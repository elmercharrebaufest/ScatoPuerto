import { Injectable } from "@angular/core";
import { State } from "@ngxs/store";
import { Destino } from "@ScatoModels/destino";

export class DestinoStateModel {
    destino: Destino[];
    selectedDestino: any;
}

@State<DestinoStateModel>({
    name: 'destino',
    defaults: {
        destino: [],
        selectedDestino: null
    }
})

@Injectable()
export class DestinoState{
}