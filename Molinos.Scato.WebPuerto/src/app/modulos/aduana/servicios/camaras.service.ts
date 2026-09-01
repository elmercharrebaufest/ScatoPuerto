import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CamaraAduanaDto {
  id: number;
  nombre: string;
  url: string;
  posicion: number;
}

@Injectable({
  providedIn: 'root'
})
export class CamarasService {
  private apiUrl = environment.apiUrl + 'Camaras';

  constructor(private http: HttpClient) { }

  listar(): Observable<CamaraAduanaDto[]> {
    return this.http.get<CamaraAduanaDto[]>(`${this.apiUrl}/Listar`);
  }
}
