import { TurnoPuertoDto } from "./turno-puerto-dto";

export interface TurnoDto {
  id: number;
  turno: TurnoPuertoDto;
}

export interface FechaDto {
  fecha: string;
  turnos: TurnoDto[];
}

export interface CombosFechasYTurnosResponse {
  fechaMinima: string;
  fechaMaxima: string;
  fechas: FechaDto[];
}