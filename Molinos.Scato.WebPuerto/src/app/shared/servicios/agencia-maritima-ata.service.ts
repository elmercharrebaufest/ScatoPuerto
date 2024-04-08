import { ListaPaginada } from '@ScatoModels/listaPaginada';
import { AgenciaMaritimaATA } from '@ScatoModels/programa-embarque/agencia-maritima-ata';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgenciaMaritimaAtaService {

  private url: string = environment.apiUrl;
  public $recargarAgenciasMaritimasAta = new Subject<void>();
  constructor(private http: HttpClient) { }

  // public registrarCoem(coem: COEM): Observable<any[]> {
  //   return this.http.post<any[]>(`${this.url}Afip/RegistrarCoem`, coem, { 'withCredentials': true });
  // }

  // public editarCoem(coem: COEM): Observable<any[]> {
  //   return this.http.put<any[]>(`${this.url}Afip/RectificarCoem`, coem, { 'withCredentials': true });
  // }

  public listar(params: any) {
    for (const prop in params) {
      if (!params[prop]) {
        delete params[prop];
      }
    }
    return this.http.get<ListaPaginada<AgenciaMaritimaATA>>(`${this.url}ProgramaEmbarque/ListarAgenciasATA`, { 'withCredentials': true, params });
  }

  public obtenerAgenciaMaritima(id: number): Observable<AgenciaMaritimaATA> {
    return this.http.get<AgenciaMaritimaATA>(`${this.url}ProgramaEmbarque/ObtenerAgenciaMaritima?id=${id}`, { 'withCredentials': true });
  }

  public obtenerAta(id: number): Observable<AgenciaMaritimaATA> {
    return this.http.get<AgenciaMaritimaATA>(`${this.url}ProgramaEmbarque/ObtenerATA?id=${id}`, { 'withCredentials': true });
  }

  public crear(body: AgenciaMaritimaATA) {
    return this.http.post<boolean>(`${this.url}ProgramaEmbarque/CrearAgenciaMaritimaATA`, body, { 'withCredentials': true });
  }

  public modificar(body: AgenciaMaritimaATA): Observable<any> {
    return this.http.put<any>(`${this.url}ProgramaEmbarque/ModificarAgenciaMaritimaATA`, body, { 'withCredentials': true });
  }

  public eliminar(id: number, tipo: number): Observable<any> {
    return this.http.delete<any>(`${this.url}ProgramaEmbarque/EliminarAgenciaMaritimaATA?id=${id}&tipo=${tipo}`, { 'withCredentials': true });
  }
}
