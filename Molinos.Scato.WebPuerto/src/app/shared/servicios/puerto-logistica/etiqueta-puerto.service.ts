import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EtiquetaPuertoService {
  url: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar(username: string, pagina: number = 1): Observable<any> {
    const params = new HttpParams()
      .set('username', username)
      .set('pagina', pagina.toString());

    return this.http.get<any>(`${this.url}EtiquetaPuerto/Listar`, { params, withCredentials: true });
  }

  guardar(etiqueta: any): Observable<any> {
    return this.http.post<any>(`${this.url}EtiquetaPuerto/Guardar`, etiqueta, { withCredentials: true });
  }

  guardarLote(etiquetas: any[]): Observable<any> {
    return this.http.post<any>(`${this.url}EtiquetaPuerto/GuardarLote`, etiquetas, { withCredentials: true });
  }

  eliminar(username: string): Observable<any> {
    return this.http.delete<any>(`${this.url}EtiquetaPuerto/Eliminar/${username}`, { withCredentials: true });
  }
}
