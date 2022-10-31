import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { Pais } from '@ScatoModels/Buques/Pais';
import { VaporInformacion } from '@ScatoModels/Buques/VaporInformacion';
import { Vapor } from '@ScatoModels/vapor';
import { RegistroFechas } from '@ScatoModels/Buques/registroFechas';
import { Actores } from '@ScatoModels/Buques/Actores';
import { Operador } from '@ScatoModels/Buques/Operador';
@Injectable({
  providedIn: 'root'
})
export class BuqueService {

  // #region Variables  
  private url: string = environment.apiUrl;
  // #endregion

  // #region Constructor
  constructor(
    private http: HttpClient
  ) {
  }
  // #endregion

  // #region Metodos  
  public obtenerListarHistorialDeBuques(anio: number, mes: number, vaporId: number): Observable<any> {
    return this.http.get<any>(`${this.url}Buque/ListarHistorialDeBuques?anio=${anio}&mes=${mes}&vaporId=${vaporId}`, { 'withCredentials': true });
  }

  public obtenerPaises(): Observable<Pais[]> {
    return this.http.get<Pais[]>(`${this.url}Buque/ListarPaises`, { 'withCredentials': true });
  }

  public obtenerVapores(): Observable<Vapor[]> {
    return this.http.get<Vapor[]>(`${this.url}Buque/ObtenerVapores`, { 'withCredentials': true });
  }

  public guardarVaporInformacion(objVaporInformacion: object[]) {
    return this.http.post(`${this.url}Buque/GuardarVaporInformacion`, objVaporInformacion, { 'withCredentials': true });
  }

  public obtenerVaporInformacion(Vapor_Id: number): Observable<VaporInformacion> {
    return this.http.get<VaporInformacion>(`${this.url}Buque/ObtenerVaporInformacion?Vapor_Id=${Vapor_Id}`, { 'withCredentials': true });
  }

  public obtenerRegistroFechas(idEmbarque: number): Observable<RegistroFechas> {
    return this.http.get<RegistroFechas>(`${this.url}Buque/ObtenerRegistroFechas?idEmbarque=${idEmbarque}`, { 'withCredentials': true });
  }

  public obtenerActores(idEmbarque: number): Observable<Actores> {
    return this.http.get<Actores>(`${this.url}Buque/ObtenerActores?idEmbarque=${idEmbarque}`, { 'withCredentials': true });
  }

  public GuardarHistoricoOperador(idEmbarque: number, accion: string){
    return this.http.post(`${this.url}Buque/GuardarHistoricoOperador?idEmbarque=${idEmbarque}&accion=${accion}`, { 'withCredentials': true });
  }

  public obtenerOperadores(idEmbarque: number): Observable<Operador[]>{
    return this.http.get<Operador[]>(`${this.url}Buque/ListarOperadores?Embarque_Id=${idEmbarque}`, { 'withCredentials': true });
  }
  // #endregion
}
