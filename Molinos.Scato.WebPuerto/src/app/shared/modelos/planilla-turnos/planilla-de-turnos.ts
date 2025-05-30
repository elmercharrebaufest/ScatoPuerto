import { CorteTurno } from "./corte-turno";
import { ObsCalidad } from "../obs-calidad";
import { Destino } from "@ScatoModels/destino";
import { Exportador } from "@ScatoModels/exportador";
import { MaterialPuerto } from "@ScatoModels/material-puerto";

export class PlanillaDeTurnos {
    fecha: any;
    fechaMiliseconds: any;
    id?: number;
    turnoPuerto: TurnoPuerto;
    cerrado: boolean;
    guardadoPorRecibidor: boolean;
    guardadoPorTablerista: boolean;
    enviado: boolean;
    moduloDeCargaPlanillaDeTurnosDetallesLiquido: TurnoDetalleLiquido[];
    moduloDeCargaPlanillaDeTurnosDetallesSolido: TurnoDetalleSolido[];
    moduloDeCargaPlanillaDeTurnosCortes: CorteTurno[];
    moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad: ObsCalidad[];
    moduloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad: TurnoDetalleSolidoGravedad[];
    indexDia: number;
    esLiquido: boolean;
    fechaCierreTurno?: any;
}

export class TurnoPuerto {
    id: number;
    nombre: any;
    orden: number
}

export class TurnoDetalleLiquido {
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
    horaInicio: string;
    horaFin: string;
}


export class TurnoDetalleSolido {
    id?: number;
    exportador: Exportador;
    bodega: { parcel: number, nombre: string, id?: number };
    materialPuerto: MaterialPuerto;
    destino: Destino;
    cantidad: number;
    idBalanzaCorte: number;
    balanzaPuerto?: BalanzaPuerto;
    siloCelda?: SiloCelda;
    fila?: number
}

export class BalanzaPuerto {
    codigoBalanza: string;
}

export class SiloCelda {
    id: number;
    nombre: string;
    color: string;
    orden: number;
}

export class TurnoDetalleSolidoGravedad {
    id: number;
    materialPuerto: MaterialPuerto;
    totalTurnoMaterial: number;
    kgGravedad: number;
}
