import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs/operators";
import { Destino } from "@ScatoModels/destino";
import { PlanoDeCargaService } from "@ScatoServicios/plano-de-carga.service";
import { GetObtenerDestino } from "./destino.actions";

export class DestinoStateModel {
    destinos: Destino[];
    selectedDestino: any;
}

@State<DestinoStateModel>({
    name: 'destinos',
    defaults: {
        destinos: [],
        selectedDestino: null
    }
})

@Injectable()
export class DestinoState{
    constructor(private planoDeCargaService: PlanoDeCargaService) {
    }
    @Selector()
    static GetObtenerDestino(state: DestinoStateModel) {
        return state.destinos;
    }

    @Action(GetObtenerDestino)
    GetObtenerDestino({ getState, setState }: StateContext<DestinoStateModel>) {
        return this.planoDeCargaService.obtenerDestinos().pipe(tap((result) => {
            const state = getState();
            setState({
                ...state,
                destinos: result,
            });
        }));
    }
}