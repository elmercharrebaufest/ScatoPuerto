import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Documento, DocumentoDestino, DocumentoTipo } from '@ScatoModels/digitalizacion-documentos/documento';
import { ListaPaginada } from '@ScatoModels/listaPaginada';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {

  private url: string = environment.apiUrl + 'documento';

  constructor(private http: HttpClient) { }

  public listarDocumentoTipos() {
    return this.http.get<DocumentoTipo[]>(`${this.url}/ListarDocumentoTipos`, { withCredentials: true });
  }

  public listarDocumentos(pagina: number, itemsPorPagina: number, nombre: string) {
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

  public listarDocumentosDestino(destinoId: number) {
    return this.http.get<DocumentoDestino[]>(`${this.url}/ListarDocumentosDestino?destinoId=${destinoId}`, { withCredentials: true });
  }
}
