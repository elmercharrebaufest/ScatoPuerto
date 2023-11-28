import { Caratula, SolicitudCambioBuque, SolicitudCambioFechas } from '@ScatoModels/afip/caratula';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

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
  public $caratula = new BehaviorSubject<Caratula>(null);
  public $recargarCaratula = new Subject<void>();

  constructor(private http: HttpClient) { }

  public registrarCaratula(caratula: Caratula) {
    return this.http.post<boolean>(this.url + 'RegistrarCaratula', caratula, { 'withCredentials': true });
  }

  public rectificarCaratula(caratula: Caratula) {
    return this.http.put<boolean>(this.url + 'RectificarCaratula', caratula, { withCredentials: true });
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

  //#region Solicitudes

  //#region Solicitud de cambio de buque
  public listarSolicitudesCambioBuque(id: number) {
    return this.http.get<SolicitudCambioBuque[]>(`${this.url}ListarSolicitudesCambioBuque/${id}`, { withCredentials: true });
  }

  public solicitarCambioBuque(solicitud: any) {
    return this.http.put<any>(`${this.url}SolicitarCambioBuque`, solicitud, { withCredentials: true });
  }

  public efectuarSolicitudCambioBuque(id: number) {
    return this.http.put<any>(`${this.url}EfectuarSolicitudCambioBuque/${id}`, null, { withCredentials: true });
  }

  public rechazarSolicitudCambioBuque(id: number) {
    return this.http.put<any>(`${this.url}RechazarSolicitudCambioBuque/${id}`, null, { withCredentials: true });
  }
  //#endregion

  //#region Solicitud de cambio de fechas
  public listarSolicitudesCambioFechas(id: number) {
    return this.http.get<SolicitudCambioFechas[]>(`${this.url}ListarSolicitudesCambioFechas/${id}`, { withCredentials: true });
  }

  public solicitarCambioFechas(solicitud: any) {
    return this.http.put<any>(`${this.url}SolicitarCambioFechas`, solicitud, { withCredentials: true });
  }

  public efectuarSolicitudCambioFechas(id: number) {
    return this.http.put<any>(`${this.url}EfectuarSolicitudCambioFechas/${id}`, null, { withCredentials: true });
  }

  public rechazarSolicitudCambioFechas(id: number) {
    return this.http.put<any>(`${this.url}RechazarSolicitudCambioFechas/${id}`, null, { withCredentials: true });
  }
  //#endregion

  //#endregion
}
