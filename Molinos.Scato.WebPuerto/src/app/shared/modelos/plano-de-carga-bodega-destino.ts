import { Destino } from "./destino";

export class PlanoDeCargaBodegaDestino{
    id: number;
    destino: Destino;

    constructor(id =0, destino){
        this.id = id;
        this.destino = destino;
    }
}