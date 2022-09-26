import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { BuqueService } from "@ScatoServicios/buque.service";
import { tap } from "rxjs/operators";
import { GetObtenerHistorialBuques, GetObtenerHistorialBuquesSel, LoadingHistorialBuques } from "./buques.actions";
export class BuquesStateModel {
    buques: any[];
    selectedBuque: null;
    buquesAll: any[];
}

@State<BuquesStateModel>({
    name: 'buques',
    defaults: {
        buques: [],
        selectedBuque: null,
        buquesAll: []
    }
})

@Injectable()
export class BuquesState {
    
    constructor(private buqueService: BuqueService) {
    }

    @Selector()
    static getHistorialBuques(state: BuquesStateModel) {
        return state.buques;
    }
    @Action(GetObtenerHistorialBuques)
    GetObtenerHistorialBuques(
        {getState, setState}: StateContext<BuquesStateModel>,
        {anio, mes, vaporId}: GetObtenerHistorialBuques
        ) {
        return this.buqueService.obtenerListarHistorialDeBuques(anio, mes, vaporId).pipe(tap((result) => {
            const state = getState();
            setState({
                ...state,
                buques: JSON.parse(JSON.stringify(result)),
                buquesAll: JSON.parse(JSON.stringify(result))
            });
        }));
    }
    @Action(GetObtenerHistorialBuquesSel)
    GetObtenerHistorialBuquesSel(
        {getState, setState}: StateContext<BuquesStateModel>
        ) {
            const state = getState()
            setState({
                ...state,
                buques: state.buquesAll
            
        });
    }
    @Action(LoadingHistorialBuques)
    LoadingHistorialBuques(
        {getState, setState}: StateContext<BuquesStateModel>
        ) {
            const state = getState()
            setState({
                ...state,
                buques: [],
                selectedBuque: null,
                buquesAll: []
        });
    }
    
    

}