import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable, Output } from "@angular/core";
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { ObsCalidad } from "@ScatoModels/obs-calidad";
import { environment } from "environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ProcesoCalidadService {
    url: string = environment.apiUrl;
    private sanBenito: InstanciaWorkflowPuerto;
    private noryoun: InstanciaWorkflowPuerto;
    private vicentin: InstanciaWorkflowPuerto;
    private otrosMuelles: InstanciaWorkflowPuerto;

    
    @Output() sendObsCalidad = new EventEmitter<ObsCalidad>();
    @Output() sendBuqueCambiaEstado = new EventEmitter<any>();

    constructor(
        private http: HttpClient,
      ) {
    
      }
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
    
    guardarObservacionesDeCalidad(idPlanillaDeTurnos: number, Observaciones: ObsCalidad[]){
        return this.http.post(`${this.url}ModuloDeCarga/GuardarObservacionesDeCalidad?idPlanillaDeTurnos=${idPlanillaDeTurnos}`, Observaciones, { 'withCredentials': true});  
      }
    setBuqueCambiaEstado(buqueCambiaEstado: any){
        this.sendBuqueCambiaEstado.emit(buqueCambiaEstado);
    }
    
}