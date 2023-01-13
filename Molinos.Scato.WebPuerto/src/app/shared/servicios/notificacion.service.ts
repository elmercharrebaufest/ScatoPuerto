import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Notificacion } from '@ScatoModels/programa-embarque/notificaciones';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

  url: string = environment.apiUrl;

  constructor(private http: HttpClient) { 

  }

  obtenerNotificaciones(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.url}ProgramaEmbarque/ObtenerNotificaciones`, { 'withCredentials': true });
  }

  eliminarNotificacion(notificacion : Notificacion) {
    return this.http.post(`${this.url}ProgramaEmbarque/EliminarNotificacion`, notificacion, { 'withCredentials': true });
  }
}
