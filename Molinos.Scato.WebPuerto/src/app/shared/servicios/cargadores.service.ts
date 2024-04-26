import { Exportador } from '@ScatoModels/exportador';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CargadoresService {

  private url: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public ListarCargadores(pagina: number = 0, itemsPorPagina: number = 10, nombre: string) {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('itemsPorPagina', itemsPorPagina.toString())
      .set('nombre', nombre);
    return this.http.get<Exportador>(`${this.url}ProgramaEmbarque/ListarExportadores`,
      {
        params: params,
        'withCredentials': true,
      })
  }

  public AgregarCargador(agencia: Exportador) {
    return this.http.post<boolean>(`${this.url}ProgramaEmbarque/CrearExportador`, agencia, { 'withCredentials': true });
  }

  public ExportarExcel(nombre: string): any {
    return this.http.get(`${this.url}ProgramaEmbarque/ExcelExportadores?nombre=${nombre}`, { 'withCredentials': true, responseType: 'blob' });
  }

  public ObtenerExportador(id: number): any {
    return this.http.get(`${this.url}ProgramaEmbarque/ObtenerExportador?id=${id}`, { 'withCredentials': true });
  }

  public EditarCargador(agencia: Exportador) {
    return this.http.put<boolean>(`${this.url}ProgramaEmbarque/EditarExportador`, agencia, { 'withCredentials': true });
  }
}
