import { Destino } from "../destino";

export class NominacionDatoTecnicoDestino {
    nominacionDatoTecnicoDestino_Id: number;
    destino: Destino;
    cantidad: number;
    nominacionDatoTecnico_Id: number;

    constructor(nominacionDatoTecnicoDestino_Id: number,
        destino: Destino,
        cantidad: number,
        nominacionDatoTecnico_Id: number) {
        this.nominacionDatoTecnicoDestino_Id = nominacionDatoTecnicoDestino_Id;
        this.destino = destino;
        this.cantidad = cantidad;
        this.nominacionDatoTecnico_Id = nominacionDatoTecnico_Id;

    }
}