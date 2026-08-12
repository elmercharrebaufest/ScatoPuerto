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

  listarBalanzadas(id: number, idFin: number | null, numeroBalanza: string, enviado: boolean | null, pagina: number = 1, ordenarPor: string = 'Id', dirOrden: string = 'Asc', itemsPorPagina: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('id', id.toString())
      .set('numeroBalanza', numeroBalanza)
      .set('pagina', pagina.toString())
      .set('ordenarPor', ordenarPor)
      .set('dirOrden', dirOrden)
      .set('itemsPorPagina', itemsPorPagina.toString());

    if (idFin != null) {
      params = params.set('idFin', idFin.toString());
    }
    if (enviado != null) {
      params = params.set('enviado', enviado.toString());
    }

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

  obtenerEnvioSapActivo(): Observable<boolean> {
    return this.http.get<boolean>(`${this.url}OperacionesPuerto/EnvioSapBalanzadasActivo`, { withCredentials: true });
  }

  enviarASap(comando: any): Observable<any> {
    return this.http.post<any>(`${this.url}OperacionesPuerto/EnviarASap`, comando, { withCredentials: true });
  }

  enviarASapLote(cargaId: number, numeroBalanza: string, usuario: string): Observable<any> {
    const params = new HttpParams()
      .set('cargaId', cargaId.toString())
      .set('numeroBalanza', numeroBalanza)
      .set('usuario', usuario);
    return this.http.post<any>(`${this.url}OperacionesPuerto/EnviarASapLote`, null, { params, withCredentials: true });
  }

  crearCarga(dto: any): Observable<any> {
    return this.http.post<any>(`${this.url}OperacionesPuerto/CrearCarga`, dto, { withCredentials: true });
  }

  modificarCarga(dto: any): Observable<any> {
    return this.http.put<any>(`${this.url}OperacionesPuerto/ModificarCarga`, dto, { withCredentials: true });
  }

  crearBalanzada(dto: any): Observable<any> {
    return this.http.post<any>(`${this.url}OperacionesPuerto/CrearBalanzada`, dto, { withCredentials: true });
  }

  modificarBalanzada(dto: any): Observable<any> {
    return this.http.put<any>(`${this.url}OperacionesPuerto/ModificarBalanzada`, dto, { withCredentials: true });
  }

  eliminarBalanzada(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}OperacionesPuerto/EliminarBalanzada/${id}`, { withCredentials: true });
  }

  obtenerBalanzada(id: number, numeroBalanza: string): Observable<any> {
    const params = new HttpParams()
      .set('id', id.toString())
      .set('numeroBalanza', numeroBalanza);
    return this.http.get<any>(`${this.url}OperacionesPuerto/ObtenerBalanzada`, { params, withCredentials: true });
  }

  crearEmbarqueLiquido(model: any): Observable<any> {
    return this.http.post<any>(`${this.url}OperacionesPuerto/CrearEmbarqueLiquido`, model, { withCredentials: true });
  }

  todoEnviado(id: number, idFin: number, numeroBalanza: string): Observable<any> {
    let params = new HttpParams()
      .set('id', id.toString())
      .set('numeroBalanza', numeroBalanza);
    if (idFin != null) {
      params = params.set('idFin', idFin.toString());
    }
    return this.http.get<any>(`${this.url}OperacionesPuerto/TodoEnviado`, { params, withCredentials: true });
  }

  listarExportadores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}OperacionesPuerto/ListarExportadores`, { withCredentials: true });
  }

  listarMateriales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}OperacionesPuerto/ListarMateriales`, { withCredentials: true });
  }

  listarBalanzasPuerto(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}OperacionesPuerto/ListarBalanzasPuerto`, { withCredentials: true });
  }

  listarBalanzasAdministrativas(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}OperacionesPuerto/ListarBalanzasAdministrativas`, { withCredentials: true });
  }

  buscarVapor(criteria: string): Observable<any> {
    const params = new HttpParams().set('criteria', criteria);
    return this.http.get<any>(`${this.url}OperacionesPuerto/BuscarVapor`, { params, withCredentials: true });
  }

  buscarVapores(criteria: string): Observable<any[]> {
    const params = new HttpParams().set('criteria', criteria);
    return this.http.get<any[]>(`${this.url}OperacionesPuerto/BuscarVapores`, { params, withCredentials: true });
  }

  buscarBodega(criteria: string): Observable<any> {
    const params = new HttpParams().set('criteria', criteria);
    return this.http.get<any>(`${this.url}OperacionesPuerto/BuscarBodega`, { params, withCredentials: true });
  }

  buscarBodegas(criteria: string): Observable<any[]> {
    const params = new HttpParams().set('criteria', criteria);
    return this.http.get<any[]>(`${this.url}OperacionesPuerto/BuscarBodegas`, { params, withCredentials: true });
  }

  buscarExportador(criteria: string): Observable<any> {
    const params = new HttpParams().set('criteria', criteria);
    return this.http.get<any>(`${this.url}OperacionesPuerto/BuscarExportador`, { params, withCredentials: true });
  }

  buscarExportadores(criteria: string): Observable<any[]> {
    const params = new HttpParams().set('criteria', criteria);
    return this.http.get<any[]>(`${this.url}OperacionesPuerto/BuscarExportadores`, { params, withCredentials: true });
  }

  buscarDestino(criteria: string): Observable<any> {
    const params = new HttpParams().set('criteria', criteria);
    return this.http.get<any>(`${this.url}OperacionesPuerto/BuscarDestino`, { params, withCredentials: true });
  }

  buscarDestinos(criteria: string): Observable<any[]> {
    const params = new HttpParams().set('criteria', criteria);
    return this.http.get<any[]>(`${this.url}OperacionesPuerto/BuscarDestinos`, { params, withCredentials: true });
  }

  buscarMaterialPuerto(criteria: string): Observable<any> {
    const params = new HttpParams().set('criteria', criteria);
    return this.http.get<any>(`${this.url}OperacionesPuerto/BuscarMaterialPuerto`, { params, withCredentials: true });
  }

  buscarMaterialesPuerto(criteria: string): Observable<any[]> {
    const params = new HttpParams().set('criteria', criteria);
    return this.http.get<any[]>(`${this.url}OperacionesPuerto/BuscarMaterialesPuerto`, { params, withCredentials: true });
  }
}
