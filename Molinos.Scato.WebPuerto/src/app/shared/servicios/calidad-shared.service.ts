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
  @Output() sendFinalizaEnCalidad = new EventEmitter<boolean>();
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

  emitFinalizaEnCalidad(esLiquido: boolean){
    this.sendFinalizaEnCalidad.emit(esLiquido);
  }

  getManosDeEmbarque(){
    return this.manosDeEmbarque;
  }

  retirarEstilosImprimirLiquido(){
    var listas = document.getElementsByClassName('custom-select');
    for (let item of listas){
      item.classList.remove("custom-select-background");
    }

    var listaFlechas = document.getElementsByClassName('fas fa-angle-down');
    for (let item of listaFlechas){
      item.classList.remove("ocultar-botones");
    }

    var listaBotones= document.getElementsByClassName("basurerito");
    for (let item of listaBotones){
      item.classList.remove("ocultar-botones");
    }
    var listaTksAbordo= document.getElementsByClassName("img-tn");
    for (let item of listaTksAbordo){
      item.classList.remove("ocultar-botones");
    }

    //Retirar estilos lineas de embarque
    let lineas = document.getElementsByClassName('table-responsive-lineas-post-pdf')[0] as HTMLDivElement;
    let tdFechaIni = document.getElementsByClassName('td-fecha-post-pdf')[0] as HTMLDivElement;
    let tdFechaFin = document.getElementsByClassName('td-fecha-post-pdf')[1] as HTMLDivElement;
    if(lineas != undefined)
      lineas.className = 'table-responsive-lineas';
    if(tdFechaIni != undefined)
      tdFechaIni.className = 'td-fecha';
    if(tdFechaFin != undefined)
      tdFechaFin.className = 'td-fecha';
  }
  ocultarBotonesImprimir(){     
    var tags: string[] = ["ENVIAR", "EXPORTAR", "GUARDAR", "EMITIR", "AGREGAR", "CERRAR TURNO", "AGREGAR TURNO"];
    var tagFilas: string[] = ["AGREGAR NUEVA FILA"];

    var buttons = document.getElementsByTagName('button');
    let collapse = document.getElementsByTagName('app-collapse-button');
    var spanAgregarFila = document.getElementsByTagName('span')

    var listas = document.getElementsByClassName('custom-select');
    for (let item of listas){
      item.classList.add("custom-select-background");
    }

    var listaFlechas = document.getElementsByClassName('fas fa-angle-down');
    for (let item of listaFlechas){
      item.classList.add("ocultar-botones");
    }

    var listaBotones= document.getElementsByClassName("basurerito");
    for (let item of listaBotones){
      item.classList.add("ocultar-botones");
    }
    var listaTksAbordo= document.getElementsByClassName("img-tn");
    for (let item of listaTksAbordo){
      item.classList.add("ocultar-botones");
    }

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

     //Aplicar estilos lineas de embarque

     let lineas = document.getElementsByClassName('table-responsive-lineas')[0] as HTMLDivElement;
     if(lineas !== undefined){
       lineas.className = 'table-responsive-lineas-post-pdf';
       lineas.style.height = "100%";
       lineas.style.width = "100%";
       lineas.style.marginLeft = "-30px";
     }

     let tdFechaIni = document.getElementsByClassName('td-fecha')[0] as HTMLDivElement;
     let tdFechaFin = document.getElementsByClassName('td-fecha')[1] as HTMLDivElement;
     if(tdFechaIni !== undefined){
       tdFechaIni.className = 'td-fecha-post-pdf';
       tdFechaIni.style.maxWidth = "40px"; 
     }
     if(tdFechaFin !== undefined){
       tdFechaFin.className = 'td-fecha-post-pdf';
       tdFechaFin.style.maxWidth = "40px"; 
     } 

  }

}
