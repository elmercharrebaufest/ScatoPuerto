import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Embarque } from '@ScatoModels/embarque';
import { Mail } from '@ScatoModels/mail';
import { OtroMuelleCarga, OtroMuelleCargaDetalle, OtroMuelleNominacion } from '@ScatoModels/otros-muelles';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CargaOtrosMuellesService {

  private url: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public guardarCarga(carga: OtroMuelleCarga, embarqueId: number, zarpar: boolean = false) {
    return this.http.post(`${this.url}CargaOtrosMuelles/GuardarCarga?embarqueId=${embarqueId}&zarpar=${zarpar}`, carga, { 'withCredentials': true });
  }

  public guardarDetalleCarga(detalle: OtroMuelleCargaDetalle, embarqueId: number) {
    return this.http.post(`${this.url}CargaOtrosMuelles/GuardarDetalleCarga?embarqueId=${embarqueId}`, detalle, { 'withCredentials': true });
  }

  public eliminarDetalleCarga(detalleId: number) {
    return this.http.delete(`${this.url}CargaOtrosMuelles/EliminarDetalleCarga?otroMuelleCargaDetalleId=${detalleId}`, { 'withCredentials': true });
  }

  public obtenerEmbarque(embarqueId: number) {
    return this.http.get<Embarque>(`${this.url}CargaOtrosMuelles/ObtenerEmbarque?embarqueId=${embarqueId}`, { 'withCredentials': true });
  }

  public obtenerDatosNominacion(embarqueId: number) {
    return this.http.get<OtroMuelleNominacion>(`${this.url}CargaOtrosMuelles/ObtenerDatosNominacion?embarqueId=${embarqueId}`, { 'withCredentials': true });
  }

  public validarHorarios(carga: OtroMuelleCargaDetalle, embarqueId: number) {
    return this.http.post<boolean>(`${this.url}CargaOtrosMuelles/ValidarHorarios?embarqueId=${embarqueId}`, carga, { 'withCredentials': true });
  }

  public obtenerMailFinalizacion(embarqueId: number) {
    return this.http.get<Mail>(`${this.url}CargaOtrosMuelles/ObtenerMailFinalizacion?embarqueId=${embarqueId}`, { 'withCredentials': true });
  }

  public enviarMailFinalizacion(mail: Mail) {
    return this.http.post(`${this.url}CargaOtrosMuelles/EnviarMailFinalizacion`, mail, { 'withCredentials': true });
  }
}
