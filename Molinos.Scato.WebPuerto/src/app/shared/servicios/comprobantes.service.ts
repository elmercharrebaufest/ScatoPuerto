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

  public obtenerNumeroInicioComprobante() {
    return this.http.get<string>(`${this.url}Comprobante/ObtenerNumeroInicioComprobante`, { 'withCredentials': true });
  }

  public guardarNumeroInicioComprobante(numero: string) {
    return this.http.post(`${this.url}Comprobante/GuardarNumeroInicioComprobante?numero=${numero}`, null, { 'withCredentials': true });
  }

  public generarRomaneo(moduloDeCargaId: number) {
    return this.http.post<Comprobante>(`${this.url}Comprobante/GenerarRomaneo?moduloDeCargaId=${moduloDeCargaId}`, null, { 'withCredentials': true });
  }

  public obtenerRomaneo(romaneoId: number) {
    return this.http.get<Comprobante>(`${this.url}Comprobante/ObtenerRomaneo?romaneoId=${romaneoId}`, { 'withCredentials': true });
  }

  public listarComprobantes(moduloDeCargaId: number) {
    return this.http.get<Comprobante[]>(`${this.url}Comprobante/ListarComprobantes?moduloDeCargaId=${moduloDeCargaId}`, { 'withCredentials': true });
  }
}
