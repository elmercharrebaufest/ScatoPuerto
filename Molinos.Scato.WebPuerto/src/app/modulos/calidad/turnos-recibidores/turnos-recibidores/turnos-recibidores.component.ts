import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Bodega } from '@ScatoModels/balanzadas/balanza';
import { Destino } from '@ScatoModels/destino';
import { Exportador } from '@ScatoModels/exportador';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { PlanillaDeTurnos, SiloCelda, TurnoDetalleLiquido, TurnoDetalleSolido } from '@ScatoModels/planilla-turnos/planilla-de-turnos';
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
  bodegas: Bodega[] = [];
  embarqueId: number;

  editandoLinea = false;
  lineaEditRef: any = null;
  turnoEditRef: FormGroup | null = null;
  diaEditIndex: number | null = null;
  lineaEditIndex: number | null = null;
  @ViewChild('altaCarga') altaCargaTpl!: any;
  refreshHorarios = 0;

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
    this.bodegas = await this.planoDeCargaService
      .obtenerBodegasTurnos()
      .pipe(take(1))
      .toPromise();;
  }

  cerrarReabrirTurno(turnoForm: FormGroup): void {
    const estadoActual = turnoForm.get('cerrado')?.value;

    //SOLO cuando intenta cerrar
    if (!estadoActual) {

      const lineas = this.getLineas(turnoForm);

      if (!lineas || lineas.length === 0) {

        this.confirmationDialogService.confirm(
          'Información',
          'No es posible cerrar el turno porque no cuenta con líneas de carga.',
          'Cerrar',
          '',
          null,
          null,
          Tipoalerta.Warning
        );

        return;
      }
    }

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
    const lineas = this.getLineas(turnoForm);

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

    if (lineas && lineas.length > 0) {

      this.confirmationDialogService.confirm(
        'Error',
        'El turno tiene cargas asociadas.',
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

  async eliminarModuloDeCargaPlanillaDeTurnosDetalles(linea: any) {

    if (!linea?.id) {
      console.error('La línea no tiene id');
      return;
    }

    try {
      const confirmed = await this.confirmationDialogService.confirm(
        'Planilla de Líquido',
        '¿Confirma la anulación de la línea de carga?',
        'Aceptar',
        'Cancelar',
        null,
        null,
        Tipoalerta.Warning
      );

      if (!confirmed) return;


      if (this.esLiquido) {
        // Eliminar detalle liquido
        await this.moduloCargaService
          .eliminarModuloDeCargaPlanillaDeTurnosDetallesLiquido(linea.id, this.moduloDeCargaId)
          .toPromise();

      } else {
        // Eliminar detalle solido
        await this.moduloCargaService
          .eliminarModuloDeCargaPlanillaDeTurnosDetallesSolido(linea.id, this.moduloDeCargaId)
          .toPromise();
      }

      // Refrescar módulo
      this.refreshHorarios++;
      const mod = await this.moduloCargaService
        .obtenerModuloDeCarga(this.moduloDeCargaId)
        .toPromise();

      this._procesoService.setModuloDeCarga(mod);
    } catch (error) {
      this.confirmationDialogService.confirm(
        '¡Error!',
        'No se pudo eliminar el ModuloDeCargaPlanillaDeTurnosDetalles.',
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
      horaInicio: [null, Validators.required],
      horaFin: [null, Validators.required],
      exportador: [null, Validators.required],
      linea: [null, Validators.required],
      bodega: [null, Validators.required],
      producto: [null, Validators.required],
      cantidad: [null, [Validators.required, Validators.min(0.001)]],
      destino: [null, Validators.required],
      observaciones: ['']
    });
  }

  private getId(l: any): number | null {
    return (
      l?.id ??
      l?.detalle?.id ??
      l?.moduloDeCargaPlanillaDeTurnosDetallesSolido?.id ??
      null
    );
  }

  private validarAltaCarga(turnoForm: FormGroup): boolean {

    const v = this.formAltaCarga.value;

    //obligatorios
    if (
      !v.horaInicio ||
      !v.horaFin ||
      !v.exportador ||
      !v.producto ||
      !v.linea ||
      !v.destino ||
      !v.bodega
    ) {
      this.formAltaCarga.markAllAsTouched();
      this.alerta('Faltan datos obligatorios');
      return false;
    }

    //cantidad
    if (!v.cantidad || Number(v.cantidad) === 0) {
      this.alerta('La cantidad de producto no puede ser cero');
      return false;
    }

    //hora fin > hora inicio
    if (v.horaFin <= v.horaInicio) {
      this.alerta('La hora de inicio es menor a la hora fin, por favor corregir');
      return false;
    }

    //validar contra horario del turno
    const turno = turnoForm.value.turnoPuerto;

    const [inicioTurno, finTurno] = turno.nombre.split('-');

    if (v.horaInicio < inicioTurno || v.horaFin > finTurno) {
      this.alerta('El horario ingresado no coincide con el horario del turno');
      return false;
    }

    //superposición
    const lineas = turnoForm.get('lineas')?.value ?? [];

    const seSuperpone = lineas.some(l => {

      const idLinea = this.getId(l);
      // si estoy editando, ignoro la misma línea
      if (this.editandoLinea && idLinea === this.lineaEditRef.id) {
        return false;
      }

      return (
        v.horaInicio < l.horaFin &&
        v.horaFin > l.horaInicio
      );
    });


    if (seSuperpone) {
      this.alerta('El día/horario ingresado se superpone con el de otra línea.');
      return false;
    }

    return true;
  }

  private alerta(mensaje: string) {
    this.confirmationDialogService.confirm(
      'Atención',
      mensaje,
      'Cerrar',
      '',
      null,
      null,
      Tipoalerta.Warning
    );
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

      lineas: this.fb.control([...lineas]) // única fuente
    });
  }

  ordenarTurnosDia(diaForm: FormGroup): void {
    const turnosArray = diaForm.get('turnos') as FormArray;

    const ordenados = [...turnosArray.controls]
      .sort((a, b) =>
        a.get('turnoPuerto')!.value.id -
        b.get('turnoPuerto')!.value.id
      );

    turnosArray.clear();
    ordenados.forEach(t => turnosArray.push(t));
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

  getRowSpanDia(diaIndex: number): number {
    return this.getTurnos(diaIndex).controls.reduce(
      (total, turno) => total + this.getRowSpanTurno(turno) + 1,
      0
    );
  }

  tieneLineas(turno: AbstractControl): boolean {
    const lineas = turno.get('lineas')?.value ?? [];
    return lineas.length > 0;
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
    return hora.length === 5 ? `${hora}:00` : hora; // HH:mm:ss
  }

  guardarAltaCarga(modal: NgbModalRef) {

    const formValue = this.formAltaCarga.value;

    const turnoForm: FormGroup | null =
      this.editandoLinea ? this.turnoEditRef : this.turnoSeleccionado;

    if (!this.validarAltaCarga(turnoForm)) {
      return;
    }

    if (!turnoForm) return;

    const planilla = this.planillasTurnos.find(
      p => p.id === turnoForm.get('id')?.value
    );

    if (!planilla?.id) return;

    let detalleLiquido: TurnoDetalleLiquido | null = null;
    let detalleSolido: TurnoDetalleSolido | null = null;

    // ===============================
    // ========= LÍQUIDO ============
    // ===============================
    if (this.esLiquido) {

      const lista = planilla.moduloDeCargaPlanillaDeTurnosDetallesLiquido ?? [];

      const idExistente =
        this.editandoLinea &&
          this.lineaEditIndex !== null &&
          lista[this.lineaEditIndex]
          ? lista[this.lineaEditIndex].id
          : 0;

      detalleLiquido = {
        id: idExistente ?? 0,
        exportador: formValue.exportador,
        materialPuerto: formValue.producto,
        destino: formValue.destino ?? null,
        linea_Id: formValue.linea.id,
        bodegaParcel: formValue.bodega.id,
        cantidad: formValue.cantidad,
        horaInicio: this.formatHora(formValue.horaInicio),
        horaFin: this.formatHora(formValue.horaFin),
        observaciones: formValue.observaciones,

        linea: null,
        tk: null,
        temperatura: null,
        medidaInicialCM: null,
        medidaInicialMM: null,
        medidaFinalCM: null,
        medidaFinalMM: null
      };
    }

    // ===============================
    // ========= SÓLIDO =============
    // ===============================
    else {

      const lista = planilla.moduloDeCargaPlanillaDeTurnosDetallesSolido ?? [];

      const idExistente =
        this.editandoLinea &&
          this.lineaEditIndex !== null &&
          lista[this.lineaEditIndex]
          ? lista[this.lineaEditIndex].id
          : 0;

      detalleSolido = {
        id: idExistente ?? 0,
        exportador: formValue.exportador,
        materialPuerto: formValue.producto,
        destino: formValue.destino ?? null,
        siloCelda: formValue.linea,
        bodega: formValue.bodega,
        cantidad: formValue.cantidad,
        idBalanzaCorte: null,
        cambioMaterial: false,
        horaInicio: this.formatHora(formValue.horaInicio),
        horaFin: this.formatHora(formValue.horaFin),
        observaciones: formValue.observaciones
      };
    }

    // ===============================
    // ========= GUARDAR ============
    // ===============================
    const request$ = this.esLiquido
      ? this.moduloCargaService.GuardarDetalleLiquido(
        planilla.id,
        this.moduloDeCargaId,
        detalleLiquido!
      )
      : this.moduloCargaService.GuardarDetalleSolido(
        planilla.id,
        this.moduloDeCargaId,
        detalleSolido!
      );

    request$
      .pipe(take(1))
      .subscribe({
        next: async () => {
          const mod = await this.moduloCargaService
            .obtenerModuloDeCarga(this.moduloDeCargaId)
            .toPromise();

          this.refreshHorarios++;
          this._procesoService.setModuloDeCarga(mod);
          this.resetEdicion();
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


  private resetEdicion() {
    this.editandoLinea = false;
    this.lineaEditRef = null;
    this.turnoEditRef = null;
    this.diaEditIndex = null;
  }


  getLineas(turno: AbstractControl): any[] {
    return turno.get('lineas')?.value ?? [];
  }

  getRowSpanTurno(turno: AbstractControl): number {
    const lineas = this.getLineas(turno);
    return lineas.length > 0 ? lineas.length : 1;
  }

  getNombreExportador(id: number): string {
    return this.exportadores.find(e => e.id === id)?.nombre || '';
  }

  getNombreBodega(id: number): string {
    if (!id) return '';
    return this.bodegas.find(b => b.id === id)?.nombre ?? '';
  }

  getNombreLineaLiquido(id: number): string {
    return this.tipoLineasEmbarques.find(l => l.id === id)?.linea ?? '';
  }

  editarLinea(
    linea: any,
    turno: FormGroup,
    diaIndex: number,
    lineaIndex: number
  ) {
    this.editandoLinea = true;
    this.lineaEditIndex = lineaIndex;
    this.turnoEditRef = turno;
    this.diaEditIndex = diaIndex;
    this.lineaEditRef = linea;

    this.formAltaCarga.reset();

    this.formAltaCarga.patchValue({
      horaInicio: linea.horaInicio,
      horaFin: linea.horaFin,
      exportador: this.exportadores.find(e => e.id == linea.exportador.id),
      producto: this.productos.find(p => p.id == linea.materialPuerto.id),
      cantidad: linea.cantidad,
      linea: this.esLiquido
        ? this.tipoLineasEmbarques.find(l => l.id === linea.linea_Id)
        : this.silosCeldas.find(s => s.id == linea.siloCelda.id),
      destino: this.destinos.find(d => d.id == linea.destino.id),
      bodega: this.esLiquido
        ? this.bodegas.find(b => b.id === linea.bodegaParcel)
        : this.bodegas.find(b => b.id === linea.bodega.id),
      observaciones: linea.observaciones
    });

    this._modalService.dismissAll();
    setTimeout(() => {
      this.modalAltaCarga = this._modalService.open(this.altaCargaTpl, {
        backdrop: 'static',
        keyboard: false
      });
    });
  }

  getPrimeraLinea(turno: AbstractControl): any | null {
    const lineas = turno.get('lineas')?.value ?? [];
    return lineas.length ? lineas[0] : null;
  }

}
