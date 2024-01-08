import { Destino } from "./destino";
import { MaterialPuerto } from "./material-puerto";
import { PlanoDeCargaBodegaDestino } from "./plano-de-carga-bodega-destino";

export class PlanoDeCargaBodega {
      id : number;
      bodegaParcel: number;
      cantidad: number;
      materialPuerto: MaterialPuerto;
      condicion: string;
      sfFull: string;
      destino: Destino;
      tanqueDeAbordo: string;
      destinos: PlanoDeCargaBodegaDestino[];
      destinosPaises?: Destino[]
      public constructor(init?:Partial<PlanoDeCargaBodega>) {
            Object.assign(this, init);
      }
}
