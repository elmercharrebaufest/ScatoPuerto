import { flatten } from '@angular/compiler';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { HorariosExportador } from '@ScatoModels/calidad/horarios-exportador';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { HistoricoEmbarqueLineUp } from '@ScatoModels/historicoEmbarqueLineup';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { CalidadSharedService } from '@ScatoServicios/calidad-shared.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { HistoricoEmbarqueLineUpService } from '@ScatoServicios/historicoEmbarqueLineup.service';
import { MailPlanillaService } from '@ScatoServicios/mail-planilla.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { ModuloNotificacion, SignalRService } from '@ScatoServicios/signal-r.service';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { TurnosRecibidoresComponent } from 'app/modulos/calidad/turnos-recibidores/turnos-recibidores/turnos-recibidores.component';
import { FumigacionBodegaComponent } from 'app/shared/componentes/fumigacion-bodega/fumigacion-bodega.component';
import { AmarreNuevoComponent } from 'app/shared/componentes/modulos/carga/amarre-nuevo/amarre-nuevo.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-solidosvn',
  templateUrl: './solidosvn.component.html',
  styleUrls: ['./solidosvn.component.css']
})
export class SolidosvnComponent implements OnInit, OnDestroy {

  @Input() moduloDeCargaId: number = 0;
  @Input() esVicentinNouryon: boolean = false;
  @Input() esSoloLectura: boolean = false;
  @ViewChild(TurnosRecibidoresComponent) turnosComponent: TurnosRecibidoresComponent;
  @ViewChild(AmarreNuevoComponent) amarreComponent: AmarreNuevoComponent;
  @ViewChild(FumigacionBodegaComponent) fumigacionBodega: FumigacionBodegaComponent;
  mostrarTurnosRecibidores: boolean;
  amarreForm: FormGroup;
  horarios: HorariosExportador[] = [];
  embarqueSelected: EmbarqueNav;
  listadoEmbarques: InstanciaWorkflowPuerto[] = null;

