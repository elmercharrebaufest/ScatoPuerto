import { Component, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Embarque } from '@ScatoModels/embarque';
import { OtroMuelleCarga, OtroMuelleNominacion } from '@ScatoModels/otros-muelles';
import { CargaOtrosMuellesService } from '@ScatoServicios/carga-otros-muelles.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { forkJoin, Subject } from 'rxjs';
import { FumigacionBodegaOtrosMuellesComponent } from '../fumigacion-bodega-otros-muelles/fumigacion-bodega-otros-muelles.component';
import { DetalleDeCargaComponent } from '../detalle-de-carga/detalle-de-carga.component';
import { take, takeUntil } from 'rxjs/operators';
import { EnvioMailDialogService } from '@ScatoServicios/envio-mail-dialog.service';
import { Mail } from '@ScatoModels/mail';
import { SignalRService } from '@ScatoServicios/signal-r.service';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { HistoricoEmbarqueLineUp } from '@ScatoModels/historicoEmbarqueLineup';
import { HistoricoEmbarqueLineUpService } from '@ScatoServicios/historicoEmbarqueLineup.service';

@Component({
  selector: 'app-ingreso-de-carga',
  templateUrl: './ingreso-de-carga.component.html',
  styleUrls: ['./ingreso-de-carga.component.css']
})
export class IngresoDeCargaComponent implements OnInit, OnDestroy {

  @ViewChild(FumigacionBodegaOtrosMuellesComponent) fumigacionComponent: FumigacionBodegaOtrosMuellesComponent;
  @ViewChild(DetalleDeCargaComponent) detalleCargaComponent: DetalleDeCargaComponent;
  @Input() embarqueId?: number;
  @Input() responsable: string;
  @Input() esSupervisor: boolean;

  public embarque: Embarque;
  public datosNominacion: OtroMuelleNominacion;
  public mostrarSpinner: boolean = false
  public mensajeSpinner: string = 'Cargando datos del embarque...';
  public esLiquido: boolean = false;
  public cargado: boolean = false;
  public yaZarpo: boolean = false;
  public esCoordinador = false;

  private destroy$ = new Subject();
  listadoEmbarques: InstanciaWorkflowPuerto[] = null;


  constructor(
    private route: ActivatedRoute,
    private cargaOtrosMuellesService: CargaOtrosMuellesService,
    private confirmationDialogService: ConfirmationDialogService,
    private envioDialogService: EnvioMailDialogService,
    private signalr: SignalRService,
    private workflowService: WorkflowService,
    private historicoEmbarqueLineUpService: HistoricoEmbarqueLineUpService,
  ) { }

  ngOnInit(): void {
    this.esCoordinador = this.responsable === "Coordinación" ? true : false;
    // 1. Si viene por INPUT (tab)
    if (this.embarqueId) {
      console.log('INIT desde INPUT directo:', this.embarqueId);
      this.initConId(this.embarqueId);
      return;
    }

    // 2. Si viene por ROUTE
    this.route.paramMap.subscribe(params => {
      this.esSupervisor = true;
      this.esCoordinador = true;
      const id = +params.get('id');

      if (id) {
        console.log('ID desde ROUTE:', id);
        this.initConId(id);
      }
    });
  }

  private initConId(id: number) {
    if (!id) return;

    console.log('INIT CON ID:', id);

    this.embarqueId = id;

    this.cargarDatos();
    this.suscribirNotificaciones();
  }

