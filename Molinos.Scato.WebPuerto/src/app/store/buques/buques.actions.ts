export class GetObtenerHistorialBuques {
    static readonly type = '[Todo] Get Listar Buques';
    constructor(public anio: number, public mes: number, public vaporId: number, 
        public desde: Date, public hasta: Date) {}
}
export class GetObtenerHistorialBuquesSel {
    static readonly type = '[Todo] Get Listar Buques Sel';
    constructor() {}
}
export class LoadingHistorialBuques {
    static readonly type = '[Todo] Loading';
    constructor() {}
}