  private gruposNotificacion: ModuloNotificacion[] = ['moduloCarga', 'periodoCarga', 'recibos', 'horariosExportador', 'planillaTurnos', 'fumigacionBodega'];
  private destroy$ = new Subject();

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private mailPlanillaService: MailPlanillaService,
    private confirmationDialogService: ConfirmationDialogService,
    private moduloCargaService: ModuloDeCargaService,
    private workflowService: WorkflowService,
    private historicoEmbarqueLineUpService: HistoricoEmbarqueLineUpService,
    private _CalidadSharedService: CalidadSharedService,
    private signalr: SignalRService
  ) {

    this.mostrarTurnosRecibidores = false;
  }

  ngOnInit(): void {
    console.log('moduloDeCargaId recibido al iniciar:', this.moduloDeCargaId);
    this.newFormAmarre();
    this.suscribirNotificaciones();
  }

  ngOnDestroy(): void {
    this.desuscribirNotificaciones();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private suscribirNotificaciones() {
    for (const modulo of this.gruposNotificacion) {
      this.signalr.suscribirAGrupo(modulo, this.moduloDeCargaId);
    }
    this.signalr.notif$.pipe(takeUntil(this.destroy$)).subscribe(notif => this.signalr.alertar(notif));
  }

  private desuscribirNotificaciones() {
    for (const modulo of this.gruposNotificacion) {
      this.signalr.desuscribirDeGrupo(modulo, this.moduloDeCargaId);
    }
  }

  newFormAmarre() {
    this.amarreForm = this.fb.group({
      fechaAmarro: [null, Validators.required],
      horaAmarro: [null, Validators.required],
      fechaDesamarro: [null, Validators.required],
      horaDesamarro: [null, Validators.required]
    });
  }

  onInicioCarga(valor: boolean) {
    if (valor) {
      this.mostrarTurnosRecibidores = true;
    }
  }

  imprimir(imprimir: boolean = false) { }

  private mostrarMensaje() {
    this.confirmationDialogService.confirm(
      'Atención',
      'Falta el ingreso de cargas, verifique.',
      'Cerrar',
      '',
      null,
      null,
      Tipoalerta.Warning
    );
  }

  private validarCargas(): boolean {
    if (!this.turnosComponent || !this.turnosComponent.planillasTurnos) {
      this.mostrarMensaje();
      return false;
    }

    if (this.turnosComponent.planillasTurnos.length === 0) {
      this.mostrarMensaje();
      return false;
    }

    const turnoSinCargas = this.turnosComponent.planillasTurnos
      .some(t =>
        (!t.moduloDeCargaPlanillaDeTurnosDetallesSolido || t.moduloDeCargaPlanillaDeTurnosDetallesSolido.length === 0));

    if (turnoSinCargas) {
      this.mostrarMensaje();
      return false;
    }

    return true;
  }

  private validarTurnosCerrados(): boolean {
    if (!this.turnosComponent || !this.turnosComponent.planillasTurnos) {
      return false;
    }

    const hayTurnosSinCerrar = this.turnosComponent.planillasTurnos
      .some(t => !t.cerrado);

    if (hayTurnosSinCerrar) {
      this.confirmationDialogService.confirm(
        'Atención',
        'Hay turnos sin cerrar, verifique.',
        'Cerrar',
        '',
        null,
        null,
        Tipoalerta.Warning
      );
      return false;
    }

    return true;
  }

  private validarFechasFinalizacion(): boolean {
    const fechaFinCarga = this.amarreComponent?.obtenerFechaFinCarga();

    const fechaAmarro = this.amarreComponent?.obtenerFechaAmarro();
    const fechaDesamarro = this.amarreComponent?.obtenerFechaDesamarro();

    if (!fechaFinCarga ||
      !fechaAmarro ||
      !fechaDesamarro) {

      this.confirmationDialogService.confirm(
        'Atención',
        'Falta el ingreso de fechas de carga, finalizacion, amarre y/o desamarre, verifique',
        'Cerrar',
        '',
        null,
        null,
        Tipoalerta.Warning
      );

      return false;
    }

    return true;
  }

  public async enviarMailFinalizacion() {

    if (!this.validarCargas()) {
      return;
    }

    if (!this.validarTurnosCerrados()) {
      return;
    }

    await this.mailPlanillaService.enviarMailFinalizacionPlanilla(
      false,
      this.moduloDeCargaId,
      [],
      false
    );
  }

  public openModalCargarAmarre(modal: any) {
    if (!this.validarCargas()) return;
    if (!this.validarTurnosCerrados()) return;
    if (!this.validarFechasFinalizacion()) return;
    if (!this.fumigacionBodega.validarSelectBodega()) return;

    this.modalService.open(modal, {
      centered: true,
      backdrop: 'static'
    });
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

  finalizaCalidad(): void {
    this._CalidadSharedService.emitFinalizaEnCalidad(false);
  }

  async guardarAmarre() {

    this.fumigacionBodega.onGuardarDesdeFinalizar();
    this.horarios = await this.moduloCargaService.listarHorariosExportador(this.moduloDeCargaId).toPromise();
    const bodegas = await this.moduloCargaService.obtenerFumigacionBodega(this.moduloDeCargaId).toPromise();
    const algunaPreventiva = bodegas.bodegas.some(x => x.fumPreventiva);
    const algunaCurativa = bodegas.bodegas.some(x => x.fumCurativa);
    const noGuardoFumigacion = !algunaPreventiva || !algunaCurativa;

    if (this.horarios.some(h => h.fin == null)) {
      this.confirmationDialogService.confirm('¡Atención!', 'Debe ingresar el horario de fin en la sección de Horarios de carga, verifique por favor.', 'Aceptar', '', null, null, Tipoalerta.Warning);
      return false;
    }

    if (this.amarreForm.value.fechaAmarro > this.amarreForm.value.fechaDesamarro || (this.amarreForm.value.fechaAmarro == this.amarreForm.value.fechaDesamarro &&
      this.amarreForm.value.horaAmarro > this.amarreForm.value.horaDesamarro)) {
      this.confirmationDialogService.confirm('¡Atención!', 'La fecha y hora de Amarro es posterior a la de Desamarro.', 'Aceptar', '', null, null, Tipoalerta.Warning);
      return false;
    }

    if (noGuardoFumigacion) {
      const confirm = await this.confirmationDialogService.confirmar('Advertencia', `¿Desea zarpar el embarque sin haber hecho cambio en la seccion Fumigacion Preventiva/Curativa?`, 'Aceptar', 'Cancelar');
      if (!confirm) {
        return false;
      }
    }
    await this.cargarLineUp();
    await this.guardarHistoricoEmbarqueLineUp(this.turnosComponent.embarqueId);

    this.moduloCargaService.obtenerModuloDeCarga(this.moduloDeCargaId).subscribe((res: any) => {
      let periodoCargarActualizar = res['moduloDeCargaPeriodoDeCarga'][0];
      periodoCargarActualizar.horaAmarro = this.amarreForm.value.horaAmarro;
      periodoCargarActualizar.fechaAmarro = this.amarreForm.value.fechaAmarro;
      periodoCargarActualizar.horaDesamarro = this.amarreForm.value.horaDesamarro;
      periodoCargarActualizar.fechaDesamarro = this.amarreForm.value.fechaDesamarro;

      this.moduloCargaService.guardarPeriodoDeCarga(periodoCargarActualizar, this.moduloDeCargaId).subscribe((res: any) => {
        this.signalr.enviarNotificacion('moduloCarga', this.moduloDeCargaId);
        this.modalService.dismissAll();
        this.finalizaCalidad();
      });
    });

  }

}