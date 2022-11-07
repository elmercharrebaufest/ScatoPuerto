import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { PuntosInteres } from '@ScatoModels/geolocalizacion/puntos-interes';
import { ErroresGeolocalizacion } from '@ScatoModels/geolocalizacion/errores-geolocalizacion';

@Injectable({
  providedIn: 'root'
})
export class GeolocalizacionService {
    url: string = environment.apiUrl;
  
    constructor(
      private http: HttpClient,
    ) {
  
    }

    ListarPuntosInteresGeolocalizacion(): Observable<any> {
        return this.http.get(`${this.url}Geolocalizacion/ListarPuntosInteresGeolocalizacion`, { 'withCredentials': true });
    }

    ListarEmbarqueLineUpGeolocalizacion(): Observable<any> {
      return this.http.get(`${this.url}Geolocalizacion/ListarEmbarqueLineUpGeolocalizacion`, { 'withCredentials': true });
    }
    
    ListarErroresGeolocalizacionPorEmbarque(idEmbarque: number): Observable<ErroresGeolocalizacion[]> {
      return this.http.get<ErroresGeolocalizacion[]>(`${this.url}Geolocalizacion/ListarErroresGeolocalizacionPorEmbarque?idEmbarque=${idEmbarque}`, { 'withCredentials': true });
    }
}