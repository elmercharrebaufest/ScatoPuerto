import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { SessionService } from 'app/shared/servicios/session.service';

@Injectable({
  providedIn: 'root'
})
export class BodegaService {
  url: string = environment.apiUrl;

  constructor(private http: HttpClient, private sessionService: SessionService) {}

  private headers(): HttpHeaders {
    const username = this.sessionService.getUser()?.username ?? '';
    return new HttpHeaders({ 'X-Usuario': username });
  }

  listar(filtro: string = '', pagina: number = 1, ordenarPor: string = 'Id', dirOrden: string = 'Asc'): Observable<any> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('ordenarPor', ordenarPor)
      .set('dirOrden', dirOrden);
    if (filtro) {
      params = params.set('filtro', filtro);
    }

    return this.http.get<any>(`${this.url}Bodega/Listar`, { params, withCredentials: true });
  }

  crear(dto: any): Observable<any> {
    return this.http.post<any>(`${this.url}Bodega/Crear`, dto, { headers: this.headers(), withCredentials: true });
  }

  modificar(dto: any): Observable<any> {
    return this.http.put<any>(`${this.url}Bodega/Modificar`, dto, { headers: this.headers(), withCredentials: true });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}Bodega/Eliminar/${id}`, { headers: this.headers(), withCredentials: true });
  }
}
