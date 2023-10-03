import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ReciboDeBuque, ReciboDeBuqueDetalles } from '@ScatoModels/reciboDeBuque';
import { ReciboSharingService } from '@ScatoServicios/recibo.shared.service';
import { ReciboBuqueService } from '@ScatoServicios/reciboBuque.service';
import jspdf from 'jspdf';
import { iif } from 'rxjs';
import { ToWords } from 'to-words';


@Component({
  selector: 'app-recibodebuquepdf',
  templateUrl: './recibodebuquepdf.component.html',
  styleUrls: ['./recibodebuquepdf.component.css']
})
export class RecibodebuquepdfComponent implements OnInit, AfterViewInit {
  reciboBuque:ReciboDeBuque;
  recibo : ReciboDeBuqueDetalles;
  cantidadFormatoEntera : string;
  cantidadAMostrar : string;

  constructor
  (
    private _reciboSharingService: ReciboSharingService,
  )
  {
    this._reciboSharingService.getReciboImpresionSubject().subscribe((data:ReciboDeBuque) => {this.reciboBuque = data
      this.recibirDataImpresion()
    });
  }

  ngOnInit(): void {

  }
  ngAfterViewInit(){
    this.recibirDataImpresion()

  }

  recibirDataImpresion(){
    console.log("RECIBIENDO DATA DESDE PDF", this.reciboBuque);
    if(this.reciboBuque !== null){
      this.recibo = this.reciboBuque.reciboDeBuqueDetalles[0];
      this.crearPDF();
    }
  }

  darFormato(cantidad: number, formatoEuropeo: boolean = false) {
    let numeroEntero = cantidad.toString().split(".")[0]
    let numeroDecimal = cantidad.toString().split(".")[1]
    let numeroEnteroConPuntos: any = "";

    if(numeroEntero.length > 0){
      for(let i = 0; i <= numeroEntero.length -1 ; i++){
        numeroEnteroConPuntos += numeroEntero[i];
        if((numeroEntero.length - (i+1))%3 == 0){
          numeroEnteroConPuntos += "."
        }
      }
    }

    if(numeroEnteroConPuntos.length > 0){
      if(numeroEnteroConPuntos.endsWith(".")){
        numeroEnteroConPuntos = numeroEnteroConPuntos.substring(0, numeroEnteroConPuntos.length - 1)
      }
    }

    if(!formatoEuropeo){
      numeroEnteroConPuntos = numeroEnteroConPuntos.replaceAll(".",",");
    }

    return (numeroEnteroConPuntos + ((numeroDecimal != undefined && numeroDecimal.length > 0) ? ((formatoEuropeo ? ",": ".") + numeroDecimal) : (!formatoEuropeo ? ".000": "")))
  }

  crearPDF(){
    let doc = new jspdf();
    for (let i = 1; i <= 3 ; i++) {
      i == 1 ? this.generarContenido(doc, i, true): this.generarContenido(doc, i, false);
    }
    doc.output('pdfobjectnewwindow');
  }

  getCantidadEnLetras(cantidad: any): string {
    if (cantidad != null) {
      const toWords = new ToWords({ localeCode: 'en-US' });
      return toWords.convert(cantidad)
    }
    return '';
  }

