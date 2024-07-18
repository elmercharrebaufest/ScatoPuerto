export interface RitmosBrutos {
  id: number;
  idTurnoPuerto: number;
  nombre: string;
  fecha: string;
  idBalanza: number;
  codigoBalanza: string;
  cantidad: number;
}

export interface ConsultarRitmosBrutosResponse {
  ritmosBrutos: RitmosBrutos[];
}
