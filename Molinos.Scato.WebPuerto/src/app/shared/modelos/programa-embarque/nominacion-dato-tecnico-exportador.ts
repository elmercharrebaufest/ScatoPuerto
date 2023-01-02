import { Exportador } from "../exportador";
import { NominacionDatoTecnico } from "./nominacion-dato-tecnico";

export class NominacionDatoTecnicoExportador {
    nominacionDatoTecnicoExportador_Id: number;
    exportador: Exportador;
    cantidad: number;
    tolerancia: number;
    nominacionDatoTecnico: NominacionDatoTecnico;

    constructor(nominacionDatoTecnicoExportador_Id: number,
        exportador: Exportador,
        cantidad: number,
        tolerancia: number,
        nominacionDatoTecnico: NominacionDatoTecnico) {
        this.nominacionDatoTecnicoExportador_Id = nominacionDatoTecnicoExportador_Id;
        this.exportador = exportador;
        this.cantidad = cantidad;
        this.tolerancia = tolerancia;
        this.nominacionDatoTecnico = nominacionDatoTecnico;
    }

}