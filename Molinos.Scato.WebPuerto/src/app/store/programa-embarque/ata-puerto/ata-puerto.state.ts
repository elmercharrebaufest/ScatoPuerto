import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { EmbarqueService } from "@ScatoServicios/embarque.service";
import { tap } from "rxjs/operators";
import { ATAPuerto } from "@ScatoModels/ata-puerto";
import { GetObtenerATAPuerto } from "./ata-puerto.actions";

export class ATAPuertoStateModel {
    ataPuerto: ATAPuerto[];
    selectedATAPuerto: any;
}

@State<ATAPuertoStateModel>({
    name: 'ataPuerto',
    defaults: {
        ataPuerto: [],
        selectedATAPuerto: null
    }
})

@Injectable()
export class ATAPuertoState{
    constructor(private embarqueService: EmbarqueService) {
    }
    @Selector()
    static GetObtenerATAPuerto(state: ATAPuertoStateModel) {
        return state.ataPuerto;
    }

    @Action(GetObtenerATAPuerto)
    GetObtenerATAPuerto({ getState, setState }: StateContext<ATAPuertoStateModel>) {
        return this.embarqueService.obtenerListadoATAPuerto().pipe(tap((result) => {
            const state = getState();
            setState({
                ...state,
                ataPuerto: result,
            });
        }));
    }
}