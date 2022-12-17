
export class NominacionParametros {

    nominacion_Id: number;
    actualizarDatoTecnico: boolean = false;
    actualizarRecibos: boolean = false;
    actualizarIntervenciones: boolean = false;

    constructor(nominacion_Id: number,
        actualizarDatoTecnico: boolean = false,
        actualizarRecibos: boolean = false,
        actualizarIntervenciones: boolean = false) {

        this.nominacion_Id = nominacion_Id;
        this.actualizarDatoTecnico = actualizarDatoTecnico;
        this.actualizarRecibos = actualizarRecibos;
        this.actualizarIntervenciones = actualizarIntervenciones;
        
    }

}
