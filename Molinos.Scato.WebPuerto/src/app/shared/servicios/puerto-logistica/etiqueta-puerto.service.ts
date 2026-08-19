import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { SessionService } from '../session.service';

@Injectable({
  providedIn: 'root'
})
export class EtiquetaPuertoService {
  url: string = environment.apiUrl;

  constructor(private http: HttpClient, private session: SessionService) {}

  private getUsername(): string {
    const user = this.session.getUser();
    const username = user?.username || '';
    return username.split('@')[0];
  }

  listar(pagina: number = 1): Observable<any> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('usuario', this.getUsername());

    return this.http.get<any>(`${this.url}EtiquetaPuerto/Listar`, { params, withCredentials: true });
  }

  descargarTemplate(): Observable<Blob> {
    return this.http.get(`${this.url}EtiquetaPuerto/DescargarTemplate`, {
      responseType: 'blob',
      withCredentials: true
    });
  }

  importar(file: File): Observable<any> {
    const params = new HttpParams().set('usuario', this.getUsername());
    const form = new FormData();
    form.append('file', file, file.name);

    return this.http.post<any>(`${this.url}EtiquetaPuerto/Importar`, form, { params, withCredentials: true });
  }

  previsualizar(id: number): Observable<Blob> {
    const params = new HttpParams().set('usuario', this.getUsername());
    return this.http.get(`${this.url}EtiquetaPuerto/Previsualizar/${id}`, {
      params,
      responseType: 'blob',
      withCredentials: true
    });
  }

  imprimir(idEtiqueta?: number): Observable<any> {
    const params = new HttpParams().set('usuario', this.getUsername());
    return this.http.post<any>(`${this.url}EtiquetaPuerto/Imprimir`, { idEtiqueta }, { params, withCredentials: true });
  }

  guardar(etiqueta: any): Observable<any> {
    return this.http.post<any>(`${this.url}EtiquetaPuerto/Guardar`, etiqueta, { withCredentials: true });
  }

  guardarLote(etiquetas: any[]): Observable<any> {
    return this.http.post<any>(`${this.url}EtiquetaPuerto/GuardarLote`, etiquetas, { withCredentials: true });
  }
}
