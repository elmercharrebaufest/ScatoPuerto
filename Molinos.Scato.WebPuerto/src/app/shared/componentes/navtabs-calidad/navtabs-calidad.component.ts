import { AfterViewInit, Component, EventEmitter, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { UbicacionDeBuquePuerto } from '@ScatoModels/ubicacion-de-buque-puerto';
import { ProcesoCalidadService } from '@ScatoServicios/procesoCalidad.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-navtabs-calidad',
  templateUrl: './navtabs-calidad.component.html',
  styleUrls: ['./navtabs-calidad.component.css']
})
export class NavtabsCalidadComponent implements OnInit, AfterViewInit {
  @Output() showPlano = new EventEmitter<boolean>();
  @Output() changeEmbarque = new EventEmitter<any>();
  @ViewChildren('listadoBotones') listadoBotones: QueryList<any>;
  elementos: EmbarqueNav[];
  elementosSinPlano: EmbarqueNav[];
  embarqueId: number;
  _unsubscribe: Subject<any>;
  errorMessage: boolean = false;

  ningunBuqueOperativo: boolean = false;
  listadoEmbarques: InstanciaWorkflowPuerto[];
  embarquesEnLineUpSinFiltrar: EmbarqueNav[];
  ubicacionDeBuquePuerto: UbicacionDeBuquePuerto[];

  buqueSanBenito: InstanciaWorkflowPuerto | undefined;
  buqueSanBenito2: EmbarqueNav;
  buqueVicentin: InstanciaWorkflowPuerto | undefined;
  buqueVicentin2: EmbarqueNav;
  buqueNoryon: InstanciaWorkflowPuerto | undefined;
  buqueNoryon2: EmbarqueNav;
  buqueOtrosMuelles: InstanciaWorkflowPuerto | undefined;

  embarqueSelected: EmbarqueNav;
  cargado: boolean = false;
  estadosBuque = [{id: 1, descripcion: 'PreOperativo'}, 
                  {id: 2, descripcion: 'Cargando'}, 
                  {id: 3, descripcion: 'ControlCalidad'}, 
                  {id: 4, descripcion: 'PostOperativo'}];

  constructor(
    private procesoCalidadService: ProcesoCalidadService,
    private _procesoService: DatosEmbarquesProcesoService,
    private _modalService: NgbModal,
    private embarqueService: EmbarqueService,
    private workflowService: WorkflowService,
  ) {
    this._unsubscribe = new Subject();
    this.elementos = new Array();
    this.elementosSinPlano = new Array();
    this.buqueSanBenito = this.procesoCalidadService.getSanBenito();
    this.buqueNoryon = this.procesoCalidadService.getNoryoun();
    this.buqueVicentin = this.procesoCalidadService.getVicentin();
    this.buqueOtrosMuelles = this.procesoCalidadService.getOtrosMuelles();

    if(this.buqueSanBenito){
      this._procesoService.setEmbarque(this.buqueSanBenito.embarque.id);
      console.log('ID EMBARQUE - NavTabs: ',this.buqueSanBenito.embarque.id);
      this._procesoService.emitSeActualizoEmbarque();
    }

    this.elementos = this._procesoService.getEmbarquesList();
    this.embarqueId = this._procesoService.getEmbarqueId();
    this.buqueSanBenito2 = this.elementos.find(b => b.muelle == 'sanBenito');
    this.buqueVicentin2 = this.elementos.find(b => b.muelle == 'vicentin');
    this.buqueNoryon2 = this.elementos.find(b => b.muelle == 'noryon');
  }

  ngOnInit(): void {
    this.ordenarEmbarques();
  }

  ngOnChanges(change: SimpleChanges) {
    if(change.elementos && this.elementos) this.embarqueSanBenito();
  }

  ordenarEmbarques(){
    this.elementos.map( (e: any) => {
      e.orden = this.elementos.indexOf(e) + 1;
      return e;
    });

    this.embarqueSanBenito();
  }

  embarqueSanBenito() {
    if (this.elementos.length > 0 && !this.embarqueId) {
      this.embarqueId = this.elementos[0].id;
      this._procesoService.setEmbarque(this.elementos[0].id);
    }
  }

  ngAfterViewInit() {
    if (this.elementos.length > 0) {
      var elementoSeleccionado = document.getElementById(this.embarqueId.toString());
      if (elementoSeleccionado) elementoSeleccionado.classList.add("btn-seleccionado");
      
      this.showPlano.emit(true);
    } else {
      this.showPlano.emit(false);
    }

    this.cargado = true;
  }

  onClickHandlerClient(elemento: EmbarqueNav) {
    console.log('elemento: ', elemento);
    
    var elementoDeseleccionado = document.getElementsByClassName("btn-seleccionado")[0];
    if (elementoDeseleccionado != null)
      elementoDeseleccionado.classList.remove("btn-seleccionado")
    var elementoSeleccionado = document.getElementById(elemento.id.toString());
    elementoSeleccionado.classList.add("btn-seleccionado");
    if (this._procesoService.getEmbarqueSelected() != elemento) {
      this._procesoService.setEmbarque(elemento.id);
      this.changeEmbarque.emit(true);
    }
  }

