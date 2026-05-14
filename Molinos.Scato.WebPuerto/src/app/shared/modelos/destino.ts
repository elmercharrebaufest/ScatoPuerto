import { Bandera } from "./bandera";

export class Destino {
    id: number;
    nombre: string;
    codigoSap?: string;
    nacionalidad?: string;
    activo?: boolean;
    bandera?: Bandera;
}
