import { Injectable } from '@angular/core';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { ComprobantesService } from './comprobantes.service';
import { take } from 'rxjs/operators';
import { RomaneoPuertoComprobante } from '@ScatoModels/comprobantes/comprobantes';

@Injectable({
  providedIn: 'root'
})
export class ComprobantesPdfService {

  constructor(private comprobantesService: ComprobantesService) { }

  public async generarRomaneoPdf(romaneoId: number): Promise<void> {
    const romaneo = await this.comprobantesService.obtenerRomaneo(romaneoId).pipe(take(1)).toPromise();

    const response = await fetch('assets/templates/formulario-molinos-ROMANEO.html');
    const htmlText = await response.text();

    // Crear un contenedor temporal fuera de pantalla
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlText;
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const element = tempContainer.querySelector('.page') as HTMLElement;

    // Crear el PDF
    const doc = new jspdf({ orientation: 'portrait', unit: 'pt', format: 'letter', });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (const comprobante of romaneo.romaneoPuertoComprobantes) {
      this.llenarDatosComprobante(element, comprobante);
      // Renderizar HTML a canvas con html2canvas
      const canvas = await html2canvas(element, { useCORS: true });
      const imgData = canvas.toDataURL('image/png');
  
  
      if (comprobante != romaneo.romaneoPuertoComprobantes[0]) {
        doc.addPage('letter', 'portrait');
      }
      // Agregar primera página (original)
      doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
  
      // Agregar segunda página (copia)
      doc.addPage('letter', 'portrait');
      doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
  
      // Añadir leyenda "COPIA"
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('COPIA', pageWidth / 2, 40, { align: 'center' });
    }

    document.body.removeChild(tempContainer);

    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, '_blank');
  }

  private llenarDatosComprobante(element: HTMLElement, comprobante: RomaneoPuertoComprobante) {
    const fechaCarga = comprobante.fechaCarga.split('T')[0].split('-').reverse().join('/');

    this.llenarValorSpan(element, 'sp-numero-comprobante', comprobante.numeroComprobante);
    this.llenarValorSpan(element, 'sp-fecha', fechaCarga);
    this.llenarValorSpan(element, 'sp-mercaderia', comprobante.producto);
    this.llenarValorSpan(element, 'sp-bodega', comprobante.bodega);
    this.llenarValorSpan(element, 'sp-exportador', comprobante.exportador);
    this.llenarValorSpan(element, 'sp-vapor', comprobante.buque);
    this.llenarValorSpan(element, 'sp-destino', comprobante.destino);
    this.llenarValorSpan(element, 'sp-turno', comprobante.turno.toString());
    this.llenarValorSpan(element, 'sp-cantidad', comprobante.cantidad);
    this.llenarValorSpan(element, 'sp-balanza', comprobante.balanza);
  }

  private llenarValorSpan(element: HTMLElement, spanId: string, valor: string) {
    const span = element.querySelector(`#${spanId}`) as HTMLElement;
    span.textContent = valor;
  }

}
