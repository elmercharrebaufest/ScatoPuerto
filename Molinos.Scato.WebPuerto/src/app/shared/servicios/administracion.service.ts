import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AdministracionEnvioAlerta } from '@ScatoModels/administracion/administracion-envio-alerta';
import { Concepto } from '@ScatoModels/administracion/concepto';
import { AdministracionEmbarque, DetalleEmbarqueAFacturar } from '@ScatoModels/administracion/detalle-embarque-a-facturar';
import { TarifaPorProducto } from '@ScatoModels/administracion/tarifa-por-producto';
import { ListaPaginada } from '@ScatoModels/listaPaginada';
import { Mail } from '@ScatoModels/mail';
import { CombosConsultaEmbarques, FiltrosAdministracion } from 'app/modulos/administracion/consulta-embarques/consulta-embarques.component';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdministracionService {

  private url: string = environment.apiUrl + 'administracion';

  constructor(private http: HttpClient) { }
  
  public listarCombos() {
    return this.http.get<CombosConsultaEmbarques>(`${this.url}/ListarCombos`, { withCredentials: true });
  }
  
  public listarEmbarques(filtros: FiltrosAdministracion){
    return this.http.post<ListaPaginada<AdministracionEmbarque>>(
      `${this.url}/ListarEmbarquesAdministracion`, filtros, { withCredentials: true }
    );
  }

public exportarListado(filtros: any): any {
  return this.http.post(`${this.url}/ExportarListado`, 
    filtros, 
    {
      withCredentials: true,
      responseType: 'blob'
    }
  );
}

  public obtenerDetalleEmbarque(idEmbarque: number) {
    return this.http.get<DetalleEmbarqueAFacturar>(`${this.url}/ObtenerDetalle?idEmbarque=${idEmbarque}`, { withCredentials: true });
  }

  public guardarAdministracionEmbarque(embarqueId: number, facturar: boolean, admEmbarque: FormData) {
    return this.http.post(`${this.url}/GuardarAdministracionEmbarque?embarqueId=${embarqueId}&facturar=${facturar}`, admEmbarque, { withCredentials: true });
  }

  public obtenerDatosMailAlerta(embarqueId: number) {
    return this.http.get(`${this.url}/ObtenerDatosMailAlerta?embarqueId=${embarqueId}`, { 'withCredentials': true });
  }

  public enviarMailAlerta(envio: AdministracionEnvioAlerta) {
    return this.http.post(`${this.url}/EnviarMailAlerta`, envio, { withCredentials: true });
  }
  
  public listarConceptosProducto() {
    return this.http.get<Concepto[]>(`${this.url}/ListarConceptosProducto`, { withCredentials: true });
  }

  public listarConceptosEmbarque() {
    return this.http.get<Concepto[]>(`${this.url}/ListarConceptosEmbarque`, { withCredentials: true });
  }

  public obtenerTarifaProducto(productoId: number, periodo: Date) {
    return this.http.get<TarifaPorProducto>(`${this.url}/ObtenerTarifaProducto?productoId=${productoId}&periodo=${periodo}`, { withCredentials: true });
  }

  public guardarTarifaPorProducto(dto: FormData) {
    return this.http.post(`${this.url}/GuardarTarifaPorProducto`, dto, { withCredentials: true });
  }
}
