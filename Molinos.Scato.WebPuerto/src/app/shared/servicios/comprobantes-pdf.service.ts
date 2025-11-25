import { Injectable } from '@angular/core';
import jspdf from 'jspdf';
import { ComprobanteDeEmbarque, ComprobanteDeEmbarqueDetalle } from '@ScatoModels/comprobantes/comprobantes';

@Injectable({
  providedIn: 'root'
})
export class ComprobantesPdfService {

  constructor() { }

  public generarRomaneoPdf(romaneo: ComprobanteDeEmbarque): Blob {
    const doc = new jspdf({ orientation: 'portrait', unit: 'pt', format: 'letter' });

    let i = 0;
    let primeraPagina = true;

    for (const comprobante of romaneo.comprobanteDeEmbarqueDetalles) {
      if (!primeraPagina) {
        doc.addPage('letter', 'portrait');
      }
      this.dibujarComprobante(doc, comprobante, romaneo.buque, false);
      // Agregar página de copia
      doc.addPage('letter', 'portrait');
      this.dibujarComprobante(doc, comprobante, romaneo.buque, true);

      i++;
      primeraPagina = false;
    }

    return doc.output('blob');
  }

  private dibujarComprobante(doc: jspdf, comprobante: ComprobanteDeEmbarqueDetalle, buque: string, esCopia: boolean): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const marginLeft = 43.2;
    const marginTop = 57.4;
    const marginRight = 43.2;

    let y = marginTop;

    // ============ ENCABEZADO ============
    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.text('DOCUMENTO NO VALIDO COMO FACTURA', pageWidth / 2, y, { align: 'center' });

    // Si es copia, agregar la leyenda
    if (esCopia) {
      y += 15;
      doc.text('COPIA', pageWidth / 2, y, { align: 'center' });
      y += 10;
    } else {
      y += 25;
    }

    // ============ INFORMACIÓN DE LA EMPRESA ============
    doc.setFont('courier', 'bold');
    doc.setFontSize(14);
    y += 20;
    doc.text('Molinos Agro SA', marginLeft, y);

    doc.setFont('courier', 'normal');
    doc.setFontSize(10);
    y += 17;
    doc.text('Terminal Fluvial San Benito', marginLeft, y);
    y += 13;
    doc.text('Benielli 398 - San Lorenzo - CP 2200', marginLeft, y);
    y += 13;
    doc.text('Tel: 03476 - 438535 - 515 - 521', marginLeft, y);
    y += 13;
    doc.text('Email: embarques@molinosagro.com.ar', marginLeft, y);

    // ============ SECCIÓN DERECHA - CHECKBOX Y DATOS ============
    const rightX = pageWidth / 2 + 30;
    let rightY = marginTop + 30;

    // Checkbox DESPACHO
    const checkboxSize = 15;
    const checkboxX = rightX;
    doc.rect(checkboxX, rightY, checkboxSize, checkboxSize);
    doc.setFont('courier', 'bold');
    doc.setFontSize(16);
    doc.text('X', checkboxX + 3, rightY + 12);

    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.text('DESPACHO', checkboxX + checkboxSize + 10, rightY + 10);

    // Número y Fecha
    doc.setFont('courier', 'bold');
    rightY += 30;
    doc.text('N°:', checkboxX + 25, rightY);
    doc.setFont('courier', 'normal');
    doc.text(comprobante.numeroComprobante, checkboxX + 46, rightY);

    rightY += 13;
    doc.setFont('courier', 'bold');
    doc.text('FECHA:', checkboxX + 25, rightY);
    doc.setFont('courier', 'normal');
    doc.text(this.formatearFecha(comprobante.fechaCarga), checkboxX + 66, rightY);

    // Campos con líneas
    rightY += 28;
    const camposConLinea = ['C.U.I.T.:', 'ING. BRUTOS N°:', 'CAJ.PREV. I.C.Y.A.C.:', 'DER. REG. INSP. N°:', 'INICIO DE ACTIVIDADES:'];

    doc.setFont('courier', 'normal');
    for (const campo of camposConLinea) {
      doc.text(campo, rightX, rightY);
      const lineStartX = rightX + doc.getTextWidth(campo) + 5;
      doc.line(lineStartX, rightY + 2, pageWidth - marginRight, rightY + 2);
      rightY += 20;
    }

    // MERCADERIA y BGA/TN
    rightY = 280.4;
    var insertarLabelValorDerecha = (label: string, valor: string) => {
      doc.setFont('courier', 'bold');
      doc.text(label, rightX, rightY);
      doc.setFont('courier', 'normal');
      doc.text(valor, rightX + doc.getTextWidth(label + ' ') + 5, rightY);
    }
    insertarLabelValorDerecha('MERCADERIA:', comprobante.producto);
    rightY += 30;
    insertarLabelValorDerecha('BGA/TN:', comprobante.bodega);

    // ============ SECCIÓN IZQUIERDA - DATOS PRINCIPALES ============
    y = 280.4;
    const leftX = marginLeft;

    const insertarLabelValor = (label: string, valor?: string) => {
      doc.setFont('courier', 'bold');
      doc.text(label, leftX, y);
      if (valor) {
        doc.setFont('courier', 'normal');
        doc.text(valor, leftX + doc.getTextWidth(label + ' '), y);
      }
      y += 30;
    }

    insertarLabelValor('EXPORTADOR:', comprobante.exportador);
    insertarLabelValor('VAPOR:', buque);
    insertarLabelValor('DESTINO:', comprobante.destino);
    insertarLabelValor('TURNO:', comprobante.turno?.toString());
    insertarLabelValor('CANTIDAD:', comprobante.cantidad + ' KG');
    insertarLabelValor('BALANZA:', 'BAL' + comprobante.balanza);
    insertarLabelValor('BALANZADA:');
    insertarLabelValor('OBSERVACIONES:');

    // ============ FIRMAS ============
    const signaturesY = pageHeight - 140; // Desde el bottom
    const sigWidth = 200;
    const sigSpacing = (pageWidth - 2 * marginLeft - 2 * sigWidth) / 3;

    // Firma Molinos Agro
    const sig1X = marginLeft + sigSpacing;
    doc.line(sig1X, signaturesY, sig1X + sigWidth, signaturesY);
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.text('F/Molinos Agro', sig1X + sigWidth / 2, signaturesY + 12, { align: 'center' });

    // Firma Cliente
    const sig2X = sig1X + sigWidth + sigSpacing;
    doc.line(sig2X, signaturesY, sig2X + sigWidth, signaturesY);
    doc.text('F/Cliente', sig2X + sigWidth / 2, signaturesY + 12, { align: 'center' });

    // Firma Control (centrada abajo)
    const sig3Y = signaturesY + 70;
    const sig3X = pageWidth / 2 - sigWidth / 2;
    doc.line(sig3X, sig3Y, sig3X + sigWidth, sig3Y);
    doc.text('F/Control', sig3X + sigWidth / 2, sig3Y + 12, { align: 'center' });
  }

  private formatearFecha(fecha: any): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
