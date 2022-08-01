import { Component, OnInit, OnDestroy } from '@angular/core';
import { Balanzas78Service } from '@ScatoServicios/balanzas78.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { PlanoDeCargaService } from '@ScatoServicios/plano-de-carga.service';
import { PlanoDeCargaBodega } from '@ScatoModels/plano-de-carga-bodega';
import { FuncionesGeneralesService } from '@ScatoServicios/funciones-generales.service';
import { BalanzadasBuque, Bodega } from '@ScatoModels/balanzadas/balanza';
import { BalanzaService } from '@ScatoServicios/balanza.service';
import { MaterialPuerto } from '@ScatoModels/material-puerto';

interface BalanzadasUnidas {
  bodega: string;
  producto: string;
  kilos: number;
  nroBodega?: number;
  cantidadEsperada?: number;
  restaCargar?: number;
  excedente?: number;
}

@Component({
  selector: 'app-bodegas',
  templateUrl: './bodegas.component.html',
  styleUrls: ['./bodegas.component.css']
})
export class BodegasComponent implements OnInit, OnDestroy {

  unsubscribe: Subject<any>;
  materialesPuerto: MaterialPuerto[] = [];
  bodegasProductosTn = [];
  embarqueSelected: EmbarqueNav;
  planoDeCargaBodega: PlanoDeCargaBodega[];
  bodegas: Bodega[] = [];
  datosEmbarque: any;

  constructor(
    private balanzas78Service: Balanzas78Service,
    private planoDeCargaService: PlanoDeCargaService,
    private _procesoService: DatosEmbarquesProcesoService,
    private funcionesGeneralesService: FuncionesGeneralesService,
    private _balanzaService: BalanzaService,) {

    this.unsubscribe = new Subject();
    this.datosEmbarque = this._procesoService.getDatosGrafico();
    this.materialesPuerto = this.datosEmbarque.listaMateriales;
    this._balanzaService.obtenerListadoBodegas().subscribe( b => this.bodegas = b );
  }

  ngOnInit(): void {
    this.embarqueSelected = this._procesoService.getEmbarqueSelected();

    this.planoDeCargaService.obtenerPlanoDeCarga(this.embarqueSelected.planoDeCargaId)
      .pipe(finalize( () => this.obtenerBalanzadasEnVivo() ))
      .subscribe( res => this.planoDeCargaBodega = res.planoDeCargaBodegas );
  }

  obtenerBalanzadasEnVivo() {
    // Datos de ambas balanzas
    // this._balanzaService.balanzadasBuque(this.embarqueSelected.moduloDeCargaId)
    this.balanzas78Service.sendBalanzadasBuque
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( blzas => {
        // let blzas7y8: BalanzadasBuque[] = blzas.balanzadasBuque;
        let balanzadasUnidas: BalanzadasUnidas[] = [];
        // let balanzadasDataOK = blzas7y8.filter( x => x.material_Id > 0 && x.pesoNeto > 0 && x.bodega_Id > 0 );
        let balanzadasDataOK = blzas.filter( x => x.material_Id > 0 && x.pesoNeto > 0 && x.bodega_Id > 0 );
        balanzadasUnidas = this.unirBalanzadasParaBodegas(balanzadasDataOK);

        if(balanzadasUnidas.length>0){
          this.bodegasProductosTn = this.agruparBodegasProductosTn(balanzadasUnidas);
          this.bodegasProductosTn.sort(((a, b) => a.nroBodega - b.nroBodega));

          for(let bodega in this.bodegasProductosTn){
            for(let plano in this.planoDeCargaBodega){
              if(this.bodegasProductosTn[bodega].nroBodega == this.planoDeCargaBodega[plano].bodegaParcel){

                this.bodegasProductosTn[bodega].cantidadEsperada = this.planoDeCargaBodega[plano].cantidad * 1000;

                this.bodegasProductosTn[bodega].restaCargar = this.bodegasProductosTn[bodega].kilos == 0 ? this.bodegasProductosTn[bodega].cantidadEsperada : 
                  (this.bodegasProductosTn[bodega].cantidadEsperada - this.bodegasProductosTn[bodega].kilos) > 0 ? (this.bodegasProductosTn[bodega].cantidadEsperada - this.bodegasProductosTn[bodega].kilos) : 0;

                this.bodegasProductosTn[bodega].excedente = this.bodegasProductosTn[bodega].kilos == 0 ? 0 : 
                  ((this.bodegasProductosTn[bodega].kilos - this.bodegasProductosTn[bodega].cantidadEsperada) > 0 ? (this.bodegasProductosTn[bodega].kilos - this.bodegasProductosTn[bodega].cantidadEsperada) : 0);
              }
            }
          }
        } else {
          this.bodegasProductosTn = [];
        }
      } );
  }

  unirBalanzadasParaBodegas(blzas7y8: BalanzadasBuque[]): BalanzadasUnidas[] {
    let nuevaBalanzadasBajaCarga: BalanzadasUnidas[] = blzas7y8.map( x => {
      let propBalanzadasUnidas = {
        "bodega": this.getNombreBodega(x.bodega_Id),
        "producto": this.getDescripcionCortaMaterial(x.material_Id),
        "kilos": x.pesoNeto
      };
      return propBalanzadasUnidas;
    });
    
    return nuevaBalanzadasBajaCarga;
  }

  getNombreBodega(bodega_id: number): string{
    let bodega = this.bodegas.find( x => x.id == bodega_id );

    if(!bodega)
      return '';
    else
      return bodega.nombre;
  }

  getHour( fecha: Date ): string{
    let hour = fecha.toString().substr(11, 5);
    return hour;
  }

  getDescripcionCortaMaterial(materialId: number): string{
    if (!materialId) return '';

    let materialesPuerto = this.materialesPuerto.find( x => x.id == materialId );
    // TODO: La siguiente linea es para cuando el id del material del corte no está en plano de carga
    let descripcionCorta = materialesPuerto?.descripcionCorta ? materialesPuerto.descripcionCorta : '';
    return descripcionCorta;
  }

  agruparBodegasProductosTn(balanza: BalanzadasUnidas[]): BalanzadasUnidas[] {
    let groups = ['bodega', 'producto'];
    let grouped = {};

    balanza.forEach(function (a) {
        groups.reduce(function (o, g, i) {                            // take existing object,
            o[a[g]] = o[a[g]] || (i + 1 === groups.length ? [] : {}); // or generate new obj, or
            return o[a[g]];                                           // at last, then an array
        }, grouped).push(a);
    });

    let finalFinal = [];

    for (var [key, value] of Object.entries(grouped)) {
      let keyBodega = key
      let producto = value;
      
      for(var [key, value2] of Object.entries(producto)) {
        let keyProducto = key;
        let kilos = value2;
        let totalKilos = 0;
        
        for(let i in kilos) {
          totalKilos += kilos[i].kilos;
        }
        
        let final = { 
          bodega: keyBodega, 
          producto: keyProducto, 
          kilos: totalKilos,
          nroBodega: this.funcionesGeneralesService.getNumbersInString(keyBodega, 'number'),
          cantidadEsperada: 0,
          restaCargar: 0,
          excedente: 0
        };

        finalFinal.push(final);
      }
    }
    return finalFinal;
  }

  ngOnDestroy() {
    this.balanzas78Service.limpiarInterval();
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
