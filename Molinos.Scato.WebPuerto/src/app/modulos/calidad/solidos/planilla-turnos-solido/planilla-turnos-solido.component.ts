import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModuloDeCarga } from '@ScatoModels/modulo-carga';
import { Exportador } from "@ScatoModels/exportador";
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { LineasService } from '@ScatoServicios/lineas.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { TurnosService } from '@ScatoServicios/turnos.service';
import { Workbook, Worksheet } from 'exceljs';
import * as fs from 'file-saver';
import { MessageService } from 'primeng/api';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { PlanillaDeTurnos, TurnoPuerto } from '@ScatoModels/planilla-turnos/planilla-de-turnos';
import { TurnoDetalleSolido } from '@ScatoModels/planilla-turnos/turno';
import { CorteTurno } from '@ScatoModels/planilla-turnos/corte-turno';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { Embarque } from '@ScatoModels/embarque';
import { PlanoContentComponent } from 'app/modulos/lineup/plano-de-carga/plano-content/plano-content.component';
import { ObsCalidad } from '@ScatoModels/obs-calidad';
import { Mail } from '@ScatoModels/mail';
import { Usuario } from '@ScatoInterfaces/usuario';
import { SessionService } from '@ScatoServicios/session.service';
import { ProcesoCalidadService } from '@ScatoServicios/procesoCalidad.service';

@Component({
  selector: 'app-planilla-turnos-solido',
  templateUrl: './planilla-turnos-solido.component.html',
  styleUrls: ['./planilla-turnos-solido.component.css']
})
export class PlanillaTurnosSolidoComponent implements OnInit {
  @Output() hideSpinner = new EventEmitter<boolean>();
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
  idModuloDeCarga: number;
  planillaDeTurnos: PlanillaDeTurnos[];
  nuevoTurno: PlanillaDeTurnos;
  embarqueId: number;
  embarque: Embarque;
  vientoAmarre: string;
  direccionViento: string;
  valorCargado: number;
  pedidoPorPlano: number;
  mostrarBtn: boolean = true;
  selectedNewTurno: number;
  @Input() tablerista: boolean;
  private user: Usuario;
  exportaPlanilla: boolean = false;

  constructor(
    private _builder: FormBuilder,
    private _modalService: NgbModal,
    private _procesoService: DatosEmbarquesProcesoService,
    private datePipe: DatePipe,
    private procesoCalidadService: ProcesoCalidadService,
    private _turnosService: TurnosService,
    private moduloCargaService: ModuloDeCargaService,
    private procesoService: DatosEmbarquesProcesoService,
    private messageService: MessageService,
    private lineasService: LineasService,
    private session: SessionService,
    private confirmationDialogService: ConfirmationDialogService,
    private embarqueService: EmbarqueService,
  ) {
    console.log('modulo de carga: ', this.procesoService.getModuloDeCarga());
    this.pedidoPorPlano = this._turnosService.getTnTotales()
    this.embarqueId = this.procesoService.getEmbarqueId();
    this.embarqueService.obtenerEmbarque(this.embarqueId).subscribe(res => this.embarque = res);
  }

