import { MaterialPuerto } from "./material-puerto";
import { Bodega } from '@ScatoModels/balanzadas/balanza';

export class Nir{
    id: number;
    fecha: Date;
    hora: string;
    ritmo: string; // ritmoTnH
    hd: string; // porcentajeHD
    protBase: string;
    prot_BS: string; // protBS
    ph: string;
    origen: string;
    bodega: string;
    // bodega: Bodega[];
    mano: string;
    material_id: number;
    moduloDeCargaId: number;
    material?: MaterialPuerto;
}

export class Maiz{
    id: number;
    fecha: Date;
    hora: string;
    hd: string;
    ph: string;
    origen: string;
    bodega: string;
    mano: string;
    moduloDeCargaId: number;
}

export class Trigo{
    id: number;
    fecha: Date;
    hora: string;
    ritmo: string;
    hd: string;
    protBase: string;
    prot_BS: string;
    ph: string;
    origen: string;
    bodega: string;
    mano: string;
    moduloDeCargaId: number;
}