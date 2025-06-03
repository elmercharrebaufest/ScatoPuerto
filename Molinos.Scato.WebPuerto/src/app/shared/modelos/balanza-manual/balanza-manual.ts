import { BodegaParcel } from "@ScatoModels/bodega-parcel";
import { Destino } from "@ScatoModels/destino";
import { Exportador } from "@ScatoModels/exportador";
import { MaterialPuerto } from "@ScatoModels/material-puerto";
import { TurnoPuerto } from "@ScatoModels/planilla-turnos/planilla-de-turnos";

export class BalanzaManual {
    id           : number;
    fechaInicio  : string;
    horaInicio   : string;
    fechaCorte   : string;
    horaCorte    : string;
    material     : MaterialPuerto;
    bodega       : BodegaParcel;
    destino      : Destino     ;
    exportador   : Exportador  ;
    motivosFallasBalanza: MotivosFallasBalanza ;
    turnoPuerto  : TurnoPuerto;
    kilogramos   : number;
    toneladas    : number;
    corteManual  : boolean;
    observaciones: string;
    correlativo  : number;
    numeroBalanza: string;
    recordatorio: boolean;
    cargaNormal  : boolean;
    cambioMaterial: boolean;
    public constructor(init?: Partial<BalanzaManual>) {
      Object.assign(this, init);
  }
}

export class MotivosFallasBalanza {
  nombre: string;
  id: number;
  siglas: string;
  bajaCargaLiquido: boolean;
  bajaCargaSolido: boolean;
  cortesLiquido: boolean;
  cortesSolido: boolean;
}


export class DestinosPorMaterialPuertoBodega {
  materiales     : MaterialPuerto;
  bodegas        : BodegaParcel  ;
  destinos       : Destino[]     ;
}

export class ExportadorPorMaterialPuerto {
  materiales     : MaterialPuerto;
  exportadores   : Exportador;
}

export class BalanzaManualCargas {
  fechaInicio: Date;
  fechaFin: Date;
}
