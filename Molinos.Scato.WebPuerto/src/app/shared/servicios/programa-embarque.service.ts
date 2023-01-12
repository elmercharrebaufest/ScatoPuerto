import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Mail } from '@ScatoModels/mail';
import { CompaniaDeFumigacion } from '@ScatoModels/programa-embarque/compania-de-fumigacion';
import { ListaProgramaEmbarque } from '@ScatoModels/programa-embarque/lista-programa-embarque';
import { NominacionDetalleIntervencion } from '@ScatoModels/programa-embarque/nominacion-detalle-intervencion';
import { NominacionRecibo } from '@ScatoModels/programa-embarque/nominacion-recibo';
import { TipoDeFumigacion } from '@ScatoModels/programa-embarque/tipo-de-fumigacion';
import { environment } from 'environments/environment';
import { Observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ProgramaEmbarqueService {

  // #region Variables
  private url: string = environment.apiUrl;
  listadoPrograma: any;
  programaEmbarqueModal: any;
  observablePrograma = new Subject<ListaProgramaEmbarque[]>();
  observableProgramaModal = new Subject<any[]>();
  filtros = {
    pagina: 1,
    itemsPorPagina: 20,
    fecha: null,
    buque: "",
    muelle: "",
    producto: ""
  }
  // #endregion

  // #region Constructor
  constructor(
    private http: HttpClient
  ) {
  }
  // #endregion

  // #region Metodos
  public ListarProgramaEmbarque(pagina: number = this.filtros.pagina,
    itemsPorPagina: number = this.filtros.itemsPorPagina,
    fecha: Date = this.filtros.fecha,
    buque: string = this.filtros.buque,
    muelle: string = this.filtros.muelle,
    producto: string = this.filtros.producto) {
    this.actualizarFiltros(pagina,
      itemsPorPagina,
      fecha,
      buque,
      muelle,
      producto)
    return this.http.get<any>(`${this.url}ProgramaEmbarque/ListarProgramaEmbarque?pagina=${this.filtros.pagina}&itemsPorPagina=${this.filtros.itemsPorPagina}&fecha=${this.filtros.fecha}&buque=${this.filtros.buque}&muelle=${this.filtros.muelle}&producto=${this.filtros.producto}`,
      {
        'withCredentials': true
      })
      .subscribe(
        (data: ListaProgramaEmbarque) => {
          this.listadoPrograma = data;
          this.observablePrograma.next(this.listadoPrograma.slice())
        }
      );
  }

  public obtenerDatosComboProgramaEmbarque(): Observable<any> {
    return this.http.get<any>(`${this.url}ProgramaEmbarque/ObtenerDatosComboProgramaEmbarque`,
      { 'withCredentials': true });
  }

  public obtenerNominacion(id: number) {
    return this.http.get<any>(`${this.url}ProgramaEmbarque/ObtenerNominacion?id=${id}`,
      {
        'withCredentials': true
      })
      .subscribe(
        (data: any) => {
          this.programaEmbarqueModal = data;
          this.observableProgramaModal.next(this.programaEmbarqueModal)
        }
      );
  }

  public registrarNominacionRecibo(nominacion_Id: number, nominacionRecibo: NominacionRecibo[]) {
    return this.http.post(`${this.url}ProgramaEmbarque/RegistrarNominacionRecibo?nominacion_id=${nominacion_Id}`,nominacionRecibo, { 'withCredentials': true });
  }

  public registrarNominacionDetalleIntervencion(nominacionDetalleIntervencion: NominacionDetalleIntervencion,nominacion_Id: number){
    return this.http.post(`${this.url}ProgramaEmbarque/RegistrarNominacionDetalleIntervencion?nominacion_id=${nominacion_Id}`,nominacionDetalleIntervencion, { 'withCredentials': true });
  }

  public obtenerProgramaEmbarqueRecibo(nominacion_id: number): Observable<NominacionRecibo[]> {
    return this.http.get<NominacionRecibo[]>(`${this.url}ProgramaEmbarque/ObtenerNominacionRecibos?nominacion_id=${nominacion_id}`,{ 'withCredentials': true });
  }  

  public ListarCompaniaDeFumigacion(): Observable<CompaniaDeFumigacion[]> {
    return this.http.get<CompaniaDeFumigacion[]>(`${this.url}ProgramaEmbarque/ListarCompaniaDeFumigacion`,{ 'withCredentials': true });
  }

  public ListarTipoDeFumigacion(): Observable<TipoDeFumigacion[]> {
    return this.http.get<TipoDeFumigacion[]>(`${this.url}ProgramaEmbarque/ListarTipoDeFumigacion`,{ 'withCredentials': true });
  }
  actualizarFiltros(pagina: number,
    itemsPorPagina: number,
    fecha: Date,
    buque: string,
    muelle: string,
    producto: string){
      this.filtros.buque = buque;
      this.filtros.muelle = muelle;
      this.filtros.producto = producto;
      this.filtros.itemsPorPagina = itemsPorPagina;
      this.filtros.pagina = pagina;
      this.filtros.fecha = fecha
    }


    public EliminarNominacion(id: number){
      return this.http.post(`${this.url}ProgramaEmbarque/EliminarNominacion?nominacion_id=${id}`, { 'withCredentials': true });
    }

    public ObtenerDatosMailProgramaEmbarque(nominacionId: number, tipoDeMail: string) {
      return this.http.get(`${this.url}ProgramaEmbarque/ObtenerDatosMailProgramaEmbarque?nominacionId=${nominacionId}&tipoDeMail=${tipoDeMail}`,{ 'withCredentials': true });
    }

    public EnviarMailProgramaEmbarque(mail: Mail) {
      return this.http.post(`${this.url}ProgramaEmbarque/EnviarMailProgramaEmbarque`,mail,{ 'withCredentials': true });
    }
  // #endregion

}
