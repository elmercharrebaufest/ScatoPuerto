import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Surveyor } from "@ScatoModels/programa-embarque/surveyor";
import { NominacionDatoTecnicoService } from "@ScatoServicios/programa-embarque/nominacion-dato-tecnico.service";
import { NominacionService } from "@ScatoServicios/programa-embarque/nominacion.service";
import { tap } from "rxjs/operators";
import { GetObtenerSurveyor } from "./surveyor.actions";

export class SurveyorStateModel {
    surveyors: Surveyor[];
    selectedSurveyor: any;
}

@State<SurveyorStateModel>({
    name: 'surveyors',
    defaults: {
        surveyors: [],
        selectedSurveyor: null
    }
})

@Injectable()
export class SurveyorState {
    constructor(private nominacionService: NominacionDatoTecnicoService) {
    }
    @Selector()
    static getListaSurveyor(state: SurveyorStateModel) {
        return state.surveyors;
    }

    @Action(GetObtenerSurveyor)
    GetObtenerSurveyor({ getState, setState }: StateContext<SurveyorStateModel>) {
        return this.nominacionService.obtenerSurveyor().pipe(tap((result) => {
            const state = getState();
            setState({
                ...state,
                surveyors: result,
            });
        }));
    }
}