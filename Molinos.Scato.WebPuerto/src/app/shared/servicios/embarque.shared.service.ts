import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmbarqueSharingService {

  // #region Variables  
  private vaporId : number;
  private embarqueId : number;
  private moduloDeCargaId: number;
  private parametrosIdsEmbarque: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  // #endregion

  // #region Constructor  
  // #endregion

  // #region Metodos

  public setVaporId(vaporId: number){
    this.vaporId = vaporId;
  }
  public getVaporId(): number{
    return this.vaporId;
  }
  public setEmbarqueId(embarqueId: number){
    this.embarqueId = embarqueId;
  }
  public getEmbarqueId(): number{
    return this.embarqueId;
  }
  public setModuloDeCargaId(modulodecargaid: number){
    this.moduloDeCargaId = modulodecargaid;
  }
  public getModuloDeCargaId(): number{
    return this.moduloDeCargaId;
  }

  public getParametrosIdsEmbarque() {
    return this.parametrosIdsEmbarque.asObservable();
  }
  public setParametrosIdsEmbarque(parametrosIdsEmbarque: any) {
    this.parametrosIdsEmbarque.next(parametrosIdsEmbarque);
  }
  
}