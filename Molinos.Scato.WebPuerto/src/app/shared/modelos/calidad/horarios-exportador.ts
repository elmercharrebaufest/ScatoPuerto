import { Destino } from "@ScatoModels/destino";
import { Exportador } from "@ScatoModels/exportador";
import { MaterialPuerto } from "@ScatoModels/material-puerto";

export interface HorariosExportador {
    id: number;
    moduloDeCarga_Id: number;
    inicio?: Date;
    fin?: Date;
    materialPuerto: MaterialPuerto;
    exportador: Exportador;
    cantidad: number;
    tiempo: string;
  }