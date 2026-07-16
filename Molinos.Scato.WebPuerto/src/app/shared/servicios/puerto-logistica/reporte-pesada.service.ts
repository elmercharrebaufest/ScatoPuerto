import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportePesadaService {
  url: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar(
    fechaDesde: string,
    fechaHasta: string,
    exportadorId: number = null,
    materialId: number = null,
    pagina: number = 1,
    ordenarPor: string = 'Fecha',
    dirOrden: 'Asc' | 'Desc' = 'Asc'
  ): Observable<any> {
    let params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta)
      .set('pagina', pagina.toString())
      .set('ordenarPor', ordenarPor)
      .set('dirOrden', dirOrden);

    if (exportadorId != null) {
      params = params.set('exportadorId', exportadorId.toString());
    }
    if (materialId != null) {
      params = params.set('materialId', materialId.toString());
    }

    return this.http.get<any>(`${this.url}ReportePesada/Listar`, { params, withCredentials: true });
  }

  listarExportadores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}ReportePesada/ListarExportadores`, { withCredentials: true });
  }

  listarMateriales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}ReportePesada/ListarMateriales`, { withCredentials: true });
  }
}
