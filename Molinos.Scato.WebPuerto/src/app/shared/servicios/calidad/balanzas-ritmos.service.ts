import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { CombosFechasYTurnosResponse } from '@ScatoModels/calidad/combos-fechas-y-turnos';
import { ConsultarRitmosBrutosResponse } from '@ScatoModels/calidad/ritmos-brutos';
import { ConsultarBalanzasCortesResponse } from '@ScatoModels/calidad/balanzas-cortes';
import { RitmosCargasBalanzas } from '@ScatoModels/calidad/ritmos-cargas-balanza';
import { TurnosCerrados } from '@ScatoModels/calidad/turnos-cerrados';

@Injectable({
  providedIn: 'root'
})
export class BalanzasRitmosService {
  private url: string = environment.apiUrl;
  private mockData: any = {};
  private _turnosCalidad: BehaviorSubject<TurnosCerrados> = new BehaviorSubject<TurnosCerrados>(null);

  constructor(private http: HttpClient) { }

  set TurnosCalidad(value: any) {
    this._turnosCalidad.next(value);
  }
  
  get TurnosCalidad() {
    return this._turnosCalidad.asObservable();
  }

  getTotalTnForDate(date: string) {
    if (!this.mockData[date]) return { totalTn7: 0, totalTn8: 0 };
    let totalTn7 = 0;
    let totalTn8 = 0;

    for (let turno in this.mockData[date]) {
      totalTn7 += this.mockData[date][turno].TnCargadasHastaAhora7;
      totalTn8 += this.mockData[date][turno].TnCargadasHastaAhora8;
    }

    return { totalTn7, totalTn8 };
  }

  consultarCombosFechasYTurnos = (idModuloDeCarga: number): Observable<CombosFechasYTurnosResponse> => {
    const response = this.http.get<CombosFechasYTurnosResponse>(`${this.url}ModuloDeCarga/ConsultarCombosFechasYTurnos?idModuloDeCarga=${idModuloDeCarga}`, { 'withCredentials': true });
    return response;
  }

  consultarRitmosBrutos = (idModuloDeCarga: number, fecha: string, idTurnoPuerto: number): Observable<ConsultarRitmosBrutosResponse> => {
    const response = this.http.get<ConsultarRitmosBrutosResponse>(`${this.url}ModuloDeCarga/ConsultarRitmosBrutos?idModuloDeCarga=${idModuloDeCarga}&fecha=${fecha}&idTurnoPuerto=${idTurnoPuerto}`, { 'withCredentials': true });
    return response;
  }

  consultarBalanzasCortes = (idModuloDeCarga: number): Observable<ConsultarBalanzasCortesResponse> => {
    const response = this.http.get<ConsultarBalanzasCortesResponse>(`${this.url}ModuloDeCarga/ConsultarBalanzasCortes?idModuloDeCarga=${idModuloDeCarga}`, { 'withCredentials': true });
    return response;
  }

  consultaRitmosCargaSolidos = (idModuloDeCarga: number, fechaTurno:string, turno: number, esCalculoGeneral: boolean = false): Observable<RitmosCargasBalanzas> => {
    const response = this.http.get<RitmosCargasBalanzas>(`${this.url}ModuloDeCarga/RitmosCargaSolidos?idModuloDeCarga=${idModuloDeCarga}&fechaTurno=${fechaTurno}&turno=${turno}&esCalculoGeneral=${esCalculoGeneral}`, { 'withCredentials': true });
    return response;
  }
}
