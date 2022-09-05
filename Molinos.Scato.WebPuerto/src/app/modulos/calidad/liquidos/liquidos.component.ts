import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as html2pdf from 'html2pdf.js';


@Component({
  selector: 'app-liquidos',
  templateUrl: './liquidos.component.html',
  styleUrls: ['./liquidos.component.css']
})
export class LiquidosComponent implements OnInit {

  @Output() hideSpinner = new EventEmitter<boolean>();
  RecibidoresPdf: boolean = false;
  
  constructor() { }

  ngOnInit(): void {
    this.hideSpinner.emit(false);
  }

  imprimir(imprimir: boolean = false){
   // #region Imprimir Recibidores Liquido
    this.ocultarBotonesImprimir();
    
    this.RecibidoresPdf = true;

    
    let element = document.getElementById('imprimirRecibidoresLiquido');
    let opt = {
      margin:       .1,
      filename:     'Pantalla Recibidores.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 3, letterRendering:true},                         //IMPRIMO PANTALLA DE SOLIDOS USANDO LIBRERIA HTML2PDF, SETEANDO
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }     // PROPIEDADES Y VALORES DE LA IMPRESION
    };

    html2pdf().from(element).set(opt).outputPdf()
    .then(() => {
      if (!imprimir) this.RecibidoresPdf = false
    }).save();
   // #endregion
  }

  private ocultarBotonesImprimir(){
   // #region Ocultar Botones Para Impresion
    let scrollBarPlanilla = document.getElementById('scrollbar-planilla-recibidores-liquido');
    let valueScrollBarPlanilla = scrollBarPlanilla.style.height;
    let botonLineasDeEmbarque = document.getElementById('guardar-conformacion-lineas-embarque');
    let valueBotonLineasDeEmbarque = botonLineasDeEmbarque.style.display;

    document.getElementsByName('expTodosPlanillas').forEach(item => {
      item.className = "collapse show";      
    })

    scrollBarPlanilla.style.height = 'auto';
    botonLineasDeEmbarque.style.display = 'none';
   // #endregion
    
   //#region Mostrar Botones 
    setTimeout(() => {
      scrollBarPlanilla.style.height = valueScrollBarPlanilla;
      botonLineasDeEmbarque.style.display = valueBotonLineasDeEmbarque;

      document.getElementsByName('expTodosPlanillas').forEach(item => {
        item.className = "collapse";      
      })
    },5000)

   // #endregion
  }

}