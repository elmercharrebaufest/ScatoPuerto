import { Injectable } from "@angular/core";
import { State } from "@ngxs/store";
import { Vapor } from "@ScatoModels/vapor";

export class VaporStateModel {
    vapor: Vapor[];
    selectedVapor: any;
}

@State<VaporStateModel>({
    name: 'vapor',
    defaults: {
        vapor: [],
        selectedVapor: null
    }
})

@Injectable()
export class VaporState{
}