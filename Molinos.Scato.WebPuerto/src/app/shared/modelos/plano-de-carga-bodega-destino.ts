import { Destino } from "./destino";
import { Exportador } from "./exportador";

export class PlanoDeCargaBodegaDestino {
  id: number;
  destino: Destino;
  cantidad: number;
  exportador?: Exportador;

  constructor(id = 0, destino: Destino, cantidad: number, exportador?: Exportador) {
    this.id = id;
    this.destino = destino;
    this.cantidad = cantidad;
    this.exportador = exportador;
  }
}
