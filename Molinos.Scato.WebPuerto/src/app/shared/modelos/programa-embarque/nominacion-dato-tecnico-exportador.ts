import { Exportador } from "../exportador";

export class NominacionDatoTecnicoExportador {
    nominacionDatoTecnicoExportador_Id: number;
    exportador: Exportador;
    cantidad: number;
    tolerancia: number;
    nominacionDatoTecnico_Id: number;

    constructor(nominacionDatoTecnicoExportador_Id: number,
        exportador: Exportador,
        cantidad: number,
        tolerancia: number,
        nominacionDatoTecnico_Id: number) {
        this.nominacionDatoTecnicoExportador_Id = nominacionDatoTecnicoExportador_Id;
        this.exportador = exportador;
        this.cantidad = cantidad;
        this.tolerancia = tolerancia;
        this.nominacionDatoTecnico_Id = nominacionDatoTecnico_Id;

    }

}