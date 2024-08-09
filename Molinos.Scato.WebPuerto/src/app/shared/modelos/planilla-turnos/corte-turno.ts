import { MotivosDeCorte } from "./motivo-de-corte";

export class CorteTurno{
    id?: number;
    motivosDeCorte: MotivosDeCorte;
    horaInicio: string;
    horaFin: string;
    tiempoTotal: string;
    observaciones: string;
    idBalanzaCorte?: number;
}
