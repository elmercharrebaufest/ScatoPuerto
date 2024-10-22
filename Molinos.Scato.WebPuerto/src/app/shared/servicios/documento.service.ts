import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfiguracionDocumento, Documento, DocumentoDestino, DocumentoMaterialPuerto, DocumentoTipo, NominacionDocumento } from '@ScatoModels/digitalizacion-documentos/documento';
import { ListaPaginada } from '@ScatoModels/listaPaginada';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

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
    return this.http.get(`${this.url}/DescargarArchivo/${id}`, { responseType: 'blob' });
  }

  public obtenerNominacionDocumento(id: number) {
    return this.http.get<NominacionDocumento>(`${this.url}/ObtenerNominacionDocumento?id=${id}`, { withCredentials: true });
  }

  public agregarComentario(nomDocId: number, texto: string) {
    return this.http.post(`${this.url}/CrearComentario?nomDocId=${nomDocId}&texto=${texto}`, { withCredentials: true });
  }

}
