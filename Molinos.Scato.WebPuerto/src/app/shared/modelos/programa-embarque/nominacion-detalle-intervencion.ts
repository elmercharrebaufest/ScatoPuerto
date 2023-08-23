import { Destino } from "@ScatoModels/destino";
import { Exportador } from "@ScatoModels/exportador";

export class NominacionDetalleIntervencion {
    id: number;
    precintado : boolean;
    precintadoACuentaDe : string;
    draftSurvey : boolean;
    surveyACuentaDe : string;
    permisoDeEmbarque : boolean;
    estibadorYTrimado : boolean;
    fumigacion : string;
    companiaDeFumigacion : CompaniaDeFumigacion;
    companiaACuentaDe : string;
    observaciones : string;
    tipoDeFumigacion : TipoDeFumigacion;
    senasa : Senasa[];
}

export class CompaniaDeFumigacion{
    id : number;
    descripcion : string;
    mail : string;
}

export class TipoDeFumigacion{
    id : number;
    descripcion : string;
}

export class Senasa{
    id : number
    nominacionDetalleIntervencion : NominacionDetalleIntervencion;
    exportador : Exportador;
    destino : Destino;
    tieneSenasa : boolean;
    consumo : string;
    aCuentaDe : string;
    ip : boolean;
    gmo : boolean;
    fito : boolean;
    muestraOficial : boolean;
    certificadoInocuidad : boolean;
    certificadoVeterinario : boolean;
    observaciones : string;
}