export class GetObtenerHistorialBuques {
    static readonly type = '[Todo] Get Listar Buques';
    constructor(public vaporId: number, 
        public nombreBuque: string, public destino: string, 
        public exportador: string, public controlPrivado: string,
        public desde: Date, public hasta: Date, 
        public producto: string, public pagina: number, 
        public itemsPorPagina: number) {}
}
export class GetObtenerHistorialBuquesSel {
    static readonly type = '[Todo] Get Listar Buques Sel';
    constructor() {}
}
export class LoadingHistorialBuques {
    static readonly type = '[Todo] Loading';
    constructor() {}
}
