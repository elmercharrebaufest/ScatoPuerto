import { CoordinadorPuerto } from "../coordinador-puerto";
import { NominacionDatoTecnico } from "./nominacion-dato-tecnico";

export class NominacionDatoTecnicoCoordinador {
    id: number;
    coordinadorPuerto: CoordinadorPuerto;
    cantidad: number;
    cantidadConTolerancia: number;
    cantidadExacta: number;
    tolerancia: number;
    nominacionDatoTecnico: NominacionDatoTecnico;

    constructor(id: number,
        coordinadorPuerto: CoordinadorPuerto,
        cantidad: number,
        cantidadConTolerancia: number,
        cantidadExacta: number,
        nominacionDatoTecnico: NominacionDatoTecnico) {
        this.id = id;
        this.coordinadorPuerto = coordinadorPuerto;
        this.cantidad = cantidad;
        this.cantidadConTolerancia = cantidadConTolerancia;
        this.cantidadExacta = cantidadExacta;
        this.nominacionDatoTecnico = nominacionDatoTecnico;
    }
}
