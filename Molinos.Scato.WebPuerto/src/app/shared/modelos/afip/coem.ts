import { EstadoCOEM } from "./estadoCoem";
import { NuevasMercaderiasSueltasCoem } from "./nuevasMercaderiasSueltasCoem";

export class COEM {
  id?: number;
  identificadorCOEM?: string;
  identificadorCaratula: string;
  contenedoresConCarga?: Array<any> = [];
  contenedoresVacios?: Array<any> = [];
  mercaderiasSueltas: Array<NuevasMercaderiasSueltasCoem>;
  afipCoemEstado: EstadoCOEM;
}

export interface SolicitudCierreCargaDto {
  idCaratula: number;
  fechaZarpada: string;
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
