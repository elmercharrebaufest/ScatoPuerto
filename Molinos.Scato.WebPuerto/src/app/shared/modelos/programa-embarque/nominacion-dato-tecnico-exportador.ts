import { Exportador } from "../exportador";
import { NominacionDatoTecnico } from "./nominacion-dato-tecnico";

export interface NominacionDatoTecnicoExportador {
  id: number;
  exportador: Exportador;
  cantidad: number;
  tolerancia: number;
  nominacionDatoTecnico: NominacionDatoTecnico;
  toleranciasDiferenciadas: boolean;
  toleranciaPositiva: number;
  toleranciaNegativa: number;
}
