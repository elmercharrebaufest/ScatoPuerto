import { Destino } from "../destino";
import { NominacionDatoTecnico } from "./nominacion-dato-tecnico";

export class NominacionDatoTecnicoDestino {
    nominacionDatoTecnicoDestino_Id: number;
    destino: Destino;
    cantidad: number;
    nominacionDatoTecnico: NominacionDatoTecnico;

    constructor(nominacionDatoTecnicoDestino_Id: number,
        destino: Destino,
        cantidad: number,
        nominacionDatoTecnico: NominacionDatoTecnico) {
        this.nominacionDatoTecnicoDestino_Id = nominacionDatoTecnicoDestino_Id;
        this.destino = destino;
        this.cantidad = cantidad;
        this.nominacionDatoTecnico = nominacionDatoTecnico;

    }
}