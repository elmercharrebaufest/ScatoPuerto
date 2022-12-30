import { Exportador } from "@ScatoModels/exportador";

export class NominacionExportadores {
    actualizar: boolean = false;
    listaExportadores: Exportador[] = [];
    constructor(actualizar: boolean = false,
                listaExportadores: Exportador[] = []){
        this.actualizar = actualizar;
        this.listaExportadores = listaExportadores;
    }
}
