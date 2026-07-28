export class Buque {  
    id: number;
    vaporId: number;
    nombreBuque: string;
    tipoBuque: string;
    categoriaBuque: string;
    imoVapor: string;
    freeboard: number;
    eslora: number;
    porteNeto: number;
    porteBruto: number;
    manga: number;
    puntual: number;
    cantidadBodegasTks: number;
    itemsTotales: number = null;
    itemPorPagina: number = null;
    pagina: number = null;
    enSap?: boolean;
    mensajeSap?: string;
    enProceso?: boolean;
}