  estadoSanBenito() {
    let msje = `Buque #1 ${this.buqueSanBenito?.embarque.nombreBuque} / CARGANDO`
    return this.buqueSanBenito ? msje : "No hay ningún barco operando";
  }
  estadoVicentin() {
    let msje = `Buque #1 ${this.buqueVicentin?.embarque.nombreBuque} / CARGANDO`
    return this.buqueVicentin ? msje : "No hay ningún barco operando";
  }
  estadoNoryon() {
    let msje = `Buque #1 ${this.buqueNoryon?.embarque.nombreBuque} / CARGANDO`
    return this.buqueNoryon ? msje : "No hay ningún barco operando";
  }
  estadoOtros() {
    let msje = `Buque #1 ${this.buqueOtrosMuelles?.embarque.nombreBuque} / CARGANDO`
    return this.buqueOtrosMuelles ? msje : "No hay ningún barco operando";
  }

  muellesOperativos() {
    return this.buqueSanBenito || this.buqueNoryon || this.buqueVicentin || this.buqueOtrosMuelles ? true : false;
  }

  imgSolidoLiquido(buque: InstanciaWorkflowPuerto) {
    if (buque)
      return buque.embarque.esLiquido ? "icono-liquido" : "icono-solido";
  }

  openModalAddBuque(modal: any) {
    this.obtenerBuquesCargando();
    this.errorMessage = false;
    this._modalService.open(modal);
  }

  obtenerBuquesCargando(){
    this.elementosSinPlano = [];
    let estadoBuque = this.estadosBuque.find( e => e.descripcion.includes('Cargando'));

    forkJoin({
      obtenerListado: this.workflowService.obtenerListado(),
      listarEmbarquesEnLineUp: this.workflowService.listarEmbarquesEnLineUp()
    })
    .subscribe( (res: {
                        obtenerListado: InstanciaWorkflowPuerto[], 
                        listarEmbarquesEnLineUp: EmbarqueNav[]
                      }) => {
      this.listadoEmbarques = res.obtenerListado;
      this.embarquesEnLineUpSinFiltrar = res.listarEmbarquesEnLineUp;

      let sanBenito: InstanciaWorkflowPuerto[] = this.listadoEmbarques ? this.listadoEmbarques.filter(i => 
        (i.embarque.sanBenito || (!i.embarque.vicentin && !i.embarque.otrosMuelles && !i.embarque.noryon)) && 
        i.embarque.estadoBuque?.id === estadoBuque.id) : new Array();
      
      // sanBenito.forEach( x => this.embarquesEnLineUpSinFiltrar.forEach( y => y.id === x.embarque.id ?? this.elementosSinPlano.push(y) ) );
      for(let a of sanBenito){
        for(let b of this.embarquesEnLineUpSinFiltrar){
          if(a.embarque.id == b.id) this.elementosSinPlano.push(b);
        }
      }
    });
  }

  agregarEmbarque(embarque: string) {
    this.errorMessage = false;
    if (embarque != '0') {
      let buque = this.elementosSinPlano.find(e => e.id.toString() === embarque);
      let estadoBuque = this.estadosBuque.find( e => e.descripcion.includes('ControlCalidad'));
      
      this.embarqueService.actualizarEstadoBuque(buque.id, estadoBuque.id)
        .pipe(finalize( () => {
          this.procesoCalidadService.setBuqueCambiaEstado(buque);

          setTimeout(() => {
            this.buqueSanBenito = this.procesoCalidadService.getSanBenito();
            console.log('this.buqueSanBenito desde finalize()', this.buqueSanBenito);

            this.buqueNoryon = this.procesoCalidadService.getNoryoun();
            this.buqueVicentin = this.procesoCalidadService.getVicentin();
            this.buqueOtrosMuelles = this.procesoCalidadService.getOtrosMuelles();

            if(this.buqueSanBenito) this._procesoService.setEmbarque(this.buqueSanBenito.embarque.id);

            this.elementos = this._procesoService.getEmbarquesList();
            this.embarqueId = this._procesoService.getEmbarqueId();
            this.buqueSanBenito2 = this.elementos[0];

            this.ngOnInit();
            this.ngAfterViewInit();
            setTimeout(() => {
              this.onClickHandlerClient(this.buqueSanBenito2);
            }, 1000);
          }, 1000);
        }))
        .subscribe( res => {
          console.log(res);
          this.elementos.push(buque);
          this.elementos.sort((a: any, b: any) => {
            return a.orden-b.orden;
          });

          let index = this.elementosSinPlano.indexOf(buque);
          this.elementosSinPlano.splice(index, 1);
        } );

      this._modalService.dismissAll();
    } else {
      this.errorMessage = true;
    }
  }

}
