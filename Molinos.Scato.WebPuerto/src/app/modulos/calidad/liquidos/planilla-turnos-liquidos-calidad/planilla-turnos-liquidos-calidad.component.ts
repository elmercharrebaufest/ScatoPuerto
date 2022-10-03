import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModuloDeCarga } from '@ScatoModels/modulo-carga';
import { Exportador } from "@ScatoModels/exportador";
import { MotivosDeCorte } from '@ScatoModels/planilla-turnos/motivo-de-corte';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { LineasService } from '@ScatoServicios/lineas.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { TurnosService } from '@ScatoServicios/turnos.service';
import { Workbook, Worksheet } from 'exceljs';
import * as fs from 'file-saver';
import { saveAs } from 'file-saver-es';
import { MessageService } from 'primeng/api';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Mail } from '@ScatoModels/mail';
import { PlanillaDeTurnos, TurnoDetalleLiquido, TurnoPuerto } from '@ScatoModels/planilla-turnos/planilla-de-turnos';
import { CorteTurno } from '@ScatoModels/planilla-turnos/corte-turno';
import { convertActionBinding, ConvertActionBindingResult } from '@angular/compiler/src/compiler_util/expression_converter';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { Embarque } from '@ScatoModels/embarque';
import { PlanoContentComponent } from 'app/modulos/lineup/plano-de-carga/plano-content/plano-content.component';
import { style } from '@angular/animations';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { Destino } from '@ScatoModels/destino';
import { Usuario } from '@ScatoInterfaces/usuario';
import { SessionService } from '@ScatoServicios/session.service';
import { ProcesoCalidadService } from '@ScatoServicios/procesoCalidad.service';
import { ObsCalidad } from '@ScatoModels/obs-calidad';
import { PlanillaTurnoLiquidoExcelService } from '@ScatoServicios/planilla-turno-liquido-excel';
import { EmbarqueSharingService } from '@ScatoServicios/embarque.shared.service';
import { PlanoDeCargaService } from '@ScatoServicios/plano-de-carga.service';


@Component({
  selector: 'app-planilla-turnos-liquidos-calidad',
  templateUrl: './planilla-turnos-liquidos-calidad.component.html',
  styleUrls: ['./planilla-turnos-liquidos-calidad.component.css']
})
export class PlanillaTurnoLiquidosCalidadComponent implements OnInit {
  @Output() hideSpinner = new EventEmitter<boolean>();
  @ViewChild(PlanoContentComponent, { static: false }) planoContent: PlanoContentComponent;
  @Input() tablerista: boolean;
  @Input() esSoloLectura: boolean = false;

  formTurnos: FormGroup;
  formCorte: FormGroup;
  formNuevoTurno: FormGroup;
  obsCalidadForm: FormGroup;
  formExportarExcel: FormGroup;
  formShipParticular: FormGroup;
  moduloCarga: ModuloDeCarga;
  exportadores: any[];
  lineas: any[];
  arrLineas: any[];
  partidas: any[];
  producto: any[];
  tanques: any[];
  hoy: any;
  bodegas: any[];
  productos: any[];
  destinos: any[];
  turnos = ['00-06', '06-12', '12-18', '18-24'];
  turnoPuerto: any[];
  motivosCorte: MotivosDeCorte[];
  idModuloDeCarga: number;
  planillaDeTurnos: PlanillaDeTurnos[];
  nuevoTurno: PlanillaDeTurnos;
  cortesTurno: CorteTurno[] = [];
  private user: Usuario
  mostrarBtn: boolean = true;

  embarqueId: number;
  embarque: Embarque;
  valorCargado: number;
  destinoPuerto: Destino[];
  cantidadTurnos: number;
  exportaPlanilla: boolean = false;
  constructor(
    private _builder: FormBuilder,
    private _modalService: NgbModal,
    private datePipe: DatePipe,
    private procesoCalidadService: ProcesoCalidadService,
    private session: SessionService,
    private _turnosService: TurnosService,
    private moduloCargaService: ModuloDeCargaService,
    private procesoService: DatosEmbarquesProcesoService,
    private planillaTurnoExcelService: PlanillaTurnoLiquidoExcelService,
    private lineasService: LineasService,
    private confirmationDialogService: ConfirmationDialogService,
    private embarqueSharingService: EmbarqueSharingService,
    private planoDeCargaService: PlanoDeCargaService,
    private workflowService: WorkflowService,
  ) {
    console.log('modulo de carga: ', this.procesoService.getModuloDeCarga());
    console.log('this._turnosService.getTnTotales(): ', this._turnosService.getTnTotales());
  }
  ngOnInit(): void {
    this.setCargarValoresPlanilla();
  }

  private setCargarFormularioPlanilla(){
    this.newForm()
    setTimeout(() => {
      this.fillPlanilla();
    }, 2000);
    this.initFormularioObs();
  }  

  private setCargarValoresPlanilla(){
    this.user = this.session.getUser();
    if(!this.esSoloLectura){
        this.embarqueId = this.procesoService.getEmbarqueId();
        this._turnosService.sendBodega.subscribe(res => {
        this.bodegas = res;
        if (this.formExportarExcel) this.addParcelChecks();
        this.getProductos();
        this.getDestinos();
        });
        this.setCargarFormularioPlanilla();
    }else{
        this.embarqueSharingService.getParametrosIdsEmbarque().subscribe(data=>{
          this.embarqueId = data.embarque_Id;
        });
        this.setCargarFormularioPlanilla();
    }
  }

  expandir() {
    document.getElementById('collapsePlanillaTurnosLiquidos').className = "collapse show";
  }

  desabilitarTurno() {
    this.mostrarBtn = false;
  }
  initShipParticular() {
    this.formShipParticular = this._builder.group({
      destino: [''],
      porteNeto: [],
      porteBruto: [],
      eslora: [],
      manga: [],
      puntal: [],
      fechaLibrePlatica: [''],
      horaLibrePlatica: [],
    })
  }

  isInvalidDate(date: Date): boolean {
    return date.getFullYear() < 2000 || date.getFullYear() > 2100;
  }

