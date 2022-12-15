import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { EmbarqueService } from "@ScatoServicios/embarque.service";
import { tap } from "rxjs/operators";
import { AgenciaMaritimaPuerto } from "@ScatoModels/agencia-maritima-puerto";
import { GetObtenerAgenciaMaritimaPuerto } from "./agencia-maritima-puerto.actions";

export class AgenciaMaritimaPuertoStateModel {
    agenciaMaritimaPuerto: AgenciaMaritimaPuerto[];
    selectedAgenciaMaritimaPuerto: any;
}

@State<AgenciaMaritimaPuertoStateModel>({
    name: 'agenciaMaritimaPuerto',
    defaults: {
        agenciaMaritimaPuerto: [],
        selectedAgenciaMaritimaPuerto: null
    }
})

@Injectable()
export class AgenciaMaritimaPuertoState{
    constructor(private embarqueService: EmbarqueService) {
    }
    @Selector()
    static GetListaAgenciaMaritimaPuerto(state: AgenciaMaritimaPuertoStateModel) {
        return state.agenciaMaritimaPuerto;
    }

    @Action(GetObtenerAgenciaMaritimaPuerto)
    getObtenerAgenciaMaritimaPuerto({ getState, setState }: StateContext<AgenciaMaritimaPuertoStateModel>) {
        return this.embarqueService.obtenerListadoAgenciasMaritimas().pipe(tap((result) => {
            const state = getState();
            setState({
                ...state,
                agenciaMaritimaPuerto: result,
            });
        }));
    }
}