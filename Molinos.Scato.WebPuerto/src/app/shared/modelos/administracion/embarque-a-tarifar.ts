import { Embarque, Vapor } from "@ScatoModels/embarque";
import { Exportador } from "@ScatoModels/exportador";
import { MaterialPuerto } from "@ScatoModels/material-puerto";

export class EmbarqueATarifar {
    public embarque: Embarque;
    public vapor: Vapor;
    public cargasSolido: CargaPorProductoExportador[];
    public cargasLiquido: CargaPorProductoExportador[];
    public esLiq: boolean;
}

export class CargaPorProductoExportador {
    public materialPuerto: MaterialPuerto;
    public exportador: Exportador;
    public cantidad: number;
}