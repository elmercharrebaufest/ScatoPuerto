export class ReciboDeBuque {
  nombrePuertoOrigen: string;
  fechaRecibo: string;
  nombreVapor: string;
  nombreEmpresaRemitente: string;
  nombrePuertoDestino: string;
  cantidad: number;
  cantidadEnLetras: string;
  estibadoEnBodega: string;
  calidadYCantidadDesconocidas: string;
  idModuloDeCarga: number;
  userImpresion: string 
  fechaImpresion: Date;
  incluirParaImpresionDesconocida: boolean;
  incluirParaImpresionBodega: boolean;
  incluirParaImpresionDestino: boolean; 
}