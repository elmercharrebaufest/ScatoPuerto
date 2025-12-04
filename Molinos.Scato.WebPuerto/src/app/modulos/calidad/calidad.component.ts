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
  buqueEnMuelleSanBenito: boolean = true;
  buqueEnMuelleVicentin: boolean = false;
  buqueEnMuelleNoryon: boolean = false;
  muelleActual: string = "sanBenito";

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
  periodoDeCarga: PeriodoDeCarga;
  estadoBuque: EstadoBuque;
  estadosBuque = [{ id: 1, descripcion: 'PreOperativo' },
  { id: 2, descripcion: 'Cargando' },
  { id: 3, descripcion: 'ControlCalidad' },
  { id: 4, descripcion: 'PostOperativo' }];
  esLiquido: boolean = false;

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
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router,
    private moduloDeCargaService: ModuloDeCargaService,
    private auth: AutenticadorService
  ) {
  }

  ngOnInit(): void {
    this.inicializacion();
    this.lineUpService.obtenerListadoUbicacionDeBuquePuerto().subscribe(res => { this.ubicacionDeBuquePuerto = res; });
    this.embarque = this._procesoService.getEmbarqueSelected();
    this.trabajoOrdenado();
  }

  inicializacion(): void {
    this.auth.renovarAuthUsuario();
    this.unsubscribe = new Subject();
    this.embarqueService.obtenerListadoMateriales().subscribe(mat => this.materialesPuerto = mat);
    this.moduloDeCarga_Id = this._procesoService.getModuloDeCargaId();
    this.parametrosService.obtenerParametros().subscribe(res => this.parametrosService.setParametros(res));

    this.procesoCalidadService.sendBuqueCambiaEstado.subscribe(res => this.trabajoOrdenado());
    this.escuchaActualizacionNavtabs();
    this.escuchaFinalizarHijos();
  }

  escuchaActualizacionNavtabs() {
    this._procesoService.sendSeActualizoEmbarque.subscribe(res => {
      this.embarqueId = this._procesoService.getEmbarqueId();
      this.moduloDeCarga_Id = this._procesoService.getModuloDeCargaId();
      this.moduloDeCargaService.obtenerModuloDeCarga(this.moduloDeCarga_Id)
        .subscribe(res => this.periodoDeCarga = res.moduloDeCargaPeriodoDeCarga[0] ? res.moduloDeCargaPeriodoDeCarga[0] : null);

      setTimeout(() => this.estadoBuque = this._procesoService.getEstadoBuque(), 3000);
    });
  }

  escuchaFinalizarHijos() {
    this.calidadSharedService.sendFinalizaEnCalidad
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((esLiquido: boolean) => this.finalizaEnCalidad(esLiquido));
  }

  trabajoOrdenado() {
    forkJoin({
      obtenerListado: this.workflowService.obtenerListado(),
      listarEmbarquesEnLineUp: this.workflowService.listarEmbarquesEnLineUpCalidad()
    })
      .subscribe((res: {
        obtenerListado: InstanciaWorkflowPuerto[],
        listarEmbarquesEnLineUp: EmbarqueNav[]
      }) => {
        this.listadoEmbarques = res.obtenerListado;

        this.embarquesEnLineUpSinFiltrar = res.listarEmbarquesEnLineUp;
        let sanBenitoCargandoMuelle = this.listadoEmbarques.find(m => m.embarque.sanBenito && m.embarque?.estadoBuque?.descripcion.includes('ControlCalidad') || m.embarque?.estadoBuque?.descripcion.includes('Cargando'));
        let posicion = 0;
        if (sanBenitoCargandoMuelle != null || sanBenitoCargandoMuelle != undefined) {
          let filtroSanBenito = this.listadoEmbarques.filter(x => x.embarque.id == sanBenitoCargandoMuelle.embarque.id && x.embarque.sanBenito);
          if (filtroSanBenito != null) {
            posicion++;
            filtroSanBenito[0].posicion = posicion;
          }
        }
        let filtroSanBenito = this.listadoEmbarques.filter(x => x.embarque.sanBenito);
        filtroSanBenito.forEach(item => {
          if (item.embarque.id != sanBenitoCargandoMuelle?.embarque?.id) {
            posicion++;
            item.posicion = posicion;
          }
        });

        this.filtrarMuelles();

        let embSanBenitoEnLineUp = this.embarquesEnLineUpSinFiltrar.find(m => m.id == this.buqueEnSanBenito?.embarque.id);
        let embVicentinEnLineUp = this.embarquesEnLineUpSinFiltrar.find(m => m.id == this.buqueEnVicentin?.embarque.id);
        let embNoryonEnLineUp = this.embarquesEnLineUpSinFiltrar.find(m => m.id == this.buqueEnNoryon?.embarque.id);

        if (embSanBenitoEnLineUp != null && embSanBenitoEnLineUp == undefined) {
          let filtro = this.listadoEmbarques.find(x => x.embarque.id == embSanBenitoEnLineUp.id);
          if (filtro != null && filtro == undefined)
            embSanBenitoEnLineUp.posicion = filtro.posicion;
        }

        if (embSanBenitoEnLineUp) this.embarquesEnLineUp.push(embSanBenitoEnLineUp);
        if (embVicentinEnLineUp) this.embarquesEnLineUp.push(embVicentinEnLineUp);
        if (embNoryonEnLineUp) this.embarquesEnLineUp.push(embNoryonEnLineUp);

        this._procesoService.setEmbarquesList(this.embarquesEnLineUp);
        this.embarque = this._procesoService.getEmbarqueSelected();
        this.embarqueId = this._procesoService.getEmbarqueId();

        if (this.embarqueId) {
          res.obtenerListado.forEach(x => x.embarque.id === this.embarqueId ?? this.barquitos.push(x));
          if (this.barquitos) {
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

    // Filtro los buques de cada muelle. Buque que esta cargando en el muelle
    this.buqueEnSanBenito = this.listadoEmbarques ? this.listadoEmbarques
      .filter(i => i.embarque.sanBenito || (!i.embarque.vicentin && !i.embarque.otrosMuelles && !i.embarque.noryon))
      .find(m => m.embarque.estadoBuque?.id == idEstadoCargando) : undefined;

    //Para buques de otros puertos se filtran por Posicion de lineUp 1 y estado de buque -> Cargando en muelle.
    this.buqueEnNoryon = this.listadoEmbarques ? this.listadoEmbarques.find(i => i.embarque.noryon && i.embarque.ubicacion == 2 && i.lineUp.orden == 1)
      : undefined;

    this.buqueEnVicentin = this.listadoEmbarques ? this.listadoEmbarques.find(i => i.embarque.vicentin && i.embarque.ubicacion == 2 && i.lineUp.orden == 1)
      : undefined;

    //Para otros muelles calidad no se muestra.
    this.buqueEnOtrosMuelles = undefined;

    this.procesoCalidadService.setSanBenito(this.buqueEnSanBenito);
    this.procesoCalidadService.setNoryoun(this.buqueEnNoryon);
    this.procesoCalidadService.setVicentin(this.buqueEnVicentin);
    this.procesoCalidadService.setOtrosMuelles(this.buqueEnOtrosMuelles);
  }

  /**
   * Se utiliza mediante un EventEmitter disparado desde sus componentes hijos para reutilizar código.
   */
  finalizaEnCalidad(esLiquido: boolean) {

    if (esLiquido) {
      let fechaFinalizacionCarga = this.periodoDeCarga != null ? this.periodoDeCarga.fechaFinalizacionCarga : null;
      let horaFinalizacionCarga = this.periodoDeCarga != null ? this.periodoDeCarga.horaFinalizacionCarga : null;

      if (fechaFinalizacionCarga == null || horaFinalizacionCarga == null) {
        this.confirmationDialogService.confirm('¡Atención!', 'La fecha y hora de finalización de carga debe estar completa.', 'Aceptar', '', null, null, Tipoalerta.Warning)
      } else {
        this.consultaCambioDeEstado();
      }
    } else {
      let estadoBuque = this.estadoBuque.descripcion.includes('ControlCalidad');
      if (estadoBuque)
        this.consultaCambioDeEstado();
      else
        this.confirmationDialogService.confirm('¡Atención!', 'El buque continua en estado "Cargando".', 'Aceptar', '', null, null, Tipoalerta.Warning)
    }
  }

  consultaCambioDeEstado() {
    //let texto = "Desea cambiar el estado del embarque a PostOperativo?";
    let texto = "Desea zarpar el embarque?";

    this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', 'Cancelar', null, null, Tipoalerta.Success)
      .then((confirmed) => {
        if (confirmed) {
          this.modificarEstadoBuque('PostOperativo');
          //this.zarparEmbarque();
          //     this._buqueService.GuardarHistoricoOperador(this.embarqueSelected.id, "Finalizó embarque").subscribe();

          this.lineUpService.sendRecargarListado(true);
          InstanciaWorkflowPuerto
          this.router.navigate(['/lineup']);
        } else
          console.log('Close: Finalizar Tablerista');
      })
      .catch(() => {
        console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)');
      });
  }

  zarparEmbarque() {
    let ubicacionBuque = this.ubicacionDeBuquePuerto.find(e => e.orden = 1);
    let embarqueActualizar = this.listadoEmbarques.find(x => x.embarque.id == this.embarqueId)['embarque'];
    embarqueActualizar.ubicacionDeBuque = ubicacionBuque;
    this.embarqueService.modificarEmbarque(embarqueActualizar).subscribe(res => console.log(res));

  }

  modificarEstadoBuque(estado: string) {
    try {
      let estadoBuque = this.estadosBuque.find(e => e.descripcion.includes(estado));
      this.embarqueService.actualizarEstadoBuque(this.embarqueSelected.id, estadoBuque.id).subscribe(res => console.log(res));
      this.zarparEmbarque();
    } catch (e) {
      console.log(e);
      console.log("Error al modificarEstadoBuque");
    }
  }

  getDate(fecha: Date): string {
    let fechaDate = new Date(fecha);
    let date = fechaDate.getDate() + "-" + fechaDate.getMonth() + "-" + fechaDate.getFullYear();
    return date;
  }

  getHour(fecha: Date): string {
    let hour = fecha.toString().substr(11, 5);
    return hour;
  }

  getDescripcionCortaMaterial(materialId: number): string {
    if (!materialId) return '';

    let materialesPuerto = this.materialesPuerto.find(x => x.id == materialId);
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

  /*changeEmbarque(embarque: any) {
    this.mostrarCargas = false;
    this.mostrarSpinner = true;
    //this.embarqueSelected = this._procesoService.getEmbarqueSelected();
    this.embarqueSelected = embarque;

    console.log("EMBARQUE SELECCIONADO", this.embarqueSelected);

    //Inicializan banderas cuando se cambia de item en nav.
    this.buqueEnMuelleSanBenito = false;
    this.buqueEnMuelleNoryon = false;
    this.buqueEnMuelleVicentin = false;

    if (this.embarqueSelected.muelle == "sanBenito") {
      this.buqueEnMuelleSanBenito = true;
    } else if (this.embarqueSelected.muelle == "vicentin") {
      this.buqueEnMuelleVicentin = true;
      this.mostrarSpinner = false;
    } else {
      this.buqueEnMuelleNoryon = true;
      this.mostrarSpinner = false;
    }
  }*/

  changeEmbarque(embarque: any) {
    setTimeout(() => {
      this.mostrarCargas = false;
      this.mostrarSpinner = true;      

      this.embarqueSelected = embarque;
      console.log("EMBARQUE SELECCIONADO", this.embarqueSelected);
      this.esLiquido = this.embarqueSelected.esLiquido;

      this.moduloDeCarga_Id = this.embarqueSelected.moduloDeCargaId;        

      // Reiniciar banderas
      this.buqueEnMuelleSanBenito = false;
      this.buqueEnMuelleNoryon = false;
      this.buqueEnMuelleVicentin = false;

      if (this.embarqueSelected.muelle === "sanBenito") {
        this.buqueEnMuelleSanBenito = true;
      } else if (this.embarqueSelected.muelle === "vicentin") {
        this.buqueEnMuelleVicentin = true;
        this.mostrarSpinner = false;        
      } else {
        this.buqueEnMuelleNoryon = true;
        this.mostrarSpinner = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
