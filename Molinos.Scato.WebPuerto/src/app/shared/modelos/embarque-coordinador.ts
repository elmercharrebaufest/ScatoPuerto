import { CoordinadorPuerto } from "./coordinador-puerto";

export class EmbarqueCoordinador{
    id: number;
    coordinadorPuerto: CoordinadorPuerto;

    constructor(id: number = 0, coordinadorPuerto){
        this.id = id;
        this.coordinadorPuerto = coordinadorPuerto;
    }
}