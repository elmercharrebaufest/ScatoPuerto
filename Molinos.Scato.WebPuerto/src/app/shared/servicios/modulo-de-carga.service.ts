import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { SentidoManoDeEmbarque } from '@ScatoModels/sentido-mano-embarque';
import { CeldaManoDeEmbarque } from '@ScatoModels/celda-mano-embarque';
import { ModuloDeCarga } from '@ScatoModels/modulo-carga';
import { ModuloDeCargaListado } from '@ScatoModels/modulo-carga-listado';
import { MotivosDeCorte } from '@ScatoModels/planilla-turnos/motivo-de-corte';
import { Bodega, MotivosFallasBalanza } from '@ScatoModels/balanzadas/balanza';
import { Nir } from '@ScatoModels/nir';
import { FuncionesGeneralesService } from './funciones-generales.service';

@Injectable({
  providedIn: 'root'
})
export class ModuloDeCargaService {
  url: string = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private funcionesGeneralesService: FuncionesGeneralesService,
  ) {

  }
  
  obtenerListadoSentidoManoDeEmbarque(): Observable<SentidoManoDeEmbarque[]> {
    return this.http.get<SentidoManoDeEmbarque[]>(`${this.url}ModuloDeCarga/ListarSentidoManoDeEmbarques`, { 'withCredentials': true });
  }

  obtenerListadoCeldaManoDeEmbarque(): Observable<CeldaManoDeEmbarque[]> {
    return this.http.get<CeldaManoDeEmbarque[]>(`${this.url}ModuloDeCarga/ListarCeldaManoDeEmbarques`, { 'withCredentials': true });
  }

  guardarModuloDeCarga(moduloDeCarga: ModuloDeCarga){
    return this.http.post(`${this.url}ModuloDeCarga/GuardarModuloDeCarga`, moduloDeCarga, { 'withCredentials' : true});
}
  
  obtenerModuloDeCarga(moduloDeCargaId: number) {
    return this.http.get<ModuloDeCarga>(`${this.url}ModuloDeCarga/ObtenerModuloDeCarga?id=`+moduloDeCargaId, { 'withCredentials' : true});
  }

  modificarCargadoPlanoDeCarga(planoDeCargaId: any): Observable<any>{
    return this.http.post(`${this.url}PlanoDeCarga/ModificarCargadoPlanoDeCarga?planoDeCargaId=${parseInt(planoDeCargaId)}`, {'withCredentials': true});
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
  guardarPlanillaDeTurnos(planillaDeTurnos: any, idModuloDeCarga: number): Observable<any>{

    return this.http.post(`${this.url}ModuloDeCarga/GuardarPlanillaDeTurnos?idModuloDeCarga=${idModuloDeCarga}`,  planillaDeTurnos, { 'withCredentials': true});
  }

  
  /**
   * 
   * @param {any} planillaTurnos PlanillaDeTurnos
   * @param {any} mail
   * @returns {Observable<any>}
   */

  guardarTurnoPlanillaDeTurnos(planillaDeTurnos: any, idModuloDeCarga: number, enviado: boolean = false){
    return this.http.post(`${this.url}ModuloDeCarga/GuardarTurnoPlanillaDeTurnos?idModuloDeCarga=${idModuloDeCarga}&enviado=${enviado}`, planillaDeTurnos, { 'withCredentials': true});  
  }

   guardarPlanillaDeTurnosMail(planillaDeTurnos: any, idModuloDeCarga: number, mail:any): Observable<any>{
    var ObjetoMail = {
      planillaDeTurnos : planillaDeTurnos,
      mail:mail
    }
    return this.http.post(`${this.url}ModuloDeCarga/GuardarPlanillaDeTurnosMail?idModuloDeCarga=${idModuloDeCarga}`, ObjetoMail, { 'withCredentials': true});
  }

  guardarPlanillaDeTurnosEnviarMail(idModuloDeCarga: number, mail:any, data: any): Observable<any>{

    var objetoEnvioPlanillaTurno = {
      mail : mail,
      archivo: data
    }

    return this.http.post(`${this.url}ModuloDeCarga/GuardarPlanillaDeTurnosEnviarMail?idModuloDeCarga=${idModuloDeCarga}`, objetoEnvioPlanillaTurno, { 'withCredentials': true});
  }

  /**
   * 
   * @returns {Observable<MotivosDeCorte[]>} MotivoDeCorte[]
   */
  obtenerMotivosDeCorte(): Observable<MotivosDeCorte[]>{
    return this.http.get<MotivosDeCorte[]>(`${this.url}ModuloDeCarga/ListarMotivosDeCorte`, { 'withCredentials': true})
  }

  /**
   * 
   * @returns {Observable<any>} Observable<any>
   */ 

   obtenerModuloDeCargaPlanillaDeTurnos(turnoPuerto_id, moduloDeCarga_id, esliquido: boolean) {
    return this.http.get(`${this.url}ModuloDeCarga/ObtenerModuloDeCargaPlanillaDeTurnos?turnoPuerto_id=${turnoPuerto_id}&moduloDeCarga_id=${moduloDeCarga_id}&esliquido=${esliquido}`, { 'withCredentials': true });
  }
  obtenerTurnoPuerto(): Observable<any>{
    return this.http.get(`${this.url}ModuloDeCarga/ListarTurnoPuerto`, {'withCredentials': true});
  }

  guardarPeriodoDeCarga(): Observable<any>{
    return this.http.post(`${this.url}ModuloDeCarga/GuardarPeriodoDeCarga`, {'withCredentials': true});
  }

  obtenerDestinatariosPlanillaTurnos(templateMail) {
    return this.http.get<string[]>(`${this.url}ModuloDeCarga/ObtenerDestinatariosPlanillaTurnos?templateMail=${templateMail}`, { 'withCredentials' : true});
  }

  guardarLineasDeEmbarque(lineasDeEmbarque: any, idModuloDeCarga: number){
    return this.http.post(`${this.url}ModuloDeCarga/GuardarLineasDeEmbarque?idModuloDeCarga=${idModuloDeCarga}`, lineasDeEmbarque, { 'withCredentials': true});  
  }

  guardarPlanillaDeEmbarque(planillaDeEmbarqueDtos: any, idModuloDeCarga: number){
    return this.http.post(`${this.url}ModuloDeCarga/GuardarPlanillaDeEmbarque?idModuloDeCarga=${idModuloDeCarga}`, planillaDeEmbarqueDtos, { 'withCredentials': true});  
  }

  obtenerNir(moduloDeCarga_id: number): Observable<Nir[]>{
    return this.http.get<Nir[]>(`${this.url}ModuloDeCarga/ObtenerModuloDeCargaNirManualPuerto?moduloDeCarga_id=${moduloDeCarga_id}`, { 'withCredentials': true})
  }
  
  guardarModuloDeCargaNirManualPuerto(moduloDeCargaNirManualPuerto: Nir[], moduloDeCarga_Id: number){
    
    let objetoMail = {
      nirManualPuerto : moduloDeCargaNirManualPuerto,
      mail: {
        "body": "body",
        "destinatarios": [
          "destinatarios1",
          "destinatarios2"
        ],
        "titulo": "titulo2",
        "adjunto": "adjunto3",
        "nombre": "nombre4"
      }
    }

    return this.http.post(`${this.url}ModuloDeCarga/GuardarModuloDeCargaNirManualPuerto?IdModuloDeCarga=${moduloDeCarga_Id}`, objetoMail, { 'withCredentials': true});
  }

  obtenerListadoBodegas(): Observable<Bodega[]>{
    return this.http.get<Bodega[]>(`${this.url}ModuloDeCarga/ListadoBodegas`, { 'withCredentials' : true});
  }

  eliminarObservacionDeCalidad( observacion_id: number ){
    return this.http.post(`${this.url}ModuloDeCarga/EliminarObservacionDeCalidad?observacion_id=${observacion_id}`, { 'withCredentials': true });
  }
}
