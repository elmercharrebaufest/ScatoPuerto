import { VaporInformacion } from "@ScatoModels/Buques/VaporInformacion";
import { MaterialPuerto } from "@ScatoModels/material-puerto";
import { MuelleDeCarga } from "./muelle-de-carga";

export class NominacionValida {
    id : number;
    materialPuerto: MaterialPuerto;
    vaporInformacion: VaporInformacion;
    muelleDeCarga: MuelleDeCarga;
}