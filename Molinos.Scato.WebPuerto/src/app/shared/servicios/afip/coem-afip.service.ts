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
    return this.http.post<any[]>(`${this.url}Afip/`, coem ,{ 'withCredentials': true });
  }

  public listarCoems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}Afip/`, { 'withCredentials': true });
  }

  public estadosCoem(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}Afip/`, { 'withCredentials': true });
  }

  public cambiarEstadosCoem(id): Observable<any[]> {
    return this.http.post<any[]>(`${this.url}Afip/`, { 'withCredentials': true });
  }

  // public obtenerCoemId(id:number): Observable<Caratula> {
  //   return this.http.get<Caratula>(`${this.url}Afip/ObtenerCaratula?id=${id}`, { 'withCredentials': true });
  // }

  public eliminarCoem(id:number): Observable<any> {
    return this.http.post<any>(`${this.url}Afip/?id=${id}&idEstado=4`, { 'withCredentials': true });
  }
}
