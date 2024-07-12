import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { Pais } from '@ScatoModels/Buques/Pais';
import { VaporInformacion } from '@ScatoModels/Buques/VaporInformacion';
import { Vapor } from '@ScatoModels/vapor';
import { RegistroFechas } from '@ScatoModels/Buques/registroFechas';
import { Actores } from '@ScatoModels/Buques/Actores';
import { Operador } from '@ScatoModels/Buques/Operador';
import { BalanzasCortesManual } from '@ScatoModels/balanza-manual/balanza-cortes-manual';
import { BalanzaManual } from '@ScatoModels/balanza-manual/balanza-manual';
import { PeriodoDeCarga } from '@ScatoModels/periodo-carga';
@Injectable({
  providedIn: 'root'
})
export class BalanzaManualRegistroService {

  private url: string = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  public obtenerPeriodoDeCarga(moduloDeCargaId: number): Observable<PeriodoDeCarga> {
    return this.http.get<PeriodoDeCarga>(`${this.url}BalanzaManual/obtenerPeriodoDeCarga?moduloDeCargaId=${moduloDeCargaId}`, { 'withCredentials': true });
  }

  public listarBalanzaManual(moduloDeCargaId: number): Observable<BalanzaManual[]> {
    return this.http.get<BalanzaManual[]>(`${this.url}BalanzaManual/ListarBalanzaManual?moduloDeCargaId=${moduloDeCargaId}`, { 'withCredentials': true });
  }

  public eliminarCortesBajaCarga(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.url}BalanzaManual/EliminarCortesBajaCarga?id=${id}`, { 'withCredentials': true });
  }

  public guardarCortesBajaCarga(balanzasCortes: BalanzasCortesManual): Observable<BalanzaManual>{
    return this.http.post<BalanzaManual>(`${this.url}BalanzaManual/GuardarCortesBajaCarga`, balanzasCortes, { 'withCredentials': true });
  }

}
