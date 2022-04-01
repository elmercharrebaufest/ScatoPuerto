import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { PuntosInteres } from '@ScatoModels/geolocalizacion/puntos-interes';

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
        const estado = 1;
        return this.http.get(`${this.url}Geolocalizacion/ListarPuntosInteresGeolocalizacion?estado=${estado}`, { 'withCredentials': true });
    }

    ListarEmbarqueLineUpGeolocalizacion(): Observable<any> {
      return this.http.get(`${this.url}Geolocalizacion/ListarEmbarqueLineUpGeolocalizacion`, { 'withCredentials': true });
    }
    
}