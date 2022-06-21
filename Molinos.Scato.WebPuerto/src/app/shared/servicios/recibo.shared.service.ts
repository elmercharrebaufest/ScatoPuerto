import { Injectable } from '@angular/core';
import { ReciboDeBuque } from '@ScatoModels/reciboDeBuque';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReciboSharingService {

  // #region Variables  
  private filtroRecibosSubject: BehaviorSubject<ReciboDeBuque> = new BehaviorSubject<ReciboDeBuque>(null);
  private refreshRecibo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  // #endregion
  
  // #region Constructor  
  constructor() {
  }
  // #endregion

  // #region Metodos
  public getFiltroRecibos() {
    return this.filtroRecibosSubject.asObservable();
  }
  public getRefreshRecibo() {
    return this.refreshRecibo.asObservable();
  }
  
  public setFiltroRecibos(recibo: ReciboDeBuque) {
    this.filtroRecibosSubject.next(recibo);
  }
  public setRefreshRecibo(refrescar : boolean) {
    this.refreshRecibo.next(refrescar);
  }
  // #endregion

}