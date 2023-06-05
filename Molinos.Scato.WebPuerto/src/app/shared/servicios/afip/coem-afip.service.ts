import { COEM } from '@ScatoModels/afip/coem';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoemAfipService {

  private url: string = environment.apiUrl;
  constructor(private http: HttpClient) { }

  public registrarCoem(coem:COEM): Observable<any[]> {
    return this.http.post<any[]>(`${this.url}Afip/RegistrarCoem`, coem ,{ 'withCredentials': true });
  }

  public editarCoem(coem:COEM): Observable<any[]> {
    return this.http.post<any[]>(`${this.url}Afip/RegistrarCoem`, coem ,{ 'withCredentials': true });
  }

  public listarCoems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}Afip/ListarCoems`, { 'withCredentials': true });
  }

  public estadosCoem(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}Afip/ListarEstadosCoem`, { 'withCredentials': true });
  }

  public cambiarEstadosCoem(id,idCoem): Observable<any[]> {
    return this.http.post<any[]>(`${this.url}Afip/CambiarEstadoCoem?idCoem=${idCoem}&idEstado=${id}`, { 'withCredentials': true });
  }

  public obtenerCoemId(id:number): Observable<any> {
    return this.http.get<any>(`${this.url}Afip/ObtenerCoem?id=${id}`, { 'withCredentials': true });
  }

  public comboCaratulas(): Observable<any> {
    return this.http.get<any>(`${this.url}Afip/ComboCaratulas`, { 'withCredentials': true });
  }

  public eliminarCoem(id:number): Observable<any> {
    return this.http.post<any>(`${this.url}Afip/CambiarEstadoCoem?idCoem=${id}&idEstado=5`, { 'withCredentials': true });
  }
}
