import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModuloDeCarga } from '@ScatoModels/modulo-carga';
import { Exportador } from "@ScatoModels/exportador";
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { TurnosService } from '@ScatoServicios/turnos.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { PlanillaDeTurnos, TurnoDetalleSolido, TurnoPuerto } from '@ScatoModels/planilla-turnos/planilla-de-turnos';
import { CorteTurno } from '@ScatoModels/planilla-turnos/corte-turno';
import { Embarque } from '@ScatoModels/embarque';
import { PlanoContentComponent } from 'app/modulos/lineup/plano-de-carga/plano-content/plano-content.component';
import { ObsCalidad } from '@ScatoModels/obs-calidad';
import { Usuario } from '@ScatoInterfaces/usuario';
import { SessionService } from '@ScatoServicios/session.service';
import { ProcesoCalidadService } from '@ScatoServicios/procesoCalidad.service';
import { PlanillaTurnoSolidoExcelService } from '@ScatoServicios/planilla-turno-solido-excel';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { EmbarqueSharingService } from '@ScatoServicios/embarque.shared.service';
import { Subject } from 'rxjs';
import { BalanzasManualService } from 'app/modulos/carga/carga-solidos/tableristas/balanzas-manual/balanzas-manual.service';
import { BalanzaManual } from '@ScatoModels/balanza-manual/balanza-manual';
import { PanillaTurnoSolidoExcelNuevoService } from '@ScatoServicios/planilla-turno-solido-excel-nuevo';

@Component({
  selector: 'app-planilla-turnos-solido',
  templateUrl: './planilla-turnos-solido.component.html',
  styleUrls: ['./planilla-turnos-solido.component.css']
})
export class PlanillaTurnosSolidoComponent implements OnInit {
  @Output() hideSpinner = new EventEmitter<boolean>();
  @Input() esSoloLectura: boolean = false;
  @Input() tablerista: boolean;
  @Output() turnoCerrado = new EventEmitter<boolean>();
  @ViewChild(PlanoContentComponent, { static: false }) planoContent: PlanoContentComponent;

  formTurnos: FormGroup;
  formCorte: FormGroup;
  formNuevoTurno: FormGroup;
  formExportarExcel: FormGroup;
  obsCalidadForm: FormGroup;
  moduloCarga: ModuloDeCarga;
  exportadores: any[];
  lineas: any[];
  arrLineas: any[];
  partidas: any[];
  producto: any[];
  tanques: any[];
  hoy: any;
  turnos = ['00-06', '06-12', '12-18', '18-24'];
  turnoPuerto: any[];
  planillaDeTurnos: PlanillaDeTurnos[];
  nuevoTurno: PlanillaDeTurnos;
  embarqueId: number;
  embarque: Embarque;
  vientoAmarre: string;
  direccionViento: string;
  valorCargado: number;
  mostrarBtn: boolean = true;
  selectedNewTurno: number;
  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;
  exportaPlanilla: boolean = false;
  totalABordo: number = 0;
  cortesOcultos: number[] = [];

  public verObservacionesCalidad: boolean = false;
  private balanzasCortes: BalanzaManual[] = [];
  private esCargaManual: boolean = false;

  constructor(
    private _builder: FormBuilder,
    private _modalService: NgbModal,
    private datePipe: DatePipe,
    private procesoCalidadService: ProcesoCalidadService,
    private _turnosService: TurnosService,
    private moduloCargaService: ModuloDeCargaService,
    private procesoService: DatosEmbarquesProcesoService,
    private balanzasManualService: BalanzasManualService,
    private session: SessionService,
    private confirmationDialogService: ConfirmationDialogService,
    private excelNuevoService: PanillaTurnoSolidoExcelNuevoService,
    private embarqueSharingService: EmbarqueSharingService,
  ) {
    this.user = this.session.getUser();
  }

  ngOnInit(): void {
    this.setCargarValoresPlanilla();
  }

