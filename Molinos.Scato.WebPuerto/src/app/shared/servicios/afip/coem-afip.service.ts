import { Caratula } from '@ScatoModels/afip/caratula';
import { COEM, SolicitudCierreCargaDto, SolicitudNoABordoDto } from '@ScatoModels/afip/coem';
import { EstadoCOEM } from '@ScatoModels/afip/estadoCoem';
import { ListaPaginada } from '@ScatoModels/listaPaginada';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoemAfipService {

  private url: string = environment.apiUrl;
  public $recargarCoems = new Subject<void>();
  constructor(private http: HttpClient) { }

  public registrarCoem(coem: COEM): Observable<any[]> {
    return this.http.post<any[]>(`${this.url}Afip/RegistrarCoem`, coem, { 'withCredentials': true });
  }

  public editarCoem(coem: COEM): Observable<any[]> {
    return this.http.put<any[]>(`${this.url}Afip/RectificarCoem`, coem, { 'withCredentials': true });
  }

  public listarCoems(params: any) {
    // Se remueven los filtros vacíos
    for (const prop in params) {
      if (!params[prop]) {
        delete params[prop];
      }
    }
    return this.http.get<ListaPaginada<COEM>>(`${this.url}Afip/ListarCoems`, { 'withCredentials': true, params });
  }

  public estadosCoem() {
    return this.http.get<EstadoCOEM[]>(`${this.url}Afip/ListarEstadosCoem`, { 'withCredentials': true });
  }

  public cambiarEstadosCoem(id, idCoem): Observable<any[]> {
    return this.http.put<any[]>(`${this.url}Afip/CambiarEstadoCoem?idCoem=${idCoem}&idEstado=${id}`, { 'withCredentials': true });
  }

  public obtenerCoemId(id: number): Observable<COEM> {
    return this.http.get<COEM>(`${this.url}Afip/ObtenerCoem?id=${id}`, { 'withCredentials': true });
  }

  public comboCaratulas(): Observable<Caratula[]> {
    return this.http.get<any>(`${this.url}Afip/ComboCaratulas`, { 'withCredentials': true });
  }

  public anularCoem(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}Afip/AnularCoem?id=${id}&idEstado=5`, { 'withCredentials': true });
  }

  public cerrarCoem(id: number): Observable<any> {
    return this.http.put<any>(`${this.url}Afip/CerrarCoem?id=${id}&idEstado=1`, { 'withCredentials': true });
  }

  public solicitarAnulacionCoem(id: number): Observable<any> {
    return this.http.put<any>(`${this.url}Afip/SolicitarAnulacionCoem?id=${id}`, { 'withCredentials': true });
  }

  public solicitarCierreDeCarga(dto: SolicitudCierreCargaDto) {
    return this.http.post<boolean>(`${this.url}Afip/SolicitarCierreCargaGranel`, dto, { withCredentials: true });
  }

  public solicitarNoABordo(body: SolicitudNoABordoDto) {
    return this.http.post<boolean>(`${this.url}Afip/SolicitarNoABordo`, body, { withCredentials: true });
  }

  public efectuarSolicitudNoABordo(id: number) {
    return this.http.put(`${this.url}Afip/EfectuarSolicitudNoABordo/${id}`, null, { withCredentials: true });
  }

  public rechazarSolicitudNoABordo(id: number) {
    return this.http.put(`${this.url}Afip/RechazarSolicitudNoABordo/${id}`, null, { withCredentials: true });
  }
}
