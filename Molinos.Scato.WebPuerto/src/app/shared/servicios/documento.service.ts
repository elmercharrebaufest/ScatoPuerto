import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfiguracionDocumento, Documento, DocumentoDestino, DocumentoMaterialPuerto, DocumentoTipo, NominacionDocumento, NominacionDocumentoEstado } from '@ScatoModels/digitalizacion-documentos/documento';
import { ListaPaginada } from '@ScatoModels/listaPaginada';
import { Destino } from '@ScatoModels/destino';
import { DocumentoEstado } from '@ScatoModels/digitalizacion-documentos/documento-estado';
import { NominacionDocumentoEmbarque } from '@ScatoModels/digitalizacion-documentos/nominacion-documento-embarque';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfiguracionDocumentoPorNominacion } from '@ScatoModels/digitalizacion-documentos/configuracion-documentos-por-nominacion';
import { NominacionDocumentoEstadoPorEmbarque } from '@ScatoModels/digitalizacion-documentos/nominacion-documento-estado-por-embarque';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {

  private url: string = environment.apiUrl + 'documento';

  private configSource = new BehaviorSubject<number>(null);  // Inicializa con null o un valor por defecto
  config$ = this.configSource.asObservable();  // Observable al que los componentes se suscriben

  constructor(private http: HttpClient) { }

  public actualizarConfiguracion(configId: number) {
    this.configSource.next(configId);  // Actualiza el valor del destino
  }

  public listarDocumentoTipos() {
    return this.http.get<DocumentoTipo[]>(`${this.url}/ListarDocumentoTipos`, { withCredentials: true });
  }

  public listarDocumentos(pagina: number = 0, itemsPorPagina: number = 0, nombre: string = '') {
    const params = { pagina, itemsPorPagina, nombre } as any;
    return this.http.get<ListaPaginada<Documento>>(`${this.url}/ListarDocumentos`, { withCredentials: true, params });
  }

  public crearDocumento(documento: Documento) {
    return this.http.post(`${this.url}/CrearDocumento`, documento, { withCredentials: true });
  }

  public editarDocumento(documento: Documento) {
    return this.http.put(`${this.url}/ModificarDocumento`, documento, { withCredentials: true });
  }

  public eliminarDocumento(id: number) {
    return this.http.delete(`${this.url}/EliminarDocumento?id=${id}`, { withCredentials: true });
  }

  public listarDocumentosNominacion() {
    return this.http.get<Documento[]>(`${this.url}/ListarDocumentosNominacion`, { withCredentials: true });
  }

  public listarDocumentosDestino(destinoId: number = 0) {
    return this.http.get<DocumentoDestino[]>(`${this.url}/ListarDocumentosDestino?destinoId=${destinoId}`, { withCredentials: true });
  }

  public ListarDocumentosProducto(productoId: number = 0) {
    return this.http.get<DocumentoMaterialPuerto[]>(`${this.url}/ListarDocumentosProducto?productoId=${productoId}`, { withCredentials: true });
  }

  public guardarConfiguraciones(configuraciones: ConfiguracionDocumento[], nominacionId: number) {
    const body = { nominacionId, configuraciones };
    return this.http.put(`${this.url}/GuardarConfiguracionDocumento`, body, { withCredentials: true });
  }

  public listarDocumentosPorConfiguracion(configuracionId: number) {
    return this.http.get<any[]>(`${this.url}/ListarDocumentosPorConfiguracion?configuracionId=${configuracionId}`, { withCredentials: true });
  }

  public guardarArchivos(nomDocId: number, archivos: FormData) {
    return this.http.post(`${this.url}/GuardarArchivos?nomDocId=${nomDocId}`, archivos, { withCredentials: true });
  }

  public eliminarArchivo(id: number) {
    return this.http.delete(`${this.url}/EliminarArchivo?id=${id}`, { withCredentials: true });
  }

  public descargarArchivo(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/DescargarArchivo?id=${id}`, { responseType: 'blob' });
  }

  public obtenerNominacionDocumento(id: number) {
    return this.http.get<NominacionDocumento>(`${this.url}/ObtenerNominacionDocumento?id=${id}`, { withCredentials: true });
  }

  public agregarComentario(nominacionDocumentoId: number, comentario: string) {
    const body = { nominacionDocumentoId, comentario };
    return this.http.post(`${this.url}/CrearComentario`, body, { withCredentials: true });
  }

  public obtenerEstados() {
    return this.http.get<NominacionDocumentoEstado[]>(`${this.url}/ListarNominacionDocumentoEstados`, { withCredentials: true });
  }

  public actualizarEstado(nominacionDocumentoId: number, estadoId: number) {
    const body = { nominacionDocumentoId, estadoId };
    return this.http.put(`${this.url}/ActualizarEstado`, body, { withCredentials: true });
  }

  public listarNominacionDocumentoEstadoPorEmbarque(nominacionId: number, configuracionDocumentoId:number, documento: string,documentoEstado:string) {
    return this.http.get<NominacionDocumentoEstadoPorEmbarque[]>(`${this.url}/ListarNominacionDocumentoEstadoPorEmbarque?nominacionId=${nominacionId}&configuracionDocumentoId=${configuracionDocumentoId}&documento=${documento}&documentoEstado=${documentoEstado}`, { withCredentials: true });
  }
  public obtenerNominacionDocumentoEmbarque(nominacionId: number, embarqueId: number) {
    return this.http.get<NominacionDocumentoEmbarque>(`${this.url}/ObtenerNominacionDocumentoEmbarque?nominacionId=${nominacionId}&embarqueId=${embarqueId}`, { withCredentials: true });
  }

  public listarNominacionDocumentoEstados() {
    return this.http.get<DocumentoEstado[]>(`${this.url}/ListarNominacionDocumentoEstados`, { withCredentials: true });
  }

  public listarDocumentosPorNominacion(nominacionId: number) {
    return this.http.get<Documento[]>(`${this.url}/ListarDocumentosPorNominacion?nominacionId=${nominacionId}`, { withCredentials: true });
  }

  public listarDestinoPorNominacion(nominacionId: number) {
    return this.http.get<Destino[]>(`${this.url}/ListarDestinoPorNominacion?nominacionId=${nominacionId}`, { withCredentials: true });
  }

  public listarProductosPorNominacion(nominacionId: number) {
    return this.http.get<MaterialPuerto[]>(`${this.url}/ListarProductosPorNominacion?nominacionId=${nominacionId}`, { withCredentials: true });
  }
  public listarConfiguracionDocumentoPorNominacion(nominacionId: number) {
    return this.http.get<ConfiguracionDocumentoPorNominacion[]>(`${this.url}/ListarConfiguracionDocumentoPorNominacion?nominacionId=${nominacionId}`, { withCredentials: true });
  }

  public cerrarDocumentos(ids: number[]) {
    return this.http.put(`${this.url}/CerrarDocumentos`, ids, { withCredentials: true });
  }
}
