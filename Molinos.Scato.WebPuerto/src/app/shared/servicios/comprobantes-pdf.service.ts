import { Injectable } from '@angular/core';
import jspdf from 'jspdf';
import { ComprobanteDeEmbarque, ComprobanteDeEmbarqueDetalle } from '@ScatoModels/comprobantes/comprobantes';

@Injectable({
  providedIn: 'root'
})
export class ComprobantesPdfService {

  constructor() { }

  // #region ROMANEO
  public generarRomaneoPdf(romaneo: ComprobanteDeEmbarque, nombreArchivo: string): Blob {
    const doc = new jspdf({ orientation: 'portrait', unit: 'pt', format: 'letter' });
    doc.setProperties({ title: nombreArchivo });

    let i = 0;
    let primeraPagina = true;

    for (const comprobante of romaneo.comprobanteDeEmbarqueDetalles) {
      if (!primeraPagina) {
        doc.addPage('letter', 'portrait');
      }
      this.dibujarComprobanteRomaneo(doc, comprobante, romaneo.buque, false);
      // Agregar página de copia
      doc.addPage('letter', 'portrait');
      this.dibujarComprobanteRomaneo(doc, comprobante, romaneo.buque, true);

      i++;
      primeraPagina = false;
    }

    return doc.output('blob');
  }

  private dibujarComprobanteRomaneo(doc: jspdf, comprobante: ComprobanteDeEmbarqueDetalle, buque: string, esCopia: boolean): void {
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

    // MERCADERIA y BDA/TK
    rightY = 280.4;
    var insertarLabelValorDerecha = (label: string, valor: string) => {
      doc.setFont('courier', 'bold');
      doc.text(label, rightX, rightY);
      doc.setFont('courier', 'normal');
      doc.text(valor, rightX + doc.getTextWidth(label + ' ') + 5, rightY);
    }
    insertarLabelValorDerecha('MERCADERIA:', comprobante.producto);
    rightY += 30;
    insertarLabelValorDerecha('BDA/TK:', comprobante.bodega);

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
    doc.text('P/Molinos Agro', sig1X + sigWidth / 2, signaturesY + 12, { align: 'center' });

    // Firma Cliente
    const sig2X = sig1X + sigWidth + sigSpacing;
    doc.line(sig2X, signaturesY, sig2X + sigWidth, signaturesY);
    doc.text('P/Cliente', sig2X + sigWidth / 2, signaturesY + 12, { align: 'center' });

    // Firma Control (centrada abajo)
    const sig3Y = signaturesY + 70;
    const sig3X = pageWidth / 2 - sigWidth / 2;
    doc.line(sig3X, sig3Y, sig3X + sigWidth, sig3Y);
    doc.text('P/Control', sig3X + sigWidth / 2, sig3Y + 12, { align: 'center' });
  }
  // #endregion ROMANEO

  // #region SECUENCIA REAL
  private readonly PAGE_CONFIG = {
    margins: { left: 43.2, top: 36, right: 43.2, bottom: 36 }, // 0.6in = 43.2pt, 0.5in = 36pt
    fonts: { header: 11, title: 12, info: 9, table: 9 },
    lineHeight: 14,
    headerHeight: 130 // Espacio reservado para encabezado completo
  };

