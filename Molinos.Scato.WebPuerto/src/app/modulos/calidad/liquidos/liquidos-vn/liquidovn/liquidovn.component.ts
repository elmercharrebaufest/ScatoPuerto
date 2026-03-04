import { formatDate } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { HorariosExportador } from '@ScatoModels/calidad/horarios-exportador';
import { HistoricoEmbarqueLineUp } from '@ScatoModels/historicoEmbarqueLineup';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { CalidadSharedService } from '@ScatoServicios/calidad-shared.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { HistoricoEmbarqueLineUpService } from '@ScatoServicios/historicoEmbarqueLineup.service';
import { MailPlanillaService } from '@ScatoServicios/mail-planilla.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { TurnosRecibidoresComponent } from 'app/modulos/calidad/turnos-recibidores/turnos-recibidores/turnos-recibidores.component';
import { AmarreNuevoComponent } from 'app/shared/componentes/modulos/carga/amarre-nuevo/amarre-nuevo.component';

@Component({
  selector: 'app-liquidovn',
  templateUrl: './liquidovn.component.html',
  styleUrls: ['./liquidovn.component.css']
})
export class LiquidovnComponent implements OnInit {

  @Input() esLiquido: boolean = false;
  @Input() moduloDeCargaId: number = 0;
  @Input() esVicentinNouryon: boolean = false;
  @ViewChild(TurnosRecibidoresComponent) turnosComponent: TurnosRecibidoresComponent;
  @ViewChild(AmarreNuevoComponent) amarreComponent: AmarreNuevoComponent;

  mostrarTurnosRecibidores: boolean;
  fechaAmarro: Date = new Date();
  horaAmarro: string = '';
  fechaDesamarro: Date = new Date();
  horaDesamarro: string = '';
  errorMessage: boolean;
  public amarreForm: FormGroup;
  horarios: HorariosExportador[] = [];
  listadoEmbarques: InstanciaWorkflowPuerto[] = null;

  constructor(
    private mailPlanillaService: MailPlanillaService,
    private confirmationDialogService: ConfirmationDialogService,
    private modalService: NgbModal,
    private _builder: FormBuilder,
    private moduloCargaService: ModuloDeCargaService,
    private workflowService: WorkflowService,
    private historicoEmbarqueLineUpService: HistoricoEmbarqueLineUpService,
    private _CalidadSharedService: CalidadSharedService,
  ) { }

  ngOnInit(): void {
    this.newFormAmarre();
  }

  onInicioCarga(valor: boolean) {
    if (valor) {
      this.mostrarTurnosRecibidores = true;
    }
  }

  imprimir(imprimir: boolean = false) {
  }

  newFormAmarre() {
    this.amarreForm = this._builder.group({
      fechaAmarro: ['', [Validators.required]],
      horaAmarro: ['', [Validators.required]],
      fechaDesamarro: ['', [Validators.required]],
      horaDesamarro: ['', [Validators.required]],
    })
  }

