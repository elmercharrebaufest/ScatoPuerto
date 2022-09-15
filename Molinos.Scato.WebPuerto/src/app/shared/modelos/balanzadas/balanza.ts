import { MaterialPuerto } from "@ScatoModels/material-puerto";

export class InfoTableristas {
  balanzas: Balanzas[];
  informacionAdicional: InformacionAdicional;
  balanzadasEnCurso: BalanzadasCompletas;
}

export class Balanzas {
  bodega_id: number;
  cerrado: boolean;
  corteManual: boolean;
  fecha_Corte: Date;
  fecha_Inicio: Date;
  id: number;
  kg: number;
  material_id: number;
  moduloDeCarga_id: number;
  motivosFallasBalanza_id: number;
  motivosFallasBalanza_id_Nueva?: number;
  numeroBalanza: string;
  observaciones: string;
  observaciones_Nueva?: string;
  tn: number;
  
  fechaHora_Corte?: string;
  fechaHora_Inicio?: string;

  fecha_Corte_Inicial?: string;
  fecha_Inicio_Inicial?: string;
  hora_Corte_Inicial?: string;
  hora_Inicio_Inicial?: string;

  fecha_Corte_Nueva?: string;
  fecha_Inicio_Nueva?: string;
  hora_Corte_Nueva?: string;
  hora_Inicio_Nueva?: string;

  nuevo_Corte?: boolean;
  listadoTotalBalanzadas?: ListadoTotalBalanzadas;
}

export class InformacionAdicional {
  BCB_BCP_F: string;
  op: string;
  ob: string;
  e: string;
  m: string;
  h: string;
  ed: string;
  porcBC: string;
  ritmoBc: string;
}

export class ListadoTotalBalanzadas {
  motivosFallasBalanza: MotivosFallasBalanza;
  motivosFallasBalanza_Nueva?: MotivosFallasBalanza;
  bodegaCorteManual?: Bodega;
  materialCorteManual?: MaterialPuerto;
}

export class Bodega {
  id: number;
  nombre: string;
}

export class MotivosFallasBalanza {
  nombre: string;
  id: number;
  siglas: string;
  liquido: boolean;
  corte: boolean;
}

export class BalanzadasCompletas {
  balanzadasAgrupadas: BalanzadasAgrupadas[];
  balanzadasBajaCarga: any[];
  balanzadasBuque: BalanzadasBuque[];
}

export class BalanzadasBuque {
  bodega_Id: number;
  cargaInicial_Id: number;
  id: number;
  material_Id: number;
  numeroBalanza: string;
  pesoBruto: number;
  pesoNeto: number;
  pesoTara: number;
}

export class BalanzadasAgrupadas {
  nombreBuque: string
  numeroBalanza: string
  fechaInicio: Date;
  horaInicio: string
  toneladas: number
  kilos: number
  producto: string; 
  bodega: string; 
  porcentajeCarga: number; 
  totalProducto: number; 
  seleccionado: boolean;
}