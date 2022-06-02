export class RitmosBalanzas78 {
    idModuloDeCarga: number;
    ritmosBalanza7: RitmosBalanza;
    ritmosBalanza8: RitmosBalanza;
}

export class RitmosBalanza {
    arranco: Date;
    ultimaBalanzada: Date;
    cargoHastaAhora: number;
    ritmoDeEmbarque: number;
    ultimaActualizacion: Date;
}