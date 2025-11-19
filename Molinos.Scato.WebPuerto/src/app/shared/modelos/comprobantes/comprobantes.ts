export interface TipoComprobante {
    id: number
    descripcion: string
}

export interface ComprobanteDeEmbarque {
    id: number
    tipoComprobante: TipoComprobante
    buque: string
    numeroComprobante: string
    cantidadPaginas: number
    fechaEmision: string
    usuarioEmision: string
    fechaImpresion: string
    estado: string
    ubicacionArchivo: string
    comprobanteDeEmbarqueDetalles: ComprobanteDeEmbarqueDetalle[]
}

export interface ComprobanteDeEmbarqueDetalle {
    id: number
    numeroComprobante: string
    producto: string
    bodega: string
    exportador: string
    destino: string
    fechaCarga: string
    turno: number
    cantidad: string
    balanza: string
    fechaHoraInicioCarga : string
    fechaHoraFinCarga : string
}
