import { CalidadValor } from "./calidad-valor";
import { NominacionDatoTecnico } from "./nominacion-dato-tecnico";

export class NominacionDatoTecnicoCalidad {
    nominacionDatoTecnicoCalidad_Id: number;
    calidadValor: CalidadValor;
    nominacionDatoTecnico: NominacionDatoTecnico;
    constructor(nominacionDatoTecnicoCalidad_Id: number,
        calidadValor: CalidadValor,
        nominacionDatoTecnico: NominacionDatoTecnico) {
        this.nominacionDatoTecnicoCalidad_Id = nominacionDatoTecnicoCalidad_Id;
        this.calidadValor = calidadValor;
        this.nominacionDatoTecnico = nominacionDatoTecnico;
    }
}