import { Caratula } from "./caratula";
import { EstadoCOEM } from "./estadoCoem";
import { NuevasMercaderiasSueltasCoem } from "./nuevasMercaderiasSueltasCoem";

export class COEM{
    id?:number;
    identificadorCaratula:string;
    contenedoresConCarga?:Array<any>=[];
    contenedoresVacios?:Array<any>=[];
    mercaderiasSueltas: Array<NuevasMercaderiasSueltasCoem>;
}