  newForm() {
    this.formTurnos = this._builder.group({
      diasTurno: this._builder.array([this.initDia()]),
    });

    this.formCorte = this._builder.group({
      motivosDeCorte: '0',
      horaInicio: '',
      horaFin: '',
      tiempoTotal: '',
      observaciones: ''
    });

    this.formNuevoTurno = this._builder.group({
      fecha: ""
    });

    this.formExportarExcel = this._builder.group({
      parcelSeleccionados: this._builder.array([]),
      filtroTurnos: ''
    });

    this.formCorte.get('tiempoTotal').disable();
    this.getCombos();
  }

  selectedNewTurno: number;

  addTurno(turno: any) {
    if (this.formNuevoTurno.value.fecha != null) {
      let fechaSplit = this.formNuevoTurno.value.fecha.split("-", 3);
      let fechaSeleccionada: Date = new Date(fechaSplit[0], fechaSplit[1] - 1, fechaSplit[2]);

      //Harcodeo una fecha de inicio mínima hasta que se controle por DB
      let fechaInicio: Date = new Date();
      let diaTurnoToAdd: number = -1;
      let exitFunction: boolean = false;

      fechaInicio.setDate(fechaInicio.getDate() - 10);
      if (this.formNuevoTurno.value.fecha != '') {
        if (fechaSeleccionada < fechaInicio || fechaSeleccionada > new Date()) {
          this.confirmationDialogService.confirm('¡Atención!', 'La fecha debe ser entre ' + fechaInicio.toLocaleString().split(', ')[0] + ' y ' + new Date().toLocaleString().split(', ')[0] + '.', 'Cerrar', '', null, null, Tipoalerta.Warning)
        } else {

          this.addTurnoFechaSeleccionada(turno, exitFunction, diaTurnoToAdd, fechaSeleccionada);
          //CIERRO EL MODAL
          //this._modalService.dismissAll();
        }
        //Si seleccionó una fecha revisamos en la planilla si el día tiene el turno disponible
      } else {
        this.confirmationDialogService.confirm('¡Atención!', 'Debes elegir una fecha para el turno.', 'Cerrar', '', null, null, Tipoalerta.Warning)
      }
    } else {
      this.confirmationDialogService.confirm('¡Atención!', 'Debes elegir una fecha para el turno.', 'Cerrar', '', null, null, Tipoalerta.Warning)
    }
  }

  addTurnoFechaSeleccionada(turno, exitFunction, diaTurnoToAdd, fechaSeleccionada) {

    //Si la fecha es válida tengo que revisar que el turno en esa fecha esté disponible.

    this.formTurnos.get('diasTurno')['controls'].forEach((dia, diaIndex) => {
      // //Si el día ya está agregado
      if (new Date(dia.controls.diaTurno.value).getFullYear() == fechaSeleccionada.getFullYear() &&
        new Date(dia.controls.diaTurno.value).getMonth() == fechaSeleccionada.getMonth() &&
        new Date(dia.controls.diaTurno.value).getDate() == fechaSeleccionada.getDate()) {
        dia.controls.turnos.controls.forEach(turnoLista => {
          if (turnoLista.value.turnoPuerto.turnoPuerto.id == turno) {
            this.confirmationDialogService.confirm('¡Atención!', 'El turno que deseas agregar no se encuentra disponible.', 'Cerrar', '', null, null, Tipoalerta.Warning)
            exitFunction = true;
          }
        });
        //El día ya existe en la lista
        diaTurnoToAdd = diaIndex;
      }
    });

    if (exitFunction) {
      return;
    }
    this.confirmationDialogService.confirm('Planilla de Liquido', '¿Esta seguro de querer agregar el turno seleccionado?', 'Aceptar', 'Cancelar', null, null, Tipoalerta.Warning)
      .then((confirmed) => {
        if (confirmed) {
          //Si llegamos hasta aca es porque tenemos que crear el turno.
          let turnoNuevo: PlanillaDeTurnos = new PlanillaDeTurnos();
          turnoNuevo.guardadoPorTablerista = false;
          turnoNuevo.fecha = fechaSeleccionada;
          turnoNuevo.fechaMiliseconds = fechaSeleccionada.getTime();
          this.moduloCargaService.obtenerTurnoPuerto().subscribe((res: TurnoPuerto[]) => {
            res.forEach((turnoPuerto: TurnoPuerto) => {
              if (turnoPuerto.id == turno) {
                turnoNuevo.turnoPuerto = turnoPuerto;

                //Si diaTurnoToAdd > -1 es porque el turno pertenecea un día existente y simplemente tengo que agregar el turno en ese día.
                if (diaTurnoToAdd > -1) {
                  this.setTurno(diaTurnoToAdd, turnoNuevo, true);
                  //Y ordenar el array del día correspondiente
                  this.formTurnos.get('diasTurno')['controls'][diaTurnoToAdd].controls.turnos;
                } else {
                  diaTurnoToAdd = 0;
                  this.setDia(null, turnoNuevo, fechaSeleccionada);
                }
              }
            })
          });
          this._modalService.dismissAll();
        }
      }).catch(() => {
        this._modalService.dismissAll()
      });


  }

