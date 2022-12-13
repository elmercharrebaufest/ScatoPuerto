import { Injectable } from "@angular/core";
import { State } from "@ngxs/store";
import { ATAPuerto } from "@ScatoModels/ata-puerto";

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
}