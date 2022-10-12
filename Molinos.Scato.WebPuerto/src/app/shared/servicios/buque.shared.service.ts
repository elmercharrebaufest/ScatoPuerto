import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BuqueSharingService {

  // #region Variables  
  private filtroBusquesSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private listadoBuquesSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  // #endregion

  // #region Constructor  
  constructor(private http: HttpClient) {
  }
  // #endregion

  // #region Metodos
  public getFiltroBusques() {
    return this.filtroBusquesSubject.asObservable();
  }
  public setFiltroBusques(filtroBuque: FormGroup) {
    this.filtroBusquesSubject.next(filtroBuque);
  }

  public getListadoBuques() {
    return this.listadoBuquesSubject.asObservable();
  }

  public setListadoBuques(listadoBuques: any) {
    this.listadoBuquesSubject.next(listadoBuques);
  }
  // #endregion
}