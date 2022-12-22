import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { TasaDeCarga } from "@ScatoModels/programa-embarque/tasa-de-carga";
import { NominacionDatoTecnicoService } from "@ScatoServicios/programa-embarque/nominacion-dato-tecnico.service";
import { NominacionService } from "@ScatoServicios/programa-embarque/nominacion.service";
import { tap } from "rxjs/operators";
import { GetObtenerTasaDeCarga } from "./tasa-de-carga.actions";

export class TasaDeCargaStateModel {
    tasaDeCargas: TasaDeCarga[];
    selectedTasaDeCarga: any;
}

@State<TasaDeCargaStateModel>({
    name: 'tasaDeCargas',
    defaults: {
        tasaDeCargas: [],
        selectedTasaDeCarga: null
    }
})

@Injectable()
export class TasaDeCargaState {
    constructor(private nominacionService: NominacionDatoTecnicoService) {
    }
    @Selector()
    static getListaTasaDeCarga(state: TasaDeCargaStateModel) {
        return state.tasaDeCargas;
    }

    @Action(GetObtenerTasaDeCarga)
    getObtenerTasaDeCarga({ getState, setState }: StateContext<TasaDeCargaStateModel>) {
        return this.nominacionService.obtenerTasaDeCarga().pipe(tap((result) => {
            const state = getState();
            setState({
                ...state,
                tasaDeCargas: result,
            });
        }));
    }
}