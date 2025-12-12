import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ComprobanteDeEmbarque } from '@ScatoModels/comprobantes/comprobantes';
import { ComprobantesPdfService } from '@ScatoServicios/comprobantes-pdf.service';
import { ComprobantesService } from '@ScatoServicios/comprobantes.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { SessionService } from '@ScatoServicios/session.service';
import { SignalRService } from '@ScatoServicios/signal-r.service';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-listado-comprobantes',
  templateUrl: './listado-comprobantes.component.html',
  styleUrls: ['./listado-comprobantes.component.css']
})
export class ListadoComprobantesComponent implements OnInit, OnDestroy {
  @Input() ModuloDeCargaId: number;
  @Input() esSoloLectura: boolean;

  public comprobantes: ComprobanteDeEmbarque[] = [];
  public cargando: boolean = false;
  public mensajeCargando: string = 'Generando PDF...';
  private destroy$ = new Subject<void>();

  constructor(
    private comprobantesService: ComprobantesService,
    private comprobantesPdfService: ComprobantesPdfService,
    private session: SessionService,
    private confirmationDialogService: ConfirmationDialogService,
    private signalr: SignalRService
  ) { }

  ngOnInit(): void {
    this.cargarComprobantes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarComprobantes(): void {
    this.comprobantesService.listarComprobantes(this.ModuloDeCargaId).subscribe(comprobantes => {
      this.comprobantes = comprobantes;
    }, error => {
      console.error('Error al cargar comprobantes:', error);
      this.confirmationDialogService.error('Ocurrió un error al cargar los comprobantes.');
    });
  }

  public async eliminarComprobante(comprobante: ComprobanteDeEmbarque): Promise<void> {
    const nombreComprobante = `${comprobante.tipoComprobante.descripcion} - ${comprobante.numeroComprobante}`;
    const confirm = await this.confirmationDialogService.confirmar('Atención', `¿Está seguro que desea eliminar el comprobante ${nombreComprobante}?`);
    if (!confirm) {
      return;
    }

    const usuario = this.session.getUser().username;
    this.comprobantesService.anularComprobante(comprobante.id, usuario).subscribe(async () => {
      await this.signalr.enviarNotificacion('comprobantes', this.ModuloDeCargaId);
      this.confirmationDialogService.exito('Comprobante anulado correctamente.');
      this.cargarComprobantes();
    }, error => {
      console.error('Error al anular el comprobante:', error);
      this.confirmationDialogService.error('Ocurrió un error al anular el comprobante.');
    });
  }

  public async generarRomaneo(): Promise<void> {
    this.mensajeCargando = 'Generando romaneo...';
    this.cargando = true;
    this.comprobantesService.generarRomaneo(this.ModuloDeCargaId).subscribe(async romaneo => {
      await this.signalr.enviarNotificacion('comprobantes', this.ModuloDeCargaId);
      this.imprimirComprobante(romaneo);
    }, error => {
      console.error('Error al generar romaneo:', error);
      let msj = typeof error.error === 'string' ? error.error : 'Ocurrió un error al generar el romaneo.';
      this.confirmationDialogService.error(msj);
      this.cargando = false;
    });
  }

  public generarSecuenciaReal(): void {
    this.mensajeCargando = 'Generando secuencia real de carga...';
    this.cargando = true;
    this.comprobantesService.generarSecuenciaReal(this.ModuloDeCargaId).subscribe(async secuenciaReal => {
      await this.signalr.enviarNotificacion('comprobantes', this.ModuloDeCargaId);
      this.imprimirComprobante(secuenciaReal);
    }, error => {
      console.error('Error al generar secuencia real de carga:', error);
      let msj = typeof error.error === 'string' ? error.error : 'Ocurrió un error al generar la secuencia real de carga.';
      this.confirmationDialogService.error(msj);
      this.cargando = false;
    });
  }

  public async imprimirComprobante(comprobante: ComprobanteDeEmbarque): Promise<void> {
    const usuario = this.session.getUser().username;
    if (comprobante.ubicacionArchivo) {
      await this.obtenerPdf(comprobante.id, usuario);
    } else {
      await this.generarPdf(comprobante, usuario);
    }
    this.cargando = false;
  }

  private async obtenerPdf(comprobanteId: number, usuario: string): Promise<void> {
    this.mensajeCargando = 'Abriendo PDF...';
    this.cargando = true;
    try {
      const blob = await this.comprobantesService.obtenerArchivoComprobante(comprobanteId).pipe(take(1)).toPromise();
      const nombreArchivo = await this.comprobantesService.obtenerNombreArchivo(comprobanteId).pipe(take(1)).toPromise();
      this.abrirBlobEnNuevaPestana(blob, nombreArchivo);
      await this.comprobantesService.guardarImpresionComprobante(comprobanteId, usuario).pipe(take(1)).toPromise();
      this.cargarComprobantes();
    } catch (error) {
      console.error('Error al abrir el archivo:', error);
      this.confirmationDialogService.error('Ocurrió un error al abrir el PDF.');
    }
  }

  private async generarPdf(comprobante: ComprobanteDeEmbarque, usuario: string): Promise<void> {
    this.mensajeCargando = 'Generando PDF...';
    this.cargando = true;
    try {
      let blob: Blob;
      let paginas: number = 0;
      const nombreArchivo = await this.comprobantesService.obtenerNombreArchivo(comprobante.id).pipe(take(1)).toPromise();
      switch (comprobante.tipoComprobante.descripcion) {
        case 'Romaneo':
          blob = this.comprobantesPdfService.generarRomaneoPdf(comprobante, nombreArchivo);
          break;
        case 'Secuencia Real':
          let { blob: b, paginas: p } = this.comprobantesPdfService.generarSecuenciaRealPdf(comprobante, nombreArchivo);
          blob = b;
          paginas = p;
          break;
        default:
          this.confirmationDialogService.error('Tipo de comprobante no soportado para generación de PDF.');
          return;
      }
      this.abrirBlobEnNuevaPestana(blob, nombreArchivo);
      this.descargarBlob(blob, nombreArchivo);

      const formData = new FormData();
      formData.append('files', blob)
      await this.comprobantesService.guardarImpresionComprobante(comprobante.id, usuario, formData, paginas).pipe(take(1)).toPromise();
      await this.signalr.enviarNotificacion('comprobantes', this.ModuloDeCargaId);
      this.cargarComprobantes();
    } catch (error) {
      this.confirmationDialogService.error('Ocurrió un error al generar el PDF');
      console.error('Error al generar PDF:', error);
    }
  }

  private abrirBlobEnNuevaPestana(blob: Blob, nombreArchivo: string): void {
    const blobUrl = URL.createObjectURL(blob);

    const nuevaVentana = window.open('', '_blank');

    if (!nuevaVentana) {
      console.error('No se pudo abrir la nueva pestaña. Revisa bloqueadores.');
      return;
    }

    // HTML que controla tamaño del visor
    nuevaVentana.document.write(`
      <html>
        <head>
          <title>${nombreArchivo}</title>
          <style>
            body, html {margin: 0;padding: 0;width: 100%;height: 100%;overflow: hidden;}
            iframe {width: 100%;height: 100%;border: none;}
          </style>
        </head>
        <body>
          <iframe src="${blobUrl}" type="application/pdf"></iframe>
        </body>
      </html>
    `);

    nuevaVentana.document.close();

    // Liberar URL cuando cierres la pestaña
    nuevaVentana.onbeforeunload = () => {
      URL.revokeObjectURL(blobUrl);
    };
  }


  private descargarBlob(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

}