import { PlanoDeCargaBodega } from "@ScatoModels/plano-de-carga-bodega";
import { EventEmitter, Injectable, Output } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class TurnosService {
    @Output() sendTurnos = new EventEmitter<any>();
    @Output() sendTnTotal = new EventEmitter<number>();
    @Output() sendExportadores = new EventEmitter<any>();
    @Output() sendBodega = new EventEmitter<PlanoDeCargaBodega[]>();
    private turnos: any;
    private mails: any;
    private tnTotales: number = 0;
    private formExportadores: any;
    private bodega: PlanoDeCargaBodega[];

    setTurnos(turno: any){
        this.turnos = turno;
        this.sendTurnos.emit(turno);
    }
    setTurnosMail(turno: any, mail:any){
        this.turnos = turno;
        this.mails = mail;
       // this.sendTurnos.emit(turno, mail);
    }

    getTurnos(){
        return this.turnos;
    }

    setTnTotales(tn: number){
        this.tnTotales = tn;
        this.sendTnTotal.emit(tn)
    }

    getTnTotales(){
        return this.tnTotales;
    }

    setExportadores(formExportadores: any){
        this.formExportadores = formExportadores;
        this.sendExportadores.emit(formExportadores);
    }

    getExportadores(){
        return this.formExportadores;
    }

    setBodega(bodega: PlanoDeCargaBodega[]) {
        this.bodega = bodega;
        this.sendBodega.emit(bodega);
    }

    getBodega(){
        return this.bodega;
    }
}
