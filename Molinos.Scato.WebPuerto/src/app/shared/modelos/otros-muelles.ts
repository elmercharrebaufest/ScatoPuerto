import { Destino } from "./destino";
import { Exportador } from "./exportador";
import { MaterialPuerto } from "./material-puerto";

export interface Muelle {
    id: number;
    descripcion: string;
    sectorResponsableDeCargas: string;
    formaIngresoCarga: string;
    ingresoManual: boolean;
}

export interface OtroMuelleCargaDetalle {
    id: number;
    fechaHoraInicio: Date;
    fechaHoraFin: Date;
    exportador: Exportador;
    destino: Destino;
    materialPuerto: MaterialPuerto;
    tipoMaterial: string;
    cantidadTn: number;
}

export interface OtroMuelleCarga {
    id: number;
    observacion: string;
    fumigacionPreventiva: boolean;
    fumigacionCurativa: boolean;
    senasa: boolean;
    otroMuelleCargaDetalles: OtroMuelleCargaDetalle[];
}