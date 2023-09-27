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
