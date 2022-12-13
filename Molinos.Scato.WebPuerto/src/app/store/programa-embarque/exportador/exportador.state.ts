import { Injectable } from "@angular/core";
import { State } from "@ngxs/store";
import { Exportador } from "@ScatoModels/exportador";

export class ExportadorStateModel {
    exportador: Exportador[];
    selectedExportador: any;
}

@State<ExportadorStateModel>({
    name: 'exportador',
    defaults: {
        exportador: [],
        selectedExportador: null
    }
})

@Injectable()
export class ExportadorState{
}