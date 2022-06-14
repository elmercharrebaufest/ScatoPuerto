import { Injectable } from '@angular/core';
import { ReciboDeBuque } from '@ScatoModels/reciboDeBuque';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReciboSharingService {

  // #region Variables  
  private filtroRecibosSubject: BehaviorSubject<ReciboDeBuque> = new BehaviorSubject<ReciboDeBuque>(null);
  // #endregion

  // #region Constructor  
  constructor() {
  }
  // #endregion

  // #region Metodos
  public getFiltroRecibos() {
    return this.filtroRecibosSubject.asObservable();
  }
  
  public setFiltroRecibos(recibo: ReciboDeBuque) {
    this.filtroRecibosSubject.next(recibo);
  }
  // #endregion

}