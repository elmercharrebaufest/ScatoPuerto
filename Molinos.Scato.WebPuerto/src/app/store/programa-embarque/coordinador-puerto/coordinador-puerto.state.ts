import { Injectable } from "@angular/core";
import { State } from "@ngxs/store";
import { Bandera } from "@ScatoModels/bandera";
import { CoordinadorPuerto } from "@ScatoModels/coordinador-puerto";

export class CoordinadorPuertoStateModel {
    coordinadorPuerto: CoordinadorPuerto[];
    selectedCoordinadorPuerto: any;
}

@State<CoordinadorPuertoStateModel>({
    name: 'coordinadorPuerto',
    defaults: {
        coordinadorPuerto: [],
        selectedCoordinadorPuerto: null
    }
})

@Injectable()
export class CoordinadorPuertoState{
}