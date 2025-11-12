import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Comprobante } from '@ScatoModels/comprobantes/comprobantes';
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
    return this.http.get<Comprobante[]>(`${this.url}Comprobante/ListarComprobantes?moduloDeCargaId=${moduloDeCargaId}`, { 'withCredentials': true });
  }

  // #region Romaneo
  public generarRomaneo(moduloDeCargaId: number) {
    return this.http.post<Comprobante>(`${this.url}Comprobante/GenerarRomaneo?moduloDeCargaId=${moduloDeCargaId}`, null, { 'withCredentials': true });
  }

  public guardarFechaImpresionRomaneo(romaneoId: number, usuario: string) {
    return this.http.put(`${this.url}Comprobante/GuardarFechaImpresionRomaneo?romaneoId=${romaneoId}&usuario=${usuario}`, null, { 'withCredentials': true });
  }

  public obtenerRomaneo(romaneoId: number) {
    return this.http.get<Comprobante>(`${this.url}Comprobante/ObtenerRomaneo?romaneoId=${romaneoId}`, { 'withCredentials': true });
  }

  public anularRomaneo(romaneoId: number, usuario: string) {
    return this.http.delete(`${this.url}Comprobante/AnularRomaneo?romaneoId=${romaneoId}&usuario=${usuario}`, { 'withCredentials': true });
  }
  // #endregion

  // #region Secuencia Real
  public generarSecuenciaReal(moduloDeCargaId: number) {
    return this.http.post<Comprobante>(`${this.url}Comprobante/GenerarSecuenciaReal?moduloDeCargaId=${moduloDeCargaId}`, null, { 'withCredentials': true });
  }

  public guardarFechaImpresionSecuenciaReal(secuenciaRealId: number) {
    return this.http.put(`${this.url}Comprobante/GuardarFechaImpresionSecuenciaReal?secuenciaRealId=${secuenciaRealId}`, null, { 'withCredentials': true });
  }

  public obtenerSecuenciaReal(secuenciaRealId: number) {
    return this.http.get<Comprobante>(`${this.url}Comprobante/ObtenerSecuenciaReal?secuenciaRealId=${secuenciaRealId}`, { 'withCredentials': true });
  }

  public anularSecuenciaReal(secuenciaRealId: number) {
    return this.http.delete(`${this.url}Comprobante/AnularSecuenciaReal?secuenciaRealId=${secuenciaRealId}`, { 'withCredentials': true });
  }
  // #endregion

}
