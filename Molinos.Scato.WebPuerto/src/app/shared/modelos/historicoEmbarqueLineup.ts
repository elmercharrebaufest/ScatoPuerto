export interface HistoricoEmbarqueLineUp {
  id?: number;
  vaporNombre: string;
  actualizado?: string;
  ubicacion?: string;
  cartaSubidaEnviada: boolean;
  cartaSubidaAprobada?: string;
  cargaEnSap: boolean;
  nominacionDePractico: boolean;
  seguridadPortuaria: boolean;
  inspeccionSenasa: boolean;
  controlSenasa: boolean;
  controlPrivado: boolean;
  amarrador: boolean;
  agenciaContactada: boolean;
  fechaRecalada?: string;
  puertoActual?: string;
  observaciones?: string;
  materiales?: string;
  planoDeCargaEnviado: boolean;
  obligacionCarga?: string;
  agenteNombre?: string;
  ataNombre?: string;
  otroMuelleNombre?: string;
  lineUpId: number;
  embarqueId: number;
}
