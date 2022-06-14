import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { ProcesoCalidadService } from '@ScatoServicios/procesoCalidad.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { Balanzas78Service } from '@ScatoServicios/balanzas78.service';
import { Balanzas } from '@ScatoModels/balanzadas/balanza';
import { takeUntil } from 'rxjs/operators';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { ParametrosService } from '@ScatoServicios/parametros.service';


@Component({
  selector: 'app-calidad',
  templateUrl: './calidad.component.html',
  styleUrls: ['./calidad.component.css']
})
export class CalidadComponent implements OnInit, OnDestroy {
  mostrarSpinner: boolean = true;
  mostrarTabs: boolean = false;
  mostrarPlano: boolean = false;
  mostrarCargas: boolean = false;
  embarquesEnLineUp: EmbarqueNav[] = [];
  embarqueSelected: EmbarqueNav;
  unsubscribe: Subject<any>;
  errorMessage: boolean = false;
  
  embarquesEnLineUpSinFiltrar: EmbarqueNav[];
  listadoEmbarques: InstanciaWorkflowPuerto[];

  buqueEnSanBenito: InstanciaWorkflowPuerto | undefined;
  buqueEnNoryon: InstanciaWorkflowPuerto | undefined;
  buqueEnVicentin: InstanciaWorkflowPuerto | undefined;
  buqueEnOtrosMuelles: InstanciaWorkflowPuerto | undefined;

  embarqueId: number;
  barquitos: InstanciaWorkflowPuerto[];
  vaporId: number = 0;
  materialesPuerto = [];
  startBalanza7: string = '';
  startBalanza8: string = '';
  resultados: Balanzas[] = [];
  embarque: EmbarqueNav;
  moduloDeCarga_Id: number = 0;

  constructor(
    private workflowService: WorkflowService,
    private procesoCalidadService: ProcesoCalidadService,
    private _procesoService: DatosEmbarquesProcesoService,
    private balanzas78Service: Balanzas78Service,
    private embarqueService: EmbarqueService,
    private parametrosService: ParametrosService,
    ) {
    this.unsubscribe = new Subject();
    this.embarqueService.obtenerListadoMateriales().subscribe( mat => this.materialesPuerto = mat );
    this.moduloDeCarga_Id = this._procesoService.getModuloDeCargaId();
    this.parametrosService.obtenerParametros().subscribe( res => this.parametrosService.setParametros(res) );

    this.procesoCalidadService.sendBuqueCambiaEstado.subscribe( res => {
      this.trabajoOrdenado();
      // this.obtenerBalanzadasEnVivo();
    });
  }

  ngOnInit(): void {
    this.embarque = this._procesoService.getEmbarqueSelected();
    this.trabajoOrdenado();
    // this.obtenerBalanzadasEnVivo();
  }

  // subscribeEmbarques(){
  //   try {
  //     this.workflowService.obtenerListado()
  //       .pipe(takeUntil(this.unsubscribe))
  //       .subscribe((resp: any) => {
  //         this.barquitos = resp.find(x => x.embarque.id === this.embarqueId);
  //         this.vaporId = this.barquitos['embarque'].vapor.id;

  //         console.log("setEmbarqueBalanzaCalidad(), desde CALIDAD, desde subscribeEmbarques()");
  //         this.balanzas78Service.setEmbarqueBalanzaCalidad(this.vaporId);
  //       });
  //   } catch (e) {
  //     console.log(e);
  //     console.log("Error en listarEmbarquesEnLineUp");
  //   }
  // }

  trabajoOrdenado(){
    forkJoin({
      obtenerListado: this.workflowService.obtenerListado(),
      listarEmbarquesEnLineUp: this.workflowService.listarEmbarquesEnLineUp()
    })
    .subscribe( (res: {
                        obtenerListado: InstanciaWorkflowPuerto[], 
                        listarEmbarquesEnLineUp: EmbarqueNav[]
                      }) => {
      this.listadoEmbarques = res.obtenerListado;
      this.filtrarMuelles();
      
      this.embarquesEnLineUpSinFiltrar = res.listarEmbarquesEnLineUp;

      
      let embEnLineUp = this.embarquesEnLineUpSinFiltrar.find(m => m.id == this.buqueEnSanBenito?.embarque.id);
      if(embEnLineUp) this.embarquesEnLineUp.push(embEnLineUp);

      this._procesoService.setEmbarquesList(this.embarquesEnLineUp);
      this.embarque = this._procesoService.getEmbarqueSelected();
      this.embarqueId = this._procesoService.getEmbarqueId();


      if(this.embarqueId){
        res.obtenerListado.forEach( x => x.embarque.id === this.embarqueId ?? this.barquitos.push(x) );
        if(this.barquitos){
          this.vaporId = this.barquitos[0]['embarque'].vapor.id;
          // TODO: Evangelino - Se asigna el Modulo de carga para cargar los ritmo de carga
          const selLineUp = this.barquitos[0].lineUp;
          const selModuloDeCarga = selLineUp['moduloDeCarga'];
          this.moduloDeCarga_Id = selModuloDeCarga.id;
          this.balanzas78Service.setEmbarqueBalanzaCalidad(this.moduloDeCarga_Id);
        }
      }

      this.mostrarTabs = true;
    });
    
  }

