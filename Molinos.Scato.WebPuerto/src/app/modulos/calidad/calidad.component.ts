import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { ProcesoCalidadService } from '@ScatoServicios/procesoCalidad.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { Balanzas78Service } from '@ScatoServicios/balanzas78.service';
import { Balanzas } from '@ScatoModels/balanzadas/balanza';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { ParametrosService } from '@ScatoServicios/parametros.service';
import { CalidadSharedService } from '@ScatoServicios/calidad-shared.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Router } from '@angular/router';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { PeriodoDeCarga } from '@ScatoModels/periodo-carga';
import { takeUntil } from 'rxjs/operators';
import { Embarque, EstadoBuque } from '@ScatoModels/embarque';
import { AutenticadorService } from '@ScatoServicios/autenticador.service';
import { UbicacionDeBuquePuerto } from '@ScatoModels/ubicacion-de-buque-puerto';
import { LineupService } from '@ScatoServicios/lineup.service';
import { BuqueService } from '@ScatoServicios/buque.service';


@Component({
  selector: 'app-calidad',
  templateUrl: './calidad.component.html',
  styleUrls: ['./calidad.component.css']
})
export class CalidadComponent implements OnInit, OnDestroy {

  ubicacionDeBuquePuerto: UbicacionDeBuquePuerto[];

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
  confirmationDialogService: any;
  periodoDeCarga: PeriodoDeCarga;
  estadoBuque: EstadoBuque;
  estadosBuque = [{id: 1, descripcion: 'PreOperativo'},
                  {id: 2, descripcion: 'Cargando'},
                  {id: 3, descripcion: 'ControlCalidad'},
                  {id: 4, descripcion: 'PostOperativo'}];



  constructor(
    private _buqueService: BuqueService,
    private lineUpService: LineupService,
    private workflowService: WorkflowService,
    private procesoCalidadService: ProcesoCalidadService,
    private _procesoService: DatosEmbarquesProcesoService,
    private balanzas78Service: Balanzas78Service,
    private embarqueService: EmbarqueService,
    private parametrosService: ParametrosService,
    private calidadSharedService: CalidadSharedService,
    confirmationDialogService: ConfirmationDialogService,
    private router: Router,
    private moduloDeCargaService: ModuloDeCargaService,
    private auth: AutenticadorService
    ) {
    this.auth.renovarAuthUsuario();
    this.confirmationDialogService = confirmationDialogService;
    this.unsubscribe = new Subject();
    this.embarqueService.obtenerListadoMateriales().subscribe( mat => this.materialesPuerto = mat );
    this.moduloDeCarga_Id = this._procesoService.getModuloDeCargaId();
    this.parametrosService.obtenerParametros().subscribe( res => this.parametrosService.setParametros(res) );

    this.procesoCalidadService.sendBuqueCambiaEstado.subscribe( res => this.trabajoOrdenado());
    this.escuchaActualizacionNavtabs();
    this.escuchaFinalizarHijos();
  }

  ngOnInit(): void {
    this.lineUpService.obtenerListadoUbicacionDeBuquePuerto().subscribe(res => { this.ubicacionDeBuquePuerto = res; });
    this.embarque = this._procesoService.getEmbarqueSelected();
    this.trabajoOrdenado();
  }

  escuchaActualizacionNavtabs(){
    this._procesoService.sendSeActualizoEmbarque.subscribe( res => {
      this.embarqueId = this._procesoService.getEmbarqueId();
      this.moduloDeCarga_Id = this._procesoService.getModuloDeCargaId();
      this.moduloDeCargaService.obtenerModuloDeCarga(this.moduloDeCarga_Id)
        .subscribe( res => this.periodoDeCarga = res.moduloDeCargaPeriodoDeCarga[0] ? res.moduloDeCargaPeriodoDeCarga[0] : null);

      setTimeout(() => this.estadoBuque = this._procesoService.getEstadoBuque(), 3000);
    });
  }

  escuchaFinalizarHijos(){
    this.calidadSharedService.sendFinalizaEnCalidad
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((esLiquido: boolean) => this.finalizaEnCalidad(esLiquido));
  }

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

  /**
   * Se utiliza mediante un EventEmitter disparado desde sus componentes hijos para reutilizar código.
   */
  finalizaEnCalidad(esLiquido: boolean ){

    if(esLiquido){
      let fechaFinalizacionCarga  = this.periodoDeCarga != null ? this.periodoDeCarga.fechaFinalizacionCarga : null;
      let horaFinalizacionCarga   = this.periodoDeCarga != null ? this.periodoDeCarga.horaFinalizacionCarga : null;

      if(fechaFinalizacionCarga == null || horaFinalizacionCarga == null){
        this.confirmationDialogService.confirm('¡Atención!', 'La fecha y hora de finalización de carga debe estar completa.', 'Aceptar', '', null, null, Tipoalerta.Warning)
      }else{
        this.consultaCambioDeEstado();
      }
    }else{
      let estadoBuque = this.estadoBuque.descripcion.includes('ControlCalidad');
      if(estadoBuque)
        this.consultaCambioDeEstado();
      else
        this.confirmationDialogService.confirm('¡Atención!', 'El buque continua en estado "Cargando".', 'Aceptar', '', null, null, Tipoalerta.Warning)
    }
  }

  consultaCambioDeEstado(){
    //let texto = "Desea cambiar el estado del embarque a PostOperativo?";
    let texto = "Desea zarpar el embarque?";

    this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', 'Cancelar', null, null, Tipoalerta.Success)
      .then((confirmed) => {
        if (confirmed) {
          this.modificarEstadoBuque('PostOperativo');
          //this.zarparEmbarque();
     //     this._buqueService.GuardarHistoricoOperador(this.embarqueSelected.id, "Finalizó embarque").subscribe();


          InstanciaWorkflowPuerto
          this.router.navigate(['/lineup']);
        } else
          console.log('Close: Finalizar Tablerista');
      })
      .catch(() => {
        console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)');
      });
  }


  zarparEmbarque()
  {

    let ubicacionBuque = this.ubicacionDeBuquePuerto.find( e => e.orden=1);
    let embarqueActualizar = this.listadoEmbarques.find(x=>x.embarque.id = this.embarqueId)['embarque'];
    embarqueActualizar.ubicacionDeBuque =ubicacionBuque;
    this.embarqueService.modificarEmbarque(embarqueActualizar).subscribe( res => console.log(res) );

  }
  modificarEstadoBuque(estado: string){
    try {
      let estadoBuque = this.estadosBuque.find( e => e.descripcion.includes(estado));
      this.embarqueService.actualizarEstadoBuque(this.embarqueSelected.id, estadoBuque.id).subscribe( res => console.log(res) );
     this.zarparEmbarque();
    } catch (e) {
      console.log(e);
      console.log("Error al modificarEstadoBuque");
    }
  }

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

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
