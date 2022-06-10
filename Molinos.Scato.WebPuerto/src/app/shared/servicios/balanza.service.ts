import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Balanzas, Bodega, InfoTableristas } from '@ScatoModels/balanzadas/balanza';
import { Ritmos, RitmosLiquido } from '@ScatoModels/balanzadas/ritmos';
import { RitmosBalanzas78 } from '@ScatoModels/balanzadas/ritmos-balanzas78';

@Injectable({
  providedIn: 'root'
})
export class BalanzaService {
    url: string = environment.apiUrl;
  
    constructor(
      private http: HttpClient,
    ) {}

    sincronizarBalanzasCortes(IdModuloDeCarga: number): Observable<InfoTableristas>{
      return this.http.post<InfoTableristas>(`${this.url}ModuloDeCarga/SincronizarBalanzasCortes?IdModuloDeCarga=${IdModuloDeCarga}`, { 'withCredentials': true });
    }

    guardarBalanzaCorte( listadoTotalBalanzadas: Balanzas[] ){
      console.log('guardarBalanzaCorte: ', listadoTotalBalanzadas);
      return this.http.post(`${this.url}ModuloDeCarga/GuardarBalanzaCorte`, listadoTotalBalanzadas, { 'withCredentials': true });
    }

    eliminarBalanzaCorte( idCorteBalanza: number ){
      console.log('eliminarBalanzaCorte - id: ', idCorteBalanza);
      return this.http.post(`${this.url}ModuloDeCarga/EliminarCorteBalanza?idCorteBalanza=${idCorteBalanza}`, { 'withCredentials': true });
    }

    obtenerListadoBodegas(): Observable<Bodega[]>{
      return this.http.get<Bodega[]>(`${this.url}ModuloDeCarga/ListadoBodegas`, { 'withCredentials' : true});
    }

    guardarFechaInicioCarga(embarque_id: number, fechaHorastring : string){
      return this.http.post(`${this.url}ModuloDeCarga/GuardarFechaInicioCarga?embarque_id=${embarque_id}&fechaHorastring=${fechaHorastring}`, { 'withCredentials': true});
    }

  obtenerRitmos(vapor_id: any, modulodecarga_id: number): Observable<Ritmos> {
    return this.http.get<Ritmos>(`${this.url}ModuloDeCarga/ObtenerRitmos?modulodecarga_id=${modulodecarga_id}`, { 'withCredentials': true });
    }
    obtenerRitmosLiquidos(vapor_id: number, modulodecarga_id: number): Observable<RitmosLiquido>{
      return this.http.get<RitmosLiquido>(`${this.url}ModuloDeCarga/ObtenerRitmosLiquidos?modulodecarga_id=${modulodecarga_id}`, { 'withCredentials': true });
    }

    sincronizarRitmosBalanzas(IdModuloDeCarga: number): Observable<RitmosBalanzas78>{
      return this.http.post<RitmosBalanzas78>(`${this.url}ModuloDeCarga/SincronizarRitmosBalanzas?IdModuloDeCarga=${IdModuloDeCarga}`, { 'withCredentials': true });
    }
}