  ngOnInit(): void {
    this.user = this.session.getUser();
    this.newForm()
    // this.fillPlanilla();
    setTimeout(() => {
      this.fillPlanilla();
    }, 2000);
    this.initFormularioObs();
  }
  expandir() {
    document.getElementById('collapsePlanillaTurnosSolido').className = "collapse show";
  }
  desabilitarTurno() {
    this.mostrarBtn = false;
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
          turnoNuevo.cerrado = false;
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
  fillPlanilla() {
    this.planillaDeTurnos = (this.procesoService.getModuloDeCarga()?.moduloDeCargaPlanillaDeTurnos as PlanillaDeTurnos[]).filter(x => x.esLiquido == false);
    this.diasTurno.clear();

    //Si la planilla tiene turnos
    if (this.planillaDeTurnos != undefined && this.planillaDeTurnos.length > 0) {

      //Agrego variable de milisegundos (fecha) para poder ordenar
      this.planillaDeTurnos.forEach(element => {
        element.fechaMiliseconds = new Date(element.fecha).getTime();
      });

      // Ordenamos los turnos por fecha y turno correspondiente
      this.planillaDeTurnos = this.planillaDeTurnos.sort((a, b) => {
        return (b.fechaMiliseconds - a.fechaMiliseconds);
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
        if (dia.moduloDeCargaPlanillaDeTurnosDetallesSolido?.length > 0) {
          this.initTurnoDetalle(dia.moduloDeCargaPlanillaDeTurnosDetallesSolido,
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
    this.lineas = this._procesoService.getModuloDeCarga().moduloDeCargaLineasDeEmbarque;
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

    this.idModuloDeCarga = this.procesoService.getModuloDeCargaId();
    this.vientoAmarre = this.procesoService.getVientoAmarre();
    this.direccionViento = this.procesoService.getDireccionViento();
    let planilla = (this.procesoService.getModuloDeCarga()?.moduloDeCargaPlanillaDeTurnos as PlanillaDeTurnos[]).filter(x => x.esLiquido == false);
    planilla?.length > 0 ? this.formTurnos.get('diasTurno').patchValue(planilla) : '';
  }

  deleteObsCalidad(ObsCalidad: any) {
    this.confirmationDialogService.confirm("Atención!", "Seguro desea eliminar la observación?", 'Si', 'No', null, null, Tipoalerta.Success)
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
    return this.getTurnos(d)['controls'][t]['controls'].moduloDeCargaPlanillaDeTurnosDetallesSolido as FormArray;
  }

  getTurno2(d, t): FormArray {
    return this.getTurnos(d)['controls'][t] as FormArray;
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

    let texto = fechaHoraIncorrecta ? "Fecha y hora mayor a la actual. Para poder continuar, debe completarlas correctamente." :
      "Desea guardar las observaciones de calidad?";

    this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', 'Cancelar', null, null, Tipoalerta.Warning)
      .then((confirmed) => {
        if (confirmed && !fechaHoraIncorrecta) {

          this.procesoCalidadService.setObsCalidad(this.obsCalidadForm.getRawValue());
          // this.obsCalidadForm.reset();

          // this.procesoCalidadService.guardarObservacionesDeCalidad(this.turnoPuerto.id, this.obsCalidadForm)
          //obtengo el turno en el que tengo que guardar
          let horaDate = new Date(fechaHora)
          let idTurnoPuerto = Math.floor(horaDate.getHours() / 6) + 1;
          //me traigo todos los turnos de la fecha seleccionada
          let idPlanillaDeTurnos = this.planillaDeTurnos.filter(x => x.fecha.includes(fecha)).filter(x => x.turnoPuerto.id == idTurnoPuerto)[0].id;

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
      contador += 1;
    }
    if(this.diasTurno.length == 1) {
      contador += 1;
    }
    return contador;
  }

  getRowSpanTurnoCalc(turno: any) {
    let registroSolido = turno.controls['moduloDeCargaPlanillaDeTurnosDetallesSolido'].controls.length;
    let registroCorte = turno.controls['moduloDeCargaPlanillaDeTurnosCortes'].controls.length;
    let registroCalidad = turno.controls['moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad'].controls.length;

    registroSolido = registroSolido > 0 && registroSolido; // tamaño del detalle de cada turno
    registroCorte = registroCorte > 0 ? 1 : 1; // tamaño del corte
    registroCalidad = registroCalidad > 0 ? 1 : 1; // tamaño de la observacion
    const numeroRegistros = registroSolido + registroCorte + registroCalidad;
    return numeroRegistros;
  }

  getRowSpanTurno(turno: any) {
    let registroSolido = turno.controls['moduloDeCargaPlanillaDeTurnosDetallesSolido'].controls.length;
    let registroCorte = turno.controls['moduloDeCargaPlanillaDeTurnosCortes'].controls.length;
    let registroCalidad = turno.controls['moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad'].controls.length;

    registroSolido = registroSolido > 0 && registroSolido; // tamaño del detalle de cada turno
    registroCorte = registroCorte > 0 ? 1 : 1; // tamaño del corte
    registroCalidad = registroCalidad > 0 ? 1 : 1; // tamaño de la observacion
    registroSolido += 1;
    const numeroRegistros = registroSolido + registroCorte + registroCalidad;
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

  async enviarTurno(dia, turno) {
    // this.enviarMail();
    let turnoAEnviar = new Object;
    turnoAEnviar['moduloDeCargaPlanillaDeTurnos'] = this.getTurnos(dia)['controls'][turno].value;
    turnoAEnviar['fecha'] = new Date();
    turnoAEnviar['id'] = null;
    turnoAEnviar['moduloDeCargaPlanillaDeTurnos'].moduloDeCargaPlanillaDeTurnosDetallesSolido = turnoAEnviar['moduloDeCargaPlanillaDeTurnos'].moduloDeCargaPlanillaDeTurnosDetallesSolido.filter(m =>
      m.exportador ||
      m.bodega ||
      m.materialPuerto ||
      m.destino ||
      m.cantidad)

    //Si tengo detalles trato de enviar el turno.
    if (turnoAEnviar['moduloDeCargaPlanillaDeTurnos'].moduloDeCargaPlanillaDeTurnosDetallesSolido.length > 0) {
      //Si el turno correspondiente está abierto
      if (!this.getTurnos(dia)['controls'][turno]['controls'].cerrado.value) {
        //lo cierro
        this.getTurnos(dia)['controls'][turno]['controls'].cerrado.setValue(true);
      }
    }
  }

  sendRitmos(dia, turno) {
    this._turnosService.setTurnos(this.getTurnos(dia).controls[turno].value)
  }

  getCantTurno(t) {
    let contador = 0;
    // return 0;
    for (let turno of t['controls']['moduloDeCargaPlanillaDeTurnosDetallesSolido'].controls) {
      contador += turno.controls.cantidad.value ? turno.controls.cantidad.value : 0;
    }
    contador = contador > 0 ? contador / 1000 : 0;
    contador = parseInt(contador.toString());
    return contador;
  }

  getCantDia(d) {
    let contador = 0;
    // return 0;
    for (let turno of d['controls']['turnos']['controls']) {
      contador += this.getCantTurno(turno);
    }
    contador = contador > 0 ? contador : 0;
    contador = parseInt(contador.toString());
    return contador;
  }

  getCantTotalABordo() {
    let contador = 0;
    // return 0;
    for (let dia of this.formTurnos['controls']['diasTurno']['controls']) {
      contador += this.getCantDia(dia);
    }
    contador = contador > 0 ? contador / 1000 : 0;
    contador = parseInt(contador.toString());    
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

  initTurnoDetalle(detalle: TurnoDetalleSolido[], turno: PlanillaDeTurnos, turnoIndex?: number) {
    let planillaTurnoDetalles = turno['controls'][turnoIndex]['controls']['moduloDeCargaPlanillaDeTurnosDetallesSolido'];
    if (detalle != null) {
      if (detalle.length > 0) {
        detalle.forEach(element => {
          (planillaTurnoDetalles as FormArray).push(this.initLinea(element, true));
        });
      }
      //Si no hay detalles completo con 4 lineas vacías.
    } else {
      for (let i = 1; i <= 4; i++) {
        (turno['controls'][turnoIndex]['controls']['moduloDeCargaPlanillaDeTurnosDetallesSolido'] as FormArray).push(this.initLinea());
      }
    }
  }

  initTurnoCortes(corte: CorteTurno[], turno: PlanillaDeTurnos, turnoIndex?: number) {
    corte.forEach(element => {
      (turno['controls'][turnoIndex]['controls']['moduloDeCargaPlanillaDeTurnosCortes'] as FormArray).push(this.initCorte(element, true));
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

  initLinea(line?: any, cerrado?: boolean) {
    return this._builder.group({
      linea: [{ value: line ? line.linea_Id : '', disabled: cerrado }],
      exportador: [{ value: line ? line.exportador : '', disabled: cerrado }],
      bodega: [{ value: line ? line.bodega : '', disabled: cerrado }],
      materialPuerto: [{ value: line ? line.materialPuerto : '', disabled: cerrado }],
      destino: [{ value: line ? line.destino.nombre : '', disabled: cerrado }],
      cantidad: [{ value: line ? line.cantidad : '', disabled: cerrado }],
      id: [{ value: line ? line.id : null, disabled: cerrado }]
    })
  }

  initCorte(corte?: any, cerrado?: boolean) {
    if (corte != null) {
      return this._builder.group({
        motivosDeCorte: [{ value: corte.motivosDeCorte ? corte.motivosDeCorte : '', disabled: true }, Validators.required],
        horaInicio: [{ value: corte.horaInicio, disabled: true }, Validators.required],
        horaFin: [{ value: corte.horaFin, disabled: true }, Validators.required],
        tiempoTotal: [{ value: corte.tiempoTotal, disabled: true }, Validators.required],
        observaciones: [{ value: corte.observaciones, disabled: true }, Validators.required],
        id: [{ value: corte.id, disabled: true }, Validators.required]
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

  async generarExcelPorParcel(bEnviarPlanilla: boolean) {
    this.exportaPlanilla = true;
    let fname = "parcels";
    const headerDetalles = ["Exportador", "Bodega", "Producto", "Destino", "Cant."];
    const headerCortes = ["Motivo", "Inicio", "Fin", "Tiempo total", "Observaciones"];
    const headerObservaciones = ["Fecha", "Hora", "Observación de calidad"];

    // let datosModal = this.obtenerDatosExportarParcel();
    const imgMolinos = await this.getImgMolinos();
    // datosModal.parcelSeleccionados.forEach((element, i) => {
    let workbook = new Workbook();

    const molinosImg = workbook.addImage({
      buffer: imgMolinos,
      extension: 'png',
    });

    let worksheet = workbook.addWorksheet("Turnos",
      {
        views: [
          { state: 'frozen', activeCell: 'A1', showGridLines: false }
        ]
      });

    //Seteo el ancho de todas las columnas.
    worksheet.columns = [
      { width: 12 },
      { width: 11 },
      { width: 13 },
      { width: 10 },
      { width: 9 },
      { width: 10 },
      { width: 5 },
      { width: 11 },
      { width: 16 },
      { width: 11 },
      { width: 17 },
      { width: 11 },
      { width: 11 },
    ];

    //Merge cells cabecera
    worksheet.mergeCells('A1:B4');
    worksheet.mergeCells('C1:H3');
    worksheet.mergeCells('I1:M3');
    worksheet.mergeCells('C4:M4');
    worksheet.mergeCells('A5:B5');
    worksheet.mergeCells('C5:M5');
    worksheet.addImage(molinosImg, 'A1:B4');
    ['C1', 'I1', 'C4', 'A5', 'C5'].forEach((cell) => {
      let currentCell = worksheet.getCell(cell);
      currentCell.border = {
        top: { style: 'medium' },
        left: { style: 'medium' },
        bottom: { style: 'medium' },
        right: { style: 'medium' },
      };
      currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
      currentCell.font = {
        name: 'Arial',
        family: 2,
        size: 12,
        bold: true
      }
    });
    ['C1', 'I1', 'C4'].forEach((cell) => {
      let currentCell = worksheet.getCell(cell);
      currentCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFC0C0C0' }
      };
    });
    worksheet.getCell('C1').value = "Código: F-XXXX";
    worksheet.getCell('I1').value = "Revisión: 01";
    worksheet.getCell('C4').value = "Título: Planilla Embarque de Solidos";
    worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'right' };
    worksheet.getCell('A5').value = "Buque:";
    worksheet.getCell('C5').value = this.procesoService.getEmbarqueSelected().nombreBuque;

    // Ordenamos los turnos por fecha y turno correspondiente
    this.planillaDeTurnos = this.planillaDeTurnos.sort((a, b) => {
      return (a.fechaMiliseconds - b.fechaMiliseconds) && (a.turnoPuerto.orden - b.turnoPuerto.orden);
    });

    let diaOrder = 0;
    this.planillaDeTurnos.forEach((turno: PlanillaDeTurnos, i) => {
      if (i == 0) {
        turno.indexDia = diaOrder;
      } else {
        //
        if (new Date(turno.fecha).getDate() == new Date(this.planillaDeTurnos[i - 1].fecha).getDate() &&
          new Date(turno.fecha).getMonth() == new Date(this.planillaDeTurnos[i - 1].fecha).getMonth() &&
          new Date(turno.fecha).getFullYear() == new Date(this.planillaDeTurnos[i - 1].fecha).getFullYear()) {
          turno.indexDia = diaOrder;
        } else {
          diaOrder++;
          turno.indexDia = diaOrder;
        }
      }
    });


    console.log('modulo de carga')
    console.log(this._procesoService.getModuloDeCarga())

    let baseCell = 9;//37

    let offset = baseCell;
    //Calculo la cantidad de rows que va a ocupar la planilla

    let numeroTurno = 0;
    let totalNumeroTurnos = this.planillaDeTurnos.length;

    this.planillaDeTurnos.forEach((turno: PlanillaDeTurnos) => {
      // sino tiene informacion de detalle de turnos y cortes no lo considera
      if (turno.moduloDeCargaPlanillaDeTurnosCortes.length == 0 && turno.moduloDeCargaPlanillaDeTurnosDetallesSolido.length == 0) {
        totalNumeroTurnos -= 1;
      }
    });

    //Renderizo todos los detalles
    this.planillaDeTurnos.forEach((turno: PlanillaDeTurnos) => {

      // sino tiene informacion de detalle de turnos y cortes no lo considera
      if (turno.moduloDeCargaPlanillaDeTurnosCortes.length == 0 && turno.moduloDeCargaPlanillaDeTurnosDetallesSolido.length == 0) {
        return;
      }

      numeroTurno += 1;
      if (turno.moduloDeCargaPlanillaDeTurnosDetallesSolido.length > 0) {
        /* Planilla de turnos */
        headerDetalles.forEach((text, index) => {

          let currentCellDiv = worksheet.getRow(offset).getCell(index + 1);
          currentCellDiv.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFCCFFCC' }
          }
          currentCellDiv.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }

          let currentCell = worksheet.getRow(offset).getCell(index + 3);

          if (text) {

            currentCell.value = text;
            currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
            currentCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFCCFFCC' }
            }
            currentCell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            }
            currentCell.font = {
              name: 'Arial',
              family: 2,
              size: 11,
              bold: true
            }

          }
        });

        offset = offset + 1;

        // Cargando Agrupador de Turnos
        let registrosTurno = turno.moduloDeCargaPlanillaDeTurnosDetallesSolido.length - 1;
        const nombreTurno = turno.turnoPuerto.nombre;

        if (turno.moduloDeCargaPlanillaDeTurnosCortes.length > 0) {
          registrosTurno = turno.moduloDeCargaPlanillaDeTurnosDetallesSolido.length
          const registroCorte = turno.moduloDeCargaPlanillaDeTurnosCortes.length;
          registrosTurno += registroCorte;

        }
        if (turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad.length > 0) {
          const numeroObservaciones = turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad.length;
          registrosTurno += numeroObservaciones + 1;
        }
        const inicioTurnoMerge = offset;
        const finTurnoMerge = offset + registrosTurno;
        worksheet.mergeCells(`B${inicioTurnoMerge}:B${(finTurnoMerge)}`);
        worksheet.getCell(`B${inicioTurnoMerge}`).value = nombreTurno;
        worksheet.getCell(`B${inicioTurnoMerge}`).alignment = { vertical: 'middle', horizontal: 'center' }

        turno.moduloDeCargaPlanillaDeTurnosDetallesSolido.forEach((turno: any, index) => {

          let lineaDescripcion;
          const lineaFiltro = this.lineas.filter(linea => linea.id == turno.linea_Id);
          if (lineaFiltro.length > 0) {
            lineaDescripcion = lineaFiltro[0].linea != null ? lineaFiltro[0].linea : '';
          }

          worksheet.getRow(offset).getCell(3).value = turno.exportador.nombre;
          worksheet.getRow(offset).getCell(4).value = turno.bodegaParcel;
          worksheet.getRow(offset).getCell(5).value = turno.materialPuerto.descripcion;
          worksheet.getRow(offset).getCell(6).value = turno.destino.nombre;
          worksheet.getRow(offset).getCell(7).value = turno.cantidad;

          let celdaDetalle = 2
          for (let indexCell = 1; indexCell <= 6; indexCell++) {
            worksheet.getRow(offset).getCell(celdaDetalle).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
            celdaDetalle += 1;
          }
          offset = offset + 1;
        });

      }

      if (turno.moduloDeCargaPlanillaDeTurnosCortes.length > 0) {

        headerCortes.forEach((text, index) => {
          let currentCell = worksheet.getRow(offset).getCell(3 + (index));

          if (text) {
            currentCell.value = text;
            currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
            currentCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFC5101A' }
            }
            currentCell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            }
            currentCell.font = {
              name: 'Arial',
              family: 2,
              size: 11,
              bold: true
            }
          }
        });

        offset = offset + 1;
        turno.moduloDeCargaPlanillaDeTurnosCortes.forEach((turno: CorteTurno, index) => {

          worksheet.getRow(offset).getCell(3).value = turno.motivosDeCorte.nombre;
          worksheet.getRow(offset).getCell(4).value = turno.horaInicio;
          worksheet.getRow(offset).getCell(5).value = turno.horaFin;
          worksheet.getRow(offset).getCell(6).value = turno.tiempoTotal;
          worksheet.getRow(offset).getCell(7).value = turno.observaciones;

          let celdaCorte = 3
          for (let indexCell = 1; indexCell <= 5; indexCell++) {
            worksheet.getRow(offset).getCell(celdaCorte).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
            celdaCorte += 1;
          }

          offset = offset + 1;
        });

      }
      if (turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad.length > 0) {
        headerObservaciones.forEach((text, index) => {
          let currentCell = worksheet.getRow(offset).getCell(3 + (index));

          if (index == 2) {
            worksheet.mergeCells(`E${offset}:G${(offset)}`);
          }

          if (text) {
            currentCell.value = text;
            currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
            currentCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFC5101A' }
            }
            currentCell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            }
            currentCell.font = {
              name: 'Arial',
              family: 2,
              size: 11,
              bold: true
            }
          }
        });

        offset = offset + 1;
        turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad.forEach((observacion, index) => {
          //if (index == 2){
          worksheet.mergeCells(`E${offset}:G${(offset)}`);
          //}
          worksheet.getRow(offset).getCell(3).value = observacion.fecha;
          worksheet.getRow(offset).getCell(4).value = observacion.hora;
          worksheet.getRow(offset).getCell(5).value = observacion.observaciones;

          let celdaCorte = 3
          for (let indexCell = 1; indexCell <= 5; indexCell++) {
            worksheet.getRow(offset).getCell(celdaCorte).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
            celdaCorte += 1;
          }

          offset = offset + 1;
        });

      }

    });


    //renderizo detalles


    for (let dia = 0; dia <= diaOrder; dia++) {
      let CantRows = 0;
      let fechaDia;
      this.planillaDeTurnos.forEach((turno: PlanillaDeTurnos) => {
        //si es el mismo día cuento las filas que voy a necesitar para calcular el merge
        if (turno.indexDia == dia) {
          fechaDia = new Date(turno.fecha);
          if (turno.moduloDeCargaPlanillaDeTurnosDetallesSolido.length > 0) {
            CantRows = CantRows + (turno.moduloDeCargaPlanillaDeTurnosDetallesSolido?.length + 1);
          }
          if (turno.moduloDeCargaPlanillaDeTurnosCortes.length > 0) {
            CantRows = CantRows + (turno.moduloDeCargaPlanillaDeTurnosCortes?.length + 1);
          }
          if (turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad.length > 0) {
            CantRows = CantRows + (turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad?.length + 1);
          }
        }
      });
      console.log('CantRows--->')
      console.log(CantRows)
      if (CantRows == 0) continue;

      const diaTurno = `${(fechaDia.getDate())}`.padStart(2, '0');
      const mesTurno = `${(fechaDia.getMonth() + 1)}`.padStart(2, '0');
      const anioTurno = fechaDia.getFullYear();
      const fechaTurno = `${diaTurno}-${mesTurno}-${anioTurno}`;
      /* Contenido Fecha */
      worksheet.getCell(`A${baseCell + 1}`).value = fechaTurno;
      worksheet.getCell(`A${baseCell + 1}`).alignment = { vertical: 'middle', horizontal: 'center' }
      worksheet.getCell(`A${baseCell + 1}`).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      /* Cabeceras Fecha */
      worksheet.mergeCells(`A${baseCell + 1}:A${baseCell + (CantRows > 0 ? CantRows - 1 : CantRows)}`);
      worksheet.getCell(`A${baseCell}`).value = "Fecha";


      worksheet.getCell(`A${baseCell}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCFFCC' }
      };
      worksheet.getCell(`A${baseCell}`).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      worksheet.getCell(`A${baseCell}`).font = {
        name: 'Arial',
        family: 2,
        size: 11,
        bold: true
      }

      /* Cabeceras Turno */
      worksheet.getCell(`B${baseCell}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCFFCC' }
      };
      worksheet.getCell(`B${baseCell}`).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      worksheet.getCell(`B${baseCell}`).font = {
        name: 'Arial',
        family: 2,
        size: 11,
        bold: true
      }
      worksheet.getCell(`B${baseCell}`).value = "Turno";
      baseCell = baseCell + (CantRows > 0 ? CantRows : CantRows);

    }
    console.log('workbook.xlsx.writeBuffer()');
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });


      if (bEnviarPlanilla) {
        this.enviarPlanillaSolido(blob);
      } else {
        fs.saveAs(blob, fname + '.xlsx');
      }
    });
    this.exportaPlanilla = false;
  }
  private enviarPlanillaSolido(blob) {
    const titulo = "Enviar Planilla de Turno Solido";
    const text = "Cuerpo del Mail:"
    const textoCuerpoMail = `Se enviara la planilla de turnos. \n
      Buque: ${this.embarque.nombreBuque}`;
    const inputTitle = "Destinatarios";
    const mail = new Mail(`Planilla de turnos.`, `${textoCuerpoMail}`);
    this.moduloCargaService.obtenerDestinatariosPlanillaTurnos('PlanillaDeTurnosSolido').subscribe(x => mail.destinatarios = x);
    const button1 = 'Enviar';
    const button2 = 'Cancelar';

    this.confirmationDialogService.confirm(titulo, text, button1, button2, 'lg', mail, null, inputTitle, true)
      .then(async (confirmed) => {
        if (confirmed) {
          this.hideSpinner.emit(true);

          const convertBlobToBase64 = (blob) => new Promise((resolve, reject) => {
            const reader = new FileReader;
            reader.onerror = reject;
            reader.onload = () => {
              resolve(reader.result);
            };
            reader.readAsDataURL(blob);
          });

          const base64String = await convertBlobToBase64(blob);
          this.moduloCargaService.guardarPlanillaDeTurnosEnviarMail(this.idModuloDeCarga, mail, base64String).subscribe(resp => {
            this.confirmationDialogService.confirm('Planilla enviada', 'Se ha enviado con éxito la planilla de turnos.', 'Cerrar', '', null, null, Tipoalerta.Success)
          });
        }
      })
      .catch((e) => {

        this.hideSpinner.emit(false)
        return
        this.hideSpinner.emit(false);
      });

  }

  calcularRestaEmbarcar(): number {
    let restaEmbarcar = this.pedidoPorPlano - this.getCantTotalABordo();

    return (restaEmbarcar >= 0 ? restaEmbarcar : 0);
  }

  enviarPlanillaTurno(dia, turno, mail) {

    // async enviarPlanillaTurno(dia, turno, mail) {
    // this.enviarMail();
    var ModuloDeCargaPlanillaDeTurnos = this.getTurnos(dia)['controls'][turno].value;

    ModuloDeCargaPlanillaDeTurnos.moduloDeCargaPlanillaDeTurnosDetallesSolido = ModuloDeCargaPlanillaDeTurnos.moduloDeCargaPlanillaDeTurnosDetallesSolido.filter(m =>
      m.exportador ||
      m.linea ||
      m.bodega ||
      m.materialPuerto ||
      m.destino ||
      m.cantidad)
    ModuloDeCargaPlanillaDeTurnos.turnoPuerto = this.getTurnos(dia)['controls'][turno]['controls']['turnoPuerto'].value.turnoPuerto;
    ModuloDeCargaPlanillaDeTurnos.cerrado = true;
    ModuloDeCargaPlanillaDeTurnos.guardadoPorRecibidor = true;
    ModuloDeCargaPlanillaDeTurnos.fecha = this.getTurnos(dia)['controls'][turno]['controls'].turnoPuerto.value.fecha


    if (ModuloDeCargaPlanillaDeTurnos.moduloDeCargaPlanillaDeTurnosDetallesSolido.length > 0) {
      this.moduloCargaService.guardarPlanillaDeTurnosMail(ModuloDeCargaPlanillaDeTurnos, this.idModuloDeCarga, mail).subscribe(
        res => {
          if (!this.getTurnos(dia)['controls'][turno]['controls'].cerrado.value) {

            this.confirmationDialogService.confirm('¡Felicitaciones!', 'Ha enviado con éxito el mail con el turno', 'Cerrar', '', null, null, Tipoalerta.Success)
              .then((confirmed) => {
                if (confirmed) {

                  this.sendRitmos(dia, turno);
                  this.hideSpinner.emit(false)
                  return
                }
              }).catch((
              ) => window.location.reload());
          }
        },
        error => {
          console.log(error)
          this.confirmationDialogService.confirm('¡Error!', 'No se pudo enviar el turno', 'Cerrar', '', null, null, Tipoalerta.Error)
            .then((confirmed) => {
              if (confirmed) {
                this.hideSpinner.emit(false)
                return
              }
            }).catch((
            ) => window.location.reload());
        });
    }
    else
      this.messageService.add({ severity: 'warn', detail: 'Error de Datos', summary: 'No hay datos a enviar', key: 'enviar-turno' });

  }

  guardarTurno(Turno: PlanillaDeTurnos, reload: boolean = false) {
    Turno.fecha = new Date();
    this.moduloCargaService.guardarTurnoPlanillaDeTurnos(Turno, this.idModuloDeCarga).subscribe(res => {
      this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeTurnos.push(Turno);
      this.fillPlanilla();
    }, error => {
      this.confirmationDialogService.confirm('¡Error!', 'No se ha podido guardar el turno.', 'Cerrar', '', null, null, Tipoalerta.Error)
    })
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

}
