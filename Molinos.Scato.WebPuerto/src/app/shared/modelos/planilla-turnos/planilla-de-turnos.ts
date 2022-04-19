import { CorteTurno } from "./corte-turno";
import { TurnoDetalleLiquido, TurnoDetalleSolido } from "./turno";
import { ObsCalidad } from "../obs-calidad";

export class PlanillaDeTurnos{
    fecha: any;
    fechaMiliseconds: any;
    id?: number;
    turnoPuerto: TurnoPuerto;
    cerrado: boolean;
    enviado: boolean
    moduloDeCargaPlanillaDeTurnosDetallesLiquido: TurnoDetalleLiquido[];
    moduloDeCargaPlanillaDeTurnosDetallesSolido: TurnoDetalleSolido[];
    moduloDeCargaPlanillaDeTurnosCortes: CorteTurno[];
    moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad: ObsCalidad[];
    indexDia: number;
    esLiquido: boolean;
}

export class TurnoPuerto{
    id: number;
    nombre: string;
    orden: number
}