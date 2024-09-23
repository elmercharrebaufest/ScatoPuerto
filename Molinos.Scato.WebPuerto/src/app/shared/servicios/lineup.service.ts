import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from 'environments/environment';
import { EstadoPuerto } from '@ScatoModels/estado-puerto';
import { Mail } from '@ScatoModels/mail';
import { UbicacionDeBuquePuerto } from '@ScatoModels/ubicacion-de-buque-puerto';
import { LineUp } from '@ScatoModels/lineUp';
import { EmbarqueRitmosLineup } from '@ScatoModels/embarque-ritmos-lineup';

@Injectable({
  providedIn: 'root'
})
export class LineupService {

  url: string = environment.apiUrl;
  private recargarListado = new Subject<any>();
  dataRecargarListado$ = this.recargarListado.asObservable();
  private _actualizarRitmos: BehaviorSubject<EmbarqueRitmosLineup> = new BehaviorSubject<EmbarqueRitmosLineup>(null);

  constructor(private http: HttpClient) {
  }

  set actualizarRitmos(value: any){
    this._actualizarRitmos.next(value);
  }
  get actualizarRitmos(){
    return this._actualizarRitmos.asObservable();
  }

  sendRecargarListado(data: any) {
    this.recargarListado.next(data);
  }

  modificarOrdenLineUp(dcnIdsYOrden: any) {
    return this.http.post(`${this.url}LineUp/ModificarOrden`, dcnIdsYOrden, { 'withCredentials': true });
  }
  modificarLineUp(lineUp: LineUp) {
    return this.http.post(`${this.url}LineUp/Modificar`, lineUp, { 'withCredentials': true });
  }

  obtenerEstadoPuerto(): Observable<EstadoPuerto> {
    return this.http.get<EstadoPuerto>(`${this.url}LineUp/ObtenerEstadoPuerto`, { 'withCredentials': true });
  }

  exportarEmbarques(): any {
    return this.http.get(`${this.url}LineUp/ExportarEmbarques`, { 'withCredentials': true, responseType: 'blob' });
  }

  enviarPorMail(mail: Mail): any {
    return this.http.post(`${this.url}LineUp/EnviarPorMail`, mail , { 'withCredentials': true });
  }
  obtenerDestinatariosLineUp() {
    return this.http.get<string[]>(`${this.url}LineUp/ObtenerDestinatariosLineUp`, { 'withCredentials' : true});
  }

  obtenerListadoUbicacionDeBuquePuerto(): Observable<UbicacionDeBuquePuerto[]> {
    return this.http.get<UbicacionDeBuquePuerto[]>(`${this.url}Embarque/ListarUbicacionDeBuquePuerto`, { 'withCredentials': true });
  }

  modificarEstadosPuerto(estadoPuerto: EstadoPuerto) {
    return this.http.post(`${this.url}LineUp/ModificarEstadosPuerto`, estadoPuerto, { 'withCredentials': true });
  }
  ocultarEmbarqueLineUp(lineUpId: number) {
    return this.http.post(`${this.url}LineUp/OcultarEmbarqueLineUp?lineUpId=` + lineUpId, { 'withCredentials': true });
  }
  restaurarEmbarquesOcultosLineUp() {
    return this.http.post(`${this.url}LineUp/RestaurarEmbarquesOcultosLineUp`, { 'withCredentials': true });
  }
}
