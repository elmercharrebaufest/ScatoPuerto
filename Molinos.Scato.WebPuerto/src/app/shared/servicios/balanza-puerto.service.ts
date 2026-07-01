import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BalanzaPuertoService {
  url: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar(filtro: string = '', pagina: number = 1): Observable<any> {
    const params = new HttpParams()
      .set('filtro', filtro)
      .set('pagina', pagina.toString());

    return this.http.get<any>(`${this.url}BalanzaPuerto/Listar`, { params, withCredentials: true });
  }

  crear(dto: any): Observable<any> {
    return this.http.post<any>(`${this.url}BalanzaPuerto/Crear`, dto, { withCredentials: true });
  }

  modificar(dto: any): Observable<any> {
    return this.http.put<any>(`${this.url}BalanzaPuerto/Modificar`, dto, { withCredentials: true });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}BalanzaPuerto/Eliminar/${id}`, { withCredentials: true });
  }
}
