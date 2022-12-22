import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { TipoDeContrato } from "@ScatoModels/programa-embarque/tipo-de-contrato";
import { NominacionDatoTecnicoService } from "@ScatoServicios/programa-embarque/nominacion-dato-tecnico.service";
import { NominacionService } from "@ScatoServicios/programa-embarque/nominacion.service";
import { tap } from "rxjs/operators";
import { GetObtenerTipoDeContrato } from "./tipo-de-contrato.actions";

export class TipoDeContratoStateModel {
    tipoDeContratos: TipoDeContrato[];
    selectedTipoDeContrato: any;
}

@State<TipoDeContratoStateModel>({
    name: 'tipoDeContrato',
    defaults: {
        tipoDeContratos: [],
        selectedTipoDeContrato: null
    }
})

@Injectable()
export class TipoDeContratoState{
    constructor(private nominacionService: NominacionDatoTecnicoService) {
    }
    @Selector()
    static getListaTipoDeContrato(state: TipoDeContratoStateModel) {
        return state.tipoDeContratos;
    }

    @Action(GetObtenerTipoDeContrato)
    GetObtenerTipoDeContrato({ getState, setState }: StateContext<TipoDeContratoStateModel>) {
        return this.nominacionService.obtenerTipoDeContrato().pipe(tap((result) => {
            const state = getState();
            setState({
                ...state,
                tipoDeContratos: result,
            });
        }));
    }
}