  ngOnDestroy(): void {
    this.desuscribirNotificaciones();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private suscribirNotificaciones() {
    this.signalr.suscribirAGrupo('otrosMuelles', this.embarqueId);
    this.signalr.notif$.pipe(takeUntil(this.destroy$)).subscribe(notif => this.signalr.alertar(notif));
  }

  private desuscribirNotificaciones() {
    this.signalr.desuscribirDeGrupo('otrosMuelles', this.embarqueId);
  }

  public cargarDatos() {
    this.mensajeSpinner = 'Cargando datos del embarque...';
    this.mostrarSpinner = true;
    forkJoin([
      this.cargaOtrosMuellesService.obtenerEmbarque(this.embarqueId),
      this.cargaOtrosMuellesService.obtenerDatosNominacion(this.embarqueId)
    ]).subscribe(([embarque, datosNominacion]) => {
      this.embarque = embarque;
      this.datosNominacion = datosNominacion;
      this.esLiquido = embarque.esLiquido;

      if (!this.embarque.otroMuelleCarga) {
        this.embarque.otroMuelleCarga = {
          id: 0, observacion: '', otroMuelleCargaDetalles: [],
          fumigacionPreventiva: datosNominacion.tieneFumigacion,
          senasa: datosNominacion.tieneSenasa,
          fumigacionCurativa: false,
        };
      }
      this.yaZarpo = this.embarque.ubicacion == 1;
      this.cargado = true;
      this.mostrarSpinner = false;
      setTimeout(() => {
        if (this.detalleCargaComponent) {
          this.detalleCargaComponent.observaciones = this.embarque.otroMuelleCarga.observacion;
        } else {
          console.warn('detalleCargaComponent aún no está disponible');
        }
      }, 100);
    }, error => {
      console.error('Error al cargar el embarque', error);
      this.confirmationDialogService.error('No se pudo cargar el embarque. Por favor, intente nuevamente.');
      this.mostrarSpinner = false;
    });
  }

  cancelar() {
    window.history.back();
  }

  async onGuardar(zarpar?: boolean) {
    if (zarpar && !this.yaZarpo) {
      const confirm = await this.confirmationDialogService.confirmar('Advertencia', 'Confirma la finalización de las cargas? El embarque pasará al estado "Zarpó".');
      if (!confirm) return;
    }

    this.mensajeSpinner = 'Guardando datos de la carga...';
    this.mostrarSpinner = true;
    try {
      const observaciones = this.detalleCargaComponent.observaciones;
      const datosFumigacion = this.fumigacionComponent.obtenerDatos() as OtroMuelleCarga;
      datosFumigacion.observacion = observaciones;

      await this.cargarLineUp();
      await this.guardarHistoricoEmbarqueLineUp(this.embarque.id);

      await this.cargaOtrosMuellesService.guardarCarga(datosFumigacion, this.embarque.id, (zarpar && !this.yaZarpo)).toPromise();
      await this.signalr.enviarNotificacion('otrosMuelles', this.embarque.id);
      this.mostrarSpinner = false;
      await this.confirmationDialogService.exito('Datos guardados con éxito.');
    } catch (error) {
      this.mostrarSpinner = false;
      console.error('Error al guardar la carga', error);
      this.confirmationDialogService.error('No se pudieron guardar los cambios. Por favor, intente nuevamente.');
    }

    if (zarpar) {
      this.enviarMailFinalizacion();
    }
  }

  cargarLineUp = async () => {
    const listadoEmbarques = await this.workflowService.obtenerListado().toPromise();
    this.listadoEmbarques = listadoEmbarques;
  }

  guardarHistoricoEmbarqueLineUp = async (embarqueId: number) => {
    try {
      this.listadoEmbarques.forEach((embarquePuerto) => {

        let lineUpDto = JSON.parse(JSON.stringify(embarquePuerto.lineUp));

        let historicoEmbarqueLineUp: HistoricoEmbarqueLineUp = {
          vaporNombre: embarquePuerto.embarque.nombreBuque,
          actualizado: embarquePuerto.fechaUltimaModificacion?.toString(),
          ubicacion: embarquePuerto.embarque.ubicacion?.toString(),
          cartaSubidaEnviada: embarquePuerto.lineUp.cartaDeSubidaEnviada,
          cartaSubidaAprobada: embarquePuerto.lineUp.cartaDeSubidaAprobada,
          cargaEnSap: embarquePuerto.lineUp.cargaEnSap,
          nominacionDePractico: embarquePuerto.lineUp.nominacionDePractico,
          seguridadPortuaria: embarquePuerto.lineUp.seguridadPortuaria,
          inspeccionSenasa: embarquePuerto.lineUp.inspeccionSenasa,
          controlSenasa: embarquePuerto.lineUp.controlSenasa,
          controlPrivado: embarquePuerto.lineUp.controlPrivado,
          amarrador: embarquePuerto.lineUp.amarrador,
          agenciaContactada: embarquePuerto.lineUp.agenciaContactada,
          fechaRecalada: embarquePuerto.embarque.fechaRecalada?.toString(),
          puertoActual: '',
          observaciones: embarquePuerto.embarque.observaciones,
          materiales: '',
          planoDeCargaEnviado: embarquePuerto.lineUp.planoDeCargaEnviado,
          obligacionCarga: embarquePuerto.embarque.obligacionCarga?.toString(),
          agenteNombre: this.extraeNombre(embarquePuerto.embarque.agencias),
          ataNombre: this.extraeNombre(embarquePuerto.embarque.ata),
          otroMuelleNombre: embarquePuerto.embarque.otroMuelleNombre,
          lineUpId: lineUpDto.id,
          embarqueId: embarqueId
        };

        let materiales = '';
        embarquePuerto.lineUp.planoDeCarga.planoDeCargaBodegas.forEach((planoDeCargaBodega) => {
          if (planoDeCargaBodega.materialPuerto) {
            if (planoDeCargaBodega.materialPuerto.descripcionCorta && planoDeCargaBodega.materialPuerto.descripcionCorta != '') {
              materiales += `(${planoDeCargaBodega.cantidad}) ${planoDeCargaBodega.materialPuerto.descripcionCorta} <br> `;
            }
          }
        });

        historicoEmbarqueLineUp.materiales = materiales;
        this.historicoEmbarqueLineUpService.crearHistoricoEmbarqueLineUp(historicoEmbarqueLineUp).subscribe(x => {
          console.log(' HistoricoEmbarqueLineUp Guardado, buque: ', historicoEmbarqueLineUp.vaporNombre);
        });
      });
    } catch (err) {
      console.error('Ocurrio un error inesperado: ', err.message);
    }
  }

  extraeNombre(objeto): string {
    return objeto != null ? objeto?.nombre?.toString() : '';
  }

  private async enviarMailFinalizacion() {
    this.mensajeSpinner = 'Generando mail de finalización...';
    this.mostrarSpinner = true;
    let mail: Mail;
    try {
      mail = await this.cargaOtrosMuellesService.obtenerMailFinalizacion(this.embarque.id).pipe(take(1)).toPromise()
      this.mostrarSpinner = false;
    } catch (error) {
      this.mostrarSpinner = false;
      console.error('Error al generar el mail de finalización', error);
      this.confirmationDialogService.error('No se pudo generar el mail de finalización. Por favor, intente nuevamente.');
      return;
    }

    const confirm = await this.envioDialogService.confirm("Enviar Mail de finalización", 'Cuerpo del Mail:', mail.titulo, 'Enviar', 'Cancelar', 'xl', mail, null, "Para:", "CC:", true);
    if (!confirm) {
      window.history.back();
      return;
    }

    // Si el email fue modificado por el usuario, el plugin CKEditor rompe las tablas, por lo que hay que repararlas
    if (mail.body.includes('<figure class="table">')) {
      const htmlOriginal = mail.body;

      let htmlLimpio = htmlOriginal
        .replace(/<figure class="table">/g, '')
        .replace(/<\/figure>/g, '')
        .replace(/<th(?!ead)([^>]*)>/g, '<th$1 style="border: 1px solid black; padding: 8px; text-align: left;">')
        .replace(/<td([^>]*)>/g, '<td$1 style="border: 1px solid black; padding: 8px; text-align: left;">');

      mail.body = `<div style="font-family: Arial, sans-serif; font-size: 14px;">${htmlLimpio}</div>`;
    }

    this.mensajeSpinner = 'Enviando mail de finalización...';
    this.mostrarSpinner = true;
    try {
      await this.cargaOtrosMuellesService.enviarMailFinalizacion(mail).pipe(take(1)).toPromise();
      await this.confirmationDialogService.exito('Se ha enviado correctamente el mail de finalización.', 'Email enviado');
      window.history.back();
    } catch (error) {
      this.mostrarSpinner = false;
      console.error('Error al enviar el mail de finalización', error);
      this.confirmationDialogService.error('No se pudo enviar el mail de finalización. Por favor, intente nuevamente.');
    }
  }

}
