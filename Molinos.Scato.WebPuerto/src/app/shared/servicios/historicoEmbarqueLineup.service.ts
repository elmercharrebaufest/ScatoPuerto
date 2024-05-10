import { HistoricoEmbarqueLineUp } from "@ScatoModels/historicoEmbarqueLineup";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HistoricoEmbarqueLineUpService {

  url: string = environment.apiUrl;

  constructor(
    private http: HttpClient,
  ) {

  }

  cargarHistoricoEmbarqueLineUp(embarqueId: number): Observable<HistoricoEmbarqueLineUp[]> {
    return this.http.get<HistoricoEmbarqueLineUp[]>(`${this.url}historico-embarque-lineup/listar/${embarqueId}`, { 'withCredentials': true });
  }

  crearHistoricoEmbarqueLineUp(request: HistoricoEmbarqueLineUp) {
    return this.http.post(`${this.url}historico-embarque-lineup/create`, request);
  }
}