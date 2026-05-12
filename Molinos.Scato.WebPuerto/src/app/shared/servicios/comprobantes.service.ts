import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ComprobanteDeEmbarque } from '@ScatoModels/comprobantes/comprobantes';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComprobantesService {
  private url: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // #region Configuración Comprobantes
  public obtenerNumeroInicioComprobante() {
    return this.http.get<string>(`${this.url}Comprobante/ObtenerNumeroInicioComprobante`, { 'withCredentials': true });
  }

  public guardarNumeroInicioComprobante(numero: string) {
    return this.http.post(`${this.url}Comprobante/GuardarNumeroInicioComprobante?numero=${numero}`, null, { 'withCredentials': true });
  }
  // #endregion

  public listarComprobantes(moduloDeCargaId: number) {
    return this.http.get<ComprobanteDeEmbarque[]>(`${this.url}Comprobante/ListarComprobantes?moduloDeCargaId=${moduloDeCargaId}`, { 'withCredentials': true });
  }

  public obtenerComprobante(comprobanteId: number) {
    return this.http.get<ComprobanteDeEmbarque>(`${this.url}Comprobante/ObtenerComprobante?comprobanteId=${comprobanteId}`, { 'withCredentials': true });
  }

  public generarRomaneo(moduloDeCargaId: number, fecha?: string, turno?: number) {
    return this.http.post<ComprobanteDeEmbarque>(`${this.url}Comprobante/GenerarRomaneo?moduloDeCargaId=${moduloDeCargaId}${fecha ? `&fecha=${fecha}` : ''}${turno ? `&turno=${turno}` : ''}`, null, { 'withCredentials': true });
  }

  public generarSecuenciaReal(moduloDeCargaId: number) {
    return this.http.post<ComprobanteDeEmbarque>(`${this.url}Comprobante/GenerarSecuenciaRealCarga?moduloDeCargaId=${moduloDeCargaId}`, null, { 'withCredentials': true });
  }

  public guardarImpresionComprobante(comprobanteId: number, usuario: string, archivo: FormData = null, npaginas: number = 0) {
    return this.http.put(`${this.url}Comprobante/GuardarFechaImpresionComprobante?comprobanteId=${comprobanteId}&usuario=${usuario}&npaginas=${npaginas}`, archivo, { 'withCredentials': true });
  }

  public obtenerArchivoComprobante(comprobanteId: number) {
    return this.http.get<Blob>(`${this.url}Comprobante/ObtenerArchivoComprobante?comprobanteId=${comprobanteId}`, { 'withCredentials': true, responseType: 'blob' as 'json' });
  }

  public anularComprobante(comprobanteId: number, usuario: string) {
    return this.http.delete(`${this.url}Comprobante/AnularComprobante?comprobanteId=${comprobanteId}&usuario=${usuario}`, { 'withCredentials': true });
  }

  public obtenerNombreArchivo(comprobanteId: number) {
    return this.http.get<string>(`${this.url}Comprobante/ObtenerNombreArchivo?comprobanteId=${comprobanteId}`, { 'withCredentials': true });
  }

}
