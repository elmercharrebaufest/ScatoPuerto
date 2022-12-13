import { CoordinadorPuerto } from "../coordinador-puerto";

export class NominacionDatoTecnicoCoordinador {
    nominacionDatoTecnicoCoordinador_Id: number;
    coordinadorPuerto: CoordinadorPuerto;
    cantidad: number;
    nominacionDatoTecnico_Id: number;

    constructor(nominacionDatoTecnicoCoordinador_Id: number,
        coordinadorPuerto: CoordinadorPuerto,
        cantidad: number,
        nominacionDatoTecnico_Id: number) {
        this.nominacionDatoTecnicoCoordinador_Id = nominacionDatoTecnicoCoordinador_Id;
        this.coordinadorPuerto = coordinadorPuerto;
        this.cantidad = cantidad;
        this.nominacionDatoTecnico_Id = nominacionDatoTecnico_Id;

    }
}