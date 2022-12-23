import { AgenciaMaritimaPuerto } from "@ScatoModels/agencia-maritima-puerto";
import { ATAPuerto } from "@ScatoModels/ata-puerto";
import { Bandera } from "@ScatoModels/bandera";
import { VaporInformacion } from "@ScatoModels/Buques/VaporInformacion";
import { CoordinadorPuerto } from "@ScatoModels/coordinador-puerto";
import { Destino } from "@ScatoModels/destino";
import { Exportador } from "@ScatoModels/exportador";
import { MaterialPuerto } from "@ScatoModels/material-puerto";
import { CalidadValor } from "./calidad-valor";
import { MuelleDeCarga } from "./muelle-de-carga";
import { Surveyor } from "./surveyor";
import { TasaDeCarga } from "./tasa-de-carga";
import { TipoDeCalidad } from "./tipo-de-calidad";
import { TipoDeContrato } from "./tipo-de-contrato";

export class ProgramaEmbarqueNominacionDatoTecnico {
    materialPuerto        : MaterialPuerto[]       ;
    tipoDeCalidad         : TipoDeCalidad[]        ;
    destino               : Destino[]              ;
    exportador            : Exportador[]           ;
    coordinadorPuerto     : CoordinadorPuerto[]    ;
    vaporInformacion      : VaporInformacion[]     ;
    bandera               : Bandera[]              ;
    muelleDeCarga         : MuelleDeCarga[]        ;
    tasaDeCarga           : TasaDeCarga[]          ;
    tipoDeContrato        : TipoDeContrato[]       ;
    ataPuerto             : ATAPuerto[]            ;
    agenciaMaritimaPuerto : AgenciaMaritimaPuerto[];
    surveyor              : Surveyor[]             ;
    calidadValor          : CalidadValor[]         ;
}