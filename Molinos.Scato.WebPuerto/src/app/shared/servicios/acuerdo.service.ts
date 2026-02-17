import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Acuerdo, AcuerdoCombo, AcuerdoPeriodoDetalle, GuardarTarifasDetallePeriodoRequest } from '@ScatoModels/acuerdos/acuerdos';
import { ListaPaginada } from '@ScatoModels/listaPaginada';
import { Mail } from '@ScatoModels/mail';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AcuerdoService {

  private url: string = environment.apiUrl + 'administracion';

  constructor(private http: HttpClient) { }

  public listarCombos(conBuques: boolean = false) {
    return this.http.get<AcuerdoCombo>(`${this.url}/ObtenerCombosAcuerdos?conBuques=${conBuques}`, { withCredentials: true });
  }

  public listarAcuerdos(filtros: any) {
    return this.http.post<ListaPaginada<Acuerdo>>(`${this.url}/ListarAcuerdos`, filtros, { withCredentials: true });
  }

  public obtenerAcuerdo(id: number) {
    return this.http.get<Acuerdo>(`${this.url}/ObtenerAcuerdo?acuerdoId=${id}`, { withCredentials: true });
  }

  public guardarAcuerdo(formData: FormData) {
    return this.http.post<any>(`${this.url}/GuardarAcuerdo`, formData, { withCredentials: true });
  }

  public obtenerArchivoAcuerdo(acuerdoId: number) {
    return this.http.get<Blob>(`${this.url}/ObtenerArchivoAcuerdo?acuerdoId=${acuerdoId}`, { withCredentials: true, responseType: 'blob' as 'json' });
  }

  public eliminarAcuerdo(acuerdoId: number) {
    return this.http.delete<any>(`${this.url}/EliminarAcuerdo?acuerdoId=${acuerdoId}`, { withCredentials: true });
  }

  public enviarMailAcuerdo(mail: Mail) {
    return this.http.post<any>(`${this.url}/EnviarMailAcuerdo`, mail, { withCredentials: true });
  }

  public guardarTarifasDetallePeriodo(request: GuardarTarifasDetallePeriodoRequest) {
    return this.http.post(`${this.url}/GuardarTarifasAcuerdo`, request, { withCredentials: true });
  }

  public obtenerPeriodosPorAcuerdo(acuerdoId: number) {
    return this.http.get<AcuerdoPeriodoDetalle[]>(`${this.url}/ListarTarifasAcuerdo?acuerdoId=${acuerdoId}`, { withCredentials: true });
  }

  public reabrirTarifasAcuerdo(periodoAcuerdoId: number) {
    return this.http.put<any>(`${this.url}/ReabrirTarifasAcuerdo?periodoAcuerdoId=${periodoAcuerdoId}`, null, { withCredentials: true });
  }
}
