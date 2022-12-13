import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { MuelleDeCarga } from "@ScatoModels/programa-embarque/muelle-de-carga";
import { NominacionService } from "@ScatoServicios/programa-embarque/nominacion.service";
import { tap } from "rxjs/operators";
import { GetObtenerMuelleDeCarga } from "./muelle-de-carga.actions";

export class MuelleDeCargaStateModel {
    muellesDeCarga: MuelleDeCarga[];
    selectedMuelleDeCarga: any;
}

@State<MuelleDeCargaStateModel>({
    name: 'muellesDeCarga',
    defaults: {
        muellesDeCarga: [],
        selectedMuelleDeCarga: null
    }
})

@Injectable()
export class MuelleDeCargaState{
    constructor(private nominacionService: NominacionService) {
    }
    @Selector()
    static GetObtenerMuelleDeCarga(state: MuelleDeCargaStateModel) {
        return state.muellesDeCarga;
    }

    @Action(GetObtenerMuelleDeCarga)
    GetObtenerMuelleDeCarga({ getState, setState }: StateContext<MuelleDeCargaStateModel>) {
        return this.nominacionService.obtenerTipoDeContrato().pipe(tap((result) => {
            const state = getState();
            setState({
                ...state,
                muellesDeCarga: result,
            });
        }));
    }
}