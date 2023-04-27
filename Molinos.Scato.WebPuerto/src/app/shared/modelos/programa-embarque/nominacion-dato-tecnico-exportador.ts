import { Exportador } from "../exportador";
import { NominacionDatoTecnico } from "./nominacion-dato-tecnico";

export class NominacionDatoTecnicoExportador {
    id: number;
    exportador: Exportador;
    cantidad: number;
    tolerancia: number;
    nominacionDatoTecnico: NominacionDatoTecnico;

    constructor(id: number,
        exportador: Exportador,
        cantidad: number,
        tolerancia: number,
        nominacionDatoTecnico: NominacionDatoTecnico) {
        this.id = id;
        this.exportador = exportador;
        this.cantidad = cantidad;
        this.tolerancia = tolerancia;
        this.nominacionDatoTecnico = nominacionDatoTecnico;
    }

}
