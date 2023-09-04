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
  private url: string = environment.apiUrl;
  constructor(private http: HttpClient) { }

  public registrarOEditarCaratula(caratula:Caratula): Observable<any[]> {
    return this.http.post<any[]>(`${this.url}Afip/RegistrarCaratula`, caratula ,{ 'withCredentials': true });
  }

  public listarCaratulas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}Afip/ListarCaratulas`, { 'withCredentials': true });
  }

  public obtenerCaratulaId(id:number): Observable<Caratula> {
    return this.http.get<Caratula>(`${this.url}Afip/ObtenerCaratula?id=${id}`, { 'withCredentials': true });
  }

  public eliminarCaratula(id:number): Observable<any> {
    return this.http.post<any>(`${this.url}Afip/CambiarEstadoCaratula?id=${id}&idEstado=4`, { 'withCredentials': true });
  }
}
