import { NominacionDatoTecnico } from "./nominacion-dato-tecnico";
import { NominacionDetalleIntervencion } from "./nominacion-detalle-intervencion";
import { NominacionRecibo } from "./nominacion-recibo";

export class Nominacion {
    id : number;
    enviadoFumigador : boolean;
    enviadoSurveyor : boolean;
    enviadoOtros : boolean;
    fechaCreacion : Date;
    fechaEnvioLineUp : Date;
    fechaEliminacion : Date;
    embarque_Id : number;
    nominacionDatoTecnico:NominacionDatoTecnico;
    nominacionDetalleIntervencion: NominacionDetalleIntervencion;
    nominacionRecibo: NominacionRecibo[]
}
