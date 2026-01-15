import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { SentidoManoDeEmbarque } from '@ScatoModels/sentido-mano-embarque';
import { CeldaManoDeEmbarque } from '@ScatoModels/celda-mano-embarque';
import { ModuloDeCarga } from '@ScatoModels/modulo-carga';
import { ModuloDeCargaListado } from '@ScatoModels/modulo-carga-listado';
import { MotivosDeCorte } from '@ScatoModels/planilla-turnos/motivo-de-corte';
import { Bodega, MotivosFallasBalanza } from '@ScatoModels/balanzadas/balanza';
import { Nir, NirManualPuerto } from '@ScatoModels/nir';
import { FuncionesGeneralesService } from './funciones-generales.service';
import { Umap } from '@ScatoModels/umap';
import { PlanillaDeTurnos, SiloCelda, TurnoPuerto } from '@ScatoModels/planilla-turnos/planilla-de-turnos';
import { RitmosBalanzaManualSolido } from '@ScatoModels/balanzadas/ritmos';
import { HorariosExportador } from '@ScatoModels/calidad/horarios-exportador';
import { FormGroup } from '@angular/forms';
import { EdicionHorarioExportador } from 'app/modulos/calidad/horarios-exportador/modal-horario-exportador/modal-horario-exportador.component';
import { Mail } from '@ScatoModels/mail';
import { PlanoDeCargaBodega } from '@ScatoModels/plano-de-carga-bodega';
import { FumigacionBodega } from '@ScatoModels/fumigacion-bodega';

@Injectable({
  providedIn: 'root'
})
export class ModuloDeCargaService {
  private url: string = environment.apiUrl;
  private _actualizarPlanillaLiquido: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  constructor(
    private http: HttpClient,
    private funcionesGeneralesService: FuncionesGeneralesService,
  ) {

  }

  set actualizarPlanillaLiquido(value: any) {
    this._actualizarPlanillaLiquido.next(value);
  }
  get actualizarPlanillaLiquido() {
    return this._actualizarPlanillaLiquido.asObservable();
  }

  obtenerListadoSentidoManoDeEmbarque(): Observable<SentidoManoDeEmbarque[]> {
    return this.http.get<SentidoManoDeEmbarque[]>(`${this.url}ModuloDeCarga/ListarSentidoManoDeEmbarques`, { 'withCredentials': true });
  }

  obtenerListadoCeldaManoDeEmbarque(): Observable<CeldaManoDeEmbarque[]> {
    return this.http.get<CeldaManoDeEmbarque[]>(`${this.url}ModuloDeCarga/ListarCeldaManoDeEmbarques`, { 'withCredentials': true });
  }
  obtenerPeriodoDeCargaPorIdModuloDeCarga = (idModuloDeCarga: number) => {
    const response = this.http.get(`${this.url}ModuloDeCarga/ObtenerPeriodoDeCargaPorIdModuloDeCarga?idModuloDeCarga=${idModuloDeCarga}`, { 'withCredentials': true });
    return response;
  }

  obtenerPeriodoDeCargaNuevo(idModuloDeCarga: number) {
    return this.http.get(`${this.url}ModuloDeCarga/ObtenerPeriodoDeCargaNuevo?idModuloDeCarga=${idModuloDeCarga}`, { withCredentials: true })
  }

  guardarModuloDeCarga(moduloDeCarga: ModuloDeCarga) {
    return this.http.post(`${this.url}ModuloDeCarga/GuardarModuloDeCarga`, moduloDeCarga, { 'withCredentials': true });
  }

  obtenerModuloDeCarga(moduloDeCargaId: number) {
    return this.http.get<ModuloDeCarga>(`${this.url}ModuloDeCarga/ObtenerModuloDeCarga?id=` + moduloDeCargaId, { 'withCredentials': true });
  }

  modificarCargadoPlanoDeCarga(planoDeCargaId: any): Observable<any> {
    return this.http.post(`${this.url}PlanoDeCarga/ModificarCargadoPlanoDeCarga?planoDeCargaId=${parseInt(planoDeCargaId)}`, { 'withCredentials': true });
  }