  private setCargarFormularioPlanilla() {
    this.newForm()
    setTimeout(() => {
      this.fillPlanilla();
    }, 2000);
    this.initFormularioObs();
  }

  private setCargarValoresPlanilla() {
    this.user = this.session.getUser();
    if (!this.esSoloLectura) {
      this.embarqueId = this.procesoService.getEmbarqueId();
      this.setCargarFormularioPlanilla();
    } else {
      this.embarqueSharingService.getParametrosIdsEmbarque().subscribe(data => {
        this.embarqueId = data.embarque_Id;
        this.setCargarFormularioPlanilla();
      });

    }
  }

  public expandir() {
    document.getElementById('collapsePlanillaTurnosSolido').className = "collapse show";
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
    //this.getCombos();
  }


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
          let exists: boolean = false;
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
          //Si llegamos hasta aca es porque tenemos que crear el turno.
          let turnoNuevo: PlanillaDeTurnos = new PlanillaDeTurnos();
          turnoNuevo.guardadoPorRecibidor = false;
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
                  this.formTurnos.get('diasTurno')['controls'][diaTurnoToAdd].controls.turnos

                } else {
                  diaTurnoToAdd = 0;
                  ///this.setDia(fechaSeleccionada, turnoNuevo, fechaSeleccionada)
                  //this.setTurno(diaTurnoToAdd,turnoNuevo, true);
                  this.setDia(null, turnoNuevo, fechaSeleccionada)

                }
              }
            })
          });

        }
        //Si seleccionó una fecha revisamos en la planilla si el día tiene el turno disponible
      } else {
        this.confirmationDialogService.confirm('¡Atención!', 'Debes elegir una fecha para el turno.', 'Cerrar', '', null, null, Tipoalerta.Warning)
      }
    } else {
      this.confirmationDialogService.confirm('¡Atención!', 'Debes elegir una fecha para el turno.', 'Cerrar', '', null, null, Tipoalerta.Warning)
    }


  }

  private devolverFechaHoraTurno(planillaTurno) {

    let turnoFechaHora = this.getFechaFormato(new Date(planillaTurno.fecha));

    switch (planillaTurno.turnoPuerto.orden) {
      case 1:
        turnoFechaHora = turnoFechaHora + ' 06:00';
        break;
      case 2:
        turnoFechaHora = turnoFechaHora + ' 12:00';
        break;
      case 3:
        turnoFechaHora = turnoFechaHora + ' 18:00';
        break;
      case 4:
        turnoFechaHora = turnoFechaHora + ' 23:00';
        break;
    }
    return turnoFechaHora;
  }

  getFechaFormato(fechaTurno: Date) {
    const anioTurno: number = fechaTurno.getFullYear();
    const mesTurno: number = fechaTurno.getMonth() + 1;
    const diaTurno: number = fechaTurno.getDate();

    const anioFormato: string = anioTurno.toString();
    const mesFormato: string = mesTurno < 10 ? '0' + mesTurno.toString() : mesTurno.toString();
    const diaFormato: string = diaTurno < 10 ? '0' + diaTurno.toString() : diaTurno.toString();

    const fechaFormato = anioFormato + '-' + mesFormato + '-' + diaFormato;

    return fechaFormato;
  }

  async fillPlanilla() {
    const moduloDeCarga = this.procesoService.getModuloDeCarga();
    this.planillaDeTurnos = moduloDeCarga.moduloDeCargaPlanillaDeTurnos.filter(x => x.esLiquido == false);
    this.diasTurno.clear();

    //Si la planilla no tiene turnos, no hay nada que hacer
    if (!this.planillaDeTurnos?.length) {
      return;
    }
    this.ordenarTurnos();

    this.esCargaManual = moduloDeCarga.ingresoManualSolido;
    if (this.esCargaManual) {
      this.balanzasCortes = await this.balanzasManualService.listarBalanzaManual(moduloDeCarga.id).toPromise();
    }

    this.turnoPuerto = [];
    for (const planillaTurno of this.planillaDeTurnos) {
      //Me fijo si el día ya está agregado
      let dayIndex = this.diasTurno.controls.findIndex(t => new Date(planillaTurno.fecha).getDate() == new Date(t.value.diaTurno).getDate())

      //Si no existe el día, lo creo.
      if (dayIndex == -1) {
        this.setDia(planillaTurno);
        dayIndex = this.diasTurno.length - 1;
      } else {
        //Si ya existe el día agrego 1 turno al array del día.
        this.setTurno(dayIndex, planillaTurno);
      }

      const turnos = this.diasTurno.at(dayIndex).get('turnos') as FormArray
      const turno = turnos.at(turnos.length - 1);

      //Agrego detalles
      if (planillaTurno.moduloDeCargaPlanillaDeTurnosDetallesSolido?.length) {
        this.initTurnoDetalles(turno, planillaTurno.moduloDeCargaPlanillaDeTurnosDetallesSolido, moduloDeCarga.ingresoManualSolido);
      }

      //Agrego cortes
      if (planillaTurno.moduloDeCargaPlanillaDeTurnosCortes?.length) {
        this.initTurnoCortes(turno, planillaTurno.moduloDeCargaPlanillaDeTurnosCortes);
      }

      //Agrego observaciones
      if (planillaTurno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad?.length) {
        this.initTurnoObservaciones(turno, planillaTurno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad);
      }
    }

  }

  private ordenarTurnos() {
    //Agrego variable de milisegundos (fecha) para poder ordenar
    for (const element of this.planillaDeTurnos) {
      const fechaFormateada = this.devolverFechaHoraTurno(element);
      element.fechaMiliseconds = new Date(fechaFormateada).getTime();
    }

    // Ordenamos los turnos por fecha y turno correspondiente
    this.planillaDeTurnos = this.planillaDeTurnos.sort((a, b) => b.fechaMiliseconds - a.fechaMiliseconds);
  }

  setTurno(dia: number, Turno: PlanillaDeTurnos, esNuevoTurno?: boolean) {
    const turnos = this.diasTurno.at(dia).get('turnos') as FormArray
    const turnoForm = this.initTurno(Turno, esNuevoTurno);
    turnos.push(turnoForm);
  }

  setDia(dia: any, turno?: PlanillaDeTurnos, date?: Date) {
    const diaForm = this.initDia(dia, turno, date);
    this.diasTurno.push(diaForm);
  }

  getDia(index: number) {
    //Calculo el día y lo convierto a dd--MM-yyyy
    return this.datePipe.transform(this.formTurnos.get('diasTurno')['controls'][index]['controls'].diaTurno.value, 'dd-MM-yyyy');
  }

  getCombos() {
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

    this.hoy = this.datePipe.transform(new Date(), 'dd-MM-yyyy');

    this.vientoAmarre = this.procesoService.getVientoAmarre();
    this.direccionViento = this.procesoService.getDireccionViento();
    let planilla = (this.procesoService.getModuloDeCarga()?.moduloDeCargaPlanillaDeTurnos as PlanillaDeTurnos[]).filter(x => x.esLiquido == false);
    planilla?.length > 0 ? this.formTurnos.get('diasTurno').patchValue(planilla) : '';
  }

  private validaTurnosNoCerrados(turnoSel): Subject<boolean> {
    let moduloDeCargaPlanillaDeTurnos = null;
    let planillaDeTurnosRecibidores = null;
    let subjectTurnosNoCerrados = new Subject<boolean>();
    let bResultado = false;
    this.moduloCargaService.obtenerModuloDeCarga(this.procesoService.getModuloDeCargaId()).subscribe(resp => {
      if (resp.moduloDeCargaPlanillaDeTurnos.length > 0) {
        moduloDeCargaPlanillaDeTurnos = resp.moduloDeCargaPlanillaDeTurnos;
      }
    }, error => { }, () => {
      const fechaMiliseconds = turnoSel.value.turnoPuerto.fechaMiliseconds;
      const turnoSelId = turnoSel.value.id;
      planillaDeTurnosRecibidores = moduloDeCargaPlanillaDeTurnos.filter(x => x.guardadoPorRecibidor == false && x.id != turnoSelId);

      planillaDeTurnosRecibidores.forEach(item => {
        const fechaFormateada = this.devolverFechaHoraTurno(item);
        item.fechaMiliseconds = new Date(fechaFormateada).getTime()
      });

      planillaDeTurnosRecibidores = planillaDeTurnosRecibidores.filter(x => x.fechaMiliseconds < fechaMiliseconds);
      if (planillaDeTurnosRecibidores != undefined || planillaDeTurnosRecibidores != null) {
        if (planillaDeTurnosRecibidores.length > 0)
          bResultado = true;
      }

      subjectTurnosNoCerrados.next(bResultado)
    });
    return subjectTurnosNoCerrados;
  }

  async guardarTurnoDetallado(turnoSeleccionado: any) {
    const idPlanillaDeTurnos = turnoSeleccionado['controls'].id.value;
    const confirmed = await this.confirmationDialogService.confirm("Cerrar turno", "Está seguro que desea cerrar el turno?", 'Aceptar', 'Cancelar', null, null, Tipoalerta.Success);
    if (!confirmed) {
      console.log('Cerrar Turno.');
      return;
    }

    this.moduloCargaService.cerrarTurnoModuloDeCarga(idPlanillaDeTurnos).subscribe(res => {
      this.turnoCerrado.emit(true);
      this.moduloCargaService.obtenerModuloDeCarga(this.procesoService.getModuloDeCargaId()).subscribe(resp => {
        if (resp.moduloDeCargaPlanillaDeTurnos.length > 0) {
          this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeTurnos = [];
          const selModuloDeCargaPlanillaDeTurnos = resp.moduloDeCargaPlanillaDeTurnos;
          this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeTurnos = selModuloDeCargaPlanillaDeTurnos;
          this.fillPlanilla();
        }
      });
    });
  }

  onCerrarTurno(turnoSeleccionado: any) {
    this.validaTurnosNoCerrados(turnoSeleccionado).subscribe(resp => {
      const existeTurno = resp;
      let mensaje = "No se puede cerrar el turno actual, debido a que existen ";
      mensaje += " turnos anteriores que aun no se han sido cerrados.";
      if (existeTurno) {
        this.confirmationDialogService.confirm("¡Atención!", mensaje, "Cerrar", "", null, null, Tipoalerta.Warning);
        return;
      } else {
        this.guardarTurnoDetallado(turnoSeleccionado);
      }
    });
  }
  deleteObsCalidad(obsCalidad: any) {
    this.confirmationDialogService.confirm("Atención!", "Seguro desea eliminar la observación?", 'Aceptar', 'Cancelar', null, null, Tipoalerta.Success)
      .then((confirmed) => {
        if (confirmed) {
          this.moduloCargaService.eliminarObservacionDeCalidad(obsCalidad.id)
            .subscribe(res => {
              this.moduloCargaService.obtenerModuloDeCarga(this.procesoService.getModuloDeCargaId()).subscribe(resp => {
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
    const turnoDetalle = this.getTurnos(d)['controls'][t]['controls'].moduloDeCargaPlanillaDeTurnosDetallesSolido as FormArray;
    return turnoDetalle;
  }

  getTurnoDetallesBajasClass(d, t) {
    const cantidadBajaCarga = this.getTurnoDetallesBajasCargas(d, t);
    const cantidadBajaNormal = this.getTurnoDetallesBajasCargas(d, t, true);
    const cantidadRegistros = cantidadBajaCarga + cantidadBajaNormal;
    let detallesBajasClass = '';
    if (cantidadRegistros == 1)
      detallesBajasClass = 'fila-turno-alto';
    else
      detallesBajasClass = 'fila-turno-alto-defecto';
    return detallesBajasClass;
  }

  getCorteColor(result) {
    const idBalanzaCorte = result.controls.idBalanzaCorte;
    let colorBajaCargaClass = '';
    if (idBalanzaCorte == 1)
      colorBajaCargaClass = 'fila-turno-normal';
    else if (idBalanzaCorte == 0)
      colorBajaCargaClass = 'fila-turno-baja-carga';
    else
      colorBajaCargaClass = 'fila-turno-corte';
    return colorBajaCargaClass;
  }

  getTurnoDetallesBajasCargas(d, t, esCargaNormales: boolean = false) {
    const turnoDetalle = this.getTurnos(d)['controls'][t]['controls'].moduloDeCargaPlanillaDeTurnosDetallesSolido as FormArray;

    const cantidadBajaCarga = esCargaNormales ? turnoDetalle.value.filter(x => x.idBalanzaCorte == 0) : turnoDetalle.value.filter(x => x.idBalanzaCorte > 0);
    return cantidadBajaCarga.length;
  }

  getCorteTurnos(d, t): FormArray {
    return this.getTurnos(d)['controls'][t]['controls'].moduloDeCargaPlanillaDeTurnosCortes as FormArray;
  }

  getObservacionTurnos(d, t) {
    const observacionesCalidad = this.getTurnos(d)['controls'][t]['controls'].moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad as FormArray;
    let listaObservacionesCalidad = observacionesCalidad.value;
    for (let observacion of listaObservacionesCalidad) {
      observacion.fechaMiliseconds = new Date(observacion.fechaHora).getTime();
    }

    listaObservacionesCalidad = listaObservacionesCalidad.sort((a, b) => {
      return (a.fechaMiliseconds - b.fechaMiliseconds);
    });

    return listaObservacionesCalidad;
  }

  initFormularioObs() {
    this.obsCalidadForm = this._builder.group({
      id: [''],
      fecha: ['', [Validators.required]],
      hora: ['', [Validators.required]],
      observaciones: ['', [Validators.required]],
      observacionVisible: true,
      userCarga: this.user.username
    });
  }

  openModalAgregarObsCalidad(modal) {
    this.formNuevoTurno.reset();
    this._modalService.open(modal, { windowClass: 'window-modal-corte', backdropClass: 'modal-corte', size: 'lg', centered: true }).result.then(() => { })
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
    if (planillaDeTurnoSel.length == 0) {
      this.confirmationDialogService.confirm('¡Atención!', 'No se ha encontrado un turno para la fecha y hora seleccionada.', 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }
    if (planillaDeTurnoSel.length > 0) {
      const esTurnoCerrado = planillaDeTurnoSel[0].guardadoPorRecibidor;
      if (esTurnoCerrado) {
        this.confirmationDialogService.confirm('¡Atención!', 'No se puede agregar una observacion para un turno cerrado.', 'Cerrar', '', null, null, Tipoalerta.Warning)
        return;
      }
    }

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
            this.moduloCargaService.obtenerModuloDeCarga(this.procesoService.getModuloDeCargaId()).subscribe(resp => {
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
      contador += this.getRowSpanTurno(turnos);
    }
    return contador;
  }

  getRowSpanTurno(turnoForm: FormGroup) {
    let rowSpan = 1;
    const turno = turnoForm.getRawValue() as PlanillaDeTurnos;
    rowSpan += turno.moduloDeCargaPlanillaDeTurnosDetallesSolido.length;
    if (turno.moduloDeCargaPlanillaDeTurnosCortes.length) {
      rowSpan++;
    }
    if (this.verObservacionesCalidad && turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad.length) {
      rowSpan++;
    }
    return rowSpan;
  }

  esTurnoVacio(turnoForm: FormGroup) {
    return this.getRowSpanTurno(turnoForm) == 1;
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
    for (let turno of t['controls']['moduloDeCargaPlanillaDeTurnosDetallesSolido'].controls) {
      let cantidad = turno.controls.cantidad.value ? turno.controls.cantidad.value : 0;
      cantidad = cantidad;
      cantidad = parseInt(cantidad.toString());
      contador += cantidad;
    }
    return contador;
  }

  getCantDia(d) {
    let contador = 0;
    // return 0;
    for (let turno of d['controls']['turnos']['controls']) {
      contador += this.getCantTurno(turno);
    }
    contador = contador > 0 ? contador : 0;
    return contador;
  }

  getCantTotalABordo() {
    let contador = 0;
    // return 0;
    for (let dia of this.formTurnos['controls']['diasTurno']['controls']) {
      contador += this.getCantDia(dia);
    }
    this.totalABordo = contador;
    return contador;
  }

  private initDia(dia?: any, turno?: PlanillaDeTurnos, date?: Date) {
    if (dia != null) {
      return this._builder.group({
        turnos: this._builder.array([this.initTurno(dia)]),
        diaTurno: dia.fecha
      });
    } else {
      return this._builder.group({
        turnos: this._builder.array([this.initTurno(turno, true)]),
        diaTurno: date ? date : new Date()
      });
    }
  }

  private initTurnoDetalles(turno: AbstractControl, detalles: TurnoDetalleSolido[], ingresoManualSolido: boolean) {
    const planillaTurnoDetalles = turno.get('moduloDeCargaPlanillaDeTurnosDetallesSolido') as FormArray
    let omitirLinea: boolean;
    for (const detalle of detalles) {
      omitirLinea = false;

      if (ingresoManualSolido) {
        // Si existe un detalle con la misma combinación de destino, bodega y material; entonces se suman los valores de las cargas
        const detallePrevio = this.getDetalleExistente(detalle, planillaTurnoDetalles);
        if (detallePrevio) {
          const cantidadControl = detallePrevio.get('cantidad');
          cantidadControl.setValue(cantidadControl.value + detalle.cantidad);
          omitirLinea = true;
        }
      }

      if (!omitirLinea) {
        const linea = this.initLinea(detalle, true);
        if (ingresoManualSolido) {
          linea.get('idBalanzaCorte').setValue(1); // Para que figure como carga normal
        }
        planillaTurnoDetalles.push(linea);
      }
    }
  }

  private getDetalleExistente(detalle: TurnoDetalleSolido, planillaTurnoDetalles: FormArray) {
    for (const detalleForm of planillaTurnoDetalles.controls) {
      const materialPuertoId = detalleForm.get('materialPuerto').value?.id;
      const nombreDestino = detalleForm.get('destino').value;
      const bodegaId = detalleForm.get('bodega').value?.id;
      if (detalle.bodega.id == bodegaId && nombreDestino == detalle.destino.nombre && materialPuertoId == detalle.materialPuerto.id) {
        return detalleForm as FormGroup;
      }
    }
    return undefined;
  }

  private initTurnoCortes(turno: AbstractControl, cortes: CorteTurno[]) {
    const planillaTurnoCortes = turno.get('moduloDeCargaPlanillaDeTurnosCortes') as FormArray;
    for (const corte of cortes) {
      const corteForm = this.initCorte(corte);
      planillaTurnoCortes.push(corteForm);
    }
  }

  private initTurnoObservaciones(turno: AbstractControl, observaciones: ObsCalidad[]) {
    const planillaTurnoObservaciones = turno.get('moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad') as FormArray;
    for (const observacion of observaciones) {
      const obsForm = this.initObservacion(observacion);
      planillaTurnoObservaciones.push(obsForm);
    }
  }

  initTurno(turnoPuerto?: PlanillaDeTurnos, esNuevoTurno?: boolean) {
    let fg: FormGroup;

    if (!esNuevoTurno) {
      fg = this._builder.group({
        moduloDeCargaPlanillaDeTurnosDetallesSolido: this._builder.array([]),
        moduloDeCargaPlanillaDeTurnosCortes: this._builder.array([]),
        moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad: this._builder.array([]),
        guardadoPorRecibidor: turnoPuerto ? turnoPuerto.guardadoPorRecibidor : false,
        turnoPuerto: turnoPuerto ?? null,
        id: turnoPuerto ? turnoPuerto.id : '0'
      });
    } else {
      fg = this._builder.group({
        moduloDeCargaPlanillaDeTurnosDetallesSolido: this._builder.array([this.initLinea(), this.initLinea(), this.initLinea(), this.initLinea()]),
        moduloDeCargaPlanillaDeTurnosCortes: this._builder.array([]),
        moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad: this._builder.array([]),
        guardadoPorRecibidor: turnoPuerto ? turnoPuerto.guardadoPorRecibidor : false,
        turnoPuerto: turnoPuerto ?? null,
        id: turnoPuerto ? turnoPuerto.id : '0'
      });
    }

    return fg;
  }

  compareFields(c1: Exportador, c2: Exportador) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  private initLinea(line?: any, cerrado?: boolean) {
    if (line != null || line != undefined) {
      let cantidad = line?.cantidad || 0;
      // cantidad = Math.round(cantidad)
      cantidad = parseInt(cantidad.toString());
      return this._builder.group({
        linea: [{ value: line?.linea_Id || '', disabled: cerrado }],
        idBalanzaCorte: [{ value: line?.idBalanzaCorte || '', disabled: cerrado }],
        exportador: [{ value: line?.exportador || '', disabled: cerrado }],
        bodega: [{ value: line?.bodega || '', disabled: cerrado }],
        materialPuerto: [{ value: line?.materialPuerto || '', disabled: cerrado }],
        destino: [{ value: line?.destino?.nombre || '', disabled: cerrado }],
        cantidad: [{ value: line?.cantidad || '', disabled: cerrado }],
        id: [{ value: line ? cantidad.toString() : null, disabled: cerrado }]
      })
    }
  }

  private initCorte(corte: any) {
    return this._builder.group({
      motivosDeCorte: [{ value: corte.motivosDeCorte ? corte.motivosDeCorte : '', disabled: true }, Validators.required],
      horaInicio: [{ value: corte.horaInicio, disabled: true }, Validators.required],
      horaFin: [{ value: corte.horaFin, disabled: true }, Validators.required],
      tiempoTotal: [{ value: corte.tiempoTotal, disabled: true }, Validators.required],
      observaciones: [{ value: corte.observaciones, disabled: true }, Validators.required],
      id: [{ value: corte.id, disabled: true }, Validators.required],
      idBalanzaCorte: [{ value: corte ? corte.idBalanzaCorte : '', disabled: true }],
    });
  }

  private initObservacion(observacion: any) {
    let fechaObs = '';
    let horaObs = '';
    let fechaHora = observacion.fechaHora;

    if (observacion.fechaHora) {
      fechaObs = this.formatoFechaHora(true, observacion.fechaHora)
      horaObs = this.formatoFechaHora(false, observacion.fechaHora)
    }

    return this._builder.group({
      fecha: [{ value: fechaObs, disabled: true }, Validators.required],
      hora: [{ value: horaObs, disabled: true }, Validators.required],
      fechaHora: [{ value: fechaHora, disabled: true }, Validators.required],
      observaciones: [{ value: observacion.observaciones, disabled: true }, Validators.required],
      id: [{ value: observacion.id, disabled: true }, Validators.required]
    });
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

  getToneladasParcelDia(bodega: number, d: number) {
    let dia = this.getTurnos(d);
    let cantidad = 0;
    // return 0;
    for (let turno of dia.controls) {
      for (let linea of turno['controls']['moduloDeCargaPlanillaDeTurnosDetallesSolido']['controls']) {
        cantidad += (linea.controls.bodega.value == bodega ? Number(linea.controls.cantidad.value) : 0);
      }
    }
    return cantidad;
  }

  getToneladasParcelTurno(bodega: number, d: number, t: number) {
    let turno = this.getTurnoDetalles(d, t);
    let cantidad = 0;
    // return 0;
    for (let linea of turno.controls) {
      cantidad += (linea['controls'].bodega.value == bodega ? Number(linea['controls'].cantidad.value) : 0);
    }
    return cantidad;
  }

  getToneladasLinea(value: string) {
    let contador = 0;
    // return 0;
    this.diasTurno.controls.forEach(dia => {
      const turnos = dia['controls']['turnos']['controls'];
      turnos.forEach(turno => {
        const lineaTurnos = turno['controls']['moduloDeCargaPlanillaDeTurnosDetallesSolido']['controls'];
        lineaTurnos.forEach(linea => {
          if (linea.get('linea').value != '') {
            const lineaId = linea.get('linea').value;
            const lineaFiltro = this.lineas.filter(linea => linea.id == lineaId);
            if (lineaFiltro.length > 0) {
              const lineaSel = lineaFiltro[0];
              const lineaValue = lineaSel.linea != null ? lineaSel.linea : '';
              contador += (lineaValue.toLowerCase() == value ? Number(linea.get('cantidad').value) : 0);
            }
          }
        })
      });
    })

    return contador;
  }

  async getImgMolinos() {
    let response = await fetch('assets/iconMolinos.png');
    let buffer = await response.arrayBuffer();
    return buffer;
  }

  private getDiferenciaCortes(inicio, fin) {
    const fechaValInicio = '1900-01-01 ' + inicio;
    const fechaValFin = '1900-01-01 ' + fin;
    const fechaInicio = new Date(fechaValInicio);
    const fechaFin = new Date(fechaValFin);
    const horaInicio = fechaInicio.getHours();
    const horaFin = fechaFin.getHours();
    const minInicio = fechaInicio.getMinutes();
    const minFin = fechaFin.getMinutes();
    const horas = horaFin - horaInicio;
    const minutos = minFin - minInicio;
    let resultado = '';
    if (horas > 0)
      resultado = horas.toString() + '.' + minutos.toString();
    else
      resultado = minutos.toString();
    return resultado;
  }

  async onExportarExcelSolido(esEnviarPlanilla: boolean = false) {
    const planillaTurnosCerrado = this.planillaDeTurnos.filter(x => x.guardadoPorRecibidor == true && x.guardadoPorTablerista == true);
    if (planillaTurnosCerrado.length == 0) {
      const mensaje = `No se encontraron turnos cerrados para ${esEnviarPlanilla ? 'enviar' : 'exportar'} la planilla.`;
      this.confirmationDialogService.confirm("¡Atención!", mensaje, "Cerrar", "", null, null, Tipoalerta.Warning);
      return false;
    }
    this.exportaPlanilla = true;
    await this.excelNuevoService.generarExcel(planillaTurnosCerrado, esEnviarPlanilla, this.verObservacionesCalidad, this.cortesOcultos);
    this.exportaPlanilla = false;
  }

  soloEnteros(valor) {
    const resultado = parseInt(valor);
    if (valor > 0) {
      return resultado.toString();
    }
    if (valor == 0) {
      return '';
    }
  }

  hasPermisoRecibidores_ObsCalidad_Agregar() {
    return this.user.permisos.find(p => p === this.permisosScato.Recibidores_ObsCalidad_Agregar);
  }
  hasPermisoRecibidores_ExportarEnviarPlanillas() {
    return this.user.permisos.find(p => p === this.permisosScato.Recibidores_ExportarEnviarPlanillas);
  }

  onCheckboxOcultarCorte(event: Event, id: number): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.cortesOcultos.push(id);
    } else {
      this.cortesOcultos = this.cortesOcultos.filter(x => x !== id);
    }
  }

  estaOculto(id: number): boolean {
    return this.cortesOcultos.includes(id);
  }

}
