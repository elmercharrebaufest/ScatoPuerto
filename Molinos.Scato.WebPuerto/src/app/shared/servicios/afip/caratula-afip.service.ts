import { Caratula } from '@ScatoModels/afip/caratula';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

export interface EstadosCaratulaAFIP {
  Aceptado: string;
  Rectificado: string;
  Enviado: string;
  Eliminado: string
}

@Injectable({
  providedIn: 'root'
})
export class CaratulaAfipService {
  public estados: EstadosCaratulaAFIP = {
    Aceptado: "Aceptado",
    Rectificado: "Rectificado",
    Enviado: "Enviado (Ya asociado a COEM)",
    Eliminado: "Eliminado"
  };
  private url: string = environment.apiUrl + 'afip/';
  constructor(private http: HttpClient) { }

  public registrarCaratula(caratula: Caratula): Observable<any[]> {
    return this.http.post<any[]>(this.url + 'RegistrarCaratula', caratula, { 'withCredentials': true });
  }

  public rectificarCaratula(caratula: Caratula): Observable<any> {
    return this.http.put<any>(this.url + 'RectificarCaratula', caratula, { withCredentials: true });
  }

  public listarCaratulas(): Observable<Caratula[]> {
    return this.http.get<Caratula[]>(this.url + 'ListarCaratulas', { withCredentials: true });
  }

  public listarEstadosCaratula(): Observable<string[]> {
    return this.http.get<string[]>(this.url + 'ListarEstadosCaratula', { withCredentials: true });
  }

  public obtenerCaratulaId(id: number): Observable<Caratula> {
    return this.http.get<Caratula>(`${this.url}ObtenerCaratula?id=${id}`, { withCredentials: true });
  }

  public cambiarEstadoCaratula(id: number, estado: string): Observable<any> {
    return this.http.put<any>(`${this.url}CambiarEstadoCaratula?id=${id}&estado=${estado}`, null);
  }

  public eliminarCaratula(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}AnularCaratula?id=${id}`, { withCredentials: true });
  }
}