  public generarSecuenciaRealPdf(secuenciaCarga: ComprobanteDeEmbarque, nombreArchivo: string): { blob: Blob, paginas: number } {
    const doc = new jspdf({ orientation: 'portrait', unit: 'pt', format: 'letter' });
    doc.setProperties({ title: nombreArchivo });

    // Agrupar cargas por fecha y turno
    const cargasPorFechaYTurno = this.agruparCargasPorFechaYTurno(secuenciaCarga.comprobanteDeEmbarqueDetalles);

    let yPosition = 0;

    // Dibujar encabezado inicial
    yPosition = this.dibujarEncabezado(doc, secuenciaCarga);

    let totalEmbarcado = 0;
    const fechas = Array.from(cargasPorFechaYTurno.keys()).sort((a, b) => {
      const [da, ma, ya] = a.split('/').map(Number);
      const [db, mb, yb] = b.split('/').map(Number);
      return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
    });

    for (const fecha of fechas) {
      const turnosPorFecha = cargasPorFechaYTurno.get(fecha)!;
      const turnos = Array.from(turnosPorFecha.keys()).sort((a, b) => a - b);

      // Verificar si hay espacio para la fecha
      if (!this.hayEspacio(doc, yPosition, 1)) {
        doc.addPage('letter', 'portrait');
        yPosition = this.dibujarEncabezado(doc, secuenciaCarga);
      }

      // Dibujar fecha
      yPosition = this.dibujarFecha(doc, fecha, yPosition);

      let totalFecha = 0;

      for (const turno of turnos) {
        const cargas = turnosPorFecha.get(turno)!;

        // Dibujar cargas una por una, con paginación automática
        for (const carga of cargas) {
          let lineasCarga = this.calcularLineasCarga(carga);
          let dibujarEncabezadoTurno = false;

          if (carga === cargas[0]) { // Primera carga del turno
            lineasCarga += 3; // Espacio extra para el encabezado del turno
            dibujarEncabezadoTurno = true;
          }

          // Verificar si hay espacio para esta carga completa
          if (!this.hayEspacio(doc, yPosition, lineasCarga)) {
            doc.addPage('letter', 'portrait');
            yPosition = this.dibujarEncabezado(doc, secuenciaCarga);
            dibujarEncabezadoTurno = true;
          }

          if (dibujarEncabezadoTurno) {
            yPosition = this.dibujarEncabezadoTurno(doc, turno, yPosition);
          }

          yPosition = this.dibujarCarga(doc, carga, yPosition);
        }

        // Calcular total del turno
        const totalTurno = cargas.reduce((sum, c) => {
          const num = parseFloat(c.cantidad.replace(/\./g, '').replace(',', '.'));
          return sum + (isNaN(num) ? 0 : num);
        }, 0);

        // Verificar espacio para total del turno
        if (!this.hayEspacio(doc, yPosition, 2)) {
          doc.addPage('letter', 'portrait');
          yPosition = this.dibujarEncabezado(doc, secuenciaCarga);
        }

        yPosition = this.dibujarTotalTurno(doc, totalTurno, yPosition);
        totalFecha += totalTurno;
      }

      // Total de fecha (solo después del último turno)
      if (!this.hayEspacio(doc, yPosition, 2)) {
        doc.addPage('letter', 'portrait');
        yPosition = this.dibujarEncabezado(doc, secuenciaCarga);
      }

      yPosition = this.dibujarTotalFecha(doc, totalFecha, yPosition);
      totalEmbarcado += totalFecha;
    }

    // Total embarcado
    if (!this.hayEspacio(doc, yPosition, 2)) {
      doc.addPage('letter', 'portrait');
      yPosition = this.dibujarEncabezado(doc, secuenciaCarga);
    }

    this.dibujarTotalEmbarcado(doc, totalEmbarcado, yPosition);

    return { blob: doc.output('blob'), paginas: doc.getNumberOfPages() };
  }

  private agruparCargasPorFechaYTurno(cargas: ComprobanteDeEmbarqueDetalle[]): Map<string, Map<number, ComprobanteDeEmbarqueDetalle[]>> {
    const mapa = new Map<string, Map<number, ComprobanteDeEmbarqueDetalle[]>>();

    for (const carga of cargas) {
      const fecha = this.formatearFecha(carga.fechaCarga);

      if (!mapa.has(fecha)) {
        mapa.set(fecha, new Map<number, ComprobanteDeEmbarqueDetalle[]>());
      }

      const turnosMapa = mapa.get(fecha);
      if (!turnosMapa.has(carga.turno)) {
        turnosMapa.set(carga.turno, []);
      }

      turnosMapa.get(carga.turno).push(carga);
    }

    return mapa;
  }

  private hayEspacio(doc: jspdf, yActual: number, numLineas: number): boolean {
    const pageHeight = doc.internal.pageSize.getHeight();
    const espacioNecesario = numLineas * this.PAGE_CONFIG.lineHeight;
    return (yActual + espacioNecesario) < (pageHeight - this.PAGE_CONFIG.margins.bottom);
  }

  private dibujarEncabezado(doc: jspdf, secuencia: ComprobanteDeEmbarque): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const { margins, fonts } = this.PAGE_CONFIG;
    let y = margins.top;

    // Header top: Terminal info (izquierda) y título (derecha)
    doc.setFont('courier', 'normal');
    doc.setFontSize(fonts.header);
    doc.text('Terminal Fluvial', margins.left, y);

