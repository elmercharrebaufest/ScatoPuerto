import { MaterialPuerto } from "@ScatoModels/material-puerto";
import { TipoDeCalidad } from "./tipo-de-calidad";
import { CalidadValor } from "./calidad-valor";

export class RegistroMaterialPuerto {
    materialPuerto: MaterialPuerto;
    tiposDeCalidad: RegistroTipoCalidad[];
}

export class RegistroTipoCalidad {
    tipoDeCalidad: TipoDeCalidad;
    calidadValores: CalidadValor[];
} 