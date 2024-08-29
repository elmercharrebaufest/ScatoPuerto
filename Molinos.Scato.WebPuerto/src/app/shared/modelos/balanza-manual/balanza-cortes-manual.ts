export class BalanzasCortesManual {
    id: number;
    numeroBalanza: number;
    moduloDeCarga_id: number;
    motivosFallasBalanza_id: number | null;
    observaciones: string;
    fecha_Inicio: string | null;
    fecha_Corte: string | null;
    bodega_id: number | null;
    material_id: number | null;
    kg: number | null;
    tn: number | null;
    cerrado: boolean;
    corteManual: boolean;
    exportador_Id: number | null;
    destino_Id: number | null;
    usuario: string;
}
