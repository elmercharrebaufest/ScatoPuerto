import { Exportador } from "@ScatoModels/exportador";
import { MaterialPuerto } from "@ScatoModels/material-puerto";
import { PlanoDeCargaBodegaDestino } from "@ScatoModels/plano-de-carga-bodega-destino";

export interface HorariosExportador {
    id: number;
    moduloDeCarga_Id: number;
    inicio?: Date;
    fin?: Date;
    materialPuerto: MaterialPuerto;
    exportador: Exportador;
    cantidad: number;
    tiempo: string;
    planoDeCargaBodegaDestino: PlanoDeCargaBodegaDestino;
    bodegaParcel: number;
  }