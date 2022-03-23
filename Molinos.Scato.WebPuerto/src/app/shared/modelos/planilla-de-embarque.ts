import { Destino } from "./destino";
import { Exportador } from "./exportador";
import { MaterialPuerto } from "./material-puerto";


export class PlanillaDeEmbarque{
    id: number;
    bodegaParcel: number;
    cantidad: number;
    destino: Destino;
    exportador: Exportador;
    fechaComienzoCarga: Date;
    horaComienzoCarga: Date;
    fechaFinalizacionCarga: Date;
    horaFinalizacionCarga: Date;
    materialPuerto: MaterialPuerto;
    tanqueDeAbordo: string;
    tk: string;
    tn: number;
}