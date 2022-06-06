import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Parametros } from '@ScatoModels/parametros';

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {
  @Output() sendParametros = new EventEmitter<Parametros[]>();
  private parametros: Parametros[];
  private url: string = environment.apiUrl;
  private verConsoleLog: boolean = false;
  private msTiempoActualizacionBalanzas: number = 0;
  private msTiempoActualizacionRitmosBlzas78: number = 0;

  constructor(private http: HttpClient) {}
  
  //GUARDA LOS DATOS DE LOS PARÁMETROS
  /**
   * @param {Object} Parametros[] objeto completo de parámetros
   * @returns {void}
   * @memberof ParametrosService
   * @description Tipos de parámetros > parametro1: boolean; parametro2: number; parametro3: string; Cada uno destinado a manejar
   * los parámetros de su tipo.
   */
  setParametros(parametros: Parametros[]){
    this.parametros = parametros;
    
    let consoleLogActivo = this.parametros.find( e => e.descripcion.includes('ConsoleLog')).parametro1
    this.setConsoleLog(consoleLogActivo);

    let tiempoActualizacionBalanzas = this.parametros.find( e => e.descripcion.includes('tiempoActualizacionBalanzas')).parametro2
    this.setTiempoActualizacionBalanzas(tiempoActualizacionBalanzas);

    let tiempoActualizacionRitmosBlzas78 = this.parametros.find( e => e.descripcion.includes('tiempoActualizacionRitmosBlzas78')).parametro2
    this.setTiempoActualizacionRitmosBlzas78(tiempoActualizacionRitmosBlzas78);
  }
  
  setConsoleLog(activo: boolean){
    this.verConsoleLog = activo;
  }
  setTiempoActualizacionBalanzas(milisegundos: number){
    this.msTiempoActualizacionBalanzas = milisegundos;
  }
  setTiempoActualizacionRitmosBlzas78(milisegundos: number){
    this.msTiempoActualizacionRitmosBlzas78 = milisegundos;
  }

  getParametroConsoleLog() {
    return this.verConsoleLog;
  }
  getParametroTiempoActualizacionBalanzas() {
    return this.msTiempoActualizacionBalanzas;
  }
  getParametroTiempoActualizacionRitmosBlzas78() {
    return this.msTiempoActualizacionRitmosBlzas78;
  }

  /**
   * @param {string} String Mensaje a mostrar
   * @param {any} Any Variable a mostrar
   * @returns {void}
   * @memberof ParametrosService
   */
  consola(msje: string, other: any): void{
    if(this.verConsoleLog) console.log(msje, other);
  }
  
  obtenerParametros(): Observable<Parametros[]>{
    return this.http.get<Parametros[]>(`${this.url}ModuloDeCarga/obtenerParametros`, { 'withCredentials' : true});
  }

  // TODO: aún no implementado en back
  actualizarParametro(idParametro: number, activo: boolean){
    return this.http.post(`${this.url}ModuloDeCarga/actualizarParametro?idParametro=${idParametro}`, activo, { 'withCredentials': true});
  }
}