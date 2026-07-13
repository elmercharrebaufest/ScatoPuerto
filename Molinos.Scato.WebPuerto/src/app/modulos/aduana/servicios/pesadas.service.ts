import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PesadaItem, DetalleCargaItem, PaginadoResponse, TotalBalanza } from '../models/aduana.models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PesadasService {
  private apiUrl = environment.apiUrl + 'Pesadas';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene listado de Pesadas Online
   * @param fechaDesde Fecha de inicio (por defecto: hoy)
   * @param horaDesde Hora de inicio (por defecto: 00:00:00)
   * @param horaHasta Hora de fin (por defecto: hora actual)
   * @param pagina Número de página
   * @param itemsPorPagina Items por página
   * @param ordenarPor Campo para ordenar
   */
  obtenerPesadasOnline(
    fechaDesde?: string,
    horaDesde?: string,
    horaHasta?: string,
    pagina: number = 1,
    itemsPorPagina: number = 50,
    ordenarPor: string = 'Fecha',
    direccionOrden: 'asc' | 'desc' = 'asc'
  ): Observable<PaginadoResponse<any>> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('itemsPorPagina', itemsPorPagina.toString())
      .set('ordenarPor', ordenarPor)
      .set('direccionOrden', direccionOrden);

    if (fechaDesde) params = params.set('fechaDesde', fechaDesde);
    if (horaDesde) params = params.set('horaDesde', horaDesde);
    if (horaHasta) params = params.set('horaHasta', horaHasta);

    return this.http.get<any>(`${this.apiUrl}/ListarOnline`, { params })
      .pipe(map(r => this.normalizarPaginado<any>(r)));
  }

  /**
   * Obtiene listado de Pesadas Históricas
   * @param fechaDesde Fecha de inicio (por defecto: hace 7 días)
   * @param fechaHasta Fecha de fin (por defecto: hoy)
   * @param horaDesde Hora de inicio (por defecto: 00:00:00)
   * @param horaHasta Hora de fin (por defecto: 23:59:00)
   * @param pagina Número de página
   * @param itemsPorPagina Items por página
   * @param ordenarPor Campo para ordenar
   */
  obtenerPesadasHistoricas(
    fechaDesde?: string,
    fechaHasta?: string,
    horaDesde?: string,
    horaHasta?: string,
    pagina: number = 1,
    itemsPorPagina: number = 50,
    ordenarPor: string = 'Fecha',
    direccionOrden: 'asc' | 'desc' = 'asc'
  ): Observable<PaginadoResponse<any>> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('itemsPorPagina', itemsPorPagina.toString())
      .set('ordenarPor', ordenarPor)
      .set('direccionOrden', direccionOrden);

    if (fechaDesde) params = params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params = params.set('fechaHasta', fechaHasta);
    if (horaDesde) params = params.set('horaDesde', horaDesde);
    if (horaHasta) params = params.set('horaHasta', horaHasta);

    return this.http.get<any>(`${this.apiUrl}/ListarHistoricas`, { params })
      .pipe(map(r => this.normalizarPaginado<any>(r)));
  }

  /**
   * Obtiene detalle de carga (balanzadas)
   * @param idCarga ID de la carga
   * @param numeroBalanza Número de balanza
   * @param pagina Número de página
   * @param itemsPorPagina Items por página
   */
  obtenerDetalleCarga(
    idCarga: number,
    numeroBalanza: string,
    pagina: number = 1,
    itemsPorPagina: number = 50
  ): Observable<PaginadoResponse<any>> {
    const params = new HttpParams()
      .set('idCarga', idCarga.toString())
      .set('numeroBalanza', numeroBalanza)
      .set('pagina', pagina.toString())
      .set('itemsPorPagina', itemsPorPagina.toString());

    return this.http.get<any>(`${this.apiUrl}/ObtenerDetalleCarga`, { params })
      .pipe(map(r => this.normalizarPaginado<any>(r)));
  }

  /**
   * Obtiene totales agregados por balanza (opcional)
   * @param fechaDesde Fecha de inicio
   * @param horaDesde Hora de inicio
   * @param horaHasta Hora de fin
   */
  obtenerTotalesPorBalanza(
    fechaDesde?: string,
    horaDesde?: string,
    horaHasta?: string
  ): Observable<TotalBalanza[]> {
    let params = new HttpParams();

    if (fechaDesde) params = params.set('fechaDesde', fechaDesde);
    if (horaDesde) params = params.set('horaDesde', horaDesde);
    if (horaHasta) params = params.set('horaHasta', horaHasta);

    return this.http.get<TotalBalanza[]>(`${this.apiUrl}/ObtenerTotalesPorBalanza`, { params });
  }

  private normalizarPaginado<T>(respuesta: any): PaginadoResponse<T> {
    return {
      items: (respuesta?.items ?? respuesta?.Items ?? []) as T[],
      pagina: Number(respuesta?.pagina ?? respuesta?.Pagina ?? 1),
      itemsPorPagina: Number(respuesta?.itemsPorPagina ?? respuesta?.ItemsPorPagina ?? 0),
      itemsTotales: Number(respuesta?.itemsTotales ?? respuesta?.ItemsTotales ?? 0)
    };
  }
}
