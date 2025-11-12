import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Comprobante } from '@ScatoModels/comprobantes/comprobantes';
import { ComprobantesPdfService } from '@ScatoServicios/comprobantes-pdf.service';
import { ComprobantesService } from '@ScatoServicios/comprobantes.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { SessionService } from '@ScatoServicios/session.service';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-listado-comprobantes',
  templateUrl: './listado-comprobantes.component.html',
  styleUrls: ['./listado-comprobantes.component.css']
})
export class ListadoComprobantesComponent implements OnInit, OnDestroy {
  @Input() ModuloDeCargaId: number;
  @Input() esSoloLectura: boolean;

  public comprobantes: Comprobante[] = [];
  public cargando: boolean = false;
  public mensajeCargando: string = 'Generando PDF...';
  private destroy$ = new Subject<void>();

  constructor(
    private comprobantesService: ComprobantesService,
    private comprobantesPdfService: ComprobantesPdfService,
    private session: SessionService,
    private confirmationDialogService: ConfirmationDialogService
  ) { }

  ngOnInit(): void {
    this.cargarComprobantes();
    this.comprobantesPdfService.progreso$.pipe(takeUntil(this.destroy$)).subscribe(progreso => {
      this.mensajeCargando = `Generando PDF... ${progreso}%`;
    });
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

  public imprimirComprobante(comprobante: Comprobante): void {
    switch (comprobante.tipoComprobante) {
      case 'ROMANEO':
        this.imprimirRomaneo(comprobante.id);
        break;
      case 'SECUENCIA_REAL':
        this.imprimirSecuenciaReal(comprobante.id);
        break;
      default:
        console.warn('Tipo de comprobante no soportado para impresión:', comprobante.tipoComprobante);
        break;
    }
  }

  public eliminarComprobante(comprobante: Comprobante): void {
    switch (comprobante.tipoComprobante) {
      case 'ROMANEO':
        this.anularRomaneo(comprobante.id);
        break;
      case 'SECUENCIA_REAL':
        this.eliminarSecuenciaReal(comprobante.id);
        break;
      default:
        console.warn('Tipo de comprobante no soportado para eliminación:', comprobante.tipoComprobante);
        break;
    }
  }

  public generarRomaneo(): void {
    this.comprobantesService.generarRomaneo(this.ModuloDeCargaId).subscribe(romaneo => {
      this.imprimirRomaneo(romaneo.id, romaneo);
    }, error => {
      console.error('Error al generar romaneo:', error);
      this.confirmationDialogService.error('Ocurrió un error al generar el romaneo.');
    });
  }

  private async imprimirRomaneo(romaneoId: number, romaneo?: Comprobante): Promise<void> {
    this.mensajeCargando = 'Generando PDF...';
    this.cargando = true;
    try {
      await this.comprobantesPdfService.generarRomaneoPdf(romaneoId, romaneo);
      const usuario = this.session.getUser().username;
      await this.comprobantesService.guardarFechaImpresionRomaneo(romaneoId, usuario).pipe(take(1)).toPromise();
      this.cargarComprobantes();
    } catch (error) {
      this.confirmationDialogService.error('Ocurrió un error al generar el PDF del romaneo.');
      console.error('Error al generar PDF del romaneo:', error);
    }
    this.cargando = false;
  }

  private async anularRomaneo(romaneoId: number): Promise<void> {
    const confirm = await this.confirmationDialogService.confirmar('Atención', '¿Está seguro que desea anular este romaneo?');
    if (!confirm) {
      return;
    }
    const usuario = this.session.getUser().username;
    this.comprobantesService.anularRomaneo(romaneoId, usuario).subscribe(() => {
      this.confirmationDialogService.exito('Romaneo anulado correctamente.');
      this.cargarComprobantes();
    }, error => {
      console.error('Error al anular romaneo:', error);
      this.confirmationDialogService.error('Ocurrió un error al anular el romaneo.');
    });
  }

  public generarSecuenciaReal(): void {
    // TODO
  }

  private imprimirSecuenciaReal(secuenciaRealId: number): void {
    // TODO
  }

  private async eliminarSecuenciaReal(secuenciaRealId: number): Promise<void> {
    const confirm = await this.confirmationDialogService.confirmar('Atención', '¿Está seguro que desea eliminar esta secuencia real de carga?');
    if (!confirm) {
      return;
    }
    this.comprobantesService.anularSecuenciaReal(secuenciaRealId).subscribe(() => {
      this.confirmationDialogService.exito('Secuencia real de carga eliminada correctamente.');
      this.cargarComprobantes();
    }, error => {
      console.error('Error al eliminar secuencia real:', error);
      this.confirmationDialogService.error('Ocurrió un error al eliminar la secuencia real de carga.');
    });
  }

}