  obtenerUltimaHabilitacionDeTanques(): Observable<ModuloDeCargaListado> {
    return this.http.get<ModuloDeCargaListado>(`${this.url}ModuloDeCarga/ObtenerUltimaHabilitacionDeTanques`, { 'withCredentials': true });
  }

  obtenerListadoMotivosFallasBalanza(): Observable<MotivosFallasBalanza[]> {
    return this.http.get<MotivosFallasBalanza[]>(`${this.url}ModuloDeCarga/ListarMotivosFallasBalanza`, { 'withCredentials': true });
  }

  /**
   *
   * @param {any} planillaTurnos PlanillaDeTurnos
   * @returns {Observable<any>}
   */
  guardarPlanillaDeTurnos(planillaDeTurnos: any, idModuloDeCarga: number): Observable<any> {

    return this.http.post(`${this.url}ModuloDeCarga/GuardarPlanillaDeTurnos?idModuloDeCarga=${idModuloDeCarga}`, planillaDeTurnos, { 'withCredentials': true });
  }


  /**
   *
   * @param {any} planillaTurnos PlanillaDeTurnos
   * @param {any} mail
   * @returns {Observable<any>}
   */

  guardarTurnoPlanillaDeTurnos(planillaDeTurnos: any, idModuloDeCarga: number, enviado: boolean = false, desdeRecibidores = false, desdeVicentinNouryon = false) {
    return this.http.post(`${this.url}ModuloDeCarga/GuardarTurnoPlanillaDeTurnos?idModuloDeCarga=${idModuloDeCarga}&enviado=${enviado}&desdeRecibidores=${desdeRecibidores}&desdeVicentinNouryon=${desdeVicentinNouryon}`, planillaDeTurnos, { 'withCredentials': true });
  }



  actualizarTurnoPlanillaDeTurnos(idPlanillaDeTurno: number, cerrado: boolean) {
    return this.http.put(`${this.url}ModuloDeCarga/ActualizarTurnoPlanillaDeTurnos?idPlanillaDeTurno=${idPlanillaDeTurno}&cerrado=${cerrado}`, { 'withCredentials': true });
  }

  eliminarTurnoPlanillaDeTurnos(idPlanillaDeTurno: number) {
    return this.http.delete(`${this.url}ModuloDeCarga/EliminarTurnoPlanillaDeTurnos?idPlanillaDeTurno=${idPlanillaDeTurno}`, { 'withCredentials': true });
  }

  eliminarModuloDeCargaPlanillaDeTurnosDetallesSolido(id: number) {
    return this.http.delete(`${this.url}ModuloDeCarga/EliminarModuloDeCargaPlanillaDeTurnosDetallesSolido?id=${id}`, { 'withCredentials': true });
  }

  eliminarModuloDeCargaPlanillaDeTurnosDetallesLiquido(id: number) {
    return this.http.delete(`${this.url}ModuloDeCarga/EliminarModuloDeCargaPlanillaDeTurnosDetallesLiquido?id=${id}`, { 'withCredentials': true });
  }

  guardarPlanillaDeTurnosMail(planillaDeTurnos: any, idModuloDeCarga: number, mail: any): Observable<any> {
    var ObjetoMail = {
      planillaDeTurnos: planillaDeTurnos,
      mail: mail
    }
    return this.http.post(`${this.url}ModuloDeCarga/GuardarPlanillaDeTurnosMail?idModuloDeCarga=${idModuloDeCarga}`, ObjetoMail, { 'withCredentials': true });
  }

  enviarPlanillaTurnoLiquido(idModuloDeCarga: number, mail: any, data: any): Observable<any> {

    var objetoEnvioPlanillaTurno = {
      mail: mail,
      archivo: data
    }

    return this.http.post(`${this.url}ModuloDeCarga/EnviarPlanillaTurnoLiquido?idModuloDeCarga=${idModuloDeCarga}`, objetoEnvioPlanillaTurno, { 'withCredentials': true });
  }

  guardarPlanillaTurnoLiquido(idModuloDeCarga: number, archivo: any): Observable<any> {
    const objetoPlanillaExcel = { idModuloDeCarga, archivo, esLiquido: true };
    return this.http.post(`${this.url}ModuloDeCarga/GuardarPlanillaTurnoLiquido`, objetoPlanillaExcel, { 'withCredentials': true });
  }

