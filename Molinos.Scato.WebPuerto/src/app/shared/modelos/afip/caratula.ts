export class Caratula {
    id?: number;
    identificadorCaratula?: string;
    identificadorBuque: string;
    fechaArribo: string;
    fechaZarpada: string;
    puertoDestino: string;
    nombreMedioTransporte: string;
    fechaRegistro: string;
    numeroViaje: string;
    estado: string;

    numeroPaginado: any = false;
    itinerario: string[] = [];

    codigoAduana?: string;
    codigoLugarOperativo?: string;
    via?: string;
    solicitudesCambioBuque?: SolicitudCambioBuque[];
    solicitudesCambioFechas?: SolicitudCambioFechas[];
}

interface SolicitudAFIP {
    id: number;
    fechaCreacion: string;
    fechaActualizacion: string;
    estado: string;
}

export interface SolicitudCambioBuque extends SolicitudAFIP {
    fechaArribo: string;
    fechaZarpada: string;
    motivoSolicitud:string;
    motivoSolicitudDetalle:string;
}

export interface SolicitudCambioFechas extends SolicitudAFIP {
    fechaZarpada: string;
    nombreMedioTransporte: string;
}
