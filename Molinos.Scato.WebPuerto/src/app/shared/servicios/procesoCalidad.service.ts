import { EventEmitter, Injectable, Output } from "@angular/core";
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { ObsCalidad } from "@ScatoModels/obs-calidad";

@Injectable({
    providedIn: 'root'
})
export class ProcesoCalidadService {
    private sanBenito: InstanciaWorkflowPuerto;
    private noryoun: InstanciaWorkflowPuerto;
    private vicentin: InstanciaWorkflowPuerto;
    private otrosMuelles: InstanciaWorkflowPuerto;

    @Output() sendObsCalidad = new EventEmitter<ObsCalidad>();
    @Output() sendBuqueCambiaEstado = new EventEmitter<any>();

    getSanBenito() {
        return this.sanBenito;
    }
    getNoryoun() {
        return this.noryoun;
    }
    getVicentin() {
        return this.vicentin;
    }
    getOtrosMuelles() {
        return this.otrosMuelles;
    }

    setSanBenito(embarque: InstanciaWorkflowPuerto) {
        this.sanBenito = embarque;
    }
    setNoryoun(embarque: InstanciaWorkflowPuerto) {
        this.noryoun = embarque;
    }
    setVicentin(embarque: InstanciaWorkflowPuerto) {
        this.vicentin = embarque;
    }
    setOtrosMuelles(embarque: InstanciaWorkflowPuerto) {
        this.otrosMuelles = embarque;
    }

    setObsCalidad(obsCalidad: ObsCalidad){
        this.sendObsCalidad.emit(obsCalidad);
    }
    
    setBuqueCambiaEstado(buqueCambiaEstado: any){
        this.sendBuqueCambiaEstado.emit(buqueCambiaEstado);
    }
    
}