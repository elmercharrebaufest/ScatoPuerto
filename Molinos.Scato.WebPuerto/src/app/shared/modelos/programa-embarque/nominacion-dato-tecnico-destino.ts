import { Destino } from "../destino";
import { NominacionDatoTecnico } from "./nominacion-dato-tecnico";

export class NominacionDatoTecnicoDestino {
    id: number;
    destino: Destino;
    cantidad: number;
    tolerancia: number;
    cantidadConTolerancia: number;
    cantidadExacta: number;
    cantidadTotalMaxima: number;
    nominacionDatoTecnico: NominacionDatoTecnico;

    constructor(id: number,
        destino: Destino,
        cantidad: number,
        tolerancia: number,
        cantidadConTolerancia: number,
        cantidadExacta: number,
        cantidadTotalMaxima: number,
        nominacionDatoTecnico: NominacionDatoTecnico) {
        this.id = id;
        this.destino = destino;
        this.cantidad = cantidad;
        this.tolerancia = tolerancia;
        this.cantidadConTolerancia = cantidadConTolerancia;
        this.cantidadExacta = cantidadExacta;
        this.cantidadTotalMaxima = cantidadTotalMaxima;
        this.nominacionDatoTecnico = nominacionDatoTecnico;
    }
}
