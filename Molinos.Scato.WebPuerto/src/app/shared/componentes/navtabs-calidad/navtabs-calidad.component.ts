import { AfterViewInit, Component, EventEmitter, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { Subject } from 'rxjs';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { UbicacionDeBuquePuerto } from '@ScatoModels/ubicacion-de-buque-puerto';
import { ProcesoCalidadService } from '@ScatoServicios/procesoCalidad.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EmbarqueService } from '@ScatoServicios/embarque.service';

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
  elementosSinPlano: any;
  embarqueId: number;
  _unsubscribe: Subject<any>;
  errorMessage: boolean = false;

  ningunBuqueOperativo: boolean = false;
  listadoEmbarques: InstanciaWorkflowPuerto[];
  ubicacionDeBuquePuerto: UbicacionDeBuquePuerto[];

  buqueSanBenito: InstanciaWorkflowPuerto | undefined;
  buqueSanBenito2: EmbarqueNav;
  buqueNoryon: InstanciaWorkflowPuerto | undefined;
  buqueVicentin: InstanciaWorkflowPuerto | undefined;
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
    private embarqueService: EmbarqueService
  ) {
    this._unsubscribe = new Subject();
    this.elementos = new Array();
    this.elementosSinPlano = new Array();

    this.buqueSanBenito = this.procesoCalidadService.getSanBenito();
    
    this.buqueNoryon = this.procesoCalidadService.getNoryoun();
    this.buqueVicentin = this.procesoCalidadService.getVicentin();
    this.buqueOtrosMuelles = this.procesoCalidadService.getOtrosMuelles();

    // this._procesoService.setEmbarque(this.buqueSanBenito.embarque.id);

    if(this.buqueSanBenito){
      this._procesoService.setEmbarque(this.buqueSanBenito.embarque.id);
    }

    this.elementos = this._procesoService.getEmbarquesList();
    this.embarqueId = this._procesoService.getEmbarqueId();

    this.buqueSanBenito2 = this.elementos[0];
    this.elementosSinPlano = [{id: 1008, nombreBuque: 'nombrePrueba', nombreUbicacio: 'calada'}]

  }

  ngOnInit(): void {
    this.ordenarEmbarques();

    // this.embarqueSanBenito();
  }

  ngOnChanges(change: SimpleChanges) {
    if (change.elementos) {
      if (this.elementos) {
        this.embarqueSanBenito();
      }
    }
  }

  ordenarEmbarques(){
    this.elementos.map( (e: any) => {
      e.orden = this.elementos.indexOf(e) + 1;
      return e;
    });
    this.embarqueSanBenito();
  }

  embarqueSanBenito() {
    if (this.elementos.length > 0) {
      if (!this.embarqueId) {
        this.embarqueId = this.elementos[0].id;
        this._procesoService.setEmbarque(this.elementos[0].id);
      }
    } 
    // else {
    //   this.cargado = false;
    // }
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
    this.errorMessage = false;
    this._modalService.open(modal);
  }

  agregarEmbarque(embarque: string) {
    this.errorMessage = false;
    if (embarque != '0') {
      let buque = this.elementosSinPlano.find(e => e.id.toString() === embarque);
      // buque.cargado = true;

      let estadoBuque = this.estadosBuque.find( e => e.descripcion.includes('PostOperativo'));
      this.embarqueService.actualizarEstadoBuque(buque.id, estadoBuque.id).subscribe( res => {
        console.log(res);
        this.elementos.push(buque);
        this.elementos.sort((a: any, b: any) => {
          return a.orden-b.orden;
        });

        let index = this.elementosSinPlano.indexOf(buque);
        this.elementosSinPlano.splice(index, 1);

        // setTimeout(() => {
        //   if (this.elementos.length == 1)
        //     this.onClickHandlerClient(buque);
        // }, 50);

      } );

      this._modalService.dismissAll();
    } else {
      this.errorMessage = true;
    }
  }

}
