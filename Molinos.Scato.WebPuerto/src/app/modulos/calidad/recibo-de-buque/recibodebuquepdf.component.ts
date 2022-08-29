import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ReciboDeBuque, ReciboDeBuqueDetalles } from '@ScatoModels/reciboDeBuque';
import { ReciboSharingService } from '@ScatoServicios/recibo.shared.service';
import { ReciboBuqueService } from '@ScatoServicios/reciboBuque.service';
import jspdf from 'jspdf'; 


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
      private _reciboBuqueService:ReciboBuqueService,
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
        this.darFormato(this.recibo.cantidad, this.recibo.esEuropeo)
        this.crearPDF();
      }
    }

    darFormato(cantidad: number, formatoEuropeo: boolean = false) {
      let arrNumero = cantidad.toString().split(".");
      if (arrNumero.length == 2) {
        
      }
      let numeroEntero = arrNumero[0];
      let numeroDecimal = arrNumero[1];
      

      if(numeroEntero.length == 9){
      let part1 = numeroEntero.slice(0, 3);
      let part2 = numeroEntero.slice(3, 6);
      let part3 = numeroEntero.slice(6, 9);
      this.cantidadFormatoEntera = !formatoEuropeo ? `${part1},${part2},${part3}` : `${part1}.${part2}.${part3}`;
      }else if(numeroEntero.length == 8){
          let part1 = numeroEntero.slice(0, 2);
          let part2 = numeroEntero.slice(2, 5);
          let part3 = numeroEntero.slice(5, 8);
          this.cantidadFormatoEntera = !formatoEuropeo ? `${part1},${part2},${part3}` : `${part1}.${part2}.${part3}`;
          
      }else if(numeroEntero.length == 7){
          let part1 = numeroEntero.slice(0, 1);
          let part2 = numeroEntero.slice(1, 4);
          let part3 = numeroEntero.slice(4, 7);
          this.cantidadFormatoEntera = !formatoEuropeo ? `${part1},${part2},${part3}` : `${part1}.${part2}.${part3}`;
          
      }else if(numeroEntero.length == 6){
          let part1 = numeroEntero.slice(0, 3);
          let part2 = numeroEntero.slice(3, 6);
          this.cantidadFormatoEntera = !formatoEuropeo ? `${part1},${part2}` : `${part1}.${part2}`;
          
      }else if(numeroEntero.length == 5){
          let part1 = numeroEntero.slice(0, 2);
          let part2 = numeroEntero.slice(2, 5);
          this.cantidadFormatoEntera = !formatoEuropeo ? `${part1},${part2}` : `${part1}.${part2}`;
          
      }
      else if(numeroEntero.length == 4){
          let part1 = numeroEntero.slice(0, 1);
          let part2 = numeroEntero.slice(1, 4);
          this.cantidadFormatoEntera = !formatoEuropeo ? `${part1},${part2}` : `${part1}.${part2}`;
      }else if(numeroEntero.length < 4){
        this.cantidadFormatoEntera = !formatoEuropeo ? `${numeroEntero}` : `${numeroEntero}`;
      }

      if(numeroDecimal !== undefined){
        this.cantidadAMostrar = !formatoEuropeo ? `${this.cantidadFormatoEntera}.${numeroDecimal}` : `${this.cantidadFormatoEntera},${numeroDecimal}`
      }else{
        if(formatoEuropeo){
          this.cantidadAMostrar = this.cantidadFormatoEntera
        }else{
          this.cantidadAMostrar = `${this.cantidadFormatoEntera}.000`

        }
        
      }
    }
    crearPDF(){
      let doc = new jspdf();
      doc.text("ORIGINAL", 105, 10, null, 'center');
   
      //PUERTO ORIGEN && FECHA 
      doc.setFontSize(11);
      doc.text("ORIGINAL", 105, 15, null, 'center');
      doc.setFontSize(11);
      doc.text(this.recibo.puertoOrigen, 57, 34.5, null, 'center');
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
      
      // FECHA
      doc.text(arrFecha[1].toUpperCase() + "    " + arrFecha[2], 145, 34.5, null, 'center');
      doc.text(arrFecha[3].slice(2, 4), 194, 34.5, null, 'center');
      
      
      //NOMBRE VAPOR
      doc.setFontSize(12);
      doc.text("Received, on board the M/V _____________________________", 79, 50)
      doc.setFontSize(11);
      doc.text(this.recibo.nombreBuque, 165, 49.5, null, 'center')
      doc.setFontSize(9);
      doc.text("Recibido a bordo del vapor",79, 54 )
      doc.setFontSize(12)
  
      //EXPORTADOR
      doc.text("the under noted goods in apparent good order and condition from", 10, 62);
      doc.setFontSize(11);
      doc.text(this.recibo.exportador.toUpperCase(), 105, 76.5, null, 'center');
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
        doc.text(this.recibo.puertoDestino.toUpperCase(), 117, 90.5, null, 'center');
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
      doc.text(this.cantidadAMostrar, 35, 131.5, null, 'center');
  
      //CALIDAD EN LETRAS
      doc.setFontSize(12);
      doc.text("QUANTITY IN WORDS AND CLASS OF CARGO", 82, 107);
      doc.setFontSize(9);
      doc.text("CANTIDAD EN LETRAS Y CLASE DE CARGA",96, 111);
      doc.setFontSize(7.5);
      if(this.recibo.esEuropeo){
        //lo spliteo para sacar el POINT y ponerle COMA al final del primer elemento del array
        let arrCantLetras = this.recibo.cantidadLetrasYClaseCarga.split('POINT');
        let conComa = arrCantLetras[0] + "COMMA" + arrCantLetras[1];
        doc.text(conComa.toUpperCase(), 129.5, 131.2, null, 'center');
        doc.setFontSize(12);
      }else{
        doc.text(this.recibo.cantidadLetrasYClaseCarga.toUpperCase(), 129.5, 131.2, null, 'center');
        doc.setFontSize(12);
      }
      
  
      //ESTIBADO DE BODEGA
      if(this.recibo.incluirImpresionEstibado && this.recibo.incluirImpresionCalidad) {
        doc.text("Stowed:", 10, 170);
        doc.text("_________________________________________________________________", 46, 170);
        doc.setFontSize(9);
        doc.text("Estibado en bodega", 10, 173);
        doc.setFontSize(11);
        doc.text(this.recibo.estibadoEnBodega, 47, 169.5);
  
  
        doc.setFontSize(12);
        doc.text("Quality And Quantity unknown Said to Weigh:", 10, 185);
        doc.text("_________________________________________", 102, 185);
        doc.setFontSize(9);
        doc.text("Calidad y cantidad desconocidas que se dice pasar", 10, 188);
  
        doc.setFontSize(11);
        doc.text(this.recibo.calidadYCantidadDesconocida, 102, 184.5);
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
        doc.text(this.recibo.estibadoEnBodega, 47, 169.5);
  
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
        doc.text("Calidad y cantidad desconocidas que se dice pasar", 10, 173);
  
        doc.setFontSize(11);
        doc.text(this.recibo.calidadYCantidadDesconocida, 102, 169.5);
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
      doc.output('pdfobjectnewwindow');
  }
}