  public async enviarMailFinalizacion() {
    if (!this.turnosComponent || !this.turnosComponent.planillasTurnos) {
      return;
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
      return;
    }
    await this.mailPlanillaService.enviarMailFinalizacionPlanilla(
      this.esLiquido,
      this.moduloDeCargaId,
      [],
      false
    );
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

  cargarHorasDesamarro(amarre) {
    var newDate = new Date();
    var horaActual = newDate.getHours() + ":" + newDate.getMinutes();

    amarre.fechaAmarro = this.fechaAmarro ? formatDate(this.fechaAmarro, 'yyyy-MM-dd', 'es-ar') : formatDate(Date.now(), 'yyyy-MM-dd', 'es-ar');
    amarre.horaAmarro = this.horaAmarro == '' ? horaActual : this.horaAmarro;
    amarre.fechaDesamarro = this.fechaDesamarro ? formatDate(this.fechaDesamarro, 'yyyy-MM-dd', 'es-ar') : formatDate(Date.now(), 'yyyy-MM-dd', 'es-ar');
    amarre.horaDesamarro = this.horaDesamarro == '' ? horaActual : this.horaDesamarro;

    this.amarreForm.patchValue(amarre);
  }

  public openModalCargarAmarre(modal: any) {
    if (!this.validarTurnosCerrados()) {
      return;
    }
    this.cargarHorasDesamarro(this.amarreForm);
    this.errorMessage = false;
    this.modalService.open(modal, { size: 'm', centered: true, backdrop: 'static', keyboard: false });
  }

  private validarCargas(): boolean {

    if (!this.turnosComponent || !this.turnosComponent.planillasTurnos) {
      return false;
    }

    const hayCargas = this.turnosComponent.planillasTurnos
      .some(t => t.moduloDeCargaPlanillaDeTurnosDetallesLiquido && t.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length > 0);

    if (!hayCargas) {
      this.confirmationDialogService.confirm(
        'Atención',
        'Falta el ingreso de cargas, verifique.',
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

    const fechaInicioCarga = this.amarreComponent?.obtenerFechaInicioCarga();
    const fechaFinCarga = this.amarreComponent?.obtenerFechaFinCarga();

    const fechaAmarro = this.amarreForm?.value?.fechaAmarro;
    const fechaDesamarro = this.amarreForm?.value?.fechaDesamarro;

    if (!fechaInicioCarga ||
      !fechaFinCarga ||
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

  async guardarAmarre() {

    if (!this.validarCargas()) return;
    if (!this.validarTurnosCerrados()) return;
    if (!this.validarFechasFinalizacion()) return;

    this.horarios = await this.moduloCargaService.listarHorariosExportador(this.moduloDeCargaId).toPromise();

    if (this.horarios.some(h => h.fin == null)) {
      this.confirmationDialogService.confirm('¡Atención!', 'Debe ingresar el horario de fin en la sección de Horarios de carga, verifique por favor.', 'Aceptar', '', null, null, Tipoalerta.Warning);
      return false;
    }

    if (this.amarreForm.value.fechaAmarro > this.amarreForm.value.fechaDesamarro || (this.amarreForm.value.fechaAmarro == this.amarreForm.value.fechaDesamarro &&
      this.amarreForm.value.horaAmarro > this.amarreForm.value.horaDesamarro)) {
      this.confirmationDialogService.confirm('¡Atención!', 'La fecha y hora de Amarro es posterior a la de Desamarro.', 'Aceptar', '', null, null, Tipoalerta.Warning)
    } else {
      await this.cargarLineUp();
      await this.guardarHistoricoEmbarqueLineUp(this.turnosComponent.embarqueId);

      this.moduloCargaService.obtenerModuloDeCarga(this.moduloDeCargaId).subscribe((res: any) => {
        let periodoCargarActualizar = res['moduloDeCargaPeriodoDeCarga'][0];
        periodoCargarActualizar.horaAmarro = this.amarreForm.value.horaAmarro;
        periodoCargarActualizar.fechaAmarro = this.amarreForm.value.fechaAmarro;
        periodoCargarActualizar.horaDesamarro = this.amarreForm.value.horaDesamarro;
        periodoCargarActualizar.fechaDesamarro = this.amarreForm.value.fechaDesamarro;

        this.moduloCargaService.guardarPeriodoDeCarga(periodoCargarActualizar, this.moduloDeCargaId).subscribe((res: any) => {
          this.modalService.dismissAll();
          this.finalizaCalidad();
        });
      });
    }
  }

  finalizaCalidad(): void {
    this._CalidadSharedService.emitFinalizaEnCalidad(true);
  }

  cargarLineUp = async () => {
    const listadoEmbarques = await this.workflowService.obtenerListado().toPromise();
    this.listadoEmbarques = listadoEmbarques;
  }

  guardarHistoricoEmbarqueLineUp = async (embarqueId: number) => {
    try {

      const embarqueActual = this.listadoEmbarques
        .find(e => e.embarque.id === embarqueId);

      if (!embarqueActual) {
        console.warn('No se encontró el embarque actual');
        return;
      }

      let lineUpDto = JSON.parse(JSON.stringify(embarqueActual.lineUp));

      let historicoEmbarqueLineUp: HistoricoEmbarqueLineUp = {
        vaporNombre: embarqueActual.embarque.nombreBuque,
        actualizado: embarqueActual.fechaUltimaModificacion?.toString(),
        ubicacion: embarqueActual.embarque.ubicacion?.toString(),
        cartaSubidaEnviada: embarqueActual.lineUp.cartaDeSubidaEnviada,
        cartaSubidaAprobada: embarqueActual.lineUp.cartaDeSubidaAprobada,
        cargaEnSap: embarqueActual.lineUp.cargaEnSap,
        nominacionDePractico: embarqueActual.lineUp.nominacionDePractico,
        seguridadPortuaria: embarqueActual.lineUp.seguridadPortuaria,
        inspeccionSenasa: embarqueActual.lineUp.inspeccionSenasa,
        controlSenasa: embarqueActual.lineUp.controlSenasa,
        controlPrivado: embarqueActual.lineUp.controlPrivado,
        amarrador: embarqueActual.lineUp.amarrador,
        agenciaContactada: embarqueActual.lineUp.agenciaContactada,
        fechaRecalada: embarqueActual.embarque.fechaRecalada?.toString(),
        puertoActual: '',
        observaciones: embarqueActual.embarque.observaciones,
        materiales: '',
        planoDeCargaEnviado: embarqueActual.lineUp.planoDeCargaEnviado,
        obligacionCarga: embarqueActual.embarque.obligacionCarga?.toString(),
        agenteNombre: this.extraeNombre(embarqueActual.embarque.agencias),
        ataNombre: this.extraeNombre(embarqueActual.embarque.ata),
        otroMuelleNombre: embarqueActual.embarque.otroMuelleNombre,
        lineUpId: lineUpDto.id,
        embarqueId: embarqueId
      };

      let materiales = '';
      embarqueActual.lineUp.planoDeCarga.planoDeCargaBodegas.forEach((planoDeCargaBodega) => {
        if (planoDeCargaBodega.materialPuerto) {
          if (planoDeCargaBodega.materialPuerto.descripcionCorta && planoDeCargaBodega.materialPuerto.descripcionCorta != '') {
            materiales += `(${planoDeCargaBodega.cantidad}) ${planoDeCargaBodega.materialPuerto.descripcionCorta} <br> `;
          }
        }
      });

      historicoEmbarqueLineUp.materiales = materiales;

      this.historicoEmbarqueLineUpService
        .crearHistoricoEmbarqueLineUp(historicoEmbarqueLineUp)
        .subscribe();

    } catch (err) {
      console.error('Ocurrio un error inesperado: ', err.message);
    }
  }

  /*guardarHistoricoEmbarqueLineUp = async (embarqueId: number) => {
    // console.log(' guardarHistoricoEmbarqueLineUp()');
    try {
      // this.listadoEmbarquesFiltrado.forEach((embarquePuerto) => {
      this.listadoEmbarques.forEach((embarquePuerto) => {
        // console.log(embarquePuerto);

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
          // historicoEmbarqueLineUp.materiales += `(${planoDeCargaBodega.cantidad}) ${planoDeCargaBodega.materialPuerto.descripcionCorta} <br> `;
        });

        historicoEmbarqueLineUp.materiales = materiales;
        // console.log(historicoEmbarqueLineUp);
        this.historicoEmbarqueLineUpService.crearHistoricoEmbarqueLineUp(historicoEmbarqueLineUp).subscribe(x => {
          console.log(' HistoricoEmbarqueLineUp Guardado, buque: ', historicoEmbarqueLineUp.vaporNombre);
        });
      });
    } catch (err) {
      console.error('Ocurrio un error inesperado: ', err.message);
    }
  }*/

  extraeNombre(objeto): string {
    return objeto != null ? objeto?.nombre?.toString() : '';
  }

}
