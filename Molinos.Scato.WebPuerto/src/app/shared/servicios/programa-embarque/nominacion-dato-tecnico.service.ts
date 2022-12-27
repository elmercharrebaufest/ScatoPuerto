import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Surveyor } from '@ScatoModels/programa-embarque/surveyor';
import { TasaDeCarga } from '@ScatoModels/programa-embarque/tasa-de-carga';
import { TipoDeCalidad } from '@ScatoModels/programa-embarque/tipo-de-calidad';
import { TipoDeContrato } from '@ScatoModels/programa-embarque/tipo-de-contrato';
import { CalidadValor } from '@ScatoModels/programa-embarque/calidad-valor';
import { MuelleDeCarga } from '@ScatoModels/programa-embarque/muelle-de-carga';
import { Nominacion } from '@ScatoModels/programa-embarque/nominacion';
import { Observable } from 'rxjs';
import { VaporInformacion } from '@ScatoModels/Buques/VaporInformacion';
import { ProgramaEmbarqueNominacionDatoTecnico } from '@ScatoModels/programa-embarque/programa-embarque-nominacion-dato-tecnico';
import { NominacionValida } from '@ScatoModels/programa-embarque/nominacion-valida';

@Injectable({
  providedIn: 'root'
})
export class NominacionDatoTecnicoService {

  private url: string = environment.apiUrl;
  constructor(private http: HttpClient) { }

  public obtenerMuellesDeCarga(): Observable<MuelleDeCarga[]> {
    return this.http.get<MuelleDeCarga[]>(`${this.url}ProgramaEmbarque/ListarMuelleDeCarga`, { 'withCredentials': true });
  }
  public obtenerTipoDeContrato(): Observable<TipoDeContrato[]> {
    return this.http.get<TipoDeContrato[]>(`${this.url}ProgramaEmbarque/ListarTipoDeContrato`, { 'withCredentials': true });
  }
  public obtenerSurveyor(): Observable<Surveyor[]> {
    return this.http.get<Surveyor[]>(`${this.url}ProgramaEmbarque/ListarSurveyor`, { 'withCredentials': true });
  }
  public obtenerTasaDeCarga(): Observable<TasaDeCarga[]> {
    return this.http.get<TasaDeCarga[]>(`${this.url}ProgramaEmbarque/ListarTasaDeCarga`, { 'withCredentials': true });
  }
  public obtenerTipoDeCalidad(): Observable<TipoDeCalidad[]> {
    return this.http.get<TipoDeCalidad[]>(`${this.url}ProgramaEmbarque/ListarTipoDeCalidad`, { 'withCredentials': true });
  }
  public obtenerCalidadValor(): Observable<CalidadValor[]> {
    return this.http.get<CalidadValor[]>(`${this.url}ProgramaEmbarque/ListarCalidadValor`, { 'withCredentials': true });
  }
  public obtenerVaporInformacion(): Observable<VaporInformacion[]> {
    return this.http.get<VaporInformacion[]>(`${this.url}ProgramaEmbarque/ListarVaporInformacion`, { 'withCredentials': true });
  }
  public registroNominacion(nominacion: Nominacion) {
    return this.http.post(`${this.url}ProgramaEmbarque/RegistrarNominacionDatoTecnico`, nominacion, { 'withCredentials': true });
  }
  public obtenerNominacion(id: number) {
    return this.http.get<Nominacion>(`${this.url}ProgramaEmbarque/ObtenerNominacion?id=${id}`, { 'withCredentials': true });
  }
  public listarCombosDatoTecnico(): Observable<ProgramaEmbarqueNominacionDatoTecnico> {
    return this.http.get<ProgramaEmbarqueNominacionDatoTecnico>(`${this.url}ProgramaEmbarque/ListarCombosDatoTecnico`, { 'withCredentials': true });
  }
  public validarCreacionNominacion(nominacion: NominacionValida): Observable<boolean> {
    return this.http.post<boolean>(`${this.url}ProgramaEmbarque/ValidarCreacionNominacion`, nominacion, { 'withCredentials': true });
  }
  

}
