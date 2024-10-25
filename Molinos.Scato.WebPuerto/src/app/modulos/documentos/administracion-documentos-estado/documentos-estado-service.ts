import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentosEstadoService {

  private _nominacionSel: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  constructor() {
  }

  set NominacionSeleccionada(value: any) {
    this._nominacionSel.next(value);
  }
  get NominacionSeleccionada() {
    return this._nominacionSel.asObservable();
  }

}