  /**
   *
   * @returns {Observable<MotivosDeCorte[]>} MotivoDeCorte[]
   */
  obtenerMotivosDeCorte(): Observable<MotivosDeCorte[]> {
    return this.http.get<MotivosDeCorte[]>(`${this.url}ModuloDeCarga/ListarMotivosDeCorte`, { 'withCredentials': true })
  }

  /**
   *
   * @returns {Observable<any>} Observable<any>
   */

  obtenerModuloDeCargaPlanillaDeTurnos(turnoPuerto_id, moduloDeCarga_id, esliquido: boolean, fechaTurno: string) {
    return this.http.get(`${this.url}ModuloDeCarga/ObtenerModuloDeCargaPlanillaDeTurnos?turnoPuerto_id=${turnoPuerto_id}&moduloDeCarga_id=${moduloDeCarga_id}&esliquido=${esliquido}&fechaTurno=${fechaTurno}`, { 'withCredentials': true });
  }
  obtenerTurnoPuerto() {
    return this.http.get<TurnoPuerto[]>(`${this.url}ModuloDeCarga/ListarTurnoPuerto`, { 'withCredentials': true });
  }

  guardarPeriodoDeCarga(PeriodoDeCarga: any[], ModuloDeCargaId): Observable<any> {
    return this.http.post(`${this.url}ModuloDeCarga/GuardarPeriodoDeCarga?moduloDeCarga_Id=${ModuloDeCargaId}`, PeriodoDeCarga, { 'withCredentials': true });
  }

  guardarPeriodoDeCargaNuevo(peridodoDeCarga: any, moduloDeCargaId: number) {
    return this.http.post(`${this.url}ModuloDeCarga/GuardarPeriodoDeCargaNuevo?moduloDeCarga_Id=${moduloDeCargaId}`, peridodoDeCarga, { withCredentials: true });
  }

  actualizarFechasPeriodoDeCarga(PeriodoDeCarga: any[], ModuloDeCargaId: number, esFechaInicio: boolean): Observable<any> {
    return this.http.post(`${this.url}ModuloDeCarga/ActualizarFechasPeriodoDeCarga?moduloDeCarga_Id=${ModuloDeCargaId}&esFechaInicio=${esFechaInicio}`, PeriodoDeCarga, { 'withCredentials': true });
  }

  consultarCombosFechasYTurnos = (idModuloDeCarga: number) => {
    const response = this.http.get(`${this.url}ModuloDeCarga/ConsultarCombosFechasYTurnos?idModuloDeCarga=${idModuloDeCarga}`, { 'withCredentials': true });
    return response;
  }

  guardarModuloDeCargaUmap(Umap: Umap[], ModuloDeCargaId) {
    return this.http.post(`${this.url}ModuloDeCarga/GuardarModuloDeCargaUmap?ModuloDeCarga_Id=${ModuloDeCargaId}`, Umap, { 'withCredentials': true });
  }

  obtenerDatosMailPlanillaLiquidos(moduloDeCargaId: number, cortesOcultos: number[], verObservaciones: boolean, esFin: boolean = false) {
    let idsOcultos = cortesOcultos.join(',');
    return this.http.get<Mail>(`${this.url}ModuloDeCarga/obtenerDatosMailPlanillaLiquidos?moduloDeCargaId=${moduloDeCargaId}&idsOcultos=${idsOcultos}&verObservaciones=${verObservaciones}&esFin=${esFin}`, { 'withCredentials': true });
  }

  guardarLineasDeEmbarque(lineasDeEmbarque: any, idModuloDeCarga: number) {
    return this.http.post(`${this.url}ModuloDeCarga/GuardarLineasDeEmbarque?idModuloDeCarga=${idModuloDeCarga}`, lineasDeEmbarque, { 'withCredentials': true });
  }

  guardarPlanillaDeEmbarque(planillaDeEmbarqueDtos: any, idModuloDeCarga: number) {
    return this.http.post(`${this.url}ModuloDeCarga/GuardarPlanillaDeEmbarque?idModuloDeCarga=${idModuloDeCarga}`, planillaDeEmbarqueDtos, { 'withCredentials': true });
  }

