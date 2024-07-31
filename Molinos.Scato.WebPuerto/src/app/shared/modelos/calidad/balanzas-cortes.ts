export interface BalanzaCorteFilledDto {
  id: number;
  idTurnoPuerto: number;
  nombreTurnoPuerto: string;
  fechaInicio: string;
  fechaCorte: string;
  idBalanza: number;
  numeroBalanza: string;
  corteManual: boolean;
  cantidad: number;
}

export interface ConsultarBalanzasCortesResponse {
  balanzasCortes: BalanzaCorteFilledDto[];
}
