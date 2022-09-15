import { EventEmitter, Injectable, Output } from '@angular/core';
import { ManosDeEmbarque } from '@ScatoModels/mano-embarque';
import { Mano } from '@ScatoModels/nir';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalidadSharedService {

  manosDeEmbarque: ManosDeEmbarque;
  constructor() { }
  @Output() Manos = new EventEmitter<any>();
  @Output() sendMano1 = new EventEmitter<Mano>();
  @Output() sendMano2 = new EventEmitter<Mano>();
  @Output() sendFinalizaEnCalidad = new EventEmitter<any>();
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

  emitFinalizaEnCalidad(){
    this.sendFinalizaEnCalidad.emit();
  }

  getManosDeEmbarque(){
    return this.manosDeEmbarque;
  }

  ocultarBotonesImprimir(){     
    var tags: string[] = ["ENVIAR", "EXPORTAR", "GUARDAR", "EMITIR", "AGREGAR", "CERRAR TURNO", "AGREGAR TURNO"];
    var tagFilas: string[] = ["AGREGAR NUEVA FILA"];

    var buttons = document.getElementsByTagName('button');
    let collapse = document.getElementsByTagName('app-collapse-button');
    var spanAgregarFila = document.getElementsByTagName('span')

    if (document.getElementById('expPlanillaSolidoCalidad')) {
      let scrollBarPlanillaSolidos = document.getElementById('scrollbar-planilla-recibidores-solido');
      let valueScrollBarPlanillaSolidos = scrollBarPlanillaSolidos.style.height;
      // let botonEnviarNir = document.getElementById('btn-enviar-nir');
      document.getElementsByName('expTodosPlanillas').forEach(item => {
      item.className = "collapse show";
      });

      scrollBarPlanillaSolidos.style.height = 'auto';
      // botonEnviarNir.style.display = 'none';

      setTimeout(() => {
        scrollBarPlanillaSolidos.style.height = valueScrollBarPlanillaSolidos;
        // botonEnviarNir.style.display = 'block';
        document.getElementsByName('expTodosPlanillas').forEach(item => {
          item.className = "collapse";      
        })
        },5000)
    }
    if(document.getElementById('scrollbar-planilla-recibidores-liquido')){
      let valueScrollBarPlanilla = document.getElementById('scrollbar-planilla-recibidores-liquido').style.height;
      // let valueScrollBarPlanilla = scrollBarPlanilla.style.height;

      document.getElementById('scrollbar-planilla-recibidores-liquido').style.height = 'auto';
      setTimeout(() => {
        document.getElementById('scrollbar-planilla-recibidores-liquido').style.height = valueScrollBarPlanilla;
        },5000)
    }
    

    for (let i = 0; i < buttons.length; i++) {
      tags.forEach(tag => {
        if (buttons[i].innerText.toLocaleLowerCase().includes(tag.toLowerCase()) ){
          buttons[i].setAttribute("data-html2canvas-ignore", "true");
        }
      })
    }  

    for (let i = 0; i < spanAgregarFila.length; i++) {
      tagFilas.forEach(tag => {
        if (spanAgregarFila[i].innerText.toLocaleLowerCase().includes(tag.toLowerCase()) ){
          spanAgregarFila[i].parentElement.setAttribute("data-html2canvas-ignore", "true");
        }
      })
    } 

    for (let i = 0; i < collapse.length; i++) {
      tags.forEach(tag => {
          collapse[i].setAttribute("data-html2canvas-ignore", "true");
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
