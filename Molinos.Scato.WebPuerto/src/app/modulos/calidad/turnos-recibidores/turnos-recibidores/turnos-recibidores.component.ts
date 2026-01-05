import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { PlanillaDeTurnos } from '@ScatoModels/planilla-turnos/planilla-de-turnos';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-turnos-recibidores',
  templateUrl: './turnos-recibidores.component.html',
  styleUrls: ['./turnos-recibidores.component.css'],
})
export class TurnosRecibidoresComponent implements OnInit, OnChanges {
  @Input() esLiquido: boolean = false;
  @Input() moduloDeCargaId: number = 0;
  cerrarTurno: boolean = true;

  formTurnos!: FormGroup;
  formNuevoTurno: FormGroup;
  formAltaCarga: FormGroup;
  planillasTurnos: PlanillaDeTurnos[] = [];
  fechaHoraInicioCarga: Date;

  modalAltaCarga?: NgbModalRef;
  turnoSeleccionado: any;
  diaSeleccionadoIndex!: number;

  constructor(
    private fb: FormBuilder,
    private procesoService: DatosEmbarquesProcesoService,
    private _modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private moduloCargaService: ModuloDeCargaService,
    private _procesoService: DatosEmbarquesProcesoService
  ) { }

  // ---------------------------------
  // INIT
  // ---------------------------------
  ngOnInit(): void {
    this.initForm();
    this.crearFormAltaCarga();

    this.procesoService.moduloDeCarga$.subscribe((modulo) => {
      if (!modulo) return;

      const planillas = modulo.moduloDeCargaPlanillaDeTurnos || [];

      // RESET TOTAL
      this.formTurnos.reset();
      this.dias.clear();

      this.planillasTurnos = [...planillas];
      this.cargarPlanillasEnForm(this.planillasTurnos);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.esLiquido && !changes.esLiquido.firstChange) {
      // No se filtra data, solo UI
      console.log('Cambio esLiquido:', changes.esLiquido.currentValue);
    }
  }

  cerrarReabrirTurno(turnoForm: FormGroup): void {
    const estadoActual = turnoForm.get('cerrado')?.value;
    const nuevoEstado = !estadoActual;

    // 1️ Actualizo UI optimista
    turnoForm.get('cerrado')?.setValue(nuevoEstado);

    // 2 Armo payload para backend
    const turno = turnoForm.value;

    // 3 Llamo al backend
    this.moduloCargaService
      .actualizarTurnoPlanillaDeTurnos(turno.id, nuevoEstado)
      .subscribe({
        next: () => {
          // Todo OK
        },
        error: () => {
          // Si falla, vuelvo al estado anterior
          turnoForm.get('cerrado')?.setValue(estadoActual);
        },
      });
  }

  async eliminarTurno(turnoForm: FormGroup) {
    const turno = turnoForm.value;

    if (turno.cerrado) {
      this.confirmationDialogService.confirm(
        '¡Atención!',
        'No es posible eliminar turno debido a que se encuentra cerrado.',
        'Cerrar',
        '',
        null,
        null,
        Tipoalerta.Warning
      );
      return;
    }

    try {
      const confirmed = await this.confirmationDialogService.confirm(
        'Planilla de Líquido',
        '¿Está seguro de querer eliminar el turno seleccionado?',
        'Aceptar',
        'Cancelar',
        null,
        null,
        Tipoalerta.Warning
      );

      if (!confirmed) return;

      // Eliminar turno
      await this.moduloCargaService
        .eliminarTurnoPlanillaDeTurnos(turno.id)
        .toPromise();

      // Refrescar módulo
      const mod = await this.moduloCargaService
        .obtenerModuloDeCarga(this.moduloDeCargaId)
        .toPromise();

      this._procesoService.setModuloDeCarga(mod);
    } catch (error) {
      this.confirmationDialogService.confirm(
        '¡Error!',
        'No se pudo eliminar el turno.',
        'Cerrar',
        '',
        null,
        null,
        Tipoalerta.Error
      );
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ---------------------------------
  // FORM BASE
  // ---------------------------------
  initForm(): void {
    this.formTurnos = this.fb.group({
      dias: this.fb.array([]),
    });
  }

  get dias(): FormArray {
    return this.formTurnos.get('dias') as FormArray;
  }

  private crearFormAltaCarga(): void {
    this.formAltaCarga = this.fb.group({
      fechaInicio: [null],
      horaInicio: [null],
      fechaFin: [null],
      horaFin: [null],
      exportador: [null],
      linea: [null],
      bodega: [null],
      producto: [null],
      cantidad: [null],
      destino: [null],
      observaciones: ['']
    });
  }

  // ---------------------------------
  // HELPERS FECHA
  // ---------------------------------
  normalizarFecha(fecha: Date | string): Date {
    if (!fecha) return null;

    const f = new Date(fecha);
    f.setHours(0, 0, 0, 0);
    return f;
  }

  formatearFechaFront(fecha: Date): string {
    if (!fecha) return '';

    const d = new Date(fecha);

    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();

    return `${dia}-${mes}-${anio}`;
  }

  // ---------------------------------
  // BUILDERS
  // ---------------------------------
  buildDia(fecha: Date): FormGroup {
    return this.fb.group({
      fecha, // YYYY-MM-DD
      turnos: this.fb.array([]),
    });
  }

  buildTurno(planilla: PlanillaDeTurnos): FormGroup {
    return this.fb.group({
      id: planilla.id,
      fecha: this.normalizarFecha(planilla.fecha),
      turnoPuerto: planilla.turnoPuerto,
      cerrado: planilla.cerrado,
      enviado: planilla.enviado,
      guardadoPorRecibidor: planilla.guardadoPorRecibidor,
      guardadoPorTablerista: planilla.guardadoPorTablerista,
      planilla
    });
  }

  ordenarTurnosDia(diaForm: FormGroup): void {
    const turnosArray = diaForm.get('turnos') as FormArray;

    const ordenados = turnosArray.controls
      .map((c) => c.value)
      .sort((a, b) => a.turnoPuerto.id - b.turnoPuerto.id);

    turnosArray.clear();
    ordenados.forEach((t) => turnosArray.push(this.buildTurno(t)));
  }

  cargarPlanillasEnForm(planillas: PlanillaDeTurnos[]): void {
    this.dias.clear();

    const planillasOrdenadas = [...planillas].sort((a, b) => {
      //FECHA: más reciente primero
      const fa = new Date(a.fecha).getTime();
      const fb = new Date(b.fecha).getTime();
      if (fa !== fb) return fb - fa;

      // TURNO: orden natural dentro del día
      return a.turnoPuerto.id - b.turnoPuerto.id;
    });

    planillasOrdenadas.forEach((planilla) => {
      const fechaDia = this.normalizarFecha(planilla.fecha);
      if (!fechaDia) return;

      let diaForm = this.dias.controls.find((d) => {
        const f = this.normalizarFecha(d.value.fecha);
        return f.getTime() === fechaDia.getTime();
      }) as FormGroup;

      if (!diaForm) {
        diaForm = this.buildDia(fechaDia);
        this.dias.push(diaForm);
      }

      (diaForm.get('turnos') as FormArray).push(this.buildTurno(planilla));
      this.ordenarTurnosDia(diaForm);
    });
  }

  // ---------------------------------
  // HELPERS HTML
  // ---------------------------------
  getTurnos(d: number): FormArray {
    return this.dias.at(d).get('turnos') as FormArray;
  }

  getRowSpanDia(d: number): number {
    return this.getTurnos(d).length + 1;
  }

  tieneLineas(turnoForm: FormGroup): boolean {
    const planilla = turnoForm.get('planilla')?.value;

    return (
      (planilla?.moduloDeCargaPlanillaDeTurnosDetallesSolido?.length ?? 0) >
      0 ||
      (planilla?.moduloDeCargaPlanillaDeTurnosDetallesLiquido?.length ?? 0) > 0
    );
  }

  openModalNuevoTurno(modal) {
    this.formNuevoTurno = this.fb.group({
      fecha: [null],
    });

    this._modalService.open(modal, {
      windowClass: 'window-modal-corte',
      backdropClass: 'modal-corte',
    });
  }  

  openModalNuevaLinea(template: any, turno: any, diaIndex: number) {
    this.turnoSeleccionado = turno;
    this.diaSeleccionadoIndex = diaIndex;

    if (!this.formAltaCarga) {
      this.crearFormAltaCarga();
    } else {
      this.formAltaCarga.reset();
    }

    this.modalAltaCarga = this._modalService.open(template, {
      //size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
  }

  addTurno(turno: any) {
    if (this.formNuevoTurno.value.fecha != null) {
      let fechaSplit = this.formNuevoTurno.value.fecha.split('-', 3);
      let fechaSeleccionada: Date = new Date(
        fechaSplit[0],
        fechaSplit[1] - 1,
        fechaSplit[2]
      );
      this.fechaHoraInicioCarga = this.procesoService.getFechaComienzoCarga();
      //Harcodeo una fecha de inicio mínima hasta que se controle por DB
      let fechaInicio =
        this.fechaHoraInicioCarga != null
          ? new Date(this.fechaHoraInicioCarga)
          : null;
      let exitFunction: boolean = false;
      let fechaActual: Date = new Date();

      //const diasDiferencia = Math.round((fechaActual-fechaInicio)/(1000*60*60*24));
      if (fechaInicio == undefined || fechaInicio == null) {
        const mensaje =
          'No es posible agregar turno debido a que no se ha establecido una fecha de inicio de carga.';
        this.confirmationDialogService.confirm(
          '¡Atención!',
          mensaje,
          'Cerrar',
          '',
          null,
          null,
          Tipoalerta.Warning
        );
        return;
      }

      if (
        fechaSeleccionada.getFullYear() == fechaActual.getFullYear() &&
        fechaSeleccionada.getMonth() == fechaActual.getMonth() &&
        fechaSeleccionada.getDate() == fechaActual.getDate() &&
        turno > Math.trunc(fechaActual.getHours() / 6) + 1
      ) {
        const mensaje = 'No puedes crear un turno posterior al actual.';
        this.confirmationDialogService.confirm(
          '¡Atención!',
          mensaje,
          'Cerrar',
          '',
          null,
          null,
          Tipoalerta.Warning
        );
        return;
      }
      this.addTurnoFechaSeleccionada(turno, exitFunction, fechaSeleccionada);
      //this._modalService.dismissAll();
    } else {
      this.confirmationDialogService.confirm(
        '¡Atención!',
        'Debes elegir una fecha para el turno.',
        'Cerrar',
        '',
        null,
        null,
        Tipoalerta.Warning
      );
    }
  }

  async addTurnoFechaSeleccionada(turno, exitFunction, fechaSeleccionada) {
    //Si la fecha es válida tengo que revisar que el turno en esa fecha esté disponible.
    this.planillasTurnos =
      this._procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeTurnos;
    this.planillasTurnos.forEach((turnoLista) => {
      const fechaExistente = new Date(turnoLista.fecha);
      if (
        turnoLista.turnoPuerto.id == turno &&
        fechaExistente.getFullYear() === fechaSeleccionada.getFullYear() &&
        fechaExistente.getMonth() === fechaSeleccionada.getMonth() &&
        fechaExistente.getDate() === fechaSeleccionada.getDate()
      ) {
        this.confirmationDialogService.confirm(
          '¡Atención!',
          'El turno que deseas agregar no se encuentra disponible.',
          'Cerrar',
          '',
          null,
          null,
          Tipoalerta.Warning
        );
        exitFunction = true;
      }
    });

    if (exitFunction) {
      return;
    }

    this.confirmationDialogService
      .confirm(
        'Planilla de turnos',
        '¿Esta seguro de querer agregar el turno seleccionado?',
        'Aceptar',
        'Cancelar',
        null,
        null,
        Tipoalerta.Warning
      )
      .then((confirmed) => {
        if (confirmed) {
          //Si llegamos hasta aca es porque tenemos que crear el turno.
          let turnoNuevo: PlanillaDeTurnos = new PlanillaDeTurnos();
          turnoNuevo.guardadoPorTablerista = false;
          turnoNuevo.fecha = fechaSeleccionada;
          turnoNuevo.fechaMiliseconds = fechaSeleccionada.getTime();
          turnoNuevo.esLiquido = this.esLiquido;
          turnoNuevo.id = 0;

          this.guardarTurno(turnoNuevo, turno);

          this._modalService.dismissAll();
        }
      })
      .catch((ex) => {
        this._modalService.dismissAll();
      });
  }

  async guardarTurno(planillaDeTurno: PlanillaDeTurnos, turno: any) {
    try {
      const turnos = await this.moduloCargaService
        .obtenerTurnoPuerto()
        .pipe(take(1))
        .toPromise();

      planillaDeTurno.turnoPuerto = turnos.find((t) => t.id == turno);

      await this.moduloCargaService
        .guardarTurnoPlanillaDeTurnos(
          planillaDeTurno,
          this.moduloDeCargaId,
          false,
          false,
          true
        )
        .pipe(take(1))
        .toPromise();

      const mod = await this.moduloCargaService
        .obtenerModuloDeCarga(this.moduloDeCargaId)
        .toPromise();
      this._procesoService.setModuloDeCarga(mod);
    } catch (error) {
      console.log(error);
      this.confirmationDialogService.confirm(
        '¡Error!',
        'No se ha podido guardar el turno.',
        'Cerrar',
        '',
        null,
        null,
        Tipoalerta.Error
      );
    }
  }
}
