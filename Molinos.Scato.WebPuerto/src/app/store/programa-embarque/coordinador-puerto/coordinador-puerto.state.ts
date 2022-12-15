import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs/operators";
import { EmbarqueService } from "@ScatoServicios/embarque.service";
import { CoordinadorPuerto } from "@ScatoModels/coordinador-puerto";
import { GetObtenerCoordinadorPuerto } from "./coordinador-puerto.actions";
export class CoordinadorPuertoStateModel {
    coordinadoresPuerto: CoordinadorPuerto[];
    selectedCoordinadorPuerto: any;
}

@State<CoordinadorPuertoStateModel>({
    name: 'coordinadoresPuerto',
    defaults: {
        coordinadoresPuerto: [],
        selectedCoordinadorPuerto: null
    }
})

@Injectable()
export class CoordinadorPuertoState {
    constructor(private embarqueService: EmbarqueService) {
    }
    @Selector()
    static GetListaCoordinadorPuerto(state: CoordinadorPuertoStateModel) {
        return state.coordinadoresPuerto;
    }

    @Action(GetObtenerCoordinadorPuerto)
    getObtenerCoordinadorPuerto({ getState, setState }: StateContext<CoordinadorPuertoStateModel>) {
        return this.embarqueService.obtenerListadoCoordinadores().pipe(tap((result) => {
            const state = getState();
            setState({
                ...state,
                coordinadoresPuerto: result,
            });
        }));
    }
}