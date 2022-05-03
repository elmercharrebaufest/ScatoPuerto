import { Destino } from "@ScatoModels/destino";
import { Exportador } from "@ScatoModels/exportador";
import { MaterialPuerto } from "@ScatoModels/material-puerto";

export class TurnoDetalleLiquido{
    id?: number;
    exportador: Exportador;
    linea: string;
    bodegaParcel: number;
    materialPuerto: MaterialPuerto;
    tk: string;
    temperatura: number;
    medidaInicialCM: number;
    medidaInicialMM: number;
    medidaFinalCM: number;
    medidaFinalMM: number;
    destino: Destino;
    cantidad: number;
}


export class TurnoDetalleSolido{
    id?: number;
    exportador: Exportador;
    linea: string;
    bodegaParcel: number;
    materialPuerto: MaterialPuerto;
    destino: Destino;
    cantidad: number;
}