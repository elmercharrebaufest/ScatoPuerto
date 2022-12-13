import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Bandera } from "@ScatoModels/bandera";
import { EmbarqueService } from "@ScatoServicios/embarque.service";
import { tap } from "rxjs/operators";
import { GetObtenerBandera } from "./bandera.actions";

export class BanderaStateModel {
    banderas: Bandera[];
    selectedBandera: any;
}

@State<BanderaStateModel>({
    name: 'banderas',
    defaults: {
        banderas: [],
        selectedBandera: null
    }
})

@Injectable()
export class BanderaState{
    constructor(private embarqueService: EmbarqueService) {
    }
    @Selector()
    static GetObtenerBandera(state: BanderaStateModel) {
        return state.banderas;
    }

    @Action(GetObtenerBandera)
    GetObtenerBandera({getState, setState}: StateContext<BanderaStateModel>) {
        return this.embarqueService.obtenerBanderas().pipe(tap((result) => {
            const state = getState();
            setState({
                ...state,
                banderas: result,
            });
        }));
    }
}