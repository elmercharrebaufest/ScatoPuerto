import { TipoArchivoPuerto } from "./TipoArchivoPuerto";

export class ArchivoPuerto{
    id: number;
    tipoArchivoPuerto: TipoArchivoPuerto;
    usuario_Id: number;
    embarque_Id: number;
    nombreArchivo: string;
    archivo: string;
    fecha: Date;
}