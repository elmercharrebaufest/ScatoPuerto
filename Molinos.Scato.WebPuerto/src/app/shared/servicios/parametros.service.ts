import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Parametros } from '@ScatoModels/parametros';

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {
    url: string = environment.apiUrl;
  
    constructor(
      private http: HttpClient,
    ) {}

    obtenerParametros(): Observable<Parametros[]>{
      return this.http.get<Parametros[]>(`${this.url}ModuloDeCarga/obtenerParametros`, { 'withCredentials' : true});
    }
}