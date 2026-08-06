export interface TotalBalanza {
  balanza: string;
  embarcando: boolean;
  material: string;
  embarcadoPorcentaje: number;
}

export interface PaginadoResponse<T> {
  items: T[];
  pagina: number;
  itemsPorPagina: number;
  itemsTotales: number;
}

export interface PesadaItem {
  id?: number;
  idCarga: number;
  numeroBalanza: string;
  totalEmbarcado: number;
  totalEmbarcadoKg?: number;
  commodity: string;
  bodega: string;
  destino: string;
  fecha: string;
  fechaCarga?: string;
  exportador: string;
  vapor: string;
  pesoProgramado: number;
  pesoProgramadoKg?: number;
  balanza?: string; // Alias
}

export interface DetalleCargaItem {
  fecha: string;
  pesoBruto: number;
  pesoTara: number;
  pesoNeto: number;
  capacidad: string;
}
