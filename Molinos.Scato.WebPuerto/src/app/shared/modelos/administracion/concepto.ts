export class Concepto {
    id: number;
    descripcion: string;
    tipoConcepto: TipoConcepto;
    moneda: Moneda;
    tipoTarifa: TipoTarifa;
    presentaAjuste: boolean;
    porProducto: boolean;
    porEmbarque: boolean;
}

export class TipoConcepto {
    id: number;
    descripcion: string;
}

export class Moneda {
    id: number;
    descripcion: string;
}

export class TipoTarifa {
    id: number;
    descripcion: string;
}