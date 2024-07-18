import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { CombosFechasYTurnosResponse } from '@ScatoModels/calidad/combos-fechas-y-turnos';
import { ConsultarRitmosBrutosResponse } from '@ScatoModels/calidad/ritmos-brutos';

@Injectable({
  providedIn: 'root'
})
export class BalanzasRitmosService {
  private url: string = environment.apiUrl;
  private mockData: any = {};

  constructor(private http: HttpClient) {
    this.generateMockData();
  }

  generateMockData() {
    const dates = ['2024-06-23', '2024-06-24', '2024-06-25', '2024-06-26', '2024-06-27'];
    const turnos = ['00-06', '06-12', '12-18', '18-24'];

    const fixedData = {
      '2024-06-23': {
        '00-06': { Tn7: 3000, Tn8: 3200 },
        '06-12': { Tn7: 3400, Tn8: 3600 },
        '12-18': { Tn7: 3700, Tn8: 3800 },
        '18-24': { Tn7: 3900, Tn8: 4000 }
      },
      '2024-06-24': {
        '00-06': { Tn7: 3100, Tn8: 3300 },
        '06-12': { Tn7: 3500, Tn8: 3700 },
        '12-18': { Tn7: 3800, Tn8: 3900 },
        '18-24': { Tn7: 4000, Tn8: 4100 }
      },
      '2024-06-25': {
        '00-06': { Tn7: 3200, Tn8: 3400 },
        '06-12': { Tn7: 3600, Tn8: 3800 },
        '12-18': { Tn7: 3900, Tn8: 4000 },
        '18-24': { Tn7: 4100, Tn8: 4200 }
      },
      '2024-06-26': {
        '00-06': { Tn7: 3300, Tn8: 3500 },
        '06-12': { Tn7: 3700, Tn8: 3900 },
        '12-18': { Tn7: 4000, Tn8: 4100 },
        '18-24': { Tn7: 4200, Tn8: 4300 }
      },
      '2024-06-27': {
        '00-06': { Tn7: 3400, Tn8: 3600 },
        '06-12': { Tn7: 3800, Tn8: 4000 },
        '12-18': { Tn7: 4100, Tn8: 4200 },
        '18-24': { Tn7: 4300, Tn8: 4400 }
      }
    };

    dates.forEach(date => {
      this.mockData[date] = {};
      turnos.forEach(turno => {
        const startHour = parseInt(turno.split('-')[0], 10);
        const endHour = parseInt(turno.split('-')[1], 10);
        const totalHours = endHour - startHour;

        const startBalanza7 = `${date} ${startHour + 1}:00:00`;
        const startBalanza8 = `${date} ${startHour + 2}:00:00`;

        let tnCargadasHastaAhora7 = 0;
        let ritmoEmbarque7 = 0;
        let tnCargadasHastaAhora8 = 0;
        let ritmoEmbarque8 = 0;

        for (let i = 0; i <= turnos.indexOf(turno); i++) {
          const turnoKey = turnos[i];
          tnCargadasHastaAhora7 += fixedData[date][turnoKey].Tn7;
          tnCargadasHastaAhora8 += fixedData[date][turnoKey].Tn8;
        }

        ritmoEmbarque7 = parseInt((tnCargadasHastaAhora7 / totalHours).toFixed(2));
        ritmoEmbarque8 = parseInt((tnCargadasHastaAhora8 / totalHours).toFixed(2));

        const ultimaActualizacion = `${date} ${endHour}:00:00`;

        this.mockData[date][turno] = {
          startBalanza7,
          tnCargadasHastaAhora7,
          ritmoEmbarque7,
          ultimaActualizacion7: ultimaActualizacion,
          startBalanza8,
          tnCargadasHastaAhora8,
          ritmoEmbarque8,
          ultimaActualizacion8: ultimaActualizacion,
        };
      });
    });
  }

  getMockData(date: string, turno: string) {
    // console.log('getMockData');
    // console.log(' date: ', date);
    // console.log(' turno: ', turno);
    // console.log(' mockData[date]: ', this.mockData[date]);
    // console.log(' mockData[date][turno]: ', this.mockData[date][turno]);
    return this.mockData[date] ? this.mockData[date][turno] : null;
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
}
