import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { CalidadValor } from "@ScatoModels/programa-embarque/calidad-valor";
import { NominacionService } from "@ScatoServicios/programa-embarque/nominacion.service";
import { tap } from "rxjs/operators";
import { GetObtenerCalidadValor } from "./calidad-valor.actions";

export class CalidadValorStateModel {
    calidadValor: CalidadValor[];
    selectedCalidadValor: any;
}

@State<CalidadValorStateModel>({
    name: 'CalidadValor',
    defaults: {
        calidadValor: [],
        selectedCalidadValor: null
    }
})

@Injectable()
export class CalidadValorState{
    constructor(private nominacionService: NominacionService) {
    }
    @Selector()
    static getListaCalidadValor(state: CalidadValorStateModel) {
        return state.calidadValor;
    }

    @Action(GetObtenerCalidadValor)
    GetObtenerCalidadValor({ getState, setState }: StateContext<CalidadValorStateModel>) {
        return this.nominacionService.obtenerCalidadValor().pipe(tap((result) => {
            const state = getState();
            setState({
                ...state,
                calidadValor: result,
            });
        }));
    }
}