  filtrarMuelles() {
    // Hasta que el pasaje a produccion de recibidores, pasar de Cargando → Post operativo (ticket 293)
    let idEstadoCargando = 3; // ControlCalidad
    // let idEstadoCargando = 4; // PostOperativo

    // Filtro los buques de cada muelle. Buque que esta cargando en el muelle
    this.buqueEnSanBenito = this.listadoEmbarques ? this.listadoEmbarques
      .filter(i => i.embarque.sanBenito || (!i.embarque.vicentin && !i.embarque.otrosMuelles && !i.embarque.noryon))
      .find(m => m.embarque.estadoBuque?.id == idEstadoCargando) : undefined;
    this.buqueEnNoryon = this.listadoEmbarques ? this.listadoEmbarques.filter(i => i.embarque.noryon)
      .find(m => m.embarque.estadoBuque?.id == idEstadoCargando) : undefined;
    this.buqueEnVicentin = this.listadoEmbarques ? this.listadoEmbarques.filter(i => i.embarque.vicentin)
      .find(m => m.embarque.estadoBuque?.id == idEstadoCargando) : undefined;
    this.buqueEnOtrosMuelles = this.listadoEmbarques ? this.listadoEmbarques.filter(i => i.embarque.otrosMuelles)
      .find(m => m.embarque.estadoBuque?.id == idEstadoCargando) : undefined;

    this.procesoCalidadService.setSanBenito(this.buqueEnSanBenito);
    this.procesoCalidadService.setNoryoun(this.buqueEnNoryon);
    this.procesoCalidadService.setVicentin(this.buqueEnVicentin);
    this.procesoCalidadService.setOtrosMuelles(this.buqueEnOtrosMuelles);
  }

  // obtenerBalanzadasEnVivo() {

  //   this.balanzas78Service.setBalanzadaAgrupada7(this.balanzas78Service.filtroBalanza7);
  //   this.balanzas78Service.setBalanzadaAgrupada8(this.balanzas78Service.filtroBalanza8);
    
  //   this.balanzas78Service.sendDataBalanzadaAgrupada7
  //     .pipe(takeUntil(this.unsubscribe))
  //     .subscribe( blzas7 => {
  //       if(blzas7.length>0){
  //         this.startBalanza7 = ``;

  //         this.posibleLoop01 = this.posibleLoop01 + 1;
  //         console.log('SUBSCRIBE en sendDataBalanzadaAgrupada7 - this.posibleLoop01: ', this.posibleLoop01);

  //         this.balanzas78Service.setBalanzadaAgrupada7(blzas7);
  //       }
  //     } );

  //   this.balanzas78Service.sendDataBalanzadaAgrupada8
  //     .pipe(takeUntil(this.unsubscribe))
  //     .subscribe( blzas8 => {
  //       if(blzas8.length>0){
  //         this.startBalanza8 = ``;

  //         this.posibleLoop02 = this.posibleLoop02 + 1;
  //         console.log('SUBSCRIBE en sendDataBalanzadaAgrupada8 - this.posibleLoop02: ', this.posibleLoop02);

  //         this.balanzas78Service.setBalanzadaAgrupada8(blzas8);
  //       }
  //     } );
  // }

  getDate(fecha: Date): string{
    let fechaDate = new Date(fecha);
    let date = fechaDate.getDate()+"-"+fechaDate.getMonth()+"-"+fechaDate.getFullYear();
    return date;
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

  showPlano(event: boolean) {
    this.embarqueSelected = this._procesoService.getEmbarqueSelected();
  
    setTimeout(() => {
      this.mostrarSpinner = false;
      this.mostrarPlano = event;
    }, 50);
  }

  showCargas(event) {
    this.mostrarCargas = event;
  }

  hideSpinner(event) {
    setTimeout(() => {
      this.mostrarSpinner = event;
    }, 50);
  }

  changeEmbarque() {
    this.mostrarCargas = false;
    this.mostrarSpinner = true;
    this.embarqueSelected = this._procesoService.getEmbarqueSelected();
  }

  ngOnDestroy() {
    // this.balanzas78Service.limpiarInterval();
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
