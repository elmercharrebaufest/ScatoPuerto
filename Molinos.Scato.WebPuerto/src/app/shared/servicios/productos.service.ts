import { ListaPaginada } from '@ScatoModels/listaPaginada';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private url: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public ListarProductos(pagina: number = 0, itemsPorPagina: number = 10, nombre: string,tipoDeProducto: string) {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('itemsPorPagina', itemsPorPagina.toString())
      .set('nombre', nombre)
      .set('tipoDeProducto',tipoDeProducto);
    return this.http.get<ListaPaginada<MaterialPuerto>>(`${this.url}ProgramaEmbarque/ListarProductos`,
      {
        params: params,
        'withCredentials': true,
      })
  }

  public ExportarExcel(nombre: string): any {
    return this.http.get(`${this.url}ProgramaEmbarque/ExportarExcelProductos?nombre=${nombre}`, { 'withCredentials': true, responseType: 'blob' });
  }

  public CrearProducto(producto: any): any{
    return this.http.post(`${this.url}ProgramaEmbarque/CrearProducto`, producto, { 'withCredentials': true });
  }

  public ObtenerProducto(id: number): any{
    return this.http.get(`${this.url}ProgramaEmbarque/ObtenerProducto?id=${id}`, { 'withCredentials': true });
  }

  public EditarProducto(producto: any): any{
    return this.http.post(`${this.url}ProgramaEmbarque/EditarProducto`, producto, { 'withCredentials': true });
  }

  public EliminarProducto(id: number): any{
    return this.http.post(`${this.url}ProgramaEmbarque/EliminarProducto?id=${id}`, { 'withCredentials': true });
  }

}
