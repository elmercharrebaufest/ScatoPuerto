import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
}
