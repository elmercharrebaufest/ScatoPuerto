import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { NotificacionProgramaDeEmbarque } from '@ScatoModels/programa-embarque/notificacionProgramaDeEmbarque';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

  url: string = environment.apiUrl;

  constructor(private http: HttpClient) { 

  }

  obtenerNotificaciones(): Observable<NotificacionProgramaDeEmbarque[]> {
    return this.http.get<NotificacionProgramaDeEmbarque[]>(`${this.url}ProgramaEmbarque/ObtenerNotificaciones`, { 'withCredentials': true });
  }

  eliminarNotificacion(notificacion : NotificacionProgramaDeEmbarque) {
    return this.http.post(`${this.url}ProgramaEmbarque/EliminarNotificacion`, notificacion, { 'withCredentials': true });
  }
}
