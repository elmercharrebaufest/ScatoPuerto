import { MaterialPuerto } from "@ScatoModels/material-puerto";
import { Concepto } from "./concepto";
import { Exportador } from "@ScatoModels/exportador";
import { Embarque } from "@ScatoModels/embarque";
import { TipoContratoTarifa } from "./tipo-contrato-tarifa";

export class TarifaPorEmbarque {
    id: number;
    embarque: Embarque;
    materialPuerto: MaterialPuerto;
    exportador: Exportador;
    periodo: Date;
    tarifaPorEmbarqueConcepto: TarifaPorEmbarqueConcepto[];
    tipoContratoTarifa: TipoContratoTarifa;
    cerrado: boolean;
}

export class TarifaPorEmbarqueConcepto {
    id: number;
    tarifaPorEmbarque: TarifaPorEmbarque;
    concepto: Concepto;
    valor: number;
    seleccionado: boolean;
}
