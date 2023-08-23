import { Exportador } from "@ScatoModels/exportador";
import { Nominacion } from "./nominacion";

export class NominacionRecibo {
    id: number;
    numeroRecibo: number;
    exportador: Exportador;
    formato: string;
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