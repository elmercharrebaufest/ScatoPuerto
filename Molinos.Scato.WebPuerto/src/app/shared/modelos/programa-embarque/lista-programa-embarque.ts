export class ListaProgramaEmbarque{    
    items: Items[];
    itemsPorPagina: number;
    itemTotales: number;
    pagina: number
}

export class Items{
    productoColor: string;
    producto: string;
    fechaEliminacion: Date;
    fechaCreacion: Date;
    fechaEnvioLineUp: Date;
    nombreBuque: string;
    muelleDeCarga: string;
    cargadores: [];
    etaRecalada: Date;
    enviadoFumigador: boolean;
    enviadoOtros: boolean;
    enviadoSurveyor: boolean;
    contrato: string;
    estado: number;
    tieneConfiguracionDocumento: boolean;
 }