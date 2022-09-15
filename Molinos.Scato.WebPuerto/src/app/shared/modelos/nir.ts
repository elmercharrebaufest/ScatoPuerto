import { MaterialPuerto } from "./material-puerto";
import { Bodega } from '@ScatoModels/balanzadas/balanza';

export class Nir{
    mano1: Mano;
    mano2: Mano;
    tipoNir: TipoNir;
}

export class Mano {
    tipo: string
    nirManualPuerto: NirManualPuerto[];
}

export class NirManualPuerto{
    id: number;
    fecha: Date;
    hd: string;
    ph: string;
    protBase: string;
    prot_BS: string;
    origen: string;
    bodega: string;
    material_id: number;
    moduloDeCargaId: number;
    mano: string;
    material?: MaterialPuerto;
}

export enum TipoNir
{
  NoNir = 0,
  CombinacionTrigoMaiz,
  CombinacionMaizTrigo,
  SoloTrigo,
  SoloMaiz,
  SoloTrigoMano1,
  SoloMaizMano1,
  SoloTrigoMano2,
  SoloMaizMano2
}



