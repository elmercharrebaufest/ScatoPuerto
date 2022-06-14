import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { ReciboDeBuque } from '@ScatoModels/reciboDeBuque';
import { environment } from 'environments/environment';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReciboBuqueService {

  @Output() sendGenerarPDF = new EventEmitter();
  private _refresh = new Subject<void>();

  url: string = environment.apiUrl;
  constructor(
    private http: HttpClient,
  ) 
  { }
  
  get refresh(){
    return this._refresh
  }

  guardarReciboDeBuque(idEmbarque: number, reciboDeBuque:ReciboDeBuque ){
    return this.http.post(`${this.url}ModuloDeCarga/GuardarReciboDeBuque?idEmbarque=${idEmbarque}`,reciboDeBuque, { 'withCredentials' : true});
  }

  obtenerRecibos(idEmbarque: number,): Observable<ReciboDeBuque[]>{
    return this.http.get<ReciboDeBuque[]>(`${this.url}ModuloDeCarga/ListarRecibosDeBuque?idEmbarque=${idEmbarque}`, { 'withCredentials' : true})
    .pipe(tap(()=> {
      this._refresh.next();
    }));
  }
}
