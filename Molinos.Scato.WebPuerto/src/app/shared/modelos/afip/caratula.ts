export class Caratula {
    id?:number;
    identificadorCaratula?: string;
    identificadorBuque: string;
    fechaArribo: string;
    fechaZarpada: string;
    puertoDestino: string;
    nombreMedioTransporte: string;
    fechaRegistro: string;
    estado: string;

    numeroPaginado:any=false;
    itinerario:string[]=[];

    codigoAduana?:string;
    codigoLugarOperativo?:string;
    via?:string;
}
