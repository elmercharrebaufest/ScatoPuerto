import { MotivosFallasBalanza } from "@ScatoModels/balanzadas/balanza";

export class CorteTurno{
    id?: number;
    motivosDeCorte: MotivosFallasBalanza;
    horaInicio: string;
    horaFin: string;
    tiempoTotal: string;
    observaciones: string;
    idBalanzaCorte?: number;
    linea?: number;
    cantidad?: number;
}
