import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Balanzas78Service } from '@ScatoServicios/balanzas78.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { PlanoDeCargaService } from '@ScatoServicios/plano-de-carga.service';
import { PlanoDeCargaBodega } from '@ScatoModels/plano-de-carga-bodega';
import { FuncionesGeneralesService } from '@ScatoServicios/funciones-generales.service';
import { BalanzadasBuque, Bodega, CargasPorBodega } from '@ScatoModels/balanzadas/balanza';
import { BalanzaService } from '@ScatoServicios/balanza.service';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { EmbarqueSharingService } from '@ScatoServicios/embarque.shared.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';

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

  @Input() esSoloLectura: boolean = false;

  private paramSoloLectura: any;
  unsubscribe: Subject<any>;
  materialesPuerto: MaterialPuerto[] = [];
  bodegasProductosTn = [];
  embarqueSelected: EmbarqueNav;
  planoDeCargaBodega: PlanoDeCargaBodega[];
  bodegas: Bodega[] = [];
  cargasPorbodega: CargasPorBodega[];
  datosEmbarque: any;
  planoDeCargaId: number = 0;

  constructor(
    private balanzas78Service: Balanzas78Service,
    private planoDeCargaService: PlanoDeCargaService,
    private _procesoService: DatosEmbarquesProcesoService,
    private funcionesGeneralesService: FuncionesGeneralesService,
    private embarqueSharingService: EmbarqueSharingService,
    private embarqueService: EmbarqueService,
    private _balanzaService: BalanzaService,) {
    this.unsubscribe = new Subject();
    this.embarqueSharingService.getParametrosIdsEmbarque().subscribe(data => {
      this.paramSoloLectura = data;
    });
    
    /*
    this.datosEmbarque = this._procesoService.getDatosGrafico();
    this.materialesPuerto = this.datosEmbarque.listaMateriales;
    this._balanzaService.obtenerListadoBodegas().subscribe( b => this.bodegas = b );
    */
  }
  setCargarValoresBodegas() {
    if (this.esSoloLectura) {
      this.planoDeCargaId = this.paramSoloLectura.planoDeCarga_Id;
      this.embarqueService.obtenerEmbarque(this.paramSoloLectura.embarque_Id).subscribe(res => {
        this.materialesPuerto = res.materialesPuertoCantidad?.map(x => ({ id: x.materialId, descripcionCorta: x.descripcionCorta, color: x.color }));
      });
      this._balanzaService.obtenerListadoBodegas().subscribe(b => this.bodegas = b);
    } else {
      if (this.planoDeCargaId == 0) {
        this.datosEmbarque = this._procesoService.getDatosGrafico();
        if (this.datosEmbarque != null || this.datosEmbarque != undefined) {
          this.materialesPuerto = this.datosEmbarque.listaMateriales;
          this.embarqueSelected = this._procesoService.getEmbarqueSelected();
          this.planoDeCargaId = this.embarqueSelected.planoDeCargaId;
          this._balanzaService.obtenerListadoBodegas().subscribe(b => this.bodegas = b);
        }
      }
    }
  }
  ngOnInit(): void {
    this.setCargarValoresBodegas();
    if (this.esSoloLectura) {
      this.planoDeCargaService.obtenerPlanoDeCarga(this.planoDeCargaId)
        .subscribe( res => {
          this.planoDeCargaBodega = res.planoDeCargaBodegas;
          this.balanzas78Service.actualizarBodegas(this.paramSoloLectura.moduloDeCarga_Id);
          this.obtenerBalanzadasEnVivo()
        });  
    }else{
      this.embarqueSelected = this._procesoService.getEmbarqueSelected();
      this.planoDeCargaService.obtenerPlanoDeCarga(this.embarqueSelected.planoDeCargaId)
        .pipe(finalize( () => this.obtenerBalanzadasEnVivo() ))
        .subscribe( res => this.planoDeCargaBodega = res.planoDeCargaBodegas );
    }
  }

  obtenerBalanzadasEnVivo() {
    // Datos de ambas balanzas
    // this._balanzaService.balanzadasBuque(this.embarqueSelected.moduloDeCargaId)
    this.balanzas78Service.sendCargasPorBodega
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( CargasPorBodega => {
        this.cargasPorbodega = CargasPorBodega;
      } );
  }

  

  getHour( fecha: Date ): string{
    let hour = fecha.toString().substr(11, 5);
    return hour;
  }


  ngOnDestroy() {
    this.balanzas78Service.limpiarInterval();
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
