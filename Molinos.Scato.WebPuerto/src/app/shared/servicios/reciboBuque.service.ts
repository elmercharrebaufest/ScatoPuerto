import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { Nominacion } from '@ScatoModels/programa-embarque/nominacion';
import { ReciboDeBuque } from '@ScatoModels/reciboDeBuque';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReciboBuqueService {

  @Output() sendGenerarPDF = new EventEmitter();
  // private _refresh = new Subject<void>();

  url: string = environment.apiUrl;
  constructor(
    private http: HttpClient,
  ) 
  { }
  
  // get refresh(){
  //   return this._refresh
  // }

  guardarReciboDeBuque(idEmbarque: number, reciboDeBuque:ReciboDeBuque ){
    return this.http.post(`${this.url}ModuloDeCarga/GuardarReciboDeBuque?idEmbarque=${idEmbarque}`,reciboDeBuque, { 'withCredentials' : true});
  }

  obtenerDestinatariosRecibo(templateMail : string){
    return this.http.get<string[]>(`${this.url}ModuloDeCarga/ObtenerSupervisoresDeRecibo?templateMail=${templateMail}`, { 'withCredentials' : true});
  }

  obtenerRecibos(idEmbarque: number,): Observable<ReciboDeBuque[]>{
    return this.http.get<ReciboDeBuque[]>(`${this.url}ModuloDeCarga/ListarRecibosDeBuque?idEmbarque=${idEmbarque}`, { 'withCredentials' : true}) 
  }
  
  obtenerNominacionRecibos(idEmbarque: number,): Observable<Nominacion[]>{
    return this.http.get<Nominacion[]>(`${this.url}ModuloDeCarga/ListarNominacionesRecibos?idEmbarque=${idEmbarque}`, { 'withCredentials' : true}) 
  }

  deshabilitarRecibo(reciboDeBuque:ReciboDeBuque ){
    return this.http.post(`${this.url}ModuloDeCarga/DeshabilitarReciboBuque`, reciboDeBuque, { 'withCredentials' : true});
  }
}