  generarContenido(doc:jspdf, numPag:number, original:boolean){
    if(original){
      doc.text("ORIGINAL", 105, 10, null, 'center');
      doc.setFontSize(11);
      doc.text("ORIGINAL", 105, 15, null, 'center');
    }else{
      doc.setFontSize(18);
      doc.text("COPY", 105, 10, null, 'center');
      doc.setFontSize(11);
      doc.text("COPIA", 105, 15, null, 'center');
    }

    //PUERTO ORIGEN && FECHA

    doc.setFontSize(11);
    doc.text(this.recibo.puertoOrigen || '', 57, 34.5, null, 'center');
    doc.setFontSize(12);
    doc.text("Port of _____________________________ Date __________________________________ 20 ___", 10, 35);
    doc.setFontSize(9);
    doc.text("Puerto de", 10, 39);
    doc.text("Fecha", 93, 39);
    doc.setFontSize(11);


    let arrFecha: string[];
    let dateRecibo = new Date(this.recibo.fechaRecibo);
    let dia = dateRecibo.getDate();
    dateRecibo.setDate(dia);
    arrFecha = dateRecibo.toDateString().split(' ',4)
    arrFecha[1] = dateRecibo.toLocaleDateString('EN-US', { 'month': 'long' });

    // FECHA
    doc.text(arrFecha[1].toUpperCase() + "    " + arrFecha[2], 145, 34.5, null, 'center');
    doc.text(arrFecha[3].slice(2, 4), 194, 34.5, null, 'center');


    //NOMBRE VAPOR
    doc.setFontSize(12);
    doc.text("Received, on board the M/V _____________________________", 79, 50)
    doc.setFontSize(11);
    doc.text(this.recibo.nombreBuque || '', 165, 49.5, null, 'center')
    doc.setFontSize(9);
    doc.text("Recibido a bordo del vapor",79, 54 )
    doc.setFontSize(12)

    //EXPORTADOR
    doc.text("the under noted goods in apparent good order and condition from", 10, 62);
    doc.setFontSize(11);
    doc.text(this.recibo.exportador?.toUpperCase() || '', 105, 76.5, null, 'center');
    doc.setFontSize(9);
    doc.text("las mercaderías abajo mencionadas en aparente buen orden y condición de ", 10, 66);
    doc.setFontSize(12);
    doc.text("________________________________________________________________________________", 10, 77);

    //PUERTO DESTINO
    if(this.recibo.incluirImpresionDestino){
      doc.text("for the Port of", 10, 87);
      doc.setFontSize(9);
      doc.text("para el puerto de", 10, 91);
      doc.setFontSize(11);
      doc.text(this.recibo.puertoDestino?.toUpperCase() || '', 117, 90.5, null, 'center');
      doc.setFontSize(12);
      doc.text("_____________________________________________________________________", 36, 91);

    }

    doc.setFontSize(9);

    //CANTIDAD EN LETRAS Y CLASE DE CARGA CUADRO
    doc.text("(Quantity to be stated in Figures and also in Words).(Cantidades a esteblecerse en números y tambien en letras)", 10, 100);
    doc.rect(10, 103, 189, 45);
    doc.rect(10, 113, 189, 35);
    doc.rect(10, 103, 50, 45);

    //CANTIDAD
    doc.setFontSize(12);
    doc.text("QUANTITY", 35, 107, null, 'center');
    doc.setFontSize(9);
    doc.text("CANTIDAD", 35, 111, null, 'center');
    doc.setFontSize(11);
    doc.text(this.darFormato(this.recibo.cantidad, this.recibo.esEuropeo) , 35, 131.5, null, 'center');

    //CALIDAD EN LETRAS
    doc.setFontSize(12);
    doc.text("QUANTITY IN WORDS AND CLASS OF CARGO", 82, 107);
    doc.setFontSize(9);
    doc.text("CANTIDAD EN LETRAS Y CLASE DE CARGA",96, 111);
    doc.setFontSize(7.5);

    let cantidadAMostrarEnLetras: string;

    if(this.recibo.esEuropeo ){
      let spliteado = this.getCantidadEnLetras(this.recibo.cantidad).split('POINT');
      if(spliteado[1] != undefined){
        let cantidadLetras = spliteado[0] + 'COMMA' + spliteado[1]
        cantidadAMostrarEnLetras = cantidadLetras.toUpperCase();
      }else{
        cantidadAMostrarEnLetras = this.getCantidadEnLetras(this.recibo.cantidad);
      }
    }else{
      cantidadAMostrarEnLetras = this.getCantidadEnLetras(this.recibo.cantidad);
    }

    let arrLineasTexto = doc.splitTextToSize(cantidadAMostrarEnLetras +  (this.recibo.valorEnKG == true ? ' KILOS' : ' METRIC TONS')+ " OF " + this.recibo.cantidadLetrasYClaseCarga, 130);
    let offSet = arrLineasTexto.length == 1 ? 0 : -(((arrLineasTexto.length * 5)-5) / 2);
    arrLineasTexto.forEach(linea => {

      doc.text(linea, 129.5, 131.2 + offSet, null, 'center')
      offSet += 5;

    })
    // doc.text(cantidadAMostrarEnLetras.toUpperCase(), 129.5, 131.2, null, 'center');
    doc.setFontSize(12);

    //ESTIBADO DE BODEGA
    if(this.recibo.incluirImpresionEstibado && this.recibo.incluirImpresionCalidad) {
      doc.text("Stowed:", 10, 170);
      doc.text("_________________________________________________________________", 46, 170);
      doc.setFontSize(9);
      doc.text("Estibado en bodega", 10, 173);
      doc.setFontSize(11);
      doc.text(this.recibo.estibadoEnBodega || '', 47, 169.5);


      doc.setFontSize(12);
      doc.text("Quality And Quantity unknown Said to Weigh:", 10, 185);
      doc.text("_________________________________________", 102, 185);
      doc.setFontSize(9);
      doc.text("Calidad y cantidad desconocidas que se dice pesar", 10, 188);

      doc.setFontSize(11);
      doc.text(this.recibo.calidadYCantidadDesconocida || '', 102, 184.5);
      doc.setFontSize(12);

      doc.text("Signature of Master - Chief Officer:", 10, 200);
      doc.text("__________________________________________________", 81, 200);
      doc.setFontSize(9);
      doc.text("Firma del capitán - Primer Oficial", 10, 203);
    } else if (this.recibo.incluirImpresionEstibado && !this.recibo.incluirImpresionCalidad){

      doc.text("Stowed:", 10, 170);
      doc.text("_________________________________________________________________", 46, 170);
      doc.setFontSize(9);
      doc.text("Estibado en bodega", 10, 173);
      doc.setFontSize(11);
      doc.text(this.recibo.estibadoEnBodega || '', 47, 169.5);

      doc.setFontSize(12);
      doc.text("Signature of Master - Chief Officer:", 10, 185);
      doc.text("__________________________________________________", 81, 185);
      doc.setFontSize(9);
      doc.text("Firma del capitán - Primer Oficial", 10, 188);
    } else if (!this.recibo.incluirImpresionEstibado && this.recibo.incluirImpresionCalidad){
      doc.setFontSize(12);
      doc.text("Quality And Quantity unknown Said to Weigh:", 10, 170);
      doc.text("_________________________________________", 102, 170);
      doc.setFontSize(9);
      doc.text("Calidad y cantidad desconocidas que se dice pesar", 10, 173);

      doc.setFontSize(11);
      doc.text(this.recibo.calidadYCantidadDesconocida || '', 102, 169.5);
      doc.setFontSize(12);
      doc.text("Signature of Master - Chief Officer:", 10, 185);
      doc.text("__________________________________________________", 81, 185);
      doc.setFontSize(9);
      doc.text("Firma del capitán - Primer Oficial", 10, 189);

    } else {
      doc.setFontSize(12);
      doc.text("Signature of Master - Chief Officer:", 10, 170);
      doc.text("__________________________________________________", 81, 170);
      doc.setFontSize(9);
      doc.text("Firma del capitán - Primer Oficial", 10, 173);

    }
    if (numPag <= 2) doc.addPage('a4', 'p');
  }
}
