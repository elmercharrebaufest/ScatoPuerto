import { Caratula } from "./caratula";
import { EstadoCOEM } from "./estadoCoem";

export class COEM{
    idCoem:number;
    caratulaCoem:Caratula;
    mercaderiasSueltasCoem:string;
    estadosCoem:EstadoCOEM;
    numeroPaginado:boolean;
}