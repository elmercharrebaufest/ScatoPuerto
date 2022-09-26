import { TipoDeBuquePuerto } from "@ScatoModels/tipo-de-buque-puerto";
import { Vapor } from "@ScatoModels/vapor";
import { Pais } from "./Pais";


export class VaporInformacion {
    vapor_id: number;
    paisPuerto_id: number;
    nombrebuque: string;
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
}
