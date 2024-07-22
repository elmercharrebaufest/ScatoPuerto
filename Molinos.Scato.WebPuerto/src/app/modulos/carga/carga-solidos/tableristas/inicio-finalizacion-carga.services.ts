import { Injectable } from "@angular/core";
import { BalanzasManualService } from "./balanzas-manual/balanzas-manual.service";
import { formatDate } from "@angular/common";

@Injectable({
    providedIn: 'root'
})
export class InicioFinalizacionCargaService {

    constructor(private balanzasManualService: BalanzasManualService) {
    }

    public obtenerFechaCorteBajaCarga(listaCortesBajaCarga, esFechaFinal: boolean): string {
        let fecha: string = '';
        if (listaCortesBajaCarga.length > 0) {
            listaCortesBajaCarga.forEach(element => {
                let fechaInicio = this.balanzasManualService.convertirFecha(element.fechaInicio, element.horaInicio);
                let fechaCorte = this.balanzasManualService.convertirFecha(element.fechaCorte, element.horaCorte);
                element.fechaInicioMiliseconds = fechaInicio.getTime();
                element.fechaCorteMiliseconds = fechaCorte.getTime();
            });
            if (esFechaFinal) {
                listaCortesBajaCarga.sort((a, b) => {
                    return (b.fechaInicioMiliseconds - a.fechaInicioMiliseconds);
                });
                let cortesBajaCarga = listaCortesBajaCarga[0];
                fecha = `${cortesBajaCarga.fechaCorte} ${cortesBajaCarga.horaCorte}`;
            }
            if (!esFechaFinal) {
                listaCortesBajaCarga.sort((a, b) => {
                    return (a.fechaCorteMiliseconds - b.fechaCorteMiliseconds);
                });
                let cortesBajaCarga = listaCortesBajaCarga[0];
                fecha = `${cortesBajaCarga.fechaInicio} ${cortesBajaCarga.horaInicio}`;
            }
        }
        return fecha;
    }
    public obtenerFechaPeriodoCarga(listaPeriodoCarga, esFechaFinal: boolean): string {
        let fecha: string = '';
        let periodoCarga = null;
        if (listaPeriodoCarga.length > 0) {
            periodoCarga = listaPeriodoCarga[0];
            let fechaSel = esFechaFinal ? periodoCarga.fechaFinalizacionCarga : periodoCarga.fechaComienzoCarga;
            let horaSel = esFechaFinal ? periodoCarga.horaFinalizacionCarga : periodoCarga.horaComienzoCarga;
            if (esFechaFinal) {
                if (fechaSel != null && fechaSel > '')
                    fecha = formatDate(fechaSel, 'yyyy-MM-dd', 'en-US') + ' ' + (horaSel ? horaSel : '00:00');
            } else {
                if (fechaSel != null && fechaSel > '')
                    fecha = formatDate(fechaSel, 'yyyy-MM-dd', 'en-US') + ' ' + (horaSel ? horaSel : '00:00');
            }
        }
        return fecha;
    }
    public obtenerFechaCargaNormal(listaCargaNormal, esFechaFinal: boolean): string {
        let fecha: string = '';
        if (listaCargaNormal.length > 0) {
            listaCargaNormal.forEach(element => {
                element.fechaFormateada = formatDate(element.fecha, 'yyyy-MM-dd', 'en-US');
            });
            let planillaDeTurnos = listaCargaNormal.sort((a, b) => {
                return (b.fechaMiliseconds - a.fechaMiliseconds);
            });
            let fechaInicio = planillaDeTurnos[0].fechaFormateada;
            let fechaFin = planillaDeTurnos[planillaDeTurnos.length - 1].fechaFormateada;
            let ultimoTurno = planillaDeTurnos.filter(x => x.fechaFormateada == fechaInicio);
            let primerTurno = planillaDeTurnos.filter(x => x.fechaFormateada == fechaFin);
    
            if (esFechaFinal) {
                primerTurno = primerTurno.sort((a, b) => { return (a.turnoPuerto.orden - b.turnoPuerto.orden); });
                fecha = primerTurno[0].fechaFormateada + ' ' + primerTurno[0].turnoPuerto.nombre.split('-')[0] + ':00';
            } else {
                ultimoTurno = ultimoTurno.sort((a, b) => { return (b.turnoPuerto.orden - a.turnoPuerto.orden); });
                fecha = ultimoTurno[0].fechaFormateada + ' ' + ultimoTurno[0].turnoPuerto.nombre.split('-')[1] + ':00';
            }
        }
        return fecha;
    }
}