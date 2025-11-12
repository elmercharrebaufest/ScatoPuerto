export interface Comprobante {
    id: number
    tipoComprobante: string
    numero: string
    cantidadPaginas: number
    fechaEmision: string
    usuarioEmision: string
    fechaImpresion: string
    estado: string
    romaneoPuertoComprobantes: RomaneoPuertoComprobante[]
    secuenciasReales: any[]
}

export interface RomaneoPuertoComprobante {
    id: number
    numeroComprobante: string
    producto: string
    exportador: string
    bodega: string
    buque: string
    destino: string
    fechaCarga: string
    turno: number
    cantidad: string
    balanza: string
}
