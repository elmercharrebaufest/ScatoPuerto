import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Acuerdo, AcuerdoCombo } from '@ScatoModels/acuerdos/acuerdos';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AcuerdoService {

  private url: string = environment.apiUrl + 'administracion';

  constructor(private http: HttpClient) { }

  public listarCombos() {
    return this.http.get<AcuerdoCombo>(`${this.url}/ObtenerCombosAcuerdos`, { withCredentials: true });
  }

  public listarAcuerdos() {
    return this.http.get<Acuerdo[]>(`${this.url}/ListarAcuerdos`, { withCredentials: true });
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
}
