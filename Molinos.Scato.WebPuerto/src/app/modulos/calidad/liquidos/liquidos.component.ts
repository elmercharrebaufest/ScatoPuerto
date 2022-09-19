import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CalidadSharedService } from '@ScatoServicios/calidad-shared.service';
import * as html2pdf from 'html2pdf.js';


@Component({
  selector: 'app-liquidos',
  templateUrl: './liquidos.component.html',
  styleUrls: ['./liquidos.component.css']
})
export class LiquidosComponent implements OnInit {

  @Output() hideSpinner = new EventEmitter<boolean>();
  RecibidoresPdf: boolean = false;
  
  constructor(private _CalidadSharedService: CalidadSharedService) { }

  ngOnInit(): void {
    this.hideSpinner.emit(false);
  }

  imprimir(imprimir: boolean = false){
      this._CalidadSharedService.ocultarBotonesImprimir();
    
    this.RecibidoresPdf = true;

    
    let element = document.getElementById('imprimirRecibidoresLiquido');
    let opt = {
      margin:       .1,
      filename:     'Pantalla Recibidores.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2},                                               //IMPRIMO PANTALLA DE SOLIDOS USANDO LIBRERIA HTML2PDF, SETEANDO
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }     // PROPIEDADES Y VALORES DE LA IMPRESION
    };

    html2pdf().from(element).set(opt).outputPdf()
    .then(() => {
      if (!imprimir) this.RecibidoresPdf = false
    }).save();
  }
}