    y += 15;
    doc.setFont('courier', 'bold');
    doc.text('MOLINOS', margins.left, y);

    // Título a la derecha (subrayado)
    const titulo = 'Secuencia Real de Carga';
    const tituloWidth = doc.getTextWidth(titulo);
    const tituloX = pageWidth - margins.right - tituloWidth;
    doc.setFontSize(fonts.title);
    doc.text(titulo, tituloX, y);

    // Línea de subrayado del título
    doc.line(tituloX, y + 2, tituloX + tituloWidth, y + 2);

    y += 20;

    // Recuadro con información
    const boxHeight = 45;
    const boxY = y;
    doc.setLineWidth(2);
    doc.rect(margins.left, boxY, pageWidth - margins.left - margins.right, boxHeight);

    // Contenido del recuadro
    doc.setFont('courier', 'normal');
    doc.setFontSize(fonts.info);

    const padding = 12;
    let boxContentY = boxY + padding + 10;

    // Izquierda
    doc.text('Unidad de tiempo: Minutos', margins.left + padding, boxContentY);
    boxContentY += 13;
    doc.text('Vapor ' + (secuencia.buque || ''), margins.left + padding, boxContentY);

    // Derecha (E.T.A.)
    const etaText = 'E.T.A. ' + secuencia.fechaETA;
    const etaWidth = doc.getTextWidth(etaText);
    doc.text(etaText, pageWidth - margins.right - padding - etaWidth, boxContentY);

    y = boxY + boxHeight + 20;

    return y;
  }

  private dibujarFecha(doc: jspdf, fecha: string, y: number): number {
    const { margins, fonts } = this.PAGE_CONFIG;

    doc.setFont('courier', 'bold');
    doc.setFontSize(fonts.info);
    doc.text('Fecha ' + fecha, margins.left, y);

    return y + this.PAGE_CONFIG.lineHeight;
  }

  private dibujarEncabezadoTurno(doc: jspdf, turno: number, y: number): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const { margins, fonts } = this.PAGE_CONFIG;

    const horaInicio = ('0' + ((turno - 1) * 6)).slice(-2) + ':00';
    const horaFin = ('0' + (turno * 6)).slice(-2) + ':00';

    doc.setFont('courier', 'bold');
    doc.setFontSize(fonts.info);
    doc.text(`Turno ${turno} ${horaInicio} A ${horaFin}`, margins.left, y);

    y += this.PAGE_CONFIG.lineHeight;

    const cols = this.getColumnPositions();

    doc.setFont('courier', 'normal');
    doc.text('Hora', cols.horaInicio, y);
    doc.text('Hora', cols.horaFin, y);
    doc.text('Balanza', cols.balanza, y);
    doc.text('Bodega', cols.bodega, y);
    doc.text('Exportador', cols.exportador, y);
    doc.text('Cant.', cols.cantidad, y);
    doc.text('Producto', cols.producto, y);
    y += 10;
    doc.text('Inicio', cols.horaInicio, y);
    doc.text('Fin', cols.horaFin, y);
    doc.text('Cargada', cols.cantidad, y);
    y += 2;
    doc.setLineWidth(1);
    doc.line(margins.left, y, pageWidth - margins.right, y);

    y += 10;

    return y;
  }

  private dibujarCarga(doc: jspdf, carga: ComprobanteDeEmbarqueDetalle, y: number): number {
    const { fonts } = this.PAGE_CONFIG;
    const cols = this.getColumnPositions();

    doc.setFont('courier', 'normal');
    doc.setFontSize(fonts.info);

    const yLinea1 = y;

    const horaInicioCarga = this.extraerHora(carga.fechaInicioCarga);
    const horaFinCarga = this.extraerHora(carga.fechaFinCarga, true);

    // Primera línea: hora inicio, hora fin, balanza, bodega, producto
    doc.text(horaInicioCarga, cols.horaInicio, yLinea1);
    doc.text(horaFinCarga, cols.horaFin, yLinea1);
    doc.text('BALANZA ' + (carga.balanza || ''), cols.balanza, yLinea1);
    doc.text(carga.bodega || '', cols.bodega, yLinea1);

    // Producto con wrapping si es muy largo
    const productoTexto = carga.producto || '';
    const maxWidthProducto = doc.internal.pageSize.getWidth() - this.PAGE_CONFIG.margins.right - cols.producto;
    const productoLineas = doc.splitTextToSize(productoTexto, maxWidthProducto);
    doc.text(productoLineas[0] || '', cols.producto, yLinea1);

    // Segunda línea (o más): cantidad
    const cantidadFormateada = carga.cantidad;
    if (cantidadFormateada.length <= 11) {
      // Cantidad en una sola línea
      doc.text(cantidadFormateada, cols.cantidad, yLinea1 + this.PAGE_CONFIG.lineHeight);
      return yLinea1 + this.PAGE_CONFIG.lineHeight + 8;
    } else {
      // Cantidad en dos líneas (dividir después de 11 caracteres)
      const linea1Cant = cantidadFormateada.substring(0, 11);
      const linea2Cant = cantidadFormateada.substring(11);

      doc.text(linea1Cant, cols.cantidad, yLinea1 + this.PAGE_CONFIG.lineHeight);
      doc.text(linea2Cant, cols.cantidad, yLinea1 + this.PAGE_CONFIG.lineHeight * 2);

      return yLinea1 + this.PAGE_CONFIG.lineHeight * 2 + 8;
    }
  }

  private dibujarTotalTurno(doc: jspdf, total: number, y: number): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const { margins } = this.PAGE_CONFIG;
    const cols = this.getColumnPositions();

    y += 2;
    doc.setFont('courier', 'bold');
    doc.text('Total del Turno', margins.left, y);
    doc.text(this.formatearCantidad(total), cols.cantidad, y);

    y += 2;
    doc.setLineWidth(1);
    doc.line(margins.left, y, pageWidth - margins.right, y);

    return y + 15;
  }

  private dibujarTotalFecha(doc: jspdf, total: number, y: number): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const { margins } = this.PAGE_CONFIG;
    const cols = this.getColumnPositions();

    doc.setFont('courier', 'bold');
    doc.setFontSize(this.PAGE_CONFIG.fonts.info);
    doc.text('Total de la Fecha', margins.left, y);
    doc.text(this.formatearCantidad(total), cols.cantidad, y);

    y += 2;
    doc.setLineWidth(1);
    doc.line(margins.left, y, pageWidth - margins.right, y);

    return y + 15;
  }

  private dibujarTotalEmbarcado(doc: jspdf, total: number, y: number): number {
    const { margins } = this.PAGE_CONFIG;
    const cols = this.getColumnPositions();

    doc.setFont('courier', 'bold');
    doc.setFontSize(this.PAGE_CONFIG.fonts.info);
    doc.text('Total Embarcado', margins.left, y);
    doc.text(this.formatearCantidad(total), cols.cantidad, y);

    return y;
  }

  private getColumnPositions(): any {
    const { margins } = this.PAGE_CONFIG;

    return {
      horaInicio: margins.left,
      horaFin: margins.left + 50,
      balanza: margins.left + 100,
      bodega: margins.left + 165,
      exportador: margins.left + 215,
      cantidad: margins.left + 290,
      producto: margins.left + 360
    };
  }

  private calcularLineasCarga(carga: ComprobanteDeEmbarqueDetalle): number {
    const cantidadFormateada = carga.cantidad;
    // Si la cantidad tiene más de 11 caracteres, necesita 2 líneas, sino 1 línea
    const lineasCantidad = cantidadFormateada.length > 11 ? 2 : 1;
    // Total: 1 línea base + líneas adicionales de cantidad + espaciado
    return 1 + lineasCantidad;
  }
  // #endregion SECUENCIA REAL

  private formatearCantidad(cantidad: string | number): string {
    // Formato: 3.000.000,0
    const num = typeof cantidad === 'string' ? parseFloat(cantidad) : cantidad;
    if (isNaN(num)) return '0,000';

    const partes = num.toFixed(3).split('.');
    const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimal = partes[1] || '0';
    return entero + ',' + decimal;
  }

  private formatearFecha(fecha: any): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private extraerHora(fechaHora: string, esfin: boolean = false): string {
    if (!fechaHora) return '';
    const date = new Date(fechaHora);
    let hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    if (esfin && hours === '00' && minutes === '00') {
      hours = '24';
    }
    return `${hours}:${minutes}`;
  }
}
