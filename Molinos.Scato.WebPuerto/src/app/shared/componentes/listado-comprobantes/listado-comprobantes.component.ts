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

  public imprimirComprobante(comprobante: ComprobanteDeEmbarque): void {
    switch (comprobante.tipoComprobante.descripcion) {
      case 'Romaneo':
        this.imprimirRomaneo(comprobante);
        break;
      case 'Secuencia Real':
        this.imprimirSecuenciaReal(comprobante.id);
        break;
      default:
        console.warn('Tipo de comprobante no soportado para impresión:', comprobante.tipoComprobante);
        break;
    }
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
      this.imprimirRomaneo(romaneo);
    }, error => {
      console.error('Error al generar romaneo:', error);
      let msj = typeof error.error === 'string' ? error.error : 'Ocurrió un error al generar el romaneo.';
      this.confirmationDialogService.error(msj);
    });
  }

  private async imprimirRomaneo(comprobante: ComprobanteDeEmbarque): Promise<void> {
    const usuario = this.session.getUser().username;
    if (!comprobante) {
      this.confirmationDialogService.error('No se encontró el romaneo para imprimir.');
      return;
    }
    if (comprobante.ubicacionArchivo) {
      this.mensajeCargando = 'Abriendo PDF...';
      this.cargando = true;
      try {
        const blob = await this.comprobantesService.obtenerArchivoComprobante(comprobante.id).pipe(take(1)).toPromise();
        this.abrirBlobEnNuevaPestana(blob);
        await this.comprobantesService.guardarImpresionComprobante(comprobante.id, usuario).pipe(take(1)).toPromise();
        this.cargarComprobantes();
      } catch (error) {
        console.error('Error al abrir el archivo:', error);
        this.confirmationDialogService.error('Ocurrió un error al abrir el PDF.');
      }
    } else {
      this.mensajeCargando = 'Generando PDF...';
      this.cargando = true;
      try {
        const blob = this.comprobantesPdfService.generarRomaneoPdf(comprobante);
        this.abrirBlobEnNuevaPestana(blob);
        
        const formData = new FormData();
        formData.append('files', blob)
        await this.comprobantesService.guardarImpresionComprobante(comprobante.id, usuario, formData).pipe(take(1)).toPromise();
        await this.signalr.enviarNotificacion('comprobantes', this.ModuloDeCargaId);
        this.cargarComprobantes();
      } catch (error) {
        this.confirmationDialogService.error('Ocurrió un error al generar el PDF del romaneo.');
        console.error('Error al generar PDF del romaneo:', error);
      }
    }
    this.cargando = false;
  }

  private abrirBlobEnNuevaPestana(blob: Blob): void {
    const blobUrl = URL.createObjectURL(blob);
    const nuevaPestana = window.open(blobUrl);
    if (nuevaPestana) {
      nuevaPestana.onload = () => { window.URL.revokeObjectURL(blobUrl); };
    } else {
      console.error('No se pudo abrir la nueva pestaña. Asegúrate de que el bloqueador de ventanas emergentes no esté habilitado.');
    }
  }

  public generarSecuenciaReal(): void {
    // TODO
  }

  private imprimirSecuenciaReal(secuenciaRealId: number): void {
    // TODO
  }

}