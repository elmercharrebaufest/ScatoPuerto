import { Destino } from "@ScatoModels/destino";
import { MaterialPuerto } from "@ScatoModels/material-puerto";

export interface DocumentoTipo {
  id: number;
  nombre: string;
}

export interface Documento {
  id: number;
  documentoTipo: DocumentoTipo;
  nombre: string;
  liquido: boolean;
  solido: boolean;
}

export interface DocumentoDestino {
  id: number;
  documento: Documento;
  destino: Destino;
}

export interface DocumentoMaterialPuerto {
  id: number;
  documento: Documento;
  materialPuerto: MaterialPuerto;
}
