import { Component, OnInit, OnDestroy,Input } from '@angular/core';
import { Balanzas } from '@ScatoModels/balanzadas/balanza';
import { Balanzas78Service } from '@ScatoServicios/balanzas78.service';
import { FuncionesGeneralesService } from '@ScatoServicios/funciones-generales.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ParametrosService } from '@ScatoServicios/parametros.service';

@Component({
  selector: 'app-balanzas-ritmos',
  templateUrl: './balanzas-ritmos.component.html',
  styleUrls: ['./balanzas-ritmos.component.css']
})
export class BalanzasRitmosComponent implements OnInit, OnDestroy {
  @Input() enBuque: boolean = false;
  unsubscribe: Subject<any>;
  startBalanza7: Date;
  startBalanza8: Date;
  TnCargadasHastaAhora7: number = 0;
  TnCargadasHastaAhora8: number = 0;
  ritmoEmbarque7: number = 0;
  ritmoEmbarque8: number = 0;
  fechaHoraUltimaBal7: Date;
  fechaHoraUltimaBal8: Date;
  ultimaActualizacion7: Date;
  ultimaActualizacion8: Date;

  constructor( private balanzas78Service: Balanzas78Service,
               private funcionesGeneralesService: FuncionesGeneralesService,
               private parametrosService: ParametrosService ) {
    this.unsubscribe = new Subject();
  }

  ngOnInit(): void {
    this.balanzas78Service.setBalanzadaAgrupada7(this.balanzas78Service.filtroBalanza7);
    this.balanzas78Service.setBalanzadaAgrupada8(this.balanzas78Service.filtroBalanza8);

    this.balanzas78Service.sendRitmosBalanzas78
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( res => {
        this.parametrosService.consola(`===== sendRitmosBalanzas78 =====:`,res);

        this.startBalanza7 = res.ritmosBalanza7.arranco;
        this.fechaHoraUltimaBal7 = res.ritmosBalanza7.ultimaBalanzada;
        this.ritmoEmbarque7 = res.ritmosBalanza7.ritmoDeEmbarque;
        this.ultimaActualizacion7 = res.ritmosBalanza7.ultimaActualizacion;
        this.TnCargadasHastaAhora7 = res.ritmosBalanza7.cargoHastaAhora;

        this.startBalanza8 = res.ritmosBalanza8.arranco;
        this.fechaHoraUltimaBal8 = res.ritmosBalanza8.ultimaBalanzada;
        this.ritmoEmbarque8 = res.ritmosBalanza8.ritmoDeEmbarque;
        this.ultimaActualizacion8 = res.ritmosBalanza8.ultimaActualizacion;
        this.TnCargadasHastaAhora8 = res.ritmosBalanza8.cargoHastaAhora;
      });

    // this.balanzas78Service.sendDataBalanzada7Kilos
    //   .pipe(takeUntil(this.unsubscribe))
    //   .subscribe( res => this.TnCargadasHastaAhora7 = res );

    // this.balanzas78Service.sendDataBalanzada8Kilos
    //   .pipe(takeUntil(this.unsubscribe))
    //   .subscribe( res => this.TnCargadasHastaAhora8 = res );

  }

  startBalanza(bal: Balanzas[]): string{
    return `${this.funcionesGeneralesService.getFechaHora(new Date(bal[0].fecha_Inicio))}`;
  }

  calculoTnCargadasHastaAhora(bal: Balanzas[]): number{
    let tnTotalesCargadas = 0;
    bal.forEach( x => tnTotalesCargadas += x.tn );
    return this.funcionesGeneralesService.decimalAdjust('round', tnTotalesCargadas, -2);
  }

  fechaHoraUltimaBalanzada(bal: Balanzas[]): string{
    let ultimoGrupoBal = bal[bal.length - 1];
    return `${this.getDia( ultimoGrupoBal.fecha_Corte )} ${this.getHora( ultimoGrupoBal.fecha_Corte )}`;
  }

  calculoRitmoEmbarque(bal: Balanzas[]): number{
    let ritmoEmbarque = 0;
    let tnTotalesCargadas = 0;
    let cant = 0;

    bal.forEach( x => {
      tnTotalesCargadas += x.tn;
      cant += 1;
    } );

    ritmoEmbarque = tnTotalesCargadas / cant;
    let ritmoEmbarqueFinal = this.funcionesGeneralesService.decimalAdjust('round', ritmoEmbarque, -2)

    return ritmoEmbarqueFinal;
  }

  getDia(fecha: Date): string{
    let date1 = fecha.toString().substr(0, 10);
    let aa = date1.toString().substr(0, 4);
    let mm = date1.toString().substr(5, 2);
    let dd = date1.toString().substr(8, 2);

    return `${dd}-${mm}-${aa}`;
  }

  getHora( fecha: Date ): string{
    let hour = fecha.toString().substr(11, 5);
    return hour;
  }

  ngOnDestroy() {
    this.balanzas78Service.limpiarInterval();
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
