import { Destino } from "./destino";
import { Exportador } from "./exportador";
import { MaterialPuerto } from "./material-puerto";

export class PlanillaDeEmbarque {
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
    destinoTexto?: string; // TODO: Cargar este campo en el back para la exportación de excel. Usar este campo SOLO si el destino es null así es compatible con los embarques anteriores
}
