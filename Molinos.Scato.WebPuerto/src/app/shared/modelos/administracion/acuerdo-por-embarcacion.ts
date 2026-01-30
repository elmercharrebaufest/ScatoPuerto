export interface EmbarqueAsociado {
  idAcuerdoEmbarque: number;
  nombreEmbarque: string;
  idEmbarque: number;
}

export interface AcuerdoPorEmbarcacion {
  idAcuerdo: number;
  descripcion: string;
  productos: string[];
  cantidadTotal: number;
  muelle: string;
  exportador: string; 
  
  relacionAcuerdo: string; // "Si", "No", "Parcial"
  cantidadDisponible: number;
  cantidadAsociada: number;
  
  embarquesAsociados: EmbarqueAsociado[];
  idAcuerdoEmbarqueActual?: number; 
}