import { CoordinadorPuerto } from "../coordinador-puerto";
import { NominacionDatoTecnico } from "./nominacion-dato-tecnico";

export class NominacionDatoTecnicoCoordinador {
    id: number;
    coordinadorPuerto: CoordinadorPuerto;
    cantidad: number;
    cantidadConTolerancia: number;
    cantidadExacta: number;
    tolerancia: number;
    cantidadTotalMaxima: number;
    nominacionDatoTecnico: NominacionDatoTecnico;

    constructor(id: number,
        coordinadorPuerto: CoordinadorPuerto,
        cantidad: number,
        cantidadConTolerancia: number,
        cantidadExacta: number,
        cantidadTotalMaxima: number,
        nominacionDatoTecnico: NominacionDatoTecnico) {
        this.id = id;
        this.coordinadorPuerto = coordinadorPuerto;
        this.cantidad = cantidad;
        this.cantidadConTolerancia = cantidadConTolerancia;
        this.cantidadExacta = cantidadExacta;
        this.cantidadTotalMaxima = cantidadTotalMaxima;
        this.nominacionDatoTecnico = nominacionDatoTecnico;
    }
}
