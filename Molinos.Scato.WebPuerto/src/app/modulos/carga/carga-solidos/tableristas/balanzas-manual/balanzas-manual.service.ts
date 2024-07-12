import { Tipoalerta } from "@ScatoEnums/tipo-alerta";
import { BalanzasCortesManual } from "@ScatoModels/balanza-manual/balanza-cortes-manual";
import { BalanzaManual, DestinosPorMaterialPuertoBodega, ExportadorPorMaterialPuerto } from "@ScatoModels/balanza-manual/balanza-manual";
import { MotivosFallasBalanza } from '@ScatoModels/balanza-manual/balanza-manual';
import { BodegaParcel } from "@ScatoModels/bodega-parcel";
import { Destino } from "@ScatoModels/destino";
import { Exportador } from "@ScatoModels/exportador";
import { MaterialPuerto } from "@ScatoModels/material-puerto";
import { PeriodoDeCarga } from "@ScatoModels/periodo-carga";
import { BalanzaManualRegistroService } from "@ScatoServicios/balanza-manual-registro.services";
import { ConfirmationDialogService } from "@ScatoServicios/confirmation-dialog.service";
import { EmbarqueService } from "@ScatoServicios/embarque.service";
import { ModuloDeCargaService } from "@ScatoServicios/modulo-de-carga.service";
import { PlanoDeCargaService } from "@ScatoServicios/plano-de-carga.service";
import { formatDate } from "@angular/common";
import { Injectable } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class BalanzasManualService {
  private _destinosBodegaPorMaterial: BehaviorSubject<DestinosPorMaterialPuertoBodega[]> = new BehaviorSubject<DestinosPorMaterialPuertoBodega[]>(null);
  private _exportadoresPorMaterial: BehaviorSubject<ExportadorPorMaterialPuerto[]> = new BehaviorSubject<ExportadorPorMaterialPuerto[]>(null);
  private _balanzaManual: BehaviorSubject<BalanzaManual> = new BehaviorSubject<BalanzaManual>(null);

  motivosBalanzas78: MotivosFallasBalanza[] = null;
  materialesPuerto: MaterialPuerto[] = null;
  destinos: Destino[] = null;
  exportadores: Exportador[] = null;
  bodegas: BodegaParcel[] = [];

  constructor(private moduloDeCargaService: ModuloDeCargaService,
    private embarqueService: EmbarqueService,
    private planoDeCargaService: PlanoDeCargaService,
    private balanzaManualRegistroService: BalanzaManualRegistroService,
    private confirmationDialogService: ConfirmationDialogService,
    private formBuilder: FormBuilder) {
  }

  set BalanzaManual(value: any) {
    this._balanzaManual.next(value);
  }
  get BalanzaManual() {
    return this._balanzaManual.asObservable();
  }
  set DestinosPorMaterialPuertoBodega(value: any) {
    this._destinosBodegaPorMaterial.next(value);
  }
  get DestinosPorMaterialPuertoBodega() {
    return this._destinosBodegaPorMaterial.asObservable();
  }
  set ExportadorPorMaterialPuerto(value: any) {
    this._exportadoresPorMaterial.next(value);
  }
  get ExportadorPorMaterialPuerto() {
    return this._exportadoresPorMaterial.asObservable();
  }

  cargarMotivosBalanzas78(): Observable<MotivosFallasBalanza[]> {
    return this.moduloDeCargaService.obtenerListadoMotivosFallasBalanza().pipe(map((data: MotivosFallasBalanza[]) => { return data; }));

  }
  cargarMaterialPuerto(): Observable<MaterialPuerto[]> {
    return this.embarqueService.obtenerListadoMateriales().pipe(map((data: MaterialPuerto[]) => { return data.filter(x => x.esLiquido == false); }));
  }
  cargarExportadores(): Observable<Exportador[]> {
    return this.planoDeCargaService.obtenerExportadores().pipe(map((data: Exportador[]) => { return data; }));
  }
  cargarDestinos(): Observable<Destino[]> {
    return this.planoDeCargaService.obtenerDestinos().pipe(map((data: Destino[]) => { return data; }));
  }
  listarBalanzaManual(moduloDeCargaId: number): Observable<BalanzaManual[]> {
    return this.balanzaManualRegistroService.listarBalanzaManual(moduloDeCargaId).pipe(map((data: BalanzaManual[]) => { return data; }));
  }
  eliminarCortesBajaCarga(id: number): Observable<boolean> {
    return this.balanzaManualRegistroService.eliminarCortesBajaCarga(id).pipe(map((data: boolean) => { return data; }));
  }
  obtenerPeriodoDeCarga(moduloDeCargaId: number): Observable<PeriodoDeCarga> {
    return this.balanzaManualRegistroService.obtenerPeriodoDeCarga(moduloDeCargaId).pipe(map((data: PeriodoDeCarga) => { return data; }));
  }

  cargarBodegasParcel(): BodegaParcel[] {
    this.bodegas = [];
    for (let index = 1; index < 10; index++) {
      let bodega: BodegaParcel = new BodegaParcel();
      bodega.id = index;
      bodega.nombre = 'Bodega ' + index;
      this.bodegas.push(bodega)
    }
    return this.bodegas;
  }
  inicializaCargaManual(x: BalanzaManual = null, esCorteManual: boolean = false) {
    return this.formBuilder.group({
      id: x?.id ?? 0,
      fechaInicio: x?.fechaInicio ?? '',
      horaInicio: x?.horaInicio ?? '',
      fechaCorte: x?.fechaCorte ?? '',
      horaCorte: x?.horaCorte ?? '',
      material: x?.material ?? 0,
      bodega: x?.bodega ?? null,
      destino: x?.destino ?? null,
      exportador: x?.exportador ?? null,
      motivosFallasBalanza: x?.motivosFallasBalanza ?? 0,
      kilogramos: x?.kilogramos ?? 0,
      toneladas: x?.kilogramos / 1000 ?? 0,
      corteManual: x?.corteManual ?? esCorteManual,
      observaciones: x?.observaciones ?? '',
      correlativo: x?.correlativo ?? 0,
    });
  }

  cargarCorteBajaCarga(balanzas, registroBalanza) {
    balanzas.push(this.inicializaCargaManual(registroBalanza, registroBalanza.esCorteManual));
  }

  agregarCorteBajaCarga(balanzas, registroBalanza, esCorteManual: boolean, numeroBalanza: number, moduloDeCargaId: number, usuario: string) {

    /*
    const fechaInicioRegistro = new Date(registroBalanza.fechaInicio + ' ' + registroBalanza.horaInicio);
    const fechaFinRegistro = new Date(registroBalanza.fechaCorte + ' ' + registroBalanza.horaCorte);
    */

    const fechaInicioRegistro = this.convertirFecha(registroBalanza.fechaInicio, registroBalanza.horaInicio);
    const fechaFinRegistro = this.convertirFecha(registroBalanza.fechaCorte, registroBalanza.horaCorte);

    let esRegistroValido = this.validarCortesBajasCarga(balanzas, fechaInicioRegistro, fechaFinRegistro);
    if (esRegistroValido) {
      let balanzaRegistro = this.crearBalanzaCorteManual(moduloDeCargaId, numeroBalanza, registroBalanza);
      this.balanzaManualRegistroService.guardarCortesBajaCarga(balanzaRegistro).subscribe(res => {
        if (balanzaRegistro.id == 0)
          registroBalanza.id = res.id;
        this.asignarCorteBajaCarga(balanzas, registroBalanza, esCorteManual);
      });
    } else {
      const tituloMensaje: string = esCorteManual ? 'Corte' : 'Baja Carga';
      this.confirmationDialogService.confirm(tituloMensaje, `Ya existe un ${tituloMensaje} en el mismo rango de las fechas seleccionadas`, 'Cerrar', '', null, null, Tipoalerta.Warning)
    }
  }

  private asignarCorteBajaCarga(balanzas, registroBalanza, esCorteManual: boolean) {
    let cantidadRegistros = balanzas.controls.length;
    if (cantidadRegistros == 0) {
      registroBalanza.correlativo = 1;
      balanzas.push(this.inicializaCargaManual(registroBalanza, esCorteManual));
    } else {
      let filterBalanza = balanzas.controls.filter(filter => filter.value.correlativo == registroBalanza.correlativo);
      if (filterBalanza != null && filterBalanza.length > 0) {
        filterBalanza[0].patchValue(registroBalanza);
      } else {
        let correlativo: number = Math.max(...balanzas.controls.map(o => o.value.correlativo));
        correlativo++;
        registroBalanza.correlativo = correlativo;
        balanzas.push(this.inicializaCargaManual(registroBalanza, esCorteManual));
      }
    }
  }
  private crearBalanzaCorteManual(moduloDeCargaId: number, numeroBalanza: number, balanza: BalanzaManual): BalanzasCortesManual {
    let balanzaCortesManual: BalanzasCortesManual = new BalanzasCortesManual();
    balanzaCortesManual.id = balanza.id;
    balanzaCortesManual.numeroBalanza = numeroBalanza;
    balanzaCortesManual.moduloDeCarga_id = moduloDeCargaId;
    balanzaCortesManual.motivosFallasBalanza_id = balanza.motivosFallasBalanza.id;
    balanzaCortesManual.observaciones = balanza.observaciones;
    balanzaCortesManual.fecha_Inicio = `${balanza.fechaInicio} ${balanza.horaInicio}`;
    balanzaCortesManual.fecha_Corte = `${balanza.fechaCorte} ${balanza.horaCorte}`;
    balanzaCortesManual.bodega_id = balanza.bodega ? balanza.bodega?.id : null;
    balanzaCortesManual.material_id = balanza.material ? balanza.material?.id : null;
    balanzaCortesManual.exportador_Id = balanza.exportador ? balanza.exportador?.id : null;
    balanzaCortesManual.destino_Id = balanza.destino ? balanza.destino?.id : null;
    balanzaCortesManual.kg = balanza.kilogramos > 0 ? balanza.kilogramos : null;
    balanzaCortesManual.tn = balanza.toneladas > 0 ? balanza.toneladas : null;
    balanzaCortesManual.cerrado = false;
    balanzaCortesManual.corteManual = balanza.corteManual;
    return balanzaCortesManual;
  }

  private validarCortesBajasCarga(balanzas, fechaInicioRegistro, fechaFinRegistro): boolean {
    let esRegistroValido: boolean = true;

    let filtro = balanzas.controls.filter(balanza => {
      const fechaInicio = this.convertirFecha(balanza.controls['fechaInicio'].value, balanza.controls['horaInicio'].value);
      const fechaCorte = this.convertirFecha(balanza.controls['fechaCorte'].value, balanza.controls['horaCorte'].value);
      return (fechaInicioRegistro >= fechaInicio && fechaInicioRegistro <= fechaCorte) &&
        (fechaFinRegistro >= fechaInicio && fechaFinRegistro <= fechaCorte)
    });
    if (filtro != null && filtro.length > 0) esRegistroValido = false;
    return esRegistroValido;
  }

  public validarFechasIngresadas(fechaInicioIng, fechaFinIng): boolean {
    let esFechaValida: boolean = true;
    const fechaHoy = this.convertirFecha(formatDate(Date.now(), 'yyyy-MM-dd', 'es-ar'));
    const fechaInicio = this.convertirFecha(fechaInicioIng);
    const fechaFin = this.convertirFecha(fechaFinIng)

    if (fechaInicio > fechaHoy || fechaFin > fechaHoy)
      esFechaValida = false;

    return esFechaValida;
  }
  private convertirFecha(valorFecha: string, valorHora: string = null): Date {
    const fechaSplit = valorFecha.split('-');
    const anio = parseInt(fechaSplit[0]);
    const mes = parseInt(fechaSplit[1]) - 1;
    const dia = parseInt(fechaSplit[2]);
    let hora = 0;
    let minuto = 0;
    if (valorHora != null) {
      const horaSplit = valorHora.split(':');
      hora = parseInt(horaSplit[0]) - 1;
      minuto = parseInt(horaSplit[1]);
    }
    let nuevaFecha = new Date(anio, mes, dia, hora, minuto);
    return nuevaFecha;
  }

}