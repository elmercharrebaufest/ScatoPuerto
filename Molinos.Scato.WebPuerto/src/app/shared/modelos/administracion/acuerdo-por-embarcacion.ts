export interface EmbarqueAsociado {
  idAcuerdoEmbarque: number;
  nombreEmbarque: string;
  idEmbarque: number;
  producto: string;
  cantidad: number;
}

export interface AcuerdoDetalleResumen {
    producto: string;
    cantidadTotal: number;
    cantidadDisponible: number;
    cargaEmbarqueMaterial: number;
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
  detallesResumen: AcuerdoDetalleResumen[];
}