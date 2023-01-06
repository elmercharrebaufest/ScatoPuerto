import { Exportador } from "@ScatoModels/exportador";

export class NominacionRecibo {
    id: number;
    numeroRecibo: number;
    exportador: Exportador;
    formato: boolean;
    cantidad: number;
    unidad: string;
    ajuste: string;
    puertoDeCarga: string;
    puertoDeDescarga: string;
    descripcionesBienes: string;
    recibosPorDia: boolean;
    mostrarDestinos: boolean;
    mostrarBodegas: boolean;
}