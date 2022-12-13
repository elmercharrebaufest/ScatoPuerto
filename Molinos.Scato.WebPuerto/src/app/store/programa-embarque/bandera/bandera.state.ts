import { Injectable } from "@angular/core";
import { State } from "@ngxs/store";
import { Bandera } from "@ScatoModels/bandera";

export class BanderaStateModel {
    bandera: Bandera[];
    selectedBandera: any;
}

@State<BanderaStateModel>({
    name: 'bandera',
    defaults: {
        bandera: [],
        selectedBandera: null
    }
})

@Injectable()
export class BanderaState{
}