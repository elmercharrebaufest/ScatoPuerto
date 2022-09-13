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

   // #endregion
  }

}