import { CorteTurno } from "./corte-turno";
import { TurnoDetalleLiquido } from "./turno";
import { ObsCalidad } from "../obs-calidad";

export class PlanillaDeTurnos{
    fecha: any;
    fechaMiliseconds: any;
    id?: number;
    turnoPuerto: TurnoPuerto;
    cerrado: boolean;
    enviado: boolean
    moduloDeCargaPlanillaDeTurnosDetallesLiquido: TurnoDetalleLiquido[];
    moduloDeCargaPlanillaDeTurnosCortes: CorteTurno[];
    indexDia: number;
}

export class TurnoPuerto{
    id: number;
    nombre: string;
    orden: number
}