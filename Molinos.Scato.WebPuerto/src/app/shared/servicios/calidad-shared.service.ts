import { EventEmitter, Injectable, Output } from '@angular/core';
import { ManosDeEmbarque } from '@ScatoModels/mano-embarque';
import { Mano } from '@ScatoModels/nir';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalidadSharedService {

  manosDeEmbarque: ManosDeEmbarque;
  constructor() { }
  @Output() Manos = new EventEmitter<any>();
  @Output() sendMano1 = new EventEmitter<Mano>();
  @Output() sendMano2 = new EventEmitter<Mano>();
  private _mano1: BehaviorSubject<Mano> = new BehaviorSubject<Mano>(null); 
  private _mano2: BehaviorSubject<Mano> = new BehaviorSubject<Mano>(null); 

  set mano1(mano: any){
    this._mano1.next(mano);
  }
  get mano1() {
    return this._mano1.asObservable();
  }

  set mano2(mano: any){
    this._mano2.next(mano);
  }
  get mano2() {
    return this._mano2.asObservable();
  }
  
  setManosDeEmbarque(manos){
    this.manosDeEmbarque = manos;
  }

  emitMano1(mano: Mano){
    this.sendMano1.emit(mano)
  }
  
  emitMano2(mano: Mano){
    this.sendMano2.emit(mano)
  }

  getManosDeEmbarque(){
    return this.manosDeEmbarque;
  }

  ocultarBotonesImprimir(){     
    var tags: string[] = ["ENVIAR", "EXPORTAR", "GUARDAR", "EMITIR", "AGREGAR", "CERRAR TURNO", "AGREGAR TURNO"];
    var buttons = document.getElementsByTagName('button');

    for (let i = 0; i < buttons.length; i++) {
      tags.forEach(tag => {
        if (buttons[i].innerText.toLocaleLowerCase().includes(tag.toLowerCase()) ){
          buttons[i].setAttribute("data-html2canvas-ignore", "true");
        }
      })
    }  

    document.getElementsByName('expTodosPlanillas').forEach(item => {
      item.className = "collapse show";      
    })

    setTimeout(() => {
      document.getElementsByName('expTodosPlanillas').forEach(item => {
        item.className = "collapse";      
      })
    },5000)
  }

}