  fillPlanilla() {
    this.planillaDeTurnos = (this.procesoService.getModuloDeCarga()?.moduloDeCargaPlanillaDeTurnos as PlanillaDeTurnos[]).filter(x => x.esLiquido == true && x.guardadoPorTablerista == true);
    this.diasTurno.clear();

    //Si la planilla tiene turnos
    if (this.planillaDeTurnos != undefined && this.planillaDeTurnos.length > 0) {
      this.cantidadTurnos = this.planillaDeTurnos.length;

      //Agrego variable de milisegundos (fecha) para poder ordenar
      this.planillaDeTurnos.forEach(element => {
        element.fechaMiliseconds = new Date(element.fecha).getTime();       
      });

      // Ordenamos los turnos por fecha y turno correspondiente
      this.planillaDeTurnos = this.planillaDeTurnos.sort((a, b) => {
        return (b.fechaMiliseconds - a.fechaMiliseconds);// && (b.turnoPuerto.orden - a.turnoPuerto.orden);
      });

      this.turnoPuerto = [];
      this.planillaDeTurnos.forEach((dia, indexDia) => {
        let exists: boolean = false;
        let dayIndex: number;

        //Me fijo si el día ya está agregado
        this.formTurnos.get('diasTurno')['controls'].forEach((element, indexDiaTurno) => {
          //Si el día ya está agregado
          if (new Date(dia.fecha).getDate() == new Date(element.value.diaTurno).getDate()) {
            exists = true;
          }
          dayIndex = indexDiaTurno;
        });

        //Si no existe el día, lo creo.
        if (!exists) {
          this.setDia(dia);
          dayIndex = this.diasTurno.length - 1;
        } else {
          //Si ya existe el día agrego 1 turno al array del día.

          this.setTurno(dayIndex, dia);
        }

        //Agrego detalles
        if (dia.moduloDeCargaPlanillaDeTurnosDetallesLiquido?.length > 0) {
          this.initTurnoDetalle(dia.moduloDeCargaPlanillaDeTurnosDetallesLiquido,
            this.diasTurno['controls'][dayIndex]['controls'].turnos,
            this.diasTurno['controls'][dayIndex]['controls'].turnos.length - 1);
        } else {
          this.initTurnoDetalle(null,
            this.diasTurno['controls'][dayIndex]['controls'].turnos,
            this.diasTurno['controls'][dayIndex]['controls'].turnos.length - 1);
        }

        //Agrego cortes
        if (dia.moduloDeCargaPlanillaDeTurnosCortes?.length > 0) {
          this.initTurnoCortes(dia.moduloDeCargaPlanillaDeTurnosCortes,
            this.diasTurno['controls'][dayIndex]['controls'].turnos,
            this.diasTurno['controls'][dayIndex]['controls'].turnos.length - 1);
        }

        //Agrego observaciones
        if (dia.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad?.length > 0) {
          this.initTurnoObservaciones(dia.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad,
            this.diasTurno['controls'][dayIndex]['controls'].turnos,
            this.diasTurno['controls'][dayIndex]['controls'].turnos.length - 1);
        }
      });

    }

    //Me obtengo la fecha del último día
    //let diaUltimoTurno;
    //let ultimoDiaIndex;
    if (this.diasTurno != undefined && this.diasTurno['controls'].length > 0) {
      //diaUltimoTurno = this.diasTurno['controls'][this.diasTurno['controls'].length - 1]['controls']['diaTurno']['value'];
      //ultimoDiaIndex = this.diasTurno['controls'].length - 1;

      const diasTurno = this.diasTurno['controls'];
      const ultimoDiaIndex = this.diasTurno['controls'].length - 1;
      const diaUltimoTurno = diasTurno[ultimoDiaIndex]['controls']['diaTurno']['value'];

      //Me fijo si ese día es hoy
      if (new Date().getDate() == new Date(diaUltimoTurno).getDate()) {
        //Si es hoy reviso el id del último turno
        const ultimoDiaRevIndex = [diasTurno[ultimoDiaIndex]['controls']['turnos']['controls'].length - 1];
        const idTurnoPuerto = diasTurno[ultimoDiaIndex]['controls']['turnos']['controls'][ultimoDiaRevIndex].value.turnoPuerto.turnoPuerto.id

        //Me traigo la hora actual (solo la hora, no me interesan los minutos.)
        let horaActual = new Date().getHours();

        //Me traigo el rango de horario del último turno y lo guardo en un array de 2 posiciones
        let rangoHorarios: string[] = this.turnos[idTurnoPuerto - 1].split('-');

        //Me fijo si la hora actual está dentro de ese rango.
        if (horaActual >= parseInt(rangoHorarios[0]) && horaActual < parseInt(rangoHorarios[1])) {
          //Si está dentro del rango quiere decir que ya existe el turno.
        } else {
          this.setTurnoODia(true, ultimoDiaIndex);
        }
      }
      else {
        this.setTurnoODia();
      }
    } else {
      this.setTurnoODia();
    }
  }

  setTurnoODia(soloTurno: boolean = false, diaIndex?: number) {
    return;
  }

  getValidaFecha(fechaTurno: Date, fechaActual: Date) {
    let bFechaValida: boolean = false;
    const anioTurno: number = fechaTurno.getFullYear();
    const mesTurno: number = fechaTurno.getMonth() + 1;
    const diaTurno: number = fechaTurno.getDate();

    const anioActual: number = fechaActual.getFullYear();
    const mesActual: number = fechaActual.getMonth() + 1;
    const diaActual: number = fechaActual.getDate();

    if (anioTurno == anioActual &&
      mesTurno == mesActual &&
      diaTurno == diaActual) {
      bFechaValida = true;
    }
    return bFechaValida;
  }

  setTurno(dia: number, Turno: PlanillaDeTurnos, esNuevoTurno?: boolean) {
    (this.diasTurno['controls'][dia]['controls'].turnos as FormArray).push(this.initTurno(Turno, esNuevoTurno));
  }

  setDia(dia: any, turno?: PlanillaDeTurnos, date?: Date) {
    this.diasTurno.push(this.initDia(dia, turno, date));
  }

  getDia(index: number) {
    //Calculo el día y lo convierto a dd--MM-yyyy
    return this.datePipe.transform(this.formTurnos.get('diasTurno')['controls'][index]['controls'].diaTurno.value, 'dd-MM-yyyy');
  }

  getCombos() {
    this.idModuloDeCarga = this.procesoService.getModuloDeCargaId();
    this.lineas = this.procesoService.getModuloDeCarga().moduloDeCargaLineasDeEmbarque;
    this.arrLineas = this.lineas;
    this.arrLineas = this.arrLineas.map(l => { return l = l.linea });
    this.arrLineas.filter((value, index, array) => {
      return array.indexOf(value) === index;
    })

    let exportadoresForm = this._turnosService.getExportadores();
    this.exportadores = new Array();
    for (let e of exportadoresForm) {
      if (e.exportador) this.exportadores.push(e.exportador);
    }

    this.bodegas = this._turnosService.getBodega();
    this.addParcelChecks();

    this.getDestinos();
    this.getProductos();
    this.getMotivosCorte();
  }

