import { Caratula } from '@ScatoModels/afip/caratula';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CaratulaAfipService {

  private url: string = environment.apiUrl;
  constructor(private http: HttpClient) { }

  public registrarNuevaCaratula(caratul:Caratula): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}ProgramaEmbarque/ListarMuelleDeCarga`, { 'withCredentials': true });
  }
}
