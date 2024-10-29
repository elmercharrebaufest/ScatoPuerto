import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Destino } from '@ScatoModels/destino';
import { ConfiguracionDocumentoPorNominacion } from '@ScatoModels/digitalizacion-documentos/configuracion-documentos-por-nominacion';
import { Documento } from '@ScatoModels/digitalizacion-documentos/documento';
import { DocumentoEstado } from '@ScatoModels/digitalizacion-documentos/documento-estado';
import { NominacionDocumentoEmbarque } from '@ScatoModels/digitalizacion-documentos/nominacion-documento-embarque';
import { NominacionDocumentoEstadoPorEmbarque } from '@ScatoModels/digitalizacion-documentos/nominacion-documento-estado-por-embarque';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DocumentoService } from '@ScatoServicios/documento.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DocumentosEstadoListadoService {
  constructor(private confirmationDialogService: ConfirmationDialogService,
    private documentoService: DocumentoService,
    private formBuilder: FormBuilder) {
  }

  cargarDatosEmbarque(datosEmbarque, registroEmbarque) {
    datosEmbarque.push(this.inicializaDatosEmbarque(registroEmbarque));
  }
  cargarDocumentosEstado(documentosEstado, registroDocumentos) {
    documentosEstado.push(this.inicializaDocumentosEstado(registroDocumentos));
  }
  listarNominacionDocumentoEstadoPorEmbarque(nominacionId: number, configuracionDocumentoId:number, documento: string,documentoEstado:string): Observable<NominacionDocumentoEstadoPorEmbarque[]> {
    return this.documentoService.listarNominacionDocumentoEstadoPorEmbarque(nominacionId, configuracionDocumentoId,documento,documentoEstado).pipe(map((data: NominacionDocumentoEstadoPorEmbarque[]) => { return data; }));
  }
  obtenerNominacionDocumentoEmbarque(nominacionId: number, embarqueId: number): Observable<NominacionDocumentoEmbarque> {
    return this.documentoService.obtenerNominacionDocumentoEmbarque(nominacionId, embarqueId).pipe(map((data: NominacionDocumentoEmbarque) => { return data; }));
  }

  listarDocumentosPorNominacion(nominacionId: number): Observable<Documento[]> {
    return this.documentoService.listarDocumentosPorNominacion(nominacionId).pipe(map((data: Documento[]) => { return data; }));
  }
  
  listarConfiguracionDocumentoPorNominacion(nominacionId: number): Observable<ConfiguracionDocumentoPorNominacion[]> {
    return this.documentoService.listarConfiguracionDocumentoPorNominacion(nominacionId).pipe(map((data: ConfiguracionDocumentoPorNominacion[]) => { return data; }));
  }
  
  listarNominacionDocumentoEstados(): Observable<DocumentoEstado[]> {
    return this.documentoService.listarNominacionDocumentoEstados().pipe(map((data: DocumentoEstado[]) => { return data; }));
  }
  public inicializarFormFiltro(): FormGroup {
    return this.formBuilder.group({
      documento: '',
      documentoEstado: '',
      configuracionDocumento: '0'
    });
  }

  private inicializaDatosEmbarque(x: NominacionDocumentoEmbarque = null) {
    return this.formBuilder.group({
      nombreBuque: x?.nombreBuque?? '',
      fechaNominacion: x?.fechaNominacion ?? '',
      fechaFinalizacionCarga: x?.fechaFinalizacionCarga ?? '',
    });
  }
  private inicializaDocumentosEstado(x: NominacionDocumentoEstadoPorEmbarque = null) {
    return this.formBuilder.group({
      documentoId         : [{ value: x?.documentoId         , disabled: true }],
      documento           : [{ value: x?.documento           , disabled: true }],
      esBorradorAprobado  : [{ value: x?.esBorradorAprobado  , disabled: true }],
      esBorradorEnviado   : [{ value: x?.esBorradorEnviado   , disabled: true }],
      esBorradorModificado: [{ value: x?.esBorradorModificado, disabled: true }],
      esBorradorSolicitado: [{ value: x?.esBorradorSolicitado, disabled: true }],
      esDocumentoEnviado  : [{ value: x?.esDocumentoEnviado  , disabled: true }],
    });
  }
}
