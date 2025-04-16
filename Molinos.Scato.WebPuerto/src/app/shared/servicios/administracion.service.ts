import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DetalleEmbarqueAFacturar } from '@ScatoModels/administracion/detalle-embarque-a-facturar';
import { ListaPaginada } from '@ScatoModels/listaPaginada';
import { CombosConsultaEmbarques } from 'app/modulos/administracion/consulta-embarques/consulta-embarques.component';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdministracionService {

  private url: string = environment.apiUrl + 'administracion';

  constructor(private http: HttpClient) { }
  
  public listarCombos() {
    return this.http.get<CombosConsultaEmbarques>(`${this.url}/ListarCombos`, { withCredentials: true });
  }
  
  public listarEmbarques(pagina: number, itemsPorPagina: number, filtros: any) {
    const params = {
      pagina,
      itemsPorPagina,
      ...filtros
    };
  
    return this.http.get<ListaPaginada<any>>(
      `${this.url}/ListarEmbarquesAdministracion`,
      { withCredentials: true, params }
    );
  }

  public exportarListado(filtros: any): any {
    return this.http.get(`${this.url}/ExportarListado`, {
      withCredentials: true,
      params: filtros, 
      responseType: 'blob' 
    });
  }

  public obtenerDetalleEmbarque(idEmbarque: number) {
    return this.http.get<DetalleEmbarqueAFacturar>(`${this.url}/ObtenerDetalle?idEmbarque=${idEmbarque}`, { withCredentials: true });
  }

  public guardarAdministracionEmbarque(embarqueId: number, facturar: boolean, admEmbarque: FormData) {
    return this.http.post(`${this.url}/GuardarAdministracionEmbarque?embarqueId=${embarqueId}&facturar=${facturar}`, admEmbarque, { withCredentials: true });
  }

}
