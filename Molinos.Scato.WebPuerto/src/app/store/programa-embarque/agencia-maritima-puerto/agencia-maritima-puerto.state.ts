import { Injectable } from "@angular/core";
import { State } from "@ngxs/store";
import { AgenciaMaritimaPuerto } from "@ScatoModels/agencia-maritima-puerto";

export class AgenciaMaritimaPuertoStateModel {
    agenciaMaritimaPuerto: AgenciaMaritimaPuerto[];
    selectedAgenciaMaritimaPuerto: any;
}

@State<AgenciaMaritimaPuertoStateModel>({
    name: 'agenciaMaritimaPuerto',
    defaults: {
        agenciaMaritimaPuerto: [],
        selectedAgenciaMaritimaPuerto: null
    }
})

@Injectable()
export class AgenciaMaritimaPuertoState{
}