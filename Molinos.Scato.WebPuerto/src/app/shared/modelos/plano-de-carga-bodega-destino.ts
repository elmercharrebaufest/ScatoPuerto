import { Destino } from "./destino";

export class PlanoDeCargaBodegaDestino {
  id: number;
  destino: Destino;
  cantidad: number;

  constructor(id = 0, destino: Destino, cantidad: number) {
    this.id = id;
    this.destino = destino;
    this.cantidad = cantidad;
  }
}