  obtenerNir(moduloDeCarga_id: number): Observable<NirManualPuerto[]> {
    return this.http.get<NirManualPuerto[]>(`${this.url}ModuloDeCarga/ObtenerModuloDeCargaNirManualPuerto?moduloDeCarga_id=${moduloDeCarga_id}`, { 'withCredentials': true })
  }

  guardarModuloDeCargaNirManualPuerto(objetoMailNir: Object, IdModuloDeCarga: number, nombreBuque?: string) {
    return this.http.post(`${this.url}ModuloDeCarga/GuardarModuloDeCargaNirManualPuerto?IdModuloDeCarga=${IdModuloDeCarga}&nombreBuque=${nombreBuque}`, objetoMailNir, { 'withCredentials': true });
  }

  obtenerListadoBodegas(): Observable<Bodega[]> {
    return this.http.get<Bodega[]>(`${this.url}ModuloDeCarga/ListadoBodegas`, { 'withCredentials': true });
  }

  eliminarObservacionDeCalidad(observacion_id: number) {
    return this.http.post(`${this.url}ModuloDeCarga/EliminarObservacionDeCalidad?observacion_id=${observacion_id}`, { 'withCredentials': true });
  }

  cerrarTurnoModuloDeCarga(idPlanillaDeTurnos: number) {
    return this.http.post(`${this.url}ModuloDeCarga/CerrarTurnoModuloDeCarga?idPlanillaDeTurnos=${idPlanillaDeTurnos}`, { 'withCredentials': true });
  }

  reabrirTurnoLiquido(idPlanillaDeTurnos: number) {
    return this.http.post(`${this.url}ModuloDeCarga/ReabrirTurnoLiquido?idPlanillaDeTurnos=${idPlanillaDeTurnos}`, { 'withCredentials': true });
  }

  cerrarTurnoLiquido(idPlanillaDeTurnos: number) {
    return this.http.post(`${this.url}ModuloDeCarga/CerrarTurnoLiquido?idPlanillaDeTurnos=${idPlanillaDeTurnos}`, { 'withCredentials': true });
  }

  listarTipoLineaEmbarque() {
    return this.http.get<any>(`${this.url}ModuloDeCarga/ListarTipoLineaEmbarque`, { 'withCredentials': true });
  }

  eliminarDetallePlanillaDeEmbarqueLiquido(idModuloDeCargaPlanillaDetalle: any): Observable<any> {
    return this.http.post(`${this.url}ModuloDeCarga/EliminarDetallePlanillaDeEmbarqueLiquido?idModuloDeCargaPlanillaDetalle=${parseInt(idModuloDeCargaPlanillaDetalle)}`, { 'withCredentials': true });
  }

  eliminarDetallePlanillaDeTurnosCortes(idModuloDeCargaPlanillaCorte: any): Observable<any> {
    return this.http.post(`${this.url}ModuloDeCarga/EliminarDetallePlanillaDeTurnosCortes?idModuloDeCargaPlanillaCorte=${parseInt(idModuloDeCargaPlanillaCorte)}`, { 'withCredentials': true });
  }

  public listarSiloCelda() {
    return this.http.get<SiloCelda[]>(`${this.url}ModuloDeCarga/ListarSiloCelda`, { withCredentials: true });
  }

  public guardarCargaManualSolidos(idModuloDeCarga: number, turnos: PlanillaDeTurnos[], desdeHistorial: boolean, obsPlanilla: string) {
    return this.http.post(`${this.url}ModuloDeCarga/GuardarCargaManualSolidos?idModuloDeCarga=${idModuloDeCarga}&desdeHistorial=${desdeHistorial}&obsPlanilla=${obsPlanilla}`, turnos, { withCredentials: true });
  }

  generarExcel(moduloDeCargaId: number, embarqueId: number): Observable<Blob> {
    return this.http.get(`${this.url}ModuloDeCarga/GenerarExcelTurnos?moduloDeCargaId=${moduloDeCargaId}&embarqueId=${embarqueId}`, { 'withCredentials': true, responseType: 'blob' });
  }

