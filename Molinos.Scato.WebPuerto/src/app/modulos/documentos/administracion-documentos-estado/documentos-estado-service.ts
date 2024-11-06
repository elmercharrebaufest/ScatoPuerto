import { Injectable } from '@angular/core';
import { DocumentoAlertaDatosAsunto } from '@ScatoModels/digitalizacion-documentos/documento-alerta-datos-asunto';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentosEstadoService {

  private _nominacionSel: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  private _documentoAlertaDatosAsunto: BehaviorSubject<DocumentoAlertaDatosAsunto> = new BehaviorSubject<DocumentoAlertaDatosAsunto>(null);

  constructor() {
  }

  set DocumentoAlertaDatosAsunto(value: any) {
    this._documentoAlertaDatosAsunto.next(value);
  }
  get DocumentoAlertaDatosAsunto() {
    return this._documentoAlertaDatosAsunto.asObservable();
  }
  set NominacionSeleccionada(value: any) {
    this._nominacionSel.next(value);
  }
  get NominacionSeleccionada() {
    return this._nominacionSel.asObservable();
  }

}
