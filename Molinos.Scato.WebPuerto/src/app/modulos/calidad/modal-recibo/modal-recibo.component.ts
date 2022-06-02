import { Component, OnInit } from '@angular/core';
import { ReciboDeBuque } from '@ScatoModels/recibo-buque';
import { PDFService } from '@ScatoServicios/pdf.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { Embarque } from '@ScatoModels/embarque';
import { finalize } from 'rxjs/operators';



@Component({
  selector: 'app-modal-recibo',
  templateUrl: './modal-recibo.component.html',
  styleUrls: ['./modal-recibo.component.css']
})
export class ModalReciboComponent implements OnInit {
  reciboBuque: ReciboDeBuque;
  errorMessage: boolean = false;
  idEmbarque:number;
  nombrBuque:string;



  constructor(
    private _PDFService: PDFService,
    private _modalService: NgbModal,
    private _datosEmbarqueProcesoService: DatosEmbarquesProcesoService,
    private _embarqueService: EmbarqueService,


  ) { }

  ngOnInit(): void {
    this.inicializarReciboBuque();
    this.initObtenerEmbarque();
  }

  initObtenerEmbarque(){
    let embarque: Embarque;
    this.idEmbarque = this._datosEmbarqueProcesoService.getEmbarqueId();
    // this._embarqueService.obtenerEmbarque(this.idEmbarque).subscribe((res:Embarque) => res.nombreBuque = this.embarque);
    this._embarqueService.obtenerEmbarque(this.idEmbarque)
     .pipe(finalize(() => {
       this.nombrBuque = embarque.nombreBuque;
       this.reciboBuque.nombreVapor = this.nombrBuque;
       console.log("NOMBRE======",this.nombrBuque);
     }))
     .subscribe((res:Embarque) => embarque = res);
  }

  inicializarReciboBuque(){
    this.reciboBuque = new ReciboDeBuque();
    var converter = require('number-to-words');
    this.reciboBuque.nombrePuertoOrigen = "San Lorenzo, ARGENTINA";
    // this.reciboBuque.fechaRecibo = new Date();
    // this.reciboBuque.nombreVapor = `${this.nombrBuque}`;
    this.reciboBuque.nombreEmpresaRemitente = "MOLINOS AGRO S.A";
    this.reciboBuque.nombrePuertoDestino = "";
    this.reciboBuque.cantidad = 0;
    this.reciboBuque.cantidadEnLetras = converter.toWords(this.reciboBuque.cantidad).toUpperCase();
    this.reciboBuque.estibadoEnBodega = "";
    this.reciboBuque.calidadYCantidadDesconocidas = "";
    this.reciboBuque.incluirParaImpresionDesconocida = true
    this.reciboBuque.incluirParaImpresionBodega = true
    this.reciboBuque.incluirParaImpresionDesconocida = true
  }

  onChangeCantidadEnLetras(cantidad: number){
    var converter = require('number-to-words');
     this.reciboBuque.cantidadEnLetras = converter.toWords(cantidad).toUpperCase();
    // let cantstr = cantidadLetras.toString();
    // this.reciboBuque.cantidadEnLetras = converter.toWords(cantidad);
  }

  openModalEmitirRecibo(modal: any) {
    this.errorMessage = false;
    this._modalService.open(modal, { size: 'lg'});
  }

  generarPDF(){
    this._PDFService.sendGenerarPDF.emit();
  }
}
