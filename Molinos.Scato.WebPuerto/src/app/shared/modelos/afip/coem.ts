import { EstadoCOEM } from "./estadoCoem";
import { NuevasMercaderiasSueltasCoem } from "./nuevasMercaderiasSueltasCoem";

export class COEM {
  id?: number;
  identificadorCOEM?: string;
  identificadorCaratula: string;
  contenedoresConCarga?: Array<any> = [];
  contenedoresVacios?: Array<any> = [];
  mercaderiasSueltas: Array<NuevasMercaderiasSueltasCoem>;
  afipSolicitudesNoABordo: SolicitudNoABordo[];
  afipCoemEstado: EstadoCOEM;
  motivoRechazo: string;
}

export interface SolicitudCierreCargaDto {
  idCaratula: number;
  fechaZarpada: string;
  ignorarFechaZarpada: boolean;
  numeroViaje: string;
  coems: SolicitudCierreCargaCoemDto[];
}

export interface SolicitudCierreCargaCoemDto {
  idCoem: number;
  identificadorCoem: string;
  declaraciones: SolicitudCierreCargaCoemDeclaracionDto[];
}

export interface SolicitudCierreCargaCoemDeclaracionDto {
  identificadorDeclaracion: string;
  fechaEmbarque: string;
  cantidadReal: string;
}

export interface SolicitudNoABordoDto {
  idCoem: number;
  codigoMotivo: string;
  descripcionMotivo: string;
  declaraciones: string[];
}

export interface SolicitudNoABordo {
  id: number;
  identificadorSolicitud: string;
  motivo: string;
  declaraciones: string[];
  descripcionMotivo: string;
  estado: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}
