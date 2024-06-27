import { Destino } from '@ScatoModels/destino';
import { ListaPaginada } from '@ScatoModels/listaPaginada';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DestinosService {

  private url: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public listarDestinos(pagina: number, itemsPorPagina: number, nombre: string) {
    const params = { pagina, itemsPorPagina, nombre } as any;
    return this.http.get<ListaPaginada<Destino>>(`${this.url}ProgramaEmbarque/ListarDestinos`, { withCredentials: true, params });
  }

  public listarDestinosExportar(nombre: string) {
    const params = { nombre };
    return this.http.get<Destino[]>(`${this.url}ProgramaEmbarque/ListarDestinosSinPaginar`, { withCredentials: true, params });
  }

  public crearDestino(nombre: string) {
    return this.http.post(`${this.url}ProgramaEmbarque/CrearDestino`, { nombre }, { withCredentials: true });
  }

  public editarDestino(destino: Destino) {
    return this.http.put(`${this.url}ProgramaEmbarque/ModificarDestino`, destino, { withCredentials: true });
  }

  public eliminarDestino(id: number) {
    return this.http.delete(`${this.url}ProgramaEmbarque/EliminarDestino?id=${id}`, { withCredentials: true });
  }
}
