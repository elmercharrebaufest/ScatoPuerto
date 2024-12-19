import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Usuario } from '@ScatoInterfaces/usuario';
import { Destino } from '@ScatoModels/destino';
import { Exportador } from '@ScatoModels/exportador';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { PeriodoDeCarga } from '@ScatoModels/periodo-carga';
import { BalanzaPuerto, PlanillaDeTurnos, SiloCelda, TurnoDetalleSolido, TurnoDetalleSolidoGravedad, TurnoPuerto } from '@ScatoModels/planilla-turnos/planilla-de-turnos';
import { PlanoDeCarga } from '@ScatoModels/plano-de-carga';
import { PlanoDeCargaBodega } from '@ScatoModels/plano-de-carga-bodega';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { PlanoDeCargaService } from '@ScatoServicios/plano-de-carga.service';
import { ProcesoGuardarService } from '@ScatoServicios/procesoGuardar.service';
import { SessionService } from '@ScatoServicios/session.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { BalanzasManualService } from '../tableristas/balanzas-manual/balanzas-manual.service';
import { CargaComercial } from '@ScatoModels/carga-comercial';

interface DestinoColor extends Destino {
  color: string;
}

interface ExportadorColor extends Exportador {
  color: string;
}

interface TotalExportadorProducto {
  material: MaterialPuerto;
  cantidadesExportadores: {
    exportador: ExportadorColor,
    cantidad: number,
    totalPlano: number
  }[]
}

@Component({
  selector: 'app-planilla-carga',
  templateUrl: './planilla-carga.component.html',
  styleUrls: ['./planilla-carga.component.scss']
})
export class PlanillaCargaComponent implements OnInit, OnDestroy {

  @Input() esSoloLectura: boolean = false;
  public bodegas: PlanoDeCargaBodega[] = [];
  public silosCeldas: SiloCelda[] = [];
  public destinos: DestinoColor[] = [];
  public exportadores: ExportadorColor[] = [];
  public cargasComerciales: CargaComercial[] = [];

  private coloresEsquinas = ['#83bc08', '#08a7f0', '#dc3545', 'orange', '#bc3aa5']
  private ultimoColorUsado: number = 0;

  public turnos: PlanillaDeTurnos[] = [];
  private turnosPuerto: TurnoPuerto[] = [];
  private form: FormGroup;

  public siloCeldaSeleccionado: SiloCelda;
  public destinoSeleccionado: DestinoColor;
  public exportadorSeleccionado: ExportadorColor;

  public totalesBodegas: { bodegaParcel: number, color: string, totalCargado: number, totalPlano: number, faltaCargar: number }[] = [];
  public totalPlano: number = 0;
  public totalCargado: number = 0;
  public faltaCargar: number = 0;
  public totalGravedad: number = 0;
  public totalPala: number = 0;

  public totalesSiloCeldaProducto: { material: MaterialPuerto, siloCelda: SiloCelda, cantidad: number }[] = [];
  public totalesDestinoProducto: { material: MaterialPuerto, destino: DestinoColor, cantidad: number }[] = [];
  public totalesExportadorProducto: TotalExportadorProducto[] = [];
  public totalesPalaProducto: { material: MaterialPuerto, cantidad: number }[] = [];

  private periodoDeCarga: PeriodoDeCarga;
  private planillasTurnos: PlanillaDeTurnos[];

  public estaGuardando: boolean = false;

  public puedeEditar: boolean;

  private destroy$ = new Subject();

  constructor(
    private _procesoService: DatosEmbarquesProcesoService,
    private _procesoGuardar: ProcesoGuardarService,
    private planoDeCargaService: PlanoDeCargaService,
    private moduloDecargaService: ModuloDeCargaService,
    private balanzasManualService: BalanzasManualService,
    private confirmationDialogService: ConfirmationDialogService,
    private fb: FormBuilder,
    private session: SessionService
  ) {
    this.inicializarForm();
    this._procesoGuardar.sendGuardarCargas.pipe(takeUntil(this.destroy$)).subscribe(() => this.guardar(true));
  }

  ngOnInit(): void {
    const user = this.session.getUser() as Usuario;
    this.puedeEditar = !this.esSoloLectura || user.permisos.includes(PermisosScato.TableroSolido_EditarCargaHistorial);

    const embarque = this._procesoService.getEmbarqueSelected();
    this.form.get('embarqueId').setValue(embarque.id);
    forkJoin([
      this.planoDeCargaService.obtenerPlanoDeCarga(embarque.planoDeCargaId),
      this.moduloDecargaService.obtenerTurnoPuerto(),
      this.moduloDecargaService.listarSiloCelda(),
      this.moduloDecargaService.obtenerPeriodoDeCargaPorIdModuloDeCarga(this._procesoService.getModuloDeCargaId()),
    ]).subscribe(([planoDeCarga, turnosPuerto, silosCeldas, periodoDeCarga]) => {
      this.totalPlano = 0;
      this.cargasComerciales = planoDeCarga.cargasComerciales;
      this.bodegas = planoDeCarga.planoDeCargaBodegas;
      this.turnosPuerto = turnosPuerto;
      this.silosCeldas = silosCeldas;
      this.periodoDeCarga = periodoDeCarga as PeriodoDeCarga;

      this.inicializarTotales();
      this.ultimoColorUsado = 0;
      this.setDestinos();
      this.setExportadores(planoDeCarga);

      this.inicializarDatos();
    });

    // Esto es para añadir los turnos que se creen al guardar un corte o baja carga
    this.balanzasManualService.guardoCorteBajaCarga$.pipe(takeUntil(this.destroy$)).subscribe(async () => {
      const moduloDeCargaId = this._procesoService.getModuloDeCargaId();
      const mod = await this.moduloDecargaService.obtenerModuloDeCarga(moduloDeCargaId).pipe(take(1)).toPromise();
      const planillasTurnos = mod.moduloDeCargaPlanillaDeTurnos;
      const turnosNuevos = planillasTurnos.filter(t => !this.planillasTurnos.map(pt => pt.id).includes(t.id));
      this.cargarDatosEdicion(turnosNuevos, false);
      this.planillasTurnos = mod.moduloDeCargaPlanillaDeTurnos;
      this._procesoService.setModuloDeCarga(mod);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  private inicializarForm() {
    this.form = this.fb.group({
      embarqueId: 0,
      dias: this.fb.array([]),
      totalCarga: 0,
      totalPlano: 0,
      restaCargar: 0,
      totalGravedad: 0,
    });
  }

  private inicializarDatos() {
    this.inicializarForm();
    if (!this.planillasTurnos) {
      this.planillasTurnos = this._procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeTurnos;
    }
    const fechaHoraInicioCarga = this.fechaHoraInicioCarga;
    if (this.planillasTurnos.length) {
      this.cargarDatosEdicion(this.planillasTurnos);
    } else {
      this.agregarDia(fechaHoraInicioCarga);
    }
  }

  private cargarDatosEdicion(turnos: PlanillaDeTurnos[], primeraCarga: boolean = true) {
    const fechasTurnos: { fecha: Date, turnos: PlanillaDeTurnos[] }[] = [];
    for (const turno of turnos) {
      turno.fecha = new Date(turno.fecha);
      turno.fecha.setHours(0, 0, 0, 0);
      let fechaTurno = fechasTurnos.find(ft => ft.fecha.getTime() == turno.fecha.getTime());
      if (!fechaTurno) {
        fechaTurno = { fecha: turno.fecha, turnos: [] };
        fechasTurnos.push(fechaTurno);
      }
      fechaTurno.turnos.push(turno);
    }

    for (const fechaTurno of fechasTurnos) {
      this.agregarDiaDatos(fechaTurno.fecha, fechaTurno.turnos);
    }

    if (!primeraCarga) {
      return;
    }

    for (let i = turnos.length; i < 4; i++) {
      this.agregarTurno();
    }

    for (const dia of this.dias.controls) {
      this.actualizarTotal(dia);
    }
  }

  // #region Getters
  public get dias() {
    return this.form.get('dias') as FormArray;
  }

  public get fechaHoraInicioCarga() {
    if (!this.periodoDeCarga.fechaComienzoCarga || !this.periodoDeCarga.horaComienzoCarga) {
      return undefined;
    }
    const fecha = new Date(this.periodoDeCarga.fechaComienzoCarga);
    const [hora, minutos] = this.periodoDeCarga.horaComienzoCarga.split(':').map(n => Number(n));
    fecha.setHours(hora, minutos);
    return fecha;
  }

  public get fechaHoraFinCarga() {
    if (!this.periodoDeCarga.fechaFinalizacionCarga || !this.periodoDeCarga.horaFinalizacionCarga) {
      return undefined;
    }
    const fecha = new Date(this.periodoDeCarga.fechaFinalizacionCarga);
    const [hora, minutos] = this.periodoDeCarga.horaFinalizacionCarga.split(':').map(n => Number(n));
    fecha.setHours(hora, minutos);
    return fecha;
  }

  private get materialesSinRepetir() {
    const materiales = this.bodegas.map(b => b.materialPuerto);
    const materialesSinRepetir: MaterialPuerto[] = [];
    for (const material of materiales) {
      if (!materialesSinRepetir.some(m => m.id == material.id)) {
        materialesSinRepetir.push(material);
      }
    }
    return materialesSinRepetir;
  }

  private get colorAleatorio() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  private getNuevoDia(): Date {
    if (!this.dias.length) {
      throw new Error("No hay un día anterior");
    }
    const diaStr = this.dias.controls[this.dias.length - 1]?.get('fecha').value;
    const dia = new Date(diaStr)
    dia.setDate(dia.getDate() + 1);
    return dia;
  }

  private getTurno(fecha: Date) {
    return Math.floor(fecha.getHours() / 6) + 1;
  }

  public getFechaRowSpan(dia: FormGroup) {
    const turnos = (dia.get('turnos') as FormArray).controls;
    let filas = 0;
    for (const turno of turnos) {
      filas += this.getTurnoRowSpan(turno);
    }
    if (this.dias.at(this.dias.length - 1) == dia) {
      filas++;
    }
    return filas;
  }

  public getTurnoRowSpan(turno: AbstractControl) {
    return (turno.get('filas') as FormArray).controls.length + 1;
  }

  public getGravedadRowSpan(turno: AbstractControl) {
    let rowSpan = (turno.get('filas') as FormArray).controls.length + 1;
    if (this.esUltimoTurno(turno)) {
      rowSpan++;
    }
    return rowSpan;
  }

  private getCargasTurno(turno: AbstractControl, enKilos: boolean = false) {
    const cargas: TurnoDetalleSolido[] = [];
    for (const fila of (turno.get('filas') as FormArray).controls) {
      for (let carga of (fila.get('cargas') as FormArray).controls) {
        const detalle: TurnoDetalleSolido = (carga as FormGroup).getRawValue();
        detalle.cantidad = this.parsearNumeros(carga.get('cantidad').value);
        if (detalle.cantidad) {
          if (enKilos) {
            detalle.cantidad = Math.round(detalle.cantidad * 1000);
          }
          cargas.push(detalle);
        }
      }
    }
    return cargas;
  }

  private getGravedadesTurno(turno: AbstractControl) {
    const gravedades: TurnoDetalleSolidoGravedad[] = [];
    for (const gravedadForm of (turno.get('gravedades') as FormArray).controls) {
      const gravedadTn = this.parsearNumeros(gravedadForm.get('cantidadGravedad').value);
      const totalTurnoTn = gravedadForm.get('totalTurnoMaterial').value || 0;
      gravedades.push({
        id: gravedadForm.get('id').value || 0,
        materialPuerto: gravedadForm.get('materialPuerto').value,
        kgGravedad: gravedadTn * 1000,
        totalTurnoMaterial: totalTurnoTn * 1000
      });
    }
    return gravedades;
  }

  private getTotalTurno(turno: AbstractControl) {
    let total = 0;
    const cargas = this.getCargasTurno(turno);
    for (const carga of cargas) {
      total += carga.cantidad;
    }
    return total;
  }

  public getCargaColor(carga: AbstractControl) {
    if (!carga.get('cantidad').value) {
      return '#c0c0c0';
    }
    const siloCelda = carga.get('siloCelda').value as SiloCelda
    return siloCelda.color || 'white';
  }

  private getTurnosFinales() {
    const turnos: PlanillaDeTurnos[] = [];

    let errGravedad = false;
    let errSiloCelda = false;
    let errDestino = false;
    let errExportador = false;

    for (const dia of (this.form.get('dias') as FormArray).controls) {
      for (const turnoForm of (dia.get('turnos') as FormArray).controls) {
        const gravedades = this.getGravedadesTurno(turnoForm);
        const cargas = this.getCargasTurno(turnoForm, true);
        const turno: PlanillaDeTurnos = new PlanillaDeTurnos();
        turno.id = turnoForm.get('id').value || 0;
        turno.turnoPuerto = turnoForm.get('turnoPuerto').value;
        turno.moduloDeCargaPlanillaDeTurnosDetallesSolido = cargas;
        turno.moduloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad = gravedades;
        turno.fecha = dia.get('fecha').value;
        turnos.push(turno);

        if (!errGravedad && gravedades.some(g => g.kgGravedad > g.totalTurnoMaterial)) {
          errGravedad = true;
        }
        if (!errSiloCelda && cargas.some(c => !c.siloCelda)) {
          errSiloCelda = true;
        }
        if (!errExportador && cargas.some(c => !c.exportador)) {
          errExportador = true
        }
        if (!errDestino && cargas.some(c => !c.destino)) {
          errDestino = true
        }
      }
    }

    let err = '';
    if (errGravedad) {
      err += 'Existen valores de pala negativos';
    }
    if (errSiloCelda) {
      err += (err ? '\n' : '') + 'Existen cargas sin un silo/celda asignado';
    }
    if (errExportador) {
      err += (err ? '\n' : '') + 'Existen cargas sin un exportador asignado';
    }
    if (errDestino) {
      err += (err ? '\n' : '') + 'Existen cargas sin un destino asignado';
    }

    if (err) {
      throw new Error(err);
    }

    return turnos;
  }

  public esUltimoTurno(turno: AbstractControl) {
    const ultimoDia = this.dias.at(this.dias.length - 1);
    const turnos = ultimoDia.get('turnos') as FormArray;
    const ultimoTurno = turnos.at(turnos.length - 1);
    return turno == ultimoTurno;
  }
  // #endregion

  private inicializarTotales() {
    for (const bodega of this.bodegas) {
      this.totalesBodegas.push({
        bodegaParcel: bodega.bodegaParcel,
        color: bodega.materialPuerto?.color || 'white',
        totalCargado: 0,
        totalPlano: bodega.cantidad,
        faltaCargar: bodega.cantidad
      });
      this.totalPlano += bodega.cantidad;
    }

    this.faltaCargar = this.totalPlano;

    const materiales = this.materialesSinRepetir;
    this.totalesPalaProducto = materiales.map(material => ({ material, cantidad: 0 }));
  }

  private setDestinos() {
    const destinosSinRepetir: DestinoColor[] = [];
    for (const bodega of this.bodegas) {
      for (const destino of bodega.destinos) {
        if (!destinosSinRepetir.some(d => d.id == destino.destino.id)) {
          const color = this.coloresEsquinas[this.ultimoColorUsado] || this.colorAleatorio;
          destinosSinRepetir.push({ ...destino.destino, color });
          this.ultimoColorUsado++;
        }
      }
    }
    this.destinos = destinosSinRepetir;
  }

  private setExportadores(planoDeCarga: PlanoDeCarga) {
    const exportadoresSinRepetir: ExportadorColor[] = [];
    for (const cargaComercial of planoDeCarga.cargasComerciales) {
      if (!exportadoresSinRepetir.some(e => e.id == cargaComercial.exportador.id)) {
        const color = this.coloresEsquinas[this.ultimoColorUsado] || this.colorAleatorio;
        exportadoresSinRepetir.push({ ...cargaComercial.exportador, color });
        this.ultimoColorUsado++;
      }
    }
    this.exportadores = exportadoresSinRepetir;
  }

  // #region Construcción de form

  private rellenarTurnosUltimoDia() {
    const diaForm = this.dias.at(this.dias.length - 1);
    const turnos = diaForm.get('turnos') as FormArray;
    const ultimoTurno = turnos.at(turnos.length - 1).value as PlanillaDeTurnos;
    for (let i = ultimoTurno.turnoPuerto.orden; i < 4; i++) {
      this.agregarTurno();
    }
  }

  private construirTurnosFormArray(fecha: Date, nTurno: number, turnos?: PlanillaDeTurnos[]) {
    const turnosFormArray = this.fb.array([]);

    let max = 4;
    if (turnos) {
      max = turnos[turnos.length - 1].turnoPuerto.orden;
    } else if (fecha.toDateString() == this.fechaHoraFinCarga?.toDateString()) {
      max = this.getTurno(this.fechaHoraFinCarga);
    }

    for (let i = nTurno; i <= max; i++) {
      const turnoDb = turnos?.find(t => t.turnoPuerto.orden == i);
      const turnoForm = this.construirTurnoForm(fecha, i, turnoDb);
      turnosFormArray.push(turnoForm);
    }

    return turnosFormArray;
  }

  private construirTurnoForm(fecha: Date, nTurno: number, turnoDb?: PlanillaDeTurnos) {
    let filas: FormArray;
    let gravedades: FormArray;
    let totalTurno = 0;
    const id = turnoDb?.id || 0;

    const turnoPuerto = this.turnosPuerto.find(t => t.orden == nTurno);

    filas = this.construirFilasFormArray(turnoDb?.moduloDeCargaPlanillaDeTurnosDetallesSolido);
    gravedades = this.construirGravedadFormArray(turnoDb?.moduloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad);

    return this.fb.group({ id, fecha, turnoPuerto, filas, totalTurno, gravedades });
  }

  private construirFilaForm(nFila: number, detalles?: TurnoDetalleSolido[]) {
    const cargas = this.construirCargasFormArray(nFila, detalles);
    return this.fb.group({ fila: nFila, cargas });
  }

  private construirGravedadFormArray(gravedadesDb?: TurnoDetalleSolidoGravedad[]) {
    const gravedadFormArray = this.fb.array([]);
    for (const material of this.materialesSinRepetir) {
      let gravedad = gravedadesDb?.find(g => g.materialPuerto.id == material.id);
      if (!gravedad) {
        gravedad = new TurnoDetalleSolidoGravedad();
        gravedad.materialPuerto = material;
      }
      const gravedadForm = this.construirGravedadForm(gravedad);
      gravedadFormArray.push(gravedadForm)
    }

    return gravedadFormArray;
  }

  private construirGravedadForm(gravedad: TurnoDetalleSolidoGravedad) {
    const cantidadGravedad = gravedad.materialPuerto ? this.formatearNumeros((gravedad.kgGravedad / 1000).toLocaleString('es-AR')) : '';
    return this.fb.group({
      id: gravedad.id || 0,
      materialPuerto: gravedad.materialPuerto,
      totalTurnoMaterial: (gravedad.totalTurnoMaterial / 1000) || '',
      cantidadGravedad: [cantidadGravedad, [Validators.required, Validators.min(0)]],
      cantidadPala: gravedad.totalTurnoMaterial ? (gravedad.totalTurnoMaterial - gravedad.kgGravedad) / 1000 : ''
    });
  }

  private construirFilasFormArray(detalles?: TurnoDetalleSolido[]) {
    const filasFormArray = this.fb.array([]);
    let max = 4;
    if (detalles) {
      const filas = detalles.map(d => d.fila);
      const maxFila = Math.max(...filas) + 1;
      max = Math.max(max, maxFila);
    }
    for (let i = 0; i < max; i++) {
      let cargas: TurnoDetalleSolido[] = [];
      if (detalles) {
        cargas = detalles.filter(c => c.fila == i);
      }
      const filaForm = this.construirFilaForm(i, cargas);
      filasFormArray.push(filaForm);
    }

    return filasFormArray;
  }

  private construirCargasFormArray(fila: number, detalles?: TurnoDetalleSolido[]) {
    const balanzas: BalanzaPuerto[] = [{ codigoBalanza: '7' }, { codigoBalanza: '8' }];
    const cargasFormArray = this.fb.array([]);

    for (const planoCargaBodega of this.bodegas) {
      for (const balanzaPuerto of balanzas) {
        const parcel = planoCargaBodega.bodegaParcel;
        const detalle = detalles?.find(c => c.bodega.nombre == 'BODEGA ' + parcel && c.balanzaPuerto.codigoBalanza == balanzaPuerto.codigoBalanza);

        const carga = detalle || new TurnoDetalleSolido();
        if (detalle) {
          carga.destino = this.destinos.find(d => d.id == carga.destino.id);
          carga.exportador = this.exportadores.find(e => e.id == carga.exportador.id);
        } else {
          carga.materialPuerto = planoCargaBodega.materialPuerto;
          carga.balanzaPuerto = balanzaPuerto;
          carga.fila = fila;
          if (this.destinos.length == 1) {
            carga.destino = this.destinos[0];
          }
          if (this.exportadores.length == 1) {
            carga.exportador = this.exportadores[0];
          }
        }
        carga.bodega = { parcel, nombre: 'BODEGA ' + parcel };
        const cargaForm = this.construirCargaForm(carga);
        cargasFormArray.push(cargaForm);
      }
    }

    return cargasFormArray;
  }

  private construirCargaForm(carga: TurnoDetalleSolido) {
    const cantidad = carga.cantidad ? this.formatearNumeros((carga.cantidad / 1000).toLocaleString('es-AR')) : ''
    return this.fb.group({
      id: carga.id || 0,
      materialPuerto: carga.materialPuerto || '',
      destino: [carga.destino || '', Validators.required],
      bodega: carga.bodega || '',
      exportador: [carga.exportador || '', Validators.required],
      cantidad: [cantidad, [Validators.required, Validators.min(0)]],
      balanzaPuerto: carga.balanzaPuerto || '',
      siloCelda: [carga.siloCelda || '', Validators.required],
      fila: carga.fila
    });
  }
  // #endregion

  private formatearNumeros(value: string) {
    let [strEnteros, strDecimales] = value.split(',').map(n => n.replace(/[^0-9]/g, ''));

    if (!strEnteros) {
      return '';
    }

    let res = parseInt(strEnteros).toLocaleString('es-AR');

    if (strDecimales !== undefined) {
      res += ',' + strDecimales.slice(0, 3);
    }

    return res;
  }

  private parsearNumeros(value: string) {
    let numerico = Number(value.replace(/\./g, '').replace(',', '.')) || 0;
    numerico = Math.trunc(numerico * 1000) / 1000; // Redondeo a 3 decimales fijos
    return numerico;
  }

  // #region Cálculos
  private setTotalesGravedad(turno: AbstractControl) {
    const cargas = this.getCargasTurno(turno);
    for (const gravedad of (turno.get('gravedades') as FormArray).controls) {

      const material = gravedad.get('materialPuerto').value as MaterialPuerto;
      const cargasMaterial = cargas.filter(c => c.materialPuerto.id == material.id);

      let totalMaterial = 0;
      for (const carga of cargasMaterial) {
        totalMaterial += carga.cantidad;
      }

      gravedad.get('totalTurnoMaterial').setValue(totalMaterial);
    }
  }

  public actualizarTotal(dia: AbstractControl) {
    let totalDia = 0;
    for (const turno of (dia.get('turnos') as FormArray).controls) {
      const totalTurno = this.getTotalTurno(turno);
      totalDia += totalTurno;
      turno.get('totalTurno').setValue(totalTurno.toLocaleString('es-AR'));
      this.setTotalesGravedad(turno);
    }
    dia.get('totalDia').setValue(totalDia.toLocaleString('es-AR'));
    this.actualizarTotalesFinales();
    this.actualizarGravedad(dia);
    this.actualizarTotalPalaProducto();
  }

  public actualizarGravedad(dia: AbstractControl) {
    let totalPala = 0;
    for (const turno of (dia.get('turnos') as FormArray).controls) {
      for (const gravedad of (turno.get('gravedades') as FormArray).controls) {
        const total = gravedad.get('totalTurnoMaterial').value as number;
        const cantidadGravedad = this.parsearNumeros(gravedad.get('cantidadGravedad').value);
        const cantidadPala = total - cantidadGravedad;
        gravedad.get('cantidadPala').setValue(cantidadPala);
        totalPala += cantidadPala;
      }
    }
    dia.get('palaDia').setValue(totalPala);
    this.actualizarTotalGravedad();
  }

  private actualizarTotalesFinales() {
    this.totalCargado = 0;
    this.totalesBodegas.forEach(tb => tb.totalCargado = 0);
    this.totalesSiloCeldaProducto = [];
    this.totalesExportadorProducto = [];
    this.totalesDestinoProducto = [];

    for (const dia of (this.form.get('dias') as FormArray).controls) {
      for (const turno of (dia.get('turnos') as FormArray).controls) {
        for (const carga of this.getCargasTurno(turno)) {
          const totalBodega = this.totalesBodegas.find(tb => tb.bodegaParcel == carga.bodega.parcel);
          totalBodega.totalCargado += carga.cantidad;

          if (carga.siloCelda) {
            let totalSiloCelda = this.totalesSiloCeldaProducto.find(t => t.siloCelda.id == carga.siloCelda?.id && t.material.id == carga.materialPuerto.id);
            if (totalSiloCelda) {
              totalSiloCelda.cantidad += carga.cantidad;
            } else {
              totalSiloCelda = { siloCelda: carga.siloCelda, material: carga.materialPuerto, cantidad: carga.cantidad };
              this.totalesSiloCeldaProducto.push(totalSiloCelda);
            }
          }

          if (carga.destino) {
            let totalDestino = this.totalesDestinoProducto.find(t => t.destino.id == carga.destino.id && t.material.id == carga.materialPuerto.id);
            if (totalDestino) {
              totalDestino.cantidad += carga.cantidad;
            } else {
              const destino = this.destinos.find(d => d.id == carga.destino.id);
              totalDestino = { destino, material: carga.materialPuerto, cantidad: carga.cantidad };
              this.totalesDestinoProducto.push(totalDestino);
            }
          }

          if (carga.exportador) {
            let totalProducto = this.totalesExportadorProducto.find(t => t.material.id == carga.materialPuerto.id);
            if (!totalProducto) {
              totalProducto = { material: carga.materialPuerto, cantidadesExportadores: [] };
              this.totalesExportadorProducto.push(totalProducto);
            }

            let totalExportador = totalProducto.cantidadesExportadores.find(e => e.exportador.id == carga.exportador.id);
            if (totalExportador) {
              totalExportador.cantidad += carga.cantidad;
            } else {
              const exportador = this.exportadores.find(e => e.id == carga.exportador.id);
              const cargaComercial = this.cargasComerciales.find(c => c.exportador.id == carga.exportador.id && c.materialPuerto.id == carga.materialPuerto.id);
              const totalPlano = cargaComercial.cantidad
              totalExportador = { exportador, cantidad: carga.cantidad, totalPlano };
              totalProducto.cantidadesExportadores.push(totalExportador);
            }
          }
        }
      }
    }

    for (const totalBodega of this.totalesBodegas) {
      this.totalCargado += totalBodega.totalCargado;
      totalBodega.faltaCargar = totalBodega.totalPlano - totalBodega.totalCargado;
    }

    this.faltaCargar = this.totalPlano - this.totalCargado;
  }

  private actualizarTotalGravedad() {
    this.totalGravedad = 0;
    for (const dia of (this.form.get('dias') as FormArray).controls) {
      for (const turno of (dia.get('turnos') as FormArray).controls) {
        for (const gravedad of (turno.get('gravedades') as FormArray).controls) {
          this.totalGravedad += this.parsearNumeros(gravedad.get('cantidadGravedad').value);
        }
      }
    }
    this.totalPala = this.totalCargado - this.totalGravedad;
  }

  private actualizarTotalPalaProducto() {
    this.totalesPalaProducto.forEach(t => t.cantidad = 0);
    for (const dia of (this.form.get('dias') as FormArray).controls) {
      for (const turno of (dia.get('turnos') as FormArray).controls) {
        for (const gravedad of (turno.get('gravedades') as FormArray).controls) {
          const total = gravedad.get('totalTurnoMaterial').value as number;
          const cantidadGravedad = this.parsearNumeros(gravedad.get('cantidadGravedad').value);
          const cantidadPala = total - cantidadGravedad;
          const material = gravedad.get('materialPuerto').value as MaterialPuerto;
          const totalPalaProducto = this.totalesPalaProducto.find(t => t.material.id == material.id);
          totalPalaProducto.cantidad += cantidadPala;
        }
      }
    }
  }
  // #endregion

  // #region ACCIONES
  public agregarDia(fechaHoraInicioCarga?: Date) {
    let fecha: Date;
    let nTurno = 1;
    if (fechaHoraInicioCarga) {
      fecha = new Date(fechaHoraInicioCarga);
      nTurno = this.getTurno(fecha);
      fecha.setHours(0, 0, 0, 0);
    } else {
      this.rellenarTurnosUltimoDia();
      fecha = this.getNuevoDia();
    }

    if (fecha > this.fechaHoraFinCarga) {
      return;
    }

    const turnos = this.construirTurnosFormArray(fecha, nTurno);

    const diaForm = this.fb.group({ fecha, turnos, totalDia: 0, palaDia: 0 });
    this.dias.push(diaForm);

    for (let i = turnos.length; i < 4; i++) {
      this.agregarTurno();
    }
  }

  private agregarDiaDatos(fecha: Date, turnosDb: PlanillaDeTurnos[]) {
    const nTurno = turnosDb[0].turnoPuerto.orden;
    const turnos = this.construirTurnosFormArray(fecha, nTurno, turnosDb);

    const fechaTurno = new Date(turnosDb[0].fecha);
    fechaTurno.setHours(0, 0, 0, 0);
    let diaForm = this.dias.controls.find(d => (d.get('fecha').value as Date).getTime() == fechaTurno.getTime());
    if (diaForm) {
      const turnosDia = diaForm.get('turnos') as FormArray;
      for (const t of turnos.controls) {
        turnosDia.push(t)
      }
    } else {
      diaForm = this.fb.group({ fecha, turnos, totalDia: 0, palaDia: 0 });
      this.dias.push(diaForm);
    }
  }

  public agregarFila(turnoForm: FormGroup) {
    const filasFormArray = turnoForm.get('filas') as FormArray;
    const nFila = filasFormArray.length;
    const filaForm = this.construirFilaForm(nFila);
    filasFormArray.push(filaForm);
  }

  public eliminarFila(turnoForm: FormGroup) {
    const filasFormArray = turnoForm.get('filas') as FormArray;
    const index = filasFormArray.length - 1;
    if (!index) {
      return;
    }
    const cargas = filasFormArray.at(index).get('cargas') as FormArray;
    const tieneCantidades = cargas.controls.some(c => c.get('cantidad').value !== '');
    if (tieneCantidades) {
      console.error('No se puede eliminar la fila porque contiene valores');
      return;
    }

    filasFormArray.removeAt(index);
    const dia = turnoForm.parent.parent;
    this.actualizarTotal(dia);
  }

  public agregarTurno() {
    const ultimoDia = this.dias.at(this.dias.length - 1);
    const turnosUltimoDia = ultimoDia.get('turnos') as FormArray;
    const ultimoTurno = turnosUltimoDia.at(turnosUltimoDia.length - 1).value as PlanillaDeTurnos;
    if (ultimoTurno.turnoPuerto.orden == 4) {
      const fecha = this.getNuevoDia();
      if (fecha > this.fechaHoraFinCarga) {
        return;
      }

      const turno = this.construirTurnoForm(fecha, 1);
      const turnos = this.fb.array([turno]);
      const diaForm = this.fb.group({ fecha, turnos, totalDia: 0, palaDia: 0 });
      this.dias.push(diaForm);
    } else {
      const nTurno = ultimoTurno.turnoPuerto.orden + 1;
      const fecha = ultimoDia.get('fecha').value as Date;

      if (fecha.toDateString() == this.fechaHoraFinCarga?.toDateString()) {
        const turnoMax = this.getTurno(this.fechaHoraFinCarga);
        if (nTurno > turnoMax) {
          return;
        }
      }

      const turnoForm = this.construirTurnoForm(fecha, nTurno);
      turnosUltimoDia.push(turnoForm);
    }
  }

  public eliminarTurno(turno: FormGroup) {
    const cargas = this.getCargasTurno(turno);
    if (cargas.length) {
      console.error("No se puede eliminar el turno ya que posee cargas");
      return;
    }

    const turnosArr = turno.parent as FormArray
    if (this.dias.length == 1 && turnosArr.length == 1) {
      console.error("No se puede eliminar el primer turno");
      return;
    }

    turnosArr.removeAt(turnosArr.length - 1);
    if (!turnosArr.length) {
      this.dias.removeAt(this.dias.length - 1);
    }

    this.actualizarTotalGravedad();
  }

  public seleccionarSiloCelda(siloCelda: SiloCelda) {
    this.siloCeldaSeleccionado = siloCelda;
    this.destinoSeleccionado = null;
    this.exportadorSeleccionado = null;
  }

  public seleccionarDestino(destino: DestinoColor) {
    this.destinoSeleccionado = destino;
    this.siloCeldaSeleccionado = null;
    this.exportadorSeleccionado = null;
  }

  public seleccionarExportador(exportador: ExportadorColor) {
    this.exportadorSeleccionado = exportador;
    this.siloCeldaSeleccionado = null;
    this.destinoSeleccionado = null;
  }

  public onInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const formateado = this.formatearNumeros(input.value);
    input.value = formateado;
  }

  public onSiloCeldaClick(carga: AbstractControl) {
    const formControl = carga.get('siloCelda');
    const siloCeldaCarga = formControl.value as SiloCelda;

    if (siloCeldaCarga.id == this.siloCeldaSeleccionado.id) {
      formControl.setValue('');
    } else {
      carga.get('siloCelda').setValue(this.siloCeldaSeleccionado);
    }
    this.actualizarTotalesFinales();
  }

  public onDestinoClick(carga: AbstractControl) {
    const formControl = carga.get('destino');
    const destinoCarga = formControl.value as DestinoColor;

    if (destinoCarga.id == this.destinoSeleccionado.id) {
      formControl.setValue('');
    } else {
      carga.get('destino').setValue(this.destinoSeleccionado);
    }
    this.actualizarTotalesFinales();
  }

  public onExportadorClick(carga: AbstractControl) {
    const formControl = carga.get('exportador');
    const exportadorCarga = formControl.value as ExportadorColor;

    if (exportadorCarga.id == this.exportadorSeleccionado.id) {
      formControl.setValue('');
    } else {
      carga.get('exportador').setValue(this.exportadorSeleccionado);
    }
    this.actualizarTotalesFinales();
  }
  // #endregion

  public async guardar(guardadoGeneral: boolean = false) {
    try {
      this.estaGuardando = true;
      const turnos = this.getTurnosFinales();
      const idModuloDeCarga = this._procesoService.getModuloDeCargaId();
      await this.moduloDecargaService.guardarCargaManualSolidos(idModuloDeCarga, turnos, this.esSoloLectura).pipe(take(1)).toPromise();
      this.estaGuardando = false;
      if (!guardadoGeneral) {
        this.confirmationDialogService.exito('Guardado con éxito');
        const moduloDeCargaId = this._procesoService.getModuloDeCargaId();
        const mod = await this.moduloDecargaService.obtenerModuloDeCarga(moduloDeCargaId).pipe(take(1)).toPromise();
        this.planillasTurnos = mod.moduloDeCargaPlanillaDeTurnos;
        this._procesoService.setModuloDeCarga(mod);
      } else {
        this._procesoGuardar.cargasManualesOk.next(true);
      }
    } catch (err) {
      console.error(err);
      this.estaGuardando = false;
      this.mostrarError(err);
      this._procesoGuardar.cargasManualesOk.next(false);
    }
  }

  private mostrarError(err: any) {
    let msjError = 'Ha ocurrido un error al guardar las cargas';
    if (typeof err.error == 'string' && err.error.startsWith('Existen')) {
      msjError = err.error;
      this.inicializarDatos();
    } else if (typeof err.message == 'string' && err.message.startsWith('Existen')) {
      msjError = err.message;
    }
    this.confirmationDialogService.error(msjError);
  }

  public cancelar() {
    this.inicializarDatos();
  }

  public getEscalado(tabla: HTMLElement) {
    let escalado = 1062.75 / tabla.offsetWidth;
    if (escalado < 1) {
      return escalado
    }
    return 1;
  }

  public getDiferenciaEscaladoPx(tabla: HTMLElement) {
    const escalado = this.getEscalado(tabla);
    const diferencia = (tabla.offsetHeight * escalado) - tabla.offsetHeight;
    return diferencia + 'px';
  }
}
