import { MaterialPuerto } from "@ScatoModels/material-puerto";
import { Concepto } from "./concepto";

export class TarifaPorProducto {
    id: number;
    materialPuerto: MaterialPuerto;
    periodo: Date;
    cerrado: boolean;
    tarifaPorProductoConcepto: TarifaPorProductoConcepto[];
}

export class TarifaPorProductoConcepto {
    id: number;
    tarifaPorProducto: TarifaPorProducto;
    concepto: Concepto;
    valor: number;
    seleccionado: boolean;
}
