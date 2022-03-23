import { Component, Input, OnInit } from '@angular/core';
import { ReciboDeBuque } from '@ScatoModels/recibo-buque';
import { PDFService } from '@ScatoServicios/pdf.service';
import { debug } from 'console';
import jspdf from 'jspdf'; 


@Component({
  selector: 'app-testpdf',
  templateUrl: './testpdf.component.html',
  styleUrls: ['./testpdf.component.css']
})
export class TestpdfComponent implements OnInit {

    

    @Input() recibo : ReciboDeBuque; 

  constructor(private _PDFService:PDFService) { }

  ngOnInit(): void {
    this._PDFService.sendGenerarPDF.subscribe(() => this.crearPDF());
    }

  crearPDF(){
    let doc = new jspdf();
    doc.text("ORIGINAL", 105, 10, null, 'center');

    doc.setFontSize(11);
    doc.text("ORIGINAL", 105, 15, null, 'center');
    doc.setFontSize(11);
    doc.text(this.recibo.nombrePuertoOrigen.toUpperCase(), 57, 34.5, null, 'center');
    doc.setFontSize(12);
    doc.text("Port of _____________________________ Date __________________________________ 20 ___", 10, 35);
    doc.setFontSize(9);
    doc.text("Puerto de", 10, 39);
    doc.text("Fecha", 93, 39);
    doc.setFontSize(11);

    let strTest = "CADENA DE PRUEBA";

    let arrFecha: string[];

    arrFecha = this.recibo.fechaRecibo.toDateString().split(" ",4);

    doc.text(arrFecha[1] + " " + arrFecha[2], 145, 34.5, null, 'center');
    doc.text(arrFecha[3].substring(2), 194, 34.5, null, 'center');
    doc.setFontSize(12);
    doc.text("Recived, on board the M/V _____________________________", 79, 50)
    doc.setFontSize(11);
    doc.text(this.recibo.nombreVapor.toUpperCase(), 165, 49.5, null, 'center')
    doc.setFontSize(9);
    doc.text("Recibido a bordo del vapor",79, 54 )
    doc.setFontSize(12);
    doc.text("the under noted goods in apparent good order and condition from", 10, 62);
    doc.setFontSize(11);
    doc.text(this.recibo.nombreEmpresaRemitente.toUpperCase(), 105, 76.5, null, 'center');
    doc.setFontSize(9);
    doc.text("las mercaderías abajo mencionadas en aparente buen orden y condición de ", 10, 66);
    doc.setFontSize(12);
    doc.text("________________________________________________________________________________", 10, 77);
    doc.text("for the Port of", 10, 87);
    doc.setFontSize(9);
    doc.text("para el puerto de", 10, 91);
    doc.setFontSize(11);
    doc.text(this.recibo.nombrePuertoDestino.toUpperCase(), 117, 90.5, null, 'center');
    doc.setFontSize(12);
    doc.text("_____________________________________________________________________", 36, 91);
    doc.setFontSize(9);
    doc.text("(Quantity to be stated in Figures and also in Words).(Cantidades a esteblecerse en números y tambien en letras)", 10, 100);
    doc.rect(10, 103, 189, 45);
    doc.rect(10, 113, 189, 35);
    doc.rect(10, 103, 50, 45);
    doc.setFontSize(12);
    doc.text("QUANTITY", 35, 107, null, 'center');
    doc.setFontSize(9);
    doc.text("CANTIDAD", 35, 111, null, 'center');
    doc.setFontSize(11);
    doc.text(this.recibo.cantidad.toString(), 35, 131.5, null, 'center');

    doc.setFontSize(12);
    doc.text("QUANTITY IN WORDS AND CLASS OF CARGO", 82, 107);
    doc.setFontSize(9);
    doc.text("CANTIDAD EN LETRAS Y CLASE DE CARGA",96, 111);
    doc.setFontSize(7.5);
    doc.text(this.recibo.cantidadEnLetras.toUpperCase(), 129.5, 131.2, null, 'center');
    doc.setFontSize(12);
    doc.text("Stowed:", 10, 170);
    doc.text("_________________________________________________________________", 46, 170);
    doc.setFontSize(9);
    doc.text("Estibado en bodega", 10, 173);
    doc.setFontSize(11);
    doc.text(this.recibo.estibadoEnBodega, 47, 169.5);

    if(this.recibo.incluirParaImpresion == true){
      doc.setFontSize(12);
      doc.text("Quality And Quantity unknown Said to Weigh:", 10, 185);
      doc.text("_________________________________________", 102, 185);
      doc.setFontSize(11);
      doc.text(this.recibo.calidadYCantidadDesconocidas, 102, 184.5);
      doc.setFontSize(12);
      doc.text("Signature of Master - Chief Officer:", 10, 200);
      doc.text("__________________________________________________", 81, 200);
      doc.setFontSize(9);
      doc.text("Firma del capitán - Primer Oficial", 10, 203);
    } else {
      doc.setFontSize(12);
      doc.text("Signature of Master - Chief Officer:", 10, 185);
      doc.text("__________________________________________________", 81, 185);
      doc.setFontSize(9);
      doc.text("Firma del capitán - Primer Oficial", 10, 188);
    }
    doc.output('pdfobjectnewwindow');

  }
}
