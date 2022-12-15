import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs/operators";
import { PlanoDeCargaService } from "@ScatoServicios/plano-de-carga.service";
import { Exportador } from "@ScatoModels/exportador";
import { GetObtenerExportador } from "./exportador.actions";

export class ExportadorStateModel {
    exportadores: Exportador[];
    selectedExportador: any;
}

@State<ExportadorStateModel>({
    name: 'exportadores',
    defaults: {
        exportadores: [],
        selectedExportador: null
    }
})

@Injectable()
export class ExportadorState {
    constructor(private planoDeCargaService: PlanoDeCargaService) {
    }
    @Selector()
    static GetListaExportadores(state: ExportadorStateModel) {
        return state.exportadores;
    }

    @Action(GetObtenerExportador)
    getObtenerExportador({ getState, setState }: StateContext<ExportadorStateModel>) {
        return this.planoDeCargaService.obtenerExportadores().pipe(tap((result) => {
            const state = getState();
            setState({
                ...state,
                exportadores: result,
            });
        }));
    }
}