  deleteObsCalidad(ObsCalidad: any) {
    this.confirmationDialogService.confirm("Atención!", "Seguro desea eliminar la observación?", 'Aceptar', 'Cancelar', null, null, Tipoalerta.Success)
      .then((confirmed) => {
        if (confirmed) {
          this.moduloCargaService.eliminarObservacionDeCalidad(ObsCalidad.id)
            .subscribe(res => {
              this.moduloCargaService.obtenerModuloDeCarga(this.idModuloDeCarga).subscribe(resp => {
                if (resp.moduloDeCargaPlanillaDeTurnos.length > 0) {
                  this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeTurnos = [];
                  const selModuloDeCargaPlanillaDeTurnos = resp.moduloDeCargaPlanillaDeTurnos;
                  this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeTurnos = selModuloDeCargaPlanillaDeTurnos;
                  this.fillPlanilla();
                }

              });
            });
        } else {
          console.log('Eliminar Observación cancelado.')
        }
      })
      .catch(() => {
        console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)');
      });
  }

  addParcelChecks() {
    while (this.parcelSeleccionados.length !== 0) {
      this.parcelSeleccionados.removeAt(0)
    }
    this.bodegas.forEach(() => this.parcelSeleccionados.push(new FormControl(false)));
  }

  getMotivosCorte() {
    this.moduloCargaService.obtenerMotivosDeCorte().subscribe(
      res => {
        this.motivosCorte = res;
      }
    )
  }

  //Obtener los horarios de los turnos
  getTurnoPuerto() {
    this.moduloCargaService.obtenerTurnoPuerto().subscribe(
      res => {
        this.turnoPuerto = res;
        this.diasTurno['controls'].forEach((dia) => {
          dia['controls'].turnos = this._builder.array(
            res.map(turno => {
              const group = this.initTurno(turno.nombre);
              return group;
            }));
        })
      }
    )
  }

  get diasTurno(): FormArray {
    return this.formTurnos.get('diasTurno') as FormArray;
  }

  get parcelSeleccionados(): FormArray {
    return this.formExportarExcel.get('parcelSeleccionados') as FormArray;
  }

  getTurnos(dia): FormArray {
    const turno = this.diasTurno["controls"][dia]['controls'].turnos;
    return turno as FormArray;
  }

  getTurnoDetalles(d, t): FormArray {
    return this.getTurnos(d)['controls'][t]['controls'].moduloDeCargaPlanillaDeTurnosDetallesLiquido as FormArray;
  }

  getTurno2(d, t): FormArray {
    return this.getTurnos(d)['controls'][t] as FormArray;
  }

  getCorteTurnos(d, t): FormArray {
    return this.getTurnos(d)['controls'][t]['controls'].moduloDeCargaPlanillaDeTurnosCortes as FormArray;
  }

  getObservacionTurnos(d, t) {
    const observacionesCalidad = this.getTurnos(d)['controls'][t]['controls'].moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad  as FormArray;
    let listaObservacionesCalidad = observacionesCalidad.value;

    for(let observacion of listaObservacionesCalidad){ 
      observacion.fechaMiliseconds = new Date(observacion.fechaHora).getTime();
    }

    listaObservacionesCalidad = listaObservacionesCalidad.sort((a, b) => {
      return (a.fechaMiliseconds - b.fechaMiliseconds);
    });
    
    return listaObservacionesCalidad;
  }

  openModalNuevoTurno(modal) {
    this.formNuevoTurno.reset();

    this._modalService.open(modal, { windowClass: 'window-modal-corte', backdropClass: 'modal-corte' }).result.then(() => {

    })

  }
  initFormularioObs() {
    this.obsCalidadForm = this._builder.group({
      id: [''],
      fecha: ['', [Validators.required]],
      hora: ['', [Validators.required]],
      observaciones: ['', [Validators.required]],
      observacionVisible: true,
      userCarga: this.user.username

    })
  }
  openModalAgregarObsCalidad(modal) {
    this.formNuevoTurno.reset();

    this._modalService.open(modal, { windowClass: 'window-modal-corte', backdropClass: 'modal-corte', size: 'lg', centered: true }).result.then(() => {

    })
  }
  guardarObservacionesDeCalidad() {
    if (this.obsCalidadForm.controls.observaciones.value === '' || this.obsCalidadForm.controls.fecha.value === '' || this.obsCalidadForm.controls.hora.value === '')
      return;

    let { fecha, hora } = this.obsCalidadForm.getRawValue();
    let { observaciones, observacionVisible } = this.obsCalidadForm.getRawValue()
    let fechaHora = `${this.obsCalidadForm.controls.fecha.value} ${this.obsCalidadForm.controls.hora.value}`
    let fechaHoraIncorrecta = this.comparaFechaHoraObs(fecha, hora);

    // this.procesoCalidadService.guardarObservacionesDeCalidad(this.turnoPuerto.id, this.obsCalidadForm)
          //obtengo el turno en el que tengo que guardar
    let horaDate = new Date(fechaHora)
    let idTurnoPuerto = Math.floor(horaDate.getHours() / 6) + 1;
    //me traigo todos los turnos de la fecha seleccionada
    const planillaDeTurnoSel = this.planillaDeTurnos.filter(x => x.fecha.includes(fecha)).filter(x => x.turnoPuerto.id == idTurnoPuerto);
    if (planillaDeTurnoSel.length == 0){
      this.confirmationDialogService.confirm('¡Atención!', 'No se ha encontrado un turno para la fecha y hora seleccionada.', 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }
    if (planillaDeTurnoSel.length > 0){
      const esTurnoCerrado = planillaDeTurnoSel[0].guardadoPorRecibidor;
      if (esTurnoCerrado){
        this.confirmationDialogService.confirm('¡Atención!', 'No se puede agregar una observacion para un turno cerrado.', 'Cerrar', '', null, null, Tipoalerta.Warning)
        return;
      }
    }
    console.log('planillaDeTurnoSel--->>')
    console.log(planillaDeTurnoSel)

    let texto = fechaHoraIncorrecta ? "Fecha y hora mayor a la actual. Para poder continuar, debe completarlas correctamente." :
      "Desea guardar las observaciones de calidad?";

    this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', 'Cancelar', null, null, Tipoalerta.Warning)
      .then((confirmed) => {
        if (confirmed && !fechaHoraIncorrecta) {

          this.procesoCalidadService.setObsCalidad(this.obsCalidadForm.getRawValue());
          // this.obsCalidadForm.reset();

          let idPlanillaDeTurnos = planillaDeTurnoSel[0].id;

          let observacionCalidad = {
            fechaHora: fechaHora,
            observaciones: observaciones,
            observacionVisible: observacionVisible
          };

          this.procesoCalidadService.guardarObservacionesDeCalidad(idPlanillaDeTurnos, [observacionCalidad]).subscribe(res => {
            console.log("::::ObsDeCalidad RES:::::", res);


            this.moduloCargaService.obtenerModuloDeCarga(this.idModuloDeCarga).subscribe(resp => {
              if (resp.moduloDeCargaPlanillaDeTurnos.length > 0) {
                this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeTurnos = [];
                const selModuloDeCargaPlanillaDeTurnos = resp.moduloDeCargaPlanillaDeTurnos;
                this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeTurnos = selModuloDeCargaPlanillaDeTurnos;
                this.fillPlanilla();
              }
            });


          });
          this.obsCalidadForm.reset();
          this._modalService.dismissAll();
        }
        else
          this._modalService.dismissAll();
        return;
      }).catch(() => {
        this._modalService.dismissAll()
      });
  }
  comparaFechaHoraObs(fecha: any, hora: any): boolean {
    let lFechaHoraObs = fecha + ' ' + hora;
    let lFechaHoy = new Date();
    let lFechaObs = new Date(lFechaHoraObs);

    if (lFechaHoy.getTime() < lFechaObs.getTime()) {
      return true;
    } else
      return false;
  }

  onLineaChange(result: any, dia: number, turno: number, index: number) {
    const lineaFiltro = this.lineas.filter(linea => linea.id == result.value.linea);
    if (lineaFiltro.length > 0) {
      const lineaSel = lineaFiltro[0];
      const valueTk = lineaSel.tkInicial != null ? lineaSel.tkInicial : null;
      const valueMaterialPuerto = lineaSel?.materialPuerto != null ? lineaSel?.materialPuerto : null;

      let controSel = this.getTurnoDetalles(dia, turno);

      controSel['controls'][index]['controls'].tk.setValue(valueTk);
      controSel['controls'][index]['controls'].materialPuerto.setValue(valueMaterialPuerto);
    }
  }
  // updateObsCalidad(obsCalidad){
  //   this.obsCalidadForm.patchValue(obsCalidad);
  // }

  agregarCorteLiquido(dia, turno) {
    this.confirmationDialogService.confirm('Planilla de Liquido', '¿Esta seguro de querer agregar un corte en la hora indicada?', 'Aceptar', 'Cancelar', null, null, Tipoalerta.Warning)
      .then((confirmed) => {
        if (confirmed) {
          this.getCorteTurnos(dia, turno).push(this.initCorte(this.formCorte.getRawValue()));
        }
      }).catch(() => {
      });
  }
  openModalCorte(modal, dia, turno) {
    this.formCorte.reset();

    if (!this.getTurnos(dia)['controls'][turno]['controls'].guardadoPorTablerista.value) {
      this._modalService.open(modal, { windowClass: 'window-modal-corte', backdropClass: 'modal-corte' }).result.then(() => {
        this.agregarCorteLiquido(dia, turno);
      })
    } else {
      this.confirmationDialogService.confirm('¡Atención!', 'No puedes agregar un corte a un turno cerrado.', 'Cerrar', '', null, null, Tipoalerta.Warning)
    }

  }

  //Calcula el total de tiempo de los cortes
  calcularTotal() {
    let desde = this.formCorte.get('horaInicio').value ? this.formCorte.get('horaInicio').value.split(':') : '',
      hasta = this.formCorte.get('horaFin').value ? this.formCorte.get('horaFin').value.split(':') : '',
      f_desde = new Date(),
      f_hasta = new Date(),
      total = new Date();

    f_desde.setHours(desde[0], desde[1], 0, 0);
    f_hasta.setHours(hasta[0], hasta[1], 0, 0);

    total.setHours(f_hasta.getHours() - f_desde.getHours(), f_hasta.getMinutes() - f_desde.getMinutes(), 0, 0);

    if (total.getHours())
      this.formCorte.get('tiempoTotal').setValue(`${total.getHours() < 10 ? '0' + total.getHours() : total.getHours()}:${total.getMinutes() < 10 ? '0' + total.getMinutes() : total.getMinutes()}`)
  }

  
  getRowSpan(dia: any) {
    let contador = 0;
    for (let turnos of dia.controls.turnos.controls) {
      contador += this.getRowSpanTurnoCalc(turnos);
    }
    if(this.diasTurno.length == 1) {
      contador += 1;
    }else{
      contador++;
    }
    return contador;
  }
  getRowSpanTurnoCalc(turno: any) {

    let registroLiquido = turno.controls['moduloDeCargaPlanillaDeTurnosDetallesLiquido'].controls.length;
    let registroCorte = turno.controls['moduloDeCargaPlanillaDeTurnosCortes'].controls.length;
    let registroCalidad = turno.controls['moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad'].controls.length;

    registroLiquido = registroLiquido > 0 && registroLiquido; // tamaño del detalle de cada turno
    registroCorte = registroCorte > 0 ? 1 : 1; // tamaño del corte
    registroCalidad = registroCalidad > 0 ? 1 : 1; // tamaño de la observacion
    registroLiquido += 2;
    let numeroRegistros = registroLiquido + registroCorte + registroCalidad;
    return numeroRegistros;
  }
  getRowSpanTurno(turno: any) {

    let registroLiquido = turno.controls['moduloDeCargaPlanillaDeTurnosDetallesLiquido'].controls.length;
    let registroCorte = turno.controls['moduloDeCargaPlanillaDeTurnosCortes'].controls.length;
    let registroCalidad = turno.controls['moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad'].controls.length;

    registroLiquido = registroLiquido > 0 && registroLiquido; // tamaño del detalle de cada turno
    registroCorte = registroCorte > 0 ? 1 : 1; // tamaño del corte
    registroCalidad = registroCalidad > 0 ? 1 : 1; // tamaño de la observacion
    registroLiquido += 2;
    let numeroRegistros = registroLiquido + registroCorte + registroCalidad;
    return numeroRegistros;
  }

  getTurnoHorario(dia, turno) {
    let fecha = new Date();
    let horario = fecha.getHours();

    //Busca dentro de los 4 turnos, un turno cuyo horario sea entre (REF: 0-6) el horario buscado
    let returnHorario = this.turnoPuerto.find(h => horario >= Number(h.nombre.split('-')[0]) && horario < Number(h.nombre.split('-')[1]));
    this.getTurnos(dia)['controls'][turno]['controls'].turnoPuerto.setValue(returnHorario);
    return returnHorario;
  }


  sendRitmos(dia, turno) {
    this._turnosService.setTurnos(this.getTurnos(dia).controls[turno].value)
  }

  getCantTurno(t) {
    let contador = 0;
    // return 0;
    for (let turno of t['controls']['moduloDeCargaPlanillaDeTurnosDetallesLiquido'].controls) {
      contador += turno.controls.cantidad.value ? turno.controls.cantidad.value : 0;
      contador = parseInt(contador.toString());
    }
    return contador;
  }

  getCantDia(d) {
    let contador = 0;
    // return 0;
    for (let turno of d['controls']['turnos']['controls']) {
      contador += this.getCantTurno(turno);
      contador = parseInt(contador.toString());
    }
    return contador;
  }

  getCantTotalABordo() {
    let contador = 0;
    // return 0;
    for (let dia of this.formTurnos['controls']['diasTurno']['controls']) {
      contador += this.getCantDia(dia);
      contador = parseInt(contador.toString());
    }
    return contador;
  }

  initDia(dia?: any, turno?: PlanillaDeTurnos, date?: Date) {
    if (dia != null) {
      return this._builder.group({
        turnos: this._builder.array([this.initTurno(dia)]),
        diaTurno: dia.fecha
      });
    } else {
      return this._builder.group({
        // turnos: this._builder.array([this.initTurno()]),
        // diaTurno: null
        turnos: this._builder.array([this.initTurno(turno, true)]),
        diaTurno: date ? date : new Date()
      });
    }
  }

  initTurnoDetalle(detalle: TurnoDetalleLiquido[], turno: PlanillaDeTurnos, turnoIndex?: number) {
    let planillaTurnoDetalles = turno['controls'][turnoIndex]['controls']['moduloDeCargaPlanillaDeTurnosDetallesLiquido'];

    if (detalle != null) {
      if (detalle.length > 0) {
        detalle.forEach(element => {
          (planillaTurnoDetalles as FormArray).push(this.initLinea(element, true));
        });

        //HAGO ESTO PARA COMPLETAR CON LINEAS VACÝAS HASTA LLEGAR A 4.
        // for (let i = detalle.length; i < 4; i++) {
        //   (turno['controls'][turnoIndex]['controls']['moduloDeCargaPlanillaDeTurnosDetallesLiquido'] as FormArray).push(this.initLinea(null, true));
        // }
      }
      //Si no hay detalles completo con 4 lineas vacías.
    } else {
      for (let i = 1; i <= 4; i++) {
        (turno['controls'][turnoIndex]['controls']['moduloDeCargaPlanillaDeTurnosDetallesLiquido'] as FormArray).push(this.initLinea(null, true));
      }
    }
  }

  initTurnoCortes(corte: CorteTurno[], turno: PlanillaDeTurnos, turnoIndex?: number) {
    corte.forEach(element => {
      (turno['controls'][turnoIndex]['controls']['moduloDeCargaPlanillaDeTurnosCortes'] as FormArray).push(this.initCorte(element, turno['controls'][0]['controls'].cerrado.value));
    });
  }

  initTurnoObservaciones(corte: ObsCalidad[], turno: PlanillaDeTurnos, turnoIndex?: number) {
    corte.forEach(element => {
      (turno['controls'][turnoIndex]['controls']['moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad'] as FormArray).push(this.initObservacion(element, true));
    });
  }

  initTurno(turnoPuerto?: PlanillaDeTurnos, esNuevoTurno?: boolean) {
    let fg: FormGroup;


    if (!esNuevoTurno) {
      fg = this._builder.group({
        moduloDeCargaPlanillaDeTurnosDetallesLiquido: this._builder.array([]),
        moduloDeCargaPlanillaDeTurnosCortes: this._builder.array([]),
        moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad: this._builder.array([]),
        guardadoPorTablerista: turnoPuerto ? turnoPuerto.guardadoPorTablerista : false,
        guardadoPorRecibidor: turnoPuerto ? turnoPuerto.guardadoPorRecibidor : false,
        cerrado: turnoPuerto ? turnoPuerto.guardadoPorTablerista : false,
        turnoPuerto: turnoPuerto ?? null,
        id: turnoPuerto ? turnoPuerto.id : '0'
      });
    } else {
      fg = this._builder.group({
        moduloDeCargaPlanillaDeTurnosDetallesLiquido: this._builder.array([this.initLinea(), this.initLinea(), this.initLinea(), this.initLinea()]),
        moduloDeCargaPlanillaDeTurnosCortes: this._builder.array([]),
        moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad: this._builder.array([]),
        guardadoPorTablerista: turnoPuerto ? turnoPuerto.guardadoPorTablerista : false,
        guardadoPorRecibidor: turnoPuerto ? turnoPuerto.guardadoPorRecibidor : false,
        cerrado: turnoPuerto ? turnoPuerto.guardadoPorTablerista : false,
        turnoPuerto: turnoPuerto ?? null,
        id: turnoPuerto ? turnoPuerto.id : '0'
      });
    }

    return fg;
  }

  compareFields(c1: Exportador, c2: Exportador) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  initLinea(line?: any, guardado?: boolean) {
    let destino = 0;
    if (line != null || line != undefined) {
      destino = line.destino?.id;
    }
    return this._builder.group({
      linea: [{ value: line ? line.linea_Id : '', disabled: guardado },],
      exportador: [{ value: line ? line.exportador : '', disabled: guardado }],
      bodegaParcel: [{ value: line ? line.bodegaParcel : '', disabled: guardado }],
      materialPuerto: [{ value: line ? line.materialPuerto : '', disabled: guardado }],
      tk: [{ value: line ? line.tk : '', disabled: guardado }],
      temperatura: [{ value: line ? line.temperatura : '', disabled: guardado }],
      medidaInicialCM: [{ value: line ? line.medidaInicialCM : '', disabled: guardado }],
      medidaInicialMM: [{ value: line ? line.medidaInicialMM : '', disabled: guardado }],
      medidaFinalCM: [{ value: line ? line.medidaFinalCM : '', disabled: guardado }],
      medidaFinalMM: [{ value: line ? line.medidaFinalMM : '', disabled: guardado }],
      destino: [{ value: destino, disabled: guardado }],
      cantidad: [{ value: line ? parseInt(line.cantidad) : '', disabled: guardado }],
      id: [{ value: line ? line.id : null, disabled: guardado }]
    })
  }

  initCorte(corte?: any, guardado?: boolean) {
    if (corte != null) {
      return this._builder.group({
        motivosDeCorte: [{ value: corte.motivosDeCorte ? corte.motivosDeCorte : '', disabled: guardado }, Validators.required],
        horaInicio: [{ value: corte.horaInicio, disabled: guardado }, Validators.required],
        horaFin: [{ value: corte.horaFin, disabled: guardado }, Validators.required],
        tiempoTotal: [{ value: corte.tiempoTotal, disabled: guardado }, Validators.required],
        observaciones: [{ value: corte.observaciones, disabled: guardado }, Validators.required],
        id: [{ value: corte.id, disabled: guardado }, Validators.required]
      })
    }
  }


  initObservacion(observacion?: any, cerrado?: boolean) {
    let fechaObs = '';
    let horaObs = '';
    let fechaHora = observacion.fechaHora;
    if (observacion.fechaHora != undefined) {
      if (observacion.fechaHora != null) {
        fechaObs = this.formatoFechaHora(true, observacion.fechaHora)
        horaObs = this.formatoFechaHora(false, observacion.fechaHora)
      }
    }
    if (observacion != null) {
      return this._builder.group({
        fecha: [{ value: fechaObs, disabled: true }, Validators.required],
        hora: [{ value: horaObs, disabled: true }, Validators.required],
        fechaHora: [{ value: fechaHora, disabled: true }, Validators.required],
        observaciones: [{ value: observacion.observaciones, disabled: true }, Validators.required],
        id: [{ value: observacion.id, disabled: true }, Validators.required]
      })
    }
  }


  getToneladasParcelDia(bodega: number, d: number) {
    let dia = this.getTurnos(d);
    let cantidad = 0;
    // return 0;
    for (let turno of dia.controls) {
      for (let linea of turno['controls']['moduloDeCargaPlanillaDeTurnosDetallesLiquido']['controls']) {
        cantidad += (linea.controls.bodegaParcel.value == bodega ? Number(linea.controls.cantidad.value) : 0);
        cantidad = parseInt(cantidad.toString());
      }
    }
    return cantidad;
  }

  getToneladasParcelTurno(bodega: number, d: number, t: number) {
    let turno = this.getTurnoDetalles(d, t);
    let cantidad = 0;
    // return 0;
    for (let linea of turno.controls) {
      cantidad += (linea['controls'].bodegaParcel.value == bodega ? Number(linea['controls'].cantidad.value) : 0);
      cantidad = parseInt(cantidad.toString());
    }
    return cantidad;
  }

  getToneladasLinea(value: string) {
    let contador = 0;
    // return 0;
    this.diasTurno.controls.forEach(dia => {
      const turnos = dia['controls']['turnos']['controls'];
      turnos.forEach(turno => {
        const lineaTurnos = turno['controls']['moduloDeCargaPlanillaDeTurnosDetallesLiquido']['controls'];
        lineaTurnos.forEach(linea => {
          if (linea.get('linea').value != '') {
            const lineaId = linea.get('linea').value;
            const lineaFiltro = this.lineas.filter(linea => linea.id == lineaId);
            if (lineaFiltro.length > 0) {
              const lineaSel = lineaFiltro[0];
              const lineaValue = lineaSel.linea != null ? lineaSel.linea : '';
              contador += (lineaValue.toLowerCase() == value ? Number(linea.get('cantidad').value) : 0);
              contador = parseInt(contador.toString());
            }
          }
        })
      });
    })
    return contador;
  }

  getProductos() {
    this.productos = new Array();
    this.bodegas.forEach(b => {
      if (b.materialPuerto && !this.productos.find(p => p == b.materialPuerto)) {
        this.productos.push(b.materialPuerto)
      }
    })
  }

  getDestinos() {
    this.destinos = new Array();
    this.bodegas.forEach(b => {
      if (!this.destinos.find(d => d.nombre == b.destino)) {
        this.destinos.push(b.destino);
      }
    })
  }

  getCantidadLinea(linea: any) {
    let lineaTurno = linea?.controls;
    if (lineaTurno?.medidaInicialCM.value &&
      lineaTurno?.medidaInicialMM.value &&
      lineaTurno?.medidaFinalCM.value &&
      lineaTurno?.medidaFinalMM.value &&
      lineaTurno?.tk.value &&
      lineaTurno?.temperatura &&
      lineaTurno?.materialPuerto) {
      const medidaInicialCM = lineaTurno?.medidaInicialCM.value;
      const medidaInicialMM = lineaTurno?.medidaInicialMM.value;
      const medidaFinalCM = lineaTurno?.medidaFinalCM.value;
      const medidaFinalMM = lineaTurno?.medidaFinalMM.value;
      const tkLinea = lineaTurno?.tk.value.toString().padStart(3, "0");;
      const temperatura = lineaTurno?.temperatura.value;
      const materialPuerto = lineaTurno?.materialPuerto?.value.id

      Promise.all([
        //await
        this.lineasService.obtenerLlenadoMilimetroPorTanque(medidaInicialCM, medidaInicialMM, tkLinea).toPromise(),
        this.lineasService.obtenerLlenadoMilimetroPorTanque(medidaFinalCM, medidaFinalMM, tkLinea).toPromise(),
        this.lineasService.obtenerDensidadPorTemperaturaDeMaterial(materialPuerto, temperatura).toPromise()
      ]).then(([inicial, final, densidad]) => {
        inicial = inicial != null ? inicial : 0;
        final = final != null ? final : 0;
        let cantidad = (Number(inicial) - Number(final)) * Number(densidad);
        lineaTurno.cantidad.setValue(cantidad);
      })

    }
  }

  async onExportarExcelLiquido(esEnviarPlanilla: boolean = false){
    this.exportaPlanilla = true;
    await this.planillaTurnoExcelService.generarExcelPorParcel(this.procesoService, this.planillaDeTurnos, this.lineas, esEnviarPlanilla, true);
    this.exportaPlanilla = false;
  }

  private formatoFechaHora(esFecha, fecha) {
    let formatoFecha = '';
    const fechaHora = new Date(fecha);
    if (esFecha) {
      formatoFecha = ("00" + fechaHora.getDate()).slice(-2) + '/' +
        ("00" + (fechaHora.getMonth() + 1)).slice(-2) + '/' +
        fechaHora.getFullYear().toString();
    } else {
      formatoFecha = ("00" + fechaHora.getHours()).slice(-2) + ':' +
        ("00" + fechaHora.getMinutes()).slice(-2)
    }
    return formatoFecha;
  }

  guardarTurnoGeneral(dia, turno, enviado: boolean = false) {
    let Turno: PlanillaDeTurnos = this.getTurnos(dia)['controls'][turno]['controls'];

    try {

      let moduloDeCargaPlanillaDeTurnosCortes = [];
      let moduloDeCargaPlanillaDeTurnosDetallesLiquido = [];

      for (const index in Turno.moduloDeCargaPlanillaDeTurnosCortes['controls']) {
        moduloDeCargaPlanillaDeTurnosCortes.push(Turno.moduloDeCargaPlanillaDeTurnosCortes['controls'][index].value);

      }

      for (const index in Turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido['controls']) {
        const turnoDetalle = Turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido['controls'][index];


        const turnoDestinoSel = this.destinos.filter(destino => destino.id === turnoDetalle.value.destino)
        const turnoDestinoVal = turnoDestinoSel.length > 0 ? turnoDestinoSel[0] : 0
        const lineaIdVal = turnoDetalle.value.linea;
        const tkVal = turnoDetalle['controls'].tk.value;
        const bodegaParcelVal = turnoDetalle.value.bodegaParcel;
        const materialPuertoVal = turnoDetalle['controls'].materialPuerto.value;

        if (turnoDestinoVal != '0' && lineaIdVal != '' &&
          tkVal != '' && bodegaParcelVal != '' &&
          materialPuertoVal != '') {

          const objTurnosDetalles = {
            bodegaParcel: turnoDetalle.value.bodegaParcel,
            cantidad: turnoDetalle['controls'].cantidad.value != '' ? turnoDetalle['controls'].cantidad.value : 0,
            destino: turnoDestinoVal,
            exportador: turnoDetalle.value.exportador,
            id: turnoDetalle.value.id,
            linea_id: turnoDetalle.value.linea,
            medidaFinalCM: turnoDetalle.value.medidaFinalCM != '' ? turnoDetalle.value.medidaFinalCM : 0,
            medidaFinalMM: turnoDetalle.value.medidaFinalMM != '' ? turnoDetalle.value.medidaFinalMM : 0,
            medidaInicialCM: turnoDetalle.value.medidaInicialCM != '' ? turnoDetalle.value.medidaInicialCM : 0,
            medidaInicialMM: turnoDetalle.value.medidaInicialMM != '' ? turnoDetalle.value.medidaInicialMM : 0,
            temperatura: turnoDetalle.value.temperatura != '' ? turnoDetalle.value.temperatura : 0,
            MaterialPuerto: turnoDetalle['controls'].materialPuerto.value,
            Tk: turnoDetalle['controls'].tk.value
          }
          moduloDeCargaPlanillaDeTurnosDetallesLiquido.push(objTurnosDetalles);
        }
      }
      console.log('Turno--->>>')
      console.log(Turno)
      let planillaTurno = {
        Fecha: Turno.turnoPuerto['value'].fecha,
        esLiquido: true,
        guardadoPorTablerista: Turno.guardadoPorTablerista['value'],
        guardadoPorRecibidor: true,
        id: Turno.id['value'],
        moduloDeCargaPlanillaDeTurnosCortes: moduloDeCargaPlanillaDeTurnosCortes,
        moduloDeCargaPlanillaDeTurnosDetallesLiquido: moduloDeCargaPlanillaDeTurnosDetallesLiquido,
        turnoPuerto: Turno.turnoPuerto['value'].turnoPuerto
      }

      this.confirmationDialogService.confirm(enviado ? "Cerrar turno" : "Guardar turno", "Está seguro que desea " + (enviado ? "cerrar" : "guardar") + " el turno?", "Aceptar", "Cancelar")
        .then((confirmed) => {
          if (confirmed) {
            planillaTurno.guardadoPorRecibidor = true;
            this.moduloCargaService.guardarTurnoPlanillaDeTurnos(planillaTurno, this.idModuloDeCarga, enviado).subscribe(res => {

              this.confirmationDialogService.confirm('¡Atención!', 'Se guardaron los cambios en el turno correctamente', 'Aceptar', '', null, null, Tipoalerta.Success);

              this.moduloCargaService.obtenerModuloDeCarga(this.idModuloDeCarga).subscribe(resp => {
                if (resp.moduloDeCargaPlanillaDeTurnos.length > 0) {
                  this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeTurnos = [];
                  const selModuloDeCargaPlanillaDeTurnos = resp.moduloDeCargaPlanillaDeTurnos;
                  this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeTurnos = selModuloDeCargaPlanillaDeTurnos;
                  this.fillPlanilla();
                }
              });
            }, error => {
              console.log(error);
              this.confirmationDialogService.confirm("¡Error!", "No se ha podido " + enviado ? "cerrar" : "guardar" + " el turno.", "Cerrar", "", null, null, Tipoalerta.Error)
            })
          }
        })
        .catch((e) => {
          this.hideSpinner.emit(false)
          return;
        });

    } catch (error) {
      console.error(error);
    }
  };

}
