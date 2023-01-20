import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VaporInformacion } from '@ScatoModels/Buques/VaporInformacion';
import { environment } from 'environments/environment';
import { Observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class VaporService {

  // #region Variables
  private url: string = environment.apiUrl;
  listadoVapor: any;
  observableVapor = new Subject<any[]>();

  filtros = {
    pagina: 1,
    itemsPorPagina: 20,
    imo: "",
    buque: "",
    tipoBuque: "",
    bandera: ""
  }
  // #endregion

  // #region Constructor
  constructor(
    private http: HttpClient
  ) {
  }
  // #endregion

  // #region Metodos
  public ListarVaporInformacion(pagina: number = this.filtros.pagina,
    itemsPorPagina: number = this.filtros.itemsPorPagina,
    buque: string = this.filtros.buque,
    imo: string = this.filtros.imo,
    tipoBuque: string = this.filtros.tipoBuque,
    bandera: string = this.filtros.bandera) {
    this.actualizarFiltros(pagina,
      itemsPorPagina,
      buque,
      imo,
      tipoBuque,
      bandera)
    return this.http.get<VaporInformacion>(`${this.url}Vapor/ListarVaporInformacion?pagina=${this.filtros.pagina}&itemsPorPagina=${this.filtros.itemsPorPagina}&buque=${this.filtros.buque}&imo=${this.filtros.imo}&tipoBuque=${this.filtros.tipoBuque}&bandera=${this.filtros.bandera}`,
      {
        'withCredentials': true
      })
      .subscribe(
        (data: any) => {
          this.listadoVapor = data;
          this.observableVapor.next(this.listadoVapor.slice())
        }
      );
  }

  actualizarFiltros(pagina: number,
    itemsPorPagina: number,
    buque: string,
    imo: string,
    tipoBuque: string,
    bandera: string){
      this.filtros.buque = buque;
      this.filtros.imo = imo;
      this.filtros.tipoBuque = tipoBuque;
      this.filtros.bandera = bandera;
      this.filtros.itemsPorPagina = itemsPorPagina;
      this.filtros.pagina = pagina;
    }

  // #endregion

}
