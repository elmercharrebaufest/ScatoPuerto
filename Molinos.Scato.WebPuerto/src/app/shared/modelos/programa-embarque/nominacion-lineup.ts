import { Exportador } from "@ScatoModels/exportador";
import { MaterialPuerto } from "@ScatoModels/material-puerto";
import { MuelleDeCarga } from "./muelle-de-carga";

export class NominacionLineUp {
    nominacion_Id: number;
    materialPuerto: MaterialPuerto;
    muelleDeCarga: MuelleDeCarga;
    nominacionCargadorPorCantidad: NominacionCargadorPorCantidad[];
    embarque_Id: number;
    enviadoLineUp: boolean;
    fechaEnvioLineUp: string | null;
    seleccionado: boolean=false;
}

export class NominacionCargadorPorCantidad {
    exportador: Exportador;
    cantidad: number;
}