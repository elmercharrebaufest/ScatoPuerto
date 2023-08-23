import { Nominacion } from "./nominacion";

export class NominacionParametros {

    nominacion_Id: number;
    actualizarDatoTecnico: boolean = false;
    actualizarRecibos: boolean = false;
    actualizarIntervenciones: boolean = false;
    nominacion: Nominacion;
    constructor(nominacion_Id: number,
        actualizarDatoTecnico: boolean = false,
        actualizarRecibos: boolean = false,
        actualizarIntervenciones: boolean = false,
        nominacion: Nominacion) {
        this.nominacion = nominacion;
        this.nominacion_Id = nominacion_Id;
        this.actualizarDatoTecnico = actualizarDatoTecnico;
        this.actualizarRecibos = actualizarRecibos;
        this.actualizarIntervenciones = actualizarIntervenciones;        
    }

}
