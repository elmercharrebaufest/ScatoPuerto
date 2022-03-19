import { Component, OnInit, OnDestroy } from '@angular/core';
import { Balanzas78Service } from '@ScatoServicios/balanzas78.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuncionesGeneralesService } from '@ScatoServicios/funciones-generales.service';
import { Balanzas } from '@ScatoModels/balanzadas/balanza';

@Component({
  selector: 'app-info-adicional',
  templateUrl: './info-adicional.component.html',
  styleUrls: ['./info-adicional.component.css']
})
export class InfoAdicionalComponent implements OnInit, OnDestroy {

  unsubscribe: Subject<any>;
  ritmoBajaCarga: string;
  porcCargadoBajaCarga: string;
  paradasOperativasPuerto: string;
  paradasOperativasPuerto8: string;
  paradasOperativasBuque: string;
  paradasMecanicas: string;
  paradasElectricas: string;
  paradasPorHabilitacion: string;
  esperaDeterminante: string;

  constructor( private balanzas78Service: Balanzas78Service,
               private funcionesGeneralesService: FuncionesGeneralesService ) {
    this.unsubscribe = new Subject();
  }

  ngOnInit(): void {
    this.obtenerBalanzadasEnVivo();
  }

  obtenerBalanzadasEnVivo(){
    this.balanzas78Service.informacionAdicional
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( info => {
        console.log('info: ', info);
        this.paradasOperativasPuerto = info.op;
        this.paradasOperativasBuque = info.ob;
        this.paradasElectricas = info.e;
        this.paradasMecanicas = info.m;
        this.esperaDeterminante = info.ed;
        this.porcCargadoBajaCarga = info.porcBC;
        this.paradasPorHabilitacion = info.h;
        this.ritmoBajaCarga = info.ritmoBc;
        // this.calcularRitmoBajaCarga();
      } );
  }

  // calcularRitmoBajaCarga(){
  //   let totalTiempoABajaCarga;
  //   let totalCargado = 1000;
  //   let porcCargadoBajaCarga = this.funcionesGeneralesService.decimalAdjust('round', this.porcCargadoBajaCarga, -2);
  //   console.log('porcCargadoBajaCarga: ', porcCargadoBajaCarga);
  //   let tnBajaCarga = porcCargadoBajaCarga * totalCargado / 100;

  //   this.ritmoBajaCarga = (60 * tnBajaCarga) / totalTiempoABajaCarga;

  //   return this.ritmoBajaCarga;
  // }
  
  porcBajaCarga( balanzadas: Balanzas[] ): number{
    let tnTotalesCargadas = 0;
    let tnTotalesCargadasABajaCarga = 0;
    balanzadas.forEach( x => tnTotalesCargadas += x.tn );
    balanzadas.forEach( x => {
      if( x.tn > 0 && x.tn < 1000 ){
        tnTotalesCargadasABajaCarga += x.tn
      }
    } );
    return (tnTotalesCargadasABajaCarga * 100 / tnTotalesCargadas);
  }

  calculoRitmoBajaCarga(balanzadas: Balanzas[]): number{
    let ritmoEmbarque = 0;
    let tnTotalesCargadasABajaCarga = 0;
    let cant = 0;

    balanzadas.forEach( x => {
      if( x.tn > 0 && x.tn < 1000 ){
        tnTotalesCargadasABajaCarga += x.tn;
        cant += 1;
      }
    } );

    ritmoEmbarque = tnTotalesCargadasABajaCarga / cant;

    return this.funcionesGeneralesService.decimalAdjust('round', ritmoEmbarque, -2);
  }

  ngOnDestroy() {
    this.balanzas78Service.limpiarInterval();
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
