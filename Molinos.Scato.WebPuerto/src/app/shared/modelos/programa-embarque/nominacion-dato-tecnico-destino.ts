import { Destino } from "../destino";
import { NominacionDatoTecnico } from "./nominacion-dato-tecnico";

export class NominacionDatoTecnicoDestino {
    id: number;
    destino: Destino;
    cantidad: number;
    nominacionDatoTecnico: NominacionDatoTecnico;

    constructor(id: number,
        destino: Destino,
        cantidad: number,
        nominacionDatoTecnico: NominacionDatoTecnico) {
        this.id = id;
        this.destino = destino;
        this.cantidad = cantidad;
        this.nominacionDatoTecnico = nominacionDatoTecnico;

    }
}
