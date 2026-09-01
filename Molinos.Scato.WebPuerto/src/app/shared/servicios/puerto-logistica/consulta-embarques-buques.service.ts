import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConsultaEmbarquesBuquesService {
  url: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar(filtro: any, pagina: number = 1, ordenarPor: string = 'Fecha', dirOrden: string = 'Desc', itemsPorPagina: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('ordenarPor', ordenarPor)
      .set('dirOrden', dirOrden)
      .set('itemsPorPagina', itemsPorPagina.toString());

    if (filtro) {
      Object.keys(filtro).forEach(key => {
        if (filtro[key] != null && filtro[key] !== '') {
          params = params.set(key, filtro[key].toString());
        }
      });
    }

    return this.http.get<any>(`${this.url}ConsultaEmbarquesBuques/Listar`, { params, withCredentials: true });
  }

  listarVapores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}ConsultaEmbarquesBuques/ListarVapores`, { withCredentials: true });
  }

  listarExportadores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}ConsultaEmbarquesBuques/ListarExportadores`, { withCredentials: true });
  }

  listarDestinos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}ConsultaEmbarquesBuques/ListarDestinos`, { withCredentials: true });
  }

  listarMateriales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}ConsultaEmbarquesBuques/ListarMateriales`, { withCredentials: true });
  }
}
