import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AcuerdoPorEmbarcacion } from '@ScatoModels/administracion/acuerdo-por-embarcacion';
import { AdministracionEnvioAlerta } from '@ScatoModels/administracion/administracion-envio-alerta';
import { Concepto } from '@ScatoModels/administracion/concepto';
import { AdministracionEmbarque, DetalleEmbarqueAFacturar } from '@ScatoModels/administracion/detalle-embarque-a-facturar';
import { EmbarqueATarifar } from '@ScatoModels/administracion/embarque-a-tarifar';
import { AltaProvisionGasto } from '@ScatoModels/administracion/provision-gasto';
import { TarifaPorEmbarque } from '@ScatoModels/administracion/tarifa-por-embarque';
import { TarifaPorProducto } from '@ScatoModels/administracion/tarifa-por-producto';
import { TipoContratoTarifa } from '@ScatoModels/administracion/tipo-contrato-tarifa';
import { ListaPaginada } from '@ScatoModels/listaPaginada';
import { Mail } from '@ScatoModels/mail';
import { MuelleDeCarga } from '@ScatoModels/programa-embarque/muelle-de-carga';
import { CombosConsultaProvisiones } from 'app/modulos/administracion/prov-gastos-embarque/prov-gastos-embarque.component';
/* ConsultaAcuerdosPorEmbarcacionComponent */
import { FiltrosAcuerdosPorEmbarcacion } from 'app/modulos/administracion/consulta-acuerdos-por-embarcacion/consulta-acuerdos-por-embarcacion.component';
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

  public listarCombosProvisiones() {
    return this.http.get<CombosConsultaProvisiones>(`${this.url}/ListarCombosProvisiones`, { withCredentials: true });
  }

  public listarEmbarques(filtros: FiltrosAdministracion) {
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

  public listarConceptos() {
    return this.http.get<Concepto[]>(`${this.url}/ListarConceptos`, { withCredentials: true });
  }

  public obtenerTarifaProducto(productoId: number, periodo: Date) {
    return this.http.get<TarifaPorProducto>(`${this.url}/ObtenerTarifaProducto?productoId=${productoId}&periodo=${periodo}`, { withCredentials: true });
  }

  public guardarTarifaPorProducto(dto: FormData) {
    return this.http.post(`${this.url}/GuardarTarifaPorProducto`, dto, { withCredentials: true });
  }

  public listarMuelles() {
    return this.http.get<MuelleDeCarga[]>(`${this.url}/ListarMuelles`, { withCredentials: true });
  }

  public listarEmbarquesATarifar(periodo: Date, muelleId: number) {
    return this.http.get<EmbarqueATarifar[]>(`${this.url}/ListarEmbarquesATarifar?periodo=${periodo}&muelleId=${muelleId}`, { withCredentials: true });
  }

  public obtenerTarifaEmbarque(embarqueId: number, productoId: number, exportadorId: number, periodo: Date) {
    return this.http.get<TarifaPorEmbarque>(`${this.url}/ObtenerTarifaEmbarque?embarqueId=${embarqueId}&productoId=${productoId}&exportadorId=${exportadorId}&periodo=${periodo}`, { withCredentials: true });
  }

  public guardarTarifaPorEmbarque(dto: FormData) {
    return this.http.post(`${this.url}/GuardarTarifaPorEmbarque`, dto, { withCredentials: true });
  }
  public listarTipoContratoTarifa() {
    return this.http.get<TipoContratoTarifa[]>(`${this.url}/ListarTipoContratoTarifa`, { withCredentials: true });
  }

  public obtenerProvision(muelleId: number, periodo: Date, embarqueId: number, productoId: number, exportadorId: number, contratoId: number) {
    return this.http.get<AltaProvisionGasto>(`${this.url}/ObtenerProvision?muelleId=${muelleId}&periodo=${periodo}&embarqueId=${embarqueId}&productoId=${productoId}&exportadorId=${exportadorId}&contratoId=${contratoId}`, { withCredentials: true });
  }

  public guardarProvision(dto: FormData) {
    return this.http.post(`${this.url}/GuardarProvision`, dto, { withCredentials: true });
  }

  public confirmarProvisiones(idsTarifas: number[]) {
    return this.http.post(`${this.url}/ConfirmarProvisiones`, idsTarifas, { withCredentials: true });
  }

  public exportarListadoProvisiones(idsTarifas: number[]): any {
    return this.http.post(`${this.url}/ExportarProvisiones`,
      idsTarifas,
      {
        withCredentials: true,
        responseType: 'blob'
      }
    );
  }

  public listarAcuerdosPorEmbarcacion(idEmbarcacion: number, filtros: FiltrosAcuerdosPorEmbarcacion): Observable<any> { // AcuerdoPorEmbarcacion[]
    return this.http.post<any>(
      `${this.url}/ListarAcuerdosPorEmbarcacion?idEmbarcacion=${idEmbarcacion}`, 
      filtros, 
      { withCredentials: true }
    );
  }

  public listarAcuerdosVinculados(idEmbarcacion: number): Observable<AcuerdoPorEmbarcacion[]> {
    return this.http.get<AcuerdoPorEmbarcacion[]>(
        `${this.url}/ListarAcuerdosVinculados?idEmbarcacion=${idEmbarcacion}`, 
        { withCredentials: true }
    );
}
}
