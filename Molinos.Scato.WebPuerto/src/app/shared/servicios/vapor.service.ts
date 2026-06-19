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
  observableVaporModal = new Subject<any[]>();
  observableMensaje = new Subject<string>();

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

    public guardarVaporInformacion(vaporInformacion: FormData, usuario: string) {
      vaporInformacion.append('usuario', usuario);
      return this.http.post(`${this.url}Vapor/GuardarVaporInformacion`, vaporInformacion, { 'withCredentials': true });
    }

    public DevolverHistoricoVapor(id: number) {      
      return this.http.get<any>(`${this.url}Vapor/DevolverHistoricoVapor?id=${id}`,
        {
          'withCredentials': true
        })
        .subscribe(
          (data: any) => {
            this.listadoVapor = data;
            this.observableVaporModal.next(this.listadoVapor.slice())
          }
        );
    }

    public ValidarBuque(bandera: string, nombreBuque: string, imo: string, id: number) {      
      return this.http.get<any>(`${this.url}Vapor/ValidarBuque?bandera=${bandera}&nombre=${nombreBuque}&imo=${imo}&id=${id}`,
        {
          'withCredentials': true
        })
        
    }

    public eliminarVapor(vapor: any, usuario: string) {
      return this.http.post(`${this.url}Vapor/DeshabilitarBuque`, { ...vapor, usuario }, { 'withCredentials': true });
  }

  public obtenerShipParticular(id: number): Observable<Blob> {
    return this.http.get(`${this.url}Vapor/ObtenerShipParticular?id=${id}`, { responseType: 'blob' });
  }

  public reenviarVaporASap(vaporId: number) {
    return this.http.post(`${this.url}Vapor/ReenviarVaporASap?vaporId=${vaporId}`, null, { 'withCredentials': true });
  }

  // #endregion

}
