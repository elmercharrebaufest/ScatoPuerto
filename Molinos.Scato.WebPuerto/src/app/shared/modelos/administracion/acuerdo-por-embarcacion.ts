export interface AcuerdoPorEmbarcacion {
  idAcuerdo: number;
  descripcion: string;
  producto: string;
  cantidadTotal: number;
  muelle: string;
  exportadores: string;
  estadoAsociacion: 'VINCULADO_ACTUAL' | 'VINCULADO_OTRO' | 'NO_VINCULADO';
  cantidadDisponible: number;
  embarquesAsociados: string[];
  productoRelacionadoTotalmente: boolean;
}