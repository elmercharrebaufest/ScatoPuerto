import { Injectable } from "@angular/core";
import { State } from "@ngxs/store";
import { TipoDeContrato } from "@ScatoModels/programa-embarque/tipo-de-contrato";

export class TipoDeContratoStateModel {
    tipoDeContrato: TipoDeContrato[];
    selectedTipoDeContrato: any;
}

@State<TipoDeContratoStateModel>({
    name: 'tipoDeContrato',
    defaults: {
        tipoDeContrato: [],
        selectedTipoDeContrato: null
    }
})

@Injectable()
export class TipoDeContratoState{
}