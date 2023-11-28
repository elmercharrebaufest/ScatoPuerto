import { CODE } from '@ScatoModels/afip/code';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodeAfipService {

  private url: string = environment.apiUrl;
  constructor(private http: HttpClient) { }

  public registrarCode(Code:CODE): Observable<any[]> {
    return this.http.post<any[]>(`${this.url}Afip/`, Code ,{ 'withCredentials': true });
  }

  public listarCode(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}Afip/`, { 'withCredentials': true });
  }



  
}
