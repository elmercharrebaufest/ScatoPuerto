import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  private username: string = environment.webPuertoApiUsername; 
  private password: string = environment.webPuertoApiPassword; 
  // #endregion

  // #region Constructor
  constructor(
    private http: HttpClient
  ) {
  }
  // #endregion

    // #region Métodos privados para agregar la autenticación básica
    private getBasicAuthHeaders(): HttpHeaders {
      const auth = 'Basic ' + btoa(`${this.username}:${this.password}`);
      console.log(this.username,this.password)
      return new HttpHeaders({ 'Authorization': auth });
    }
    // #endregion
  // #region Metodos  
  public obtenerListarHistorialDeBuques(anio: number, mes: number, vaporId: number, nombreBuque: string, destino: string, 
    exportador: string, controlPrivado: string, desde: Date, hasta: Date, producto: string, pagina: number, itemsPorPagina: number): Observable<any> {
    const headers = this.getBasicAuthHeaders();
    return this.http.get<any>(`${this.url}Buque/ListarHistorialDeBuques?anio=${anio}&mes=${mes}&vaporId=${vaporId}&nombreBuque=${nombreBuque}&destino=${destino}&exportador=${exportador}&controlPrivado=${controlPrivado}&desde=${desde}&hasta=${hasta}&producto=${producto}
    &pagina=${pagina}&itemsPorPagina=${itemsPorPagina}`,
    { headers });
  }

  public obtenerPaises(): Observable<Pais[]> {
    const headers = this.getBasicAuthHeaders();
    return this.http.get<Pais[]>(`${this.url}Buque/ListarPaises`, { headers });
  }

  public obtenerVapores(): Observable<Vapor[]> {
    const headers = this.getBasicAuthHeaders();
    return this.http.get<Vapor[]>(`${this.url}Buque/ObtenerVapores`, { headers });
  }

  public obtenerVaporInformacion(Vapor_Id: number): Observable<VaporInformacion> {
    const headers = this.getBasicAuthHeaders();
    return this.http.get<VaporInformacion>(`${this.url}Buque/ObtenerVaporInformacion?Vapor_Id=${Vapor_Id}`, { headers });
  }

  public obtenerRegistroFechas(idEmbarque: number): Observable<RegistroFechas> {
    const headers = this.getBasicAuthHeaders();
    return this.http.get<RegistroFechas>(`${this.url}Buque/ObtenerRegistroFechas?idEmbarque=${idEmbarque}`, { headers });
  }

  public obtenerActores(idEmbarque: number): Observable<Actores> {
    const headers = this.getBasicAuthHeaders();
    return this.http.get<Actores>(`${this.url}Buque/ObtenerActores?idEmbarque=${idEmbarque}`, { headers });
  }

  public GuardarHistoricoOperador(idEmbarque: number, accion: string){
    const headers = this.getBasicAuthHeaders();
    return this.http.post(`${this.url}Buque/GuardarHistoricoOperador?idEmbarque=${idEmbarque}&accion=${accion}`, { headers });
  }

  public obtenerOperadores(idEmbarque: number): Observable<Operador[]>{
    const headers = this.getBasicAuthHeaders();
    return this.http.get<Operador[]>(`${this.url}Buque/ListarOperadores?Embarque_Id=${idEmbarque}`, { headers });
  }
  // #endregion
}
