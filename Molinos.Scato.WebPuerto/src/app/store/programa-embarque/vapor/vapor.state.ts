import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs/operators";
import { Vapor } from "@ScatoModels/vapor";
import { BuqueService } from "@ScatoServicios/buque.service";
import { GetObtenerVapor } from "./vapor.actions";

export class VaporStateModel {
    vapores: Vapor[];
    selectedVapor: any;
}

@State<VaporStateModel>({
    name: 'vapores',
    defaults: {
        vapores: [],
        selectedVapor: null
    }
})

@Injectable()
export class VaporState {
    constructor(private buqueService: BuqueService) {
    }
    @Selector()
    static getListaVapores(state: VaporStateModel) {
        return state.vapores;
    }

    @Action(GetObtenerVapor)
    getObtenerVapor({ getState, setState }: StateContext<VaporStateModel>) {
        return this.buqueService.obtenerVapores().pipe(tap((result) => {
            const state = getState();
            setState({
                ...state,
                vapores: result,
            });
        }));
    }
}