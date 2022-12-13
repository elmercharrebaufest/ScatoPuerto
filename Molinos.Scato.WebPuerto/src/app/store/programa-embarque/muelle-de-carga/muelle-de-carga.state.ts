import { Injectable } from "@angular/core";
import { State } from "@ngxs/store";
import { MuelleDeCarga } from "@ScatoModels/programa-embarque/muelle-de-carga";

export class MuelleDeCargaStateModel {
    muelleDeCarga: MuelleDeCarga[];
    selectedMuelleDeCarga: any;
}

@State<MuelleDeCargaStateModel>({
    name: 'muelleDeCarga',
    defaults: {
        muelleDeCarga: [],
        selectedMuelleDeCarga: null
    }
})

@Injectable()
export class MuelleDeCargaState{
}