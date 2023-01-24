export class ReciboDeBuque {
   id: number;
   embarque_Id: number;
   numeroRecibo: number;
   estado: string;
   emitio: string;
   superviso: string;
   fechaHoraImpresion: Date;
   desdeTabla: boolean;
   reciboDeBuqueDetalles: ReciboDeBuqueDetalles[];
}

export class ReciboDeBuqueDetalles {
    reciboDeBuque_id: number;
    exportador: string;
    cantidad: number;
    puertoDestino: string;
    fechaRecibo: Date;
    puertoOrigen: string;
    nombreBuque: string;
    cantidadLetrasYClaseCarga: string;
    estibadoEnBodega: string;
    calidadYCantidadDesconocida: string;
    fechaImpresion: Date;
    incluirImpresionDestino: boolean; 
    incluirImpresionCalidad: boolean;
    incluirImpresionEstibado: boolean;
    esEuropeo:boolean;
    valorEnKG:boolean;
};