import { ConfiguracionDocumento } from "@ScatoModels/digitalizacion-documentos/documento";
import { NominacionDatoTecnico } from "./nominacion-dato-tecnico";
import { NominacionDetalleIntervencion } from "./nominacion-detalle-intervencion";
import { NominacionRecibo } from "./nominacion-recibo";

export class Nominacion {
    id : number;
    enviadoFumigador : boolean;
    enviadoSurveyor : boolean;
    enviadoOtros : boolean;
    enMuelleDeCarga : boolean;
    fechaCreacion : Date;
    fechaEnvioLineUp : Date;
    fechaEliminacion : Date;
    embarque_Id : number;
    nominacionDatoTecnico:NominacionDatoTecnico;
    nominacionDetalleIntervencion: NominacionDetalleIntervencion;
    nominacionRecibo: NominacionRecibo[];
    configuracionDocumentos: ConfiguracionDocumento[];;
    zarpo: boolean;
}
