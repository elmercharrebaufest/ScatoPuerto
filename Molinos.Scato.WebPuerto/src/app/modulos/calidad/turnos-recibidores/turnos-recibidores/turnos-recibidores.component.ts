import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Destino } from '@ScatoModels/destino';
import { Exportador } from '@ScatoModels/exportador';
import { LineasDeEmbarque } from '@ScatoModels/linea-embarque';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { PlanillaDeTurnos, SiloCelda } from '@ScatoModels/planilla-turnos/planilla-de-turnos';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { PlanoDeCargaService } from '@ScatoServicios/plano-de-carga.service';
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
  exportadores: Exportador[] = [];
  productos: MaterialPuerto[] = [];
  destinos: Destino[] = [];
  silosCeldas: SiloCelda[] = [];
  tipoLineasEmbarques: any;
  bodegas: number[] = [];
  embarqueId: number;

  constructor(
    private fb: FormBuilder,
    private procesoService: DatosEmbarquesProcesoService,
    private _modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private moduloCargaService: ModuloDeCargaService,
    private _procesoService: DatosEmbarquesProcesoService,
    private planoDeCargaService: PlanoDeCargaService,
    private embarqueService: EmbarqueService,
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

    this.listarCombos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.esLiquido && !changes.esLiquido.firstChange) {
      // No se filtra data, solo UI
      console.log('Cambio esLiquido:', changes.esLiquido.currentValue);
    }
  }


  async listarCombos(): Promise<void> {
    this.embarqueId = await this.moduloCargaService
      .obtenerEmbarqueIdPorModuloDeCarga(this.moduloDeCargaId)
      .pipe(take(1))
      .toPromise();

    this.exportadores = await this.planoDeCargaService
      .obtenerExportadoresPorEmbarque(this.embarqueId)
      .pipe(take(1))
      .toPromise();

    this.productos = await this.embarqueService
      .obtenerListadoMaterialesPorEmbarque(this.embarqueId)
      .pipe(take(1))
      .toPromise();

    this.destinos = await this.planoDeCargaService
      .obtenerDestinosPorEmbarque(this.embarqueId)
      .pipe(take(1))
      .toPromise();

    if (this.esLiquido) {
      this.tipoLineasEmbarques = await this.moduloCargaService
        .listarTipoLineaEmbarque()
        .pipe(take(1))
        .toPromise();
    } else {
      this.silosCeldas = await this.moduloCargaService
        .listarSiloCelda()
        .pipe(take(1))
        .toPromise();
    }
    this.bodegas = [1, 2, 3, 4, 5, 6, 7, 8, 9];
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

  /*buildTurno(planilla: PlanillaDeTurnos): FormGroup {
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
  }*/

  buildTurno(planilla: PlanillaDeTurnos): FormGroup {
    debugger;
    const lineas = this.esLiquido
      ? planilla.moduloDeCargaPlanillaDeTurnosDetallesLiquido ?? []
      : planilla.moduloDeCargaPlanillaDeTurnosDetallesSolido ?? [];

    return this.fb.group({
      id: planilla.id,
      fecha: this.normalizarFecha(planilla.fecha),
      turnoPuerto: planilla.turnoPuerto,
      cerrado: planilla.cerrado,
      enviado: planilla.enviado,
      guardadoPorRecibidor: planilla.guardadoPorRecibidor,
      guardadoPorTablerista: planilla.guardadoPorTablerista,

      planilla,       // entidad completa
      lineas          // 👈 CACHE
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

  /*ordenarTurnosDia(diaForm: FormGroup): void {
    const turnosArray = diaForm.get('turnos') as FormArray;

    const planillasOrdenadas = turnosArray.controls
      .map(c => c.get('planilla')!.value as PlanillaDeTurnos)
      .sort((a, b) => a.turnoPuerto.id - b.turnoPuerto.id);

    turnosArray.clear();
    planillasOrdenadas.forEach(p => {
      turnosArray.push(this.buildTurno(p));
    });
  }*/


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

  /*getRowSpanDia(d: number): number {
    return this.getTurnos(d).length + 1;
  }*/

  /* getRowSpanDia(diaIndex: number): number {
     return this.getTurnos(diaIndex).controls.reduce((total, turno) => {
       return total + this.getRowSpanTurno(turno) + 1; // +1 por "Agregar línea"
     }, 0);
   }*/

  getRowSpanDia(diaIndex: number): number {
    return this.getTurnos(diaIndex).controls.reduce(
      (total, turno) => total + this.getRowSpanTurno(turno) + 1,
      0
    );
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

  private buildDateTime(fecha: string, hora: string): Date {
    const [y, m, d] = fecha.split('-').map(Number);
    const [hh, mm] = hora.split(':').map(Number);

    return new Date(y, m - 1, d, hh, mm, 0);
  }

  private formatHora(hora: string): string {
    if (!hora) return null;
    // input: "06:00"
    return hora.length === 5 ? `${hora}:00` : hora; // HH:mm:ss
  }

  guardarAltaCarga(modal: NgbModalRef) {
    const formValue = this.formAltaCarga.value;

    const planilla: PlanillaDeTurnos =
      this.turnoSeleccionado.value.planilla;

    if (!planilla || !planilla.id) {
      return;
    }

    if (this.esLiquido) {
      const detalle: any = {
        id: 0,
        exportador: { id: formValue.exportador },
        materialPuerto: { id: formValue.producto },
        destino: formValue.destino ? { id: formValue.destino } : null,
        //linea_Id: formValue.linea?.id,
        linea: formValue.linea,
        parcel: formValue.bodega,
        cantidad: formValue.cantidad,
        horaInicio: this.formatHora(formValue.horaInicio),
        /*horaInicio: this.buildDateTime(
          formValue.fechaInicio,
          formValue.horaInicio
        ),*/
        horaFin: this.formatHora(formValue.horaFin),
        /*horaFin: this.buildDateTime(
          formValue.fechaFin,
          formValue.horaFin
        ),*/
        cambioMaterial: false
      };

      if (!planilla.moduloDeCargaPlanillaDeTurnosDetallesLiquido) {
        planilla.moduloDeCargaPlanillaDeTurnosDetallesLiquido = [];
      }

      planilla.moduloDeCargaPlanillaDeTurnosDetallesLiquido.push(detalle);
    }
    else {
      const detalle: any = {
        id: 0,
        exportador: { id: formValue.exportador },
        materialPuerto: { id: formValue.producto },
        destino: formValue.destino ? { id: formValue.destino } : null,
        siloCelda: { id: formValue.linea.id },
        bodega: formValue.bodega,
        cantidad: formValue.cantidad,
        horaInicio: this.formatHora(formValue.horaInicio),
        /*horaInicio: this.buildDateTime(
          formValue.fechaInicio,
          formValue.horaInicio
        ),*/
        horaFin: this.formatHora(formValue.horaFin),
        /*horaFin: this.buildDateTime(
          formValue.fechaFin,
          formValue.horaFin
        )*/
      };

      if (!planilla.moduloDeCargaPlanillaDeTurnosDetallesSolido) {
        planilla.moduloDeCargaPlanillaDeTurnosDetallesSolido = [];
      }

      planilla.moduloDeCargaPlanillaDeTurnosDetallesSolido.push(detalle);
    }

    planilla.esLiquido = this.esLiquido;

    this.moduloCargaService
      .guardarTurnoPlanillaDeTurnos(
        planilla,
        this.moduloDeCargaId,
        false,
        false,
        true
      )
      .pipe(take(1))
      .subscribe({
        next: async () => {
          const mod = await this.moduloCargaService
            .obtenerModuloDeCarga(this.moduloDeCargaId)
            .toPromise();

          this._procesoService.setModuloDeCarga(mod);
          modal.close();
        },
        error: () => {
          this.confirmationDialogService.confirm(
            'Error',
            'No se pudo guardar la línea de carga',
            'Cerrar',
            '',
            null,
            null,
            Tipoalerta.Error
          );
        }
      });
  }

  /*getRowSpanTurno(turno: any): number {
    const planilla = turno?.value?.planilla;

    if (!planilla) {
      return 1;
    }

    if (planilla.esLiquido) {
      const cant =
        planilla.moduloDeCargaPlanillaDeTurnosDetallesLiquido?.length || 0;
      return cant > 0 ? cant : 1;
    } else {
      const cant =
        planilla.moduloDeCargaPlanillaDeTurnosDetallesSolido?.length || 0;
      return cant > 0 ? cant : 1;
    }
  }*/

  getLineas(turno: AbstractControl): any[] {
    return turno.get('lineas')?.value ?? [];
  }

  /*getRowSpanTurno(turno: any): number {
    const lineas = this.getLineasTurno(turno);
    return lineas && lineas.length > 0 ? lineas.length : 1;
  }*/

  /*getRowSpanTurno(turno: AbstractControl): number {
    const lineas = turno.get('lineas')?.value ?? [];
    return lineas.length > 0 ? lineas.length : 1;
  }*/

  getRowSpanTurno(turno: AbstractControl): number {
    const lineas = this.getLineas(turno);
    return lineas.length > 0 ? lineas.length : 1;
  }

  /*getLineasTurno(turno: any) {
    const planilla = turno?.value?.planilla;
    if (!planilla) return [];

    return this.esLiquido
      ? planilla.moduloDeCargaPlanillaDeTurnosDetallesLiquido || []
      : planilla.moduloDeCargaPlanillaDeTurnosDetallesSolido || [];
  }*/

  getNombreExportador(id: number): string {
    return this.exportadores.find(e => e.id === id)?.nombre || '';
  }


}
