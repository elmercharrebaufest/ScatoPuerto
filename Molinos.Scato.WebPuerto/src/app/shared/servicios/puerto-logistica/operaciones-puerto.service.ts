import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OperacionesPuertoService {
  url: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listarCargas(filtro: any, pagina: number = 1, ordenarPor: string = 'Fecha', dirOrden: string = 'Asc'): Observable<any> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('ordenarPor', ordenarPor)
      .set('dirOrden', dirOrden);

    if (filtro) {
      Object.keys(filtro).forEach(key => {
        if (filtro[key] != null && filtro[key] !== '') {
          params = params.set(key, filtro[key].toString());
        }
      });
    }

    return this.http.get<any>(`${this.url}OperacionesPuerto/ListarCargas`, { params, withCredentials: true });
  }

  listarBalanzadas(id: number, idFin: number, numeroBalanza: string, enviado: boolean, pagina: number = 1): Observable<any> {
    const params = new HttpParams()
      .set('id', id.toString())
      .set('idFin', idFin.toString())
      .set('numeroBalanza', numeroBalanza)
      .set('enviado', enviado.toString())
      .set('pagina', pagina.toString());

    return this.http.get<any>(`${this.url}OperacionesPuerto/ListarBalanzadas`, { params, withCredentials: true });
  }

  obtenerCarga(id: number, numeroBalanza: string): Observable<any> {
    const params = new HttpParams()
      .set('id', id.toString())
      .set('numeroBalanza', numeroBalanza);

    return this.http.get<any>(`${this.url}OperacionesPuerto/ObtenerCarga`, { params, withCredentials: true });
  }

  totalEmbarcado(cargaInicialId: number, cargaInicialNumeroBalanza: string): Observable<number> {
    const params = new HttpParams()
      .set('cargaInicialId', cargaInicialId.toString())
      .set('cargaInicialNumeroBalanza', cargaInicialNumeroBalanza);

    return this.http.get<number>(`${this.url}OperacionesPuerto/TotalEmbarcado`, { params, withCredentials: true });
  }

  balanzadasFaltantes(id: number, idFin: number, numeroBalanza: string): Observable<any> {
    const params = new HttpParams()
      .set('id', id.toString())
      .set('idFin', idFin.toString())
      .set('numeroBalanza', numeroBalanza);

    return this.http.get<any>(`${this.url}OperacionesPuerto/BalanzadasFaltantes`, { params, withCredentials: true });
  }

  enviarASap(comando: any): Observable<any> {
    return this.http.post<any>(`${this.url}OperacionesPuerto/EnviarASap`, comando, { withCredentials: true });
  }
}
