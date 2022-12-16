import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { TipoDeCalidad } from "@ScatoModels/programa-embarque/tipo-de-calidad";
import { NominacionService } from "@ScatoServicios/programa-embarque/nominacion.service";
import { tap } from "rxjs/operators";
import { GetObtenerTipoDeCalidad } from "./tipo-de-calidad.actions";

export class TipoDeCalidadStateModel {
    tipoDeCalidad: TipoDeCalidad[];
    selectedTipoDeCalidad: any;
}

@State<TipoDeCalidadStateModel>({
    name: 'TipoDeCalidad',
    defaults: {
        tipoDeCalidad: [],
        selectedTipoDeCalidad: null
    }
})

@Injectable()
export class TipoDeCalidadState{
    constructor(private nominacionService: NominacionService) {
    }
    @Selector()
    static getListaTipoDeCalidad(state: TipoDeCalidadStateModel) {
        return state.tipoDeCalidad;
    }

    @Action(GetObtenerTipoDeCalidad)
    GetObtenerTipoDeCalidad({ getState, setState }: StateContext<TipoDeCalidadStateModel>) {
        return this.nominacionService.obtenerTipoDeCalidad().pipe(tap((result) => {
            const state = getState();
            setState({
                ...state,
                tipoDeCalidad: result,
            });
        }));
    }
}