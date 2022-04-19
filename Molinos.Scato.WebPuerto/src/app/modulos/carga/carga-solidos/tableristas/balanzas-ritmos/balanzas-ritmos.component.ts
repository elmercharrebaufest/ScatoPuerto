import { Component, OnInit, OnDestroy } from '@angular/core';
import { Balanzas } from '@ScatoModels/balanzadas/balanza';
import { Balanzas78Service } from '@ScatoServicios/balanzas78.service';
import { FuncionesGeneralesService } from '@ScatoServicios/funciones-generales.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-balanzas-ritmos',
  templateUrl: './balanzas-ritmos.component.html',
  styleUrls: ['./balanzas-ritmos.component.css']
})
export class BalanzasRitmosComponent implements OnInit, OnDestroy {

  unsubscribe: Subject<any>;
  startBalanza7: string = '';
  startBalanza8: string = '';
  TnCargadasHastaAhora7: number = 0;
  TnCargadasHastaAhora8: number = 0;
  ritmoEmbarque7: number = 0;
  ritmoEmbarque8: number = 0;
  fechaHoraUltimaBal7: string = '';
  fechaHoraUltimaBal8: string = '';
  ultimaActualizacion7: string = '';
  ultimaActualizacion8: string = '';

  constructor( private balanzas78Service: Balanzas78Service,
               private funcionesGeneralesService: FuncionesGeneralesService ) {
    this.unsubscribe = new Subject();
  }

  ngOnInit(): void {
    this.balanzas78Service.setBalanzadaAgrupada7(this.balanzas78Service.filtroBalanza7);
    this.balanzas78Service.setBalanzadaAgrupada8(this.balanzas78Service.filtroBalanza8);
    this.balanzas78Service.sendDataBalanzadaAgrupada7
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( 
        res => {
        if(res.length>0){
          this.startBalanza7 = this.startBalanza(res);
          this.fechaHoraUltimaBal7 = this.fechaHoraUltimaBalanzada(res);
          this.ritmoEmbarque7 = this.calculoRitmoEmbarque(res);
          this.ultimaActualizacion7 = this.funcionesGeneralesService.getFechaHora( new Date() );
        } else {
          this.startBalanza7 = '';
          this.fechaHoraUltimaBal7 = '';
          this.ritmoEmbarque7 = 0;
          this.ultimaActualizacion7 = '';
        }
      } );
      
    this.balanzas78Service.sendDataBalanzadaAgrupada8
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( res => {
        if(res.length>0){
          this.startBalanza8 = this.startBalanza(res);
          this.fechaHoraUltimaBal8 = this.fechaHoraUltimaBalanzada(res);
          this.ritmoEmbarque8 = this.calculoRitmoEmbarque(res);
          this.ultimaActualizacion8 = this.funcionesGeneralesService.getFechaHora( new Date() );
        } else {
          this.startBalanza8 = '';
          this.fechaHoraUltimaBal8 = '';
          this.ritmoEmbarque8 = 0;
          this.ultimaActualizacion8 = '';
        }
      } );

    this.balanzas78Service.sendDataBalanzada7Kilos
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( res => this.TnCargadasHastaAhora7 = res );

    this.balanzas78Service.sendDataBalanzada8Kilos
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( res => this.TnCargadasHastaAhora8 = res );

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
