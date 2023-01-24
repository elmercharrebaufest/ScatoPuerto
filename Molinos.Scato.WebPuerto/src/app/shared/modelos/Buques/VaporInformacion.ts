import { Bandera } from "@ScatoModels/bandera";
import { TipoDeBuquePuerto } from "@ScatoModels/tipo-de-buque-puerto";
import { Vapor } from "@ScatoModels/vapor";
import { Pais } from "./Pais";


export class VaporInformacion {
    id: number;
    vapor: Vapor;
    bandera: Bandera;
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
    banderaInformacion: string = null;
    itemsTotales: number = 0;
    pagina: number = 0;
    itemPorPagina: number = 0;
    vaporId: number = 0;
    usuario: string = null;
    fechaModificacion: Date = null; 
}
