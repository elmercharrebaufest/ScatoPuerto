import { CoordinadorPuerto } from "../coordinador-puerto";
import { NominacionDatoTecnico } from "./nominacion-dato-tecnico";

export class NominacionDatoTecnicoCoordinador {
    nominacionDatoTecnicoCoordinador_Id: number;
    coordinadorPuerto: CoordinadorPuerto;
    cantidad: number;
    nominacionDatoTecnico: NominacionDatoTecnico;

    constructor(nominacionDatoTecnicoCoordinador_Id: number,
        coordinadorPuerto: CoordinadorPuerto,
        cantidad: number,
        nominacionDatoTecnico: NominacionDatoTecnico) {
        this.nominacionDatoTecnicoCoordinador_Id = nominacionDatoTecnicoCoordinador_Id;
        this.coordinadorPuerto = coordinadorPuerto;
        this.cantidad = cantidad;
        this.nominacionDatoTecnico = nominacionDatoTecnico;

    }
}