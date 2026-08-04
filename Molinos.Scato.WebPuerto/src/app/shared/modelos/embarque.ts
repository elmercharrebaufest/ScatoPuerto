import { AgenciaMaritimaPuerto } from './agencia-maritima-puerto';
import { ATAPuerto } from './ata-puerto';
import { CoordinadorPuerto } from './coordinador-puerto';
import { Destino } from './destino';
import { EmbarqueInformacion } from './embarque-Informacion';
import { EmbarqueCoordinador } from './embarque-coordinador';
import { MaterialPuertoCantidad } from './material-puerto-cantidad';
import { MotivosLimpieza } from './motivo-limpieza';
import { Muelle, OtroMuelleCarga } from './otros-muelles';
import { TipoDeBuquePuerto } from './tipo-de-buque-puerto';
import { UbicacionDeBuquePuerto } from './ubicacion-de-buque-puerto';


export class Embarque {
  id: number;
  nombreBuque: string;
  agencia: string;
  agencias: AgenciaMaritimaPuerto[];
  coordinadores: EmbarqueCoordinador[];
  fechaRecalada: Date;
  horaRecalada: string;
  obligacionCarga: Date;
  senasa: boolean;
  observaciones: string;
  vicentin: boolean;
  otrosMuelles: boolean;
  otroMuelleNombre : string;
  materialesPuertoCantidad: MaterialPuertoCantidad[]
  centroId: number;
  patente: string;
  tipoBuque: string;
  tipoDeBuque: TipoDeBuquePuerto;
  freeboard: number;
  noryon: boolean;
  sanBenito: boolean;
  ubicacion: number;
  ubicacionDeBuque: UbicacionDeBuquePuerto;
  ata: ATAPuerto[];
  esLiquido: boolean;
  fechaDesdeLimpieza: Date;
  horaDesdeLimpieza: string;
  fechaHastaLimpieza: Date;
  horaHastaLimpieza: string;
  motivosLimpieza:  MotivosLimpieza;
  motivosLimpiezas:  MotivosLimpieza[];
  observacionesLimpieza: string;
  destinoBuque: number;
  destino: Destino;
  porteNeto: number;
  porteBruto: number;
  eslora: number;
  manga: number;
  puntal: number;
  fechaLibrePlatica: Date;
  horaLibrePlatica: string;
  vapor: Vapor;
  estadoBuque: EstadoBuque;
  filePathShipParticular: string | ArrayBuffer;
  shipParticularArchivoNombre: string;
  fechaHoraInicioCarga: Date;
  usuarioInicioCarga: string;
  imo:string;
  cantidadBodegasTanques:number;
  filePathImgLineUp: string | ArrayBuffer;
  muelle?: Muelle;
  otroMuelleCarga?: OtroMuelleCarga;
  nroOpSap?: number;
}

export class Vapor{
  id: number;
  nombre: string;
  habilitado: boolean;
}
export class EstadoBuque{
  id: number;
  descripcion: string;
}