  generarExcelCargaLiquidos(moduloDeCargaId: number): Observable<Blob> {
    return this.http.get(`${this.url}ModuloDeCarga/GenerarExcelTurnosLiquidos?moduloDeCargaId=${moduloDeCargaId}`, { 'withCredentials': true, responseType: 'blob' });
  }

  obtenerPlanillaTurnos(moduloDeCargaId: number): Observable<PlanillaDeTurnos[]> {
    return this.http.get<any>(`${this.url}ModuloDeCarga/ListarPlanillaTurnos?moduloDeCargaId=${moduloDeCargaId}`, { 'withCredentials': true });
  }

  obtenerDatosMailPlanillaSolidos(moduloDeCargaId: number, cortesOcultos: number[], verObservaciones: boolean = true, esFin: boolean = false) {
    let idsOcultos = cortesOcultos.join(',');
    return this.http.get<Mail>(`${this.url}ModuloDeCarga/ObtenerDatosMailPlanillaSolidos?moduloDeCargaId=${moduloDeCargaId}&idsOcultos=${idsOcultos}&verObservaciones=${verObservaciones}&esFin=${esFin}`, { 'withCredentials': true });
  }

  enviarPlanillaTurnoSolido(idModuloDeCarga: number, mail: any, data: any): Observable<any> {

    var objetoEnvioPlanillaTurno = {
      mail: mail,
      archivo: data
    }

    return this.http.post(`${this.url}ModuloDeCarga/enviarPlanillaTurnoSolido?idModuloDeCarga=${idModuloDeCarga}`, objetoEnvioPlanillaTurno, { 'withCredentials': true });
  }

  guardarPlanillaTurnoSolido(idModuloDeCarga: number, archivo: any): Observable<any> {
    const objetoPlanillaExcel = { idModuloDeCarga, archivo, esLiquido: false };
    return this.http.post(`${this.url}ModuloDeCarga/GuardarPlanillaTurnoSolido`, objetoPlanillaExcel, { 'withCredentials': true });
  }

  obtenerRitmosBalanzaManual(modulodecarga_id: number): Observable<RitmosBalanzaManualSolido> {
    return this.http.get<RitmosBalanzaManualSolido>(`${this.url}ModuloDeCarga/ObtenerRitmosBalanzaManual?modulodecarga_id=${modulodecarga_id}`, { 'withCredentials': true });
  }

  listarHorariosExportador(moduloDeCargaId: number) {
    return this.http.get<HorariosExportador[]>(`${this.url}ModuloDeCarga/ListarHorariosExportador?moduloDeCargaId=` + moduloDeCargaId, { 'withCredentials': true });
  }

  obtenerHorarioExportador(id: number): Observable<HorariosExportador> {
    return this.http.get<HorariosExportador>(`${this.url}ModuloDeCarga/ObtenerHorarioExportador?id=${id}`, { 'withCredentials': true });
  }

  editarHorarioExportador(obj: EdicionHorarioExportador) {
    return this.http.put(`${this.url}ModuloDeCarga/EditarHorarioExportador`, obj, { withCredentials: true });
  }

  obtenerDatosMailInicioCarga(moduloDeCargaId: number) {
    return this.http.get<Mail>(`${this.url}ModuloDeCarga/ObtenerDatosMailInicioCarga?moduloDeCargaId=${moduloDeCargaId}`, { withCredentials: true });
  }

  enviarMail(mail: Mail) {
    return this.http.post(`${this.url}ModuloDeCarga/EnviarMail`, mail, { withCredentials: true });
  }

  obtenerFumigacionBodega(modCargaId :number): Observable<FumigacionBodega> {
    return this.http.get<FumigacionBodega>(`${this.url}ModuloDeCarga/ObtenerFumigacionBodega?modCargaId=${modCargaId}`, { 'withCredentials': true });
  }

  guardarFumigacion(dto: FumigacionBodega) {
    return this.http.post(`${this.url}ModuloDeCarga/GuardarFumigacion`, dto, { withCredentials: true });
  }

  obtenerEmbarqueIdPorModuloDeCarga(moduloDeCargaId: number) {
    return this.http.get<number>(`${this.url}ModuloDeCarga/ObtenerEmbarqueIdPorModuloDeCarga?moduloDeCargaId=${moduloDeCargaId}`, { withCredentials: true });
  }

}
