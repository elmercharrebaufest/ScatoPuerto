import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { TarifaDolar } from '@ScatoModels/administracion/tarifa-dolar';

@Injectable({
  providedIn: 'root'
})
export class TarifaDolarService {

  private url: string = environment.apiUrl + 'administracion';

  constructor(private http: HttpClient) { }

  public convertirPeriodoADate(periodo: string): Date {
    let año: number, mes: number;

    if (periodo.includes('-')) {
      const parts = periodo.split('-');
      año = parseInt(parts[0], 10);
      mes = parseInt(parts[1], 10);
    } else if (periodo.includes('/')) {
      const parts = periodo.split('/');
      mes = parseInt(parts[0], 10);
      año = parseInt(parts[1], 10);
    } else {
      throw new Error('Formato de período inválido');
    }

    return new Date(año, mes - 1, 1);
  }

  public obtenerTarifaDolar(periodo: string): Observable<any> {
    const periodoDate = this.convertirPeriodoADate(periodo);
    
    return this.http.get<any>(
      `${this.url}/ObtenerTarifaDolar?periodo=${periodoDate.toISOString()}`,
      { withCredentials: true }
    );
  }

  public guardarTarifaDolar(periodo: string, cotizacion: number): Observable<any> {
    const periodoDate = this.convertirPeriodoADate(periodo);
    
    return this.http.post(
      `${this.url}/GuardarTarifaDolar?periodo=${periodoDate.toISOString()}&cotizacion=${cotizacion}`,
      null,
      { withCredentials: true }
    );
  }

  public obtenerPeriodosDisponibles(): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.url}/ObtenerPeriodosDisponibles`,
      { withCredentials: true }
    );
  }  
}