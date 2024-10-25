import { CoordinadorPuerto } from "@ScatoModels/coordinador-puerto";
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

export interface NominacionDocumentoArchivo {
  id: number;
  usuario: string;
  ubicacion: string;
  fechaSubida: string;
  nombre: string;
}

export interface NominacionDocumentoComentario {
  id: number;
  usuario: string;
  comentario: string;
  fecha: string;
}

export interface NominacionDocumentoEstado {
  id: number;
  estado: string;
}

export interface NominacionDocumento {
  id: number;
  documento: Documento;
  nominacionDocumentoEstado?: NominacionDocumentoEstado;
  archivos?: NominacionDocumentoArchivo[];
  comentarios?: NominacionDocumentoComentario[];
}

export interface ConfiguracionDocumento {
  id: number;
  coordinadorPuerto: CoordinadorPuerto;
  destino: Destino;
  cantidadDeJuegos: number;
  nominacionDocumentos: NominacionDocumento[];
}
