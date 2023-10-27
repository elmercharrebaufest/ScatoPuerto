import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModuloDeCarga } from '@ScatoModels/modulo-carga';
import { Exportador } from "@ScatoModels/exportador";
import { MotivosDeCorte } from '@ScatoModels/planilla-turnos/motivo-de-corte';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { LineasService } from '@ScatoServicios/lineas.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { TurnosService } from '@ScatoServicios/turnos.service';
// import * as fs from 'file-saver';
import { MessageService } from 'primeng/api';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { PlanillaDeTurnos, TurnoDetalleLiquido, TurnoPuerto } from '@ScatoModels/planilla-turnos/planilla-de-turnos';
import { CorteTurno } from '@ScatoModels/planilla-turnos/corte-turno';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { Embarque } from '@ScatoModels/embarque';
import { PlanoContentComponent } from 'app/modulos/lineup/plano-de-carga/plano-content/plano-content.component';
import { Destino } from '@ScatoModels/destino';
import { Usuario } from '@ScatoInterfaces/usuario';
import { SessionService } from '@ScatoServicios/session.service';
import { ProcesoCalidadService } from '@ScatoServicios/procesoCalidad.service';
import { ObsCalidad } from '@ScatoModels/obs-calidad';
import { Subject } from 'rxjs';
import { PlanillaTurnoLiquidoExcelService } from '@ScatoServicios/planilla-turno-liquido-excel';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { ToastrService } from 'ngx-toastr';
import { LineaDeEmbarque } from '@ScatoEnums/lineaEmbarque';

@Component({
  selector: 'app-planilla-turno-liquidos',
  templateUrl: './planilla-turno-liquidos.component.html',
  styleUrls: ['./planilla-turno-liquidos.component.css']
})
export class PlanillaTurnoLiquidosComponent implements OnInit {
  @Output() hideSpinner = new EventEmitter<boolean>();
  @Output() recargarGraficos = new EventEmitter<boolean>();
  @ViewChild(PlanoContentComponent, { static: false }) planoContent: PlanoContentComponent;
  formTurnos: FormGroup;
  formCorte: FormGroup;
  toneladasLineas:any[]=[];
  formNuevoTurno: FormGroup;
  obsCalidadForm: FormGroup;
  formExportarExcel: FormGroup;
  formShipParticular: FormGroup;
  moduloCarga: ModuloDeCarga;
  exportadores: any[];
  lineas: any[];
  lineasPlanilla: any[] = [];
  tkInicialPlanilla: any[] = [];
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
  lineaDeEmbarque: any;
  nuevoTurno: PlanillaDeTurnos;
  cortesTurno: CorteTurno[] = [];
  private user: Usuario
  mostrarBtn: boolean = true;
  permisosScato: typeof PermisosScato = PermisosScato;
  fechaHoraInicioCarga: Date;
  totalABordo:number=0;
  embarqueId: number;
  embarque: Embarque;
  vientoAmarre: string;
  direccionViento: string;
  valorCargado: number;
  pedidoPorPlano: number;
  destinoPuerto: Destino[];
  @Input() tablerista: boolean;
  cantidadTurnos: number;
  exportaPlanilla: boolean = false;
  selectedNewTurno: number;
  tipoLineaEmbarque: Array<any> = [];
  tipoLineaProductoTk = [];
  bGrabandoTurnoActivo: boolean = true;
  estadosBuque = [{ id: 1, descripcion: 'PreOperativo' },
  { id: 2, descripcion: 'Cargando' },
  { id: 3, descripcion: 'ControlCalidad' },
  { id: 4, descripcion: 'PostOperativo' }];
  horaTurnoInicio;
  horaTurnoFin;
  diaModalCorte: any;
  turnoModalCorte: any;

  constructor(
    private _builder: FormBuilder,
    private _modalService: NgbModal,
    private datePipe: DatePipe,
    private procesoCalidadService: ProcesoCalidadService,
    private session: SessionService,
    private _turnosService: TurnosService,
    private moduloCargaService: ModuloDeCargaService,
    private procesoService: DatosEmbarquesProcesoService,
    private lineasService: LineasService,
    private confirmationDialogService: ConfirmationDialogService,
    private planillaTurnoExcelService: PlanillaTurnoLiquidoExcelService,
    private embarqueService: EmbarqueService,
    private toastr: ToastrService,
    private cdRef: ChangeDetectorRef
  ) {
    console.log('modulo de carga: ', this.procesoService.getModuloDeCarga());
    console.log('this._turnosService.getTnTotales(): ', this._turnosService.getTnTotales());
    this.user = this.session.getUser();
    this.pedidoPorPlano = this._turnosService.getTnTotales()
    this.embarqueId = this.procesoService.getEmbarqueId();
    console.log('xxxx')
    console.log(this.procesoService.getFechaComienzoCarga());
    this.fechaHoraInicioCarga = this.procesoService.getFechaComienzoCarga();
    this.cargarTurnosBodegasDestinos();
    this.cargarEmbarqueShipParticular();
    this.obtenerTipoLineaEmbarque();
    this.moduloCargaService.actualizarPlanillaLiquido.subscribe(data => {
      if (data) {
        this.obtenerTipoLineaEmbarque();
        this.fechaHoraInicioCarga = this.procesoService.getFechaComienzoCarga();
      }
    });
  }

  ngOnInit(): void {
    this.newForm()
    // this.fillPlanilla();
    setTimeout(() => {
      this.fillPlanilla();
    }, 2000);
    this.initFormularioObs();
    this.initShipParticular();

    setTimeout(() => {
      this.controlarPermisos();
    }, 3000);
  }

  ngAfterViewChecked()
  {       
    this.cdRef.detectChanges();
  }

  private obtenerTipoLineaEmbarque() {
    this.moduloCargaService.listarTipoLineaEmbarque().subscribe(res => {
      this.tipoLineaEmbarque = res;
      this.obtenerLineaProductoTk();
    });
  }

  cargarEmbarqueShipParticular() {
    this.embarqueService.obtenerEmbarque(this.embarqueId).subscribe(res => {
      this.embarque = res;
      if (res.embarqueInformacion != null || res.embarqueInformacion != undefined) {
        if (res.embarqueInformacion.length > 0) {
          const destino: Destino = {
            id: res.embarqueInformacion[0].bandera.id,
            nombre: res.embarqueInformacion[0].bandera.nombre,
          }
          this.destinoPuerto = [destino];
        }
      }
      this.cargarShipParticular(res);
    });
  }

  cargarTurnosBodegasDestinos() {
    this.bodegas = this._turnosService.getBodega();
    
    if (this.formExportarExcel) this.addParcelChecks();

    this.getProductos();
    this.getDestinos();
    
  }

  expandir() {
    document.getElementById('collapsePlanillaTurnosLiquidos').className = "collapse show";
  }

  public desabilitarTurno() {
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

  cargarShipParticular(embarque: Embarque) {
    this.formShipParticular.patchValue(embarque);

    if (embarque.fechaLibrePlatica != null)
      this.formShipParticular.get('fechaLibrePlatica').setValue(new Date(embarque.fechaLibrePlatica).toISOString().slice(0, 10));
    else
      this.formShipParticular.get('fechaLibrePlatica').setValue('');

    if (this.destinoPuerto != null || this.destinoPuerto != undefined) {
      if (this.destinoPuerto.length > 0) {
        this.formShipParticular.get('destino').setValue(this.destinoPuerto[0]);
      }
    }
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

  addTurno(turno: any) {
    if (this.formNuevoTurno.value.fecha != null) {
      let fechaSplit = this.formNuevoTurno.value.fecha.split("-", 3);
      let fechaSeleccionada: Date = new Date(fechaSplit[0], fechaSplit[1] - 1, fechaSplit[2]);

      //Harcodeo una fecha de inicio mínima hasta que se controle por DB
      let fechaInicio = this.fechaHoraInicioCarga != null ? this.fechaHoraInicioCarga : null;
      let diaTurnoToAdd: number = -1;
      let exitFunction: boolean = false;
      let fechaActual: Date = new Date();

      //const diasDiferencia = Math.round((fechaActual-fechaInicio)/(1000*60*60*24));
      if (fechaInicio == undefined || fechaInicio == null) {
        const mensaje = 'No es posible agregar turno debido a que no se ha establecido una fecha de inicio de carga.';
        this.confirmationDialogService.confirm('¡Atención!', mensaje, 'Cerrar', '', null, null, Tipoalerta.Warning)
        return;
      }
      if (fechaSeleccionada < fechaInicio || fechaSeleccionada > new Date()) {
        console.log('xxxxxx Valida')
        console.log(fechaSeleccionada)
        console.log(fechaInicio)
        const mensaje = 'La fecha debe ser entre ' + new Date(fechaInicio).toLocaleDateString() + ' y ' + new Date().toLocaleDateString() + '.';
        this.confirmationDialogService.confirm('¡Atención!', mensaje, 'Cerrar', '', null, null, Tipoalerta.Warning)
        return;
      }
      if (fechaSeleccionada.getFullYear() == fechaActual.getFullYear() &&
        fechaSeleccionada.getMonth() == fechaActual.getMonth() &&
        fechaSeleccionada.getDate() == fechaActual.getDate() &&
        turno > Math.trunc(fechaActual.getHours() / 6) + 1) {
        const mensaje = 'No puedes crear un turno posterior al actual.';
        this.confirmationDialogService.confirm('¡Atención!', mensaje, 'Cerrar', '', null, null, Tipoalerta.Warning);
        return;
      }
      this.addTurnoFechaSeleccionada(turno, exitFunction, diaTurnoToAdd, fechaSeleccionada);
      //this._modalService.dismissAll();
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

        dia.controls?.turnos?.controls?.forEach(turnoLista => {
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
      }).catch((ex) => {
        this._modalService.dismissAll()
      });


  }

  fillPlanilla() {

    this.planillaDeTurnos = (this.procesoService.getModuloDeCarga()?.moduloDeCargaPlanillaDeTurnos as PlanillaDeTurnos[]).filter(x => x.esLiquido == true);
    this.lineaDeEmbarque = this.procesoService.getModuloDeCarga()?.moduloDeCargaLineasDeEmbarque;
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

      });

    }

    //Me obtengo la fecha del último día
    //let diaUltimoTurno;
    //let ultimoDiaIndex;
    if (this.diasTurno != undefined && this.diasTurno['controls'].length > 0) {

      const diasTurno = this.diasTurno['controls'];
      const ultimoDiaIndex = 0; //this.diasTurno['controls'].length - 1;
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
    } 
    //NO CREAR TURNO POR DEFAULT
    // else {
    //   this.setTurnoODia(false, 0, true);
    // }
  }

  setTurnoODia(soloTurno: boolean = false, diaIndex?: number, noExisteTurno:boolean = false) {
    //Si entro aca creo el turno del día actual en hora actual.

    //Calculo el turnoPuerto actual así lo traigo de la DB
    let idTurnoPuerto = Math.floor(new Date().getHours() / 6) + 1

    //Si no, tengo que agregar el turno
    let turno: PlanillaDeTurnos = new PlanillaDeTurnos();

    turno.esLiquido = true;

    turno.guardadoPorRecibidor = false;
    turno.guardadoPorTablerista = false;

    turno.fecha = new Date();
    turno.fechaMiliseconds = new Date().getTime();
    const esLiquido: boolean = true;

    const turnoFecha = this.getFechaFormato(turno.fecha);
    //turno.fecha = turnoFecha;
    if (noExisteTurno){
      this.moduloCargaService.obtenerTurnoPuerto().subscribe((res: TurnoPuerto[]) => {
        res.forEach((turnoPuerto: TurnoPuerto) => {
          if (turnoPuerto.id == idTurnoPuerto) {
            turno.turnoPuerto = turnoPuerto;
            this.setDia(null, turno);
          }
        });
      });
       // Se comenta la funciondad de crear turno en la base de datos.
    }else{
      this.moduloCargaService.obtenerModuloDeCargaPlanillaDeTurnos(idTurnoPuerto, this.procesoService.getModuloDeCarga().id, esLiquido, turnoFecha).subscribe((turnoDb: PlanillaDeTurnos) => {

        if (turnoDb == null) {
          this.moduloCargaService.obtenerTurnoPuerto().subscribe((res: TurnoPuerto[]) => {
            res.forEach((turnoPuerto: TurnoPuerto) => {
              if (turnoPuerto.id == idTurnoPuerto) {
                turno.turnoPuerto = turnoPuerto;
                //Aca me fijo si solo agrego el turno o también tengo que agregar el día. Es solo para la visualización de la planilla
                if (soloTurno) {
                  this.setTurno(diaIndex, turno, true);
                } else {
                  this.setDia(null, turno)
                }
                //this.guardarTurno(turno); // Se comenta la funciondad de crear turno en la base de datos.
              }
            });
          });
        }
      });
    }

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

  getFechaFormato(fechaTurno: Date) {
    const anioTurno: number = fechaTurno.getFullYear();
    const mesTurno: number = fechaTurno.getMonth() + 1;
    const diaTurno: number = fechaTurno.getDate();

    const anioFormato: string = anioTurno.toString();
    const mesFormato: string = mesTurno < 10 ? '0' + mesTurno.toString() : mesTurno.toString();
    const diaFormato: string = diaTurno < 10 ? '0' + diaTurno.toString() : diaTurno.toString();

    const fechaFormato = anioFormato + mesFormato + diaFormato;

    return fechaFormato;
  }

  setTurno(dia: number, Turno: PlanillaDeTurnos, esNuevoTurno?: boolean) {
    if (!esNuevoTurno)
      (this.diasTurno['controls'][dia]['controls'].turnos as FormArray).push(this.initTurno(Turno, esNuevoTurno));
    // SE QUITA ASIGNACION DE TURNO POR DEFAULT A PEDIDO DEL CLIENTE
    // else
    //   (this.diasTurno['controls'][dia]['controls'].turnos as FormArray).insert(0, this.initTurno(Turno, esNuevoTurno));
  }

  setDia(dia: any, turno?: PlanillaDeTurnos, date?: Date) {
    this.diasTurno.push(this.initDia(dia, turno, date));
  }

  getDia(index: number) {
    //Calculo el día y lo convierto a dd--MM-yyyy
    return this.datePipe.transform(this.formTurnos.get('diasTurno')['controls'][index]['controls'].diaTurno.value, 'dd-MM-yyyy');
  }

  getCombos() {
    this.lineas = this.procesoService.getModuloDeCarga()?.moduloDeCargaLineasDeEmbarque;
    let lineasPlanilla = [];
    this.lineas?.forEach(function (item) {
      var i = lineasPlanilla.findIndex(x => x.linea == item.linea);
      if (i <= -1) {
        lineasPlanilla.push({ id: item.id, linea: item.linea });
      }

    });
    this.lineasPlanilla = lineasPlanilla;

    let exportadoresForm = this._turnosService.getExportadores();
    this.exportadores = new Array();
    for (let e of exportadoresForm) {
      //if (e.exportador) this.exportadores.push(e.exportador);
      var i = this.exportadores.findIndex(x => x.id == e.exportador.id);
      if (i <= -1) {
        this.exportadores.push(e.exportador);
      }
    }

    this.hoy = this.datePipe.transform(new Date(), 'dd-MM-yyyy');   

    this.idModuloDeCarga = this.procesoService.getModuloDeCargaId();
    this.vientoAmarre = this.procesoService.getVientoAmarre();
    this.direccionViento = this.procesoService.getDireccionViento();
    let planilla = (this.procesoService.getModuloDeCarga()?.moduloDeCargaPlanillaDeTurnos as PlanillaDeTurnos[])?.filter(x => x.esLiquido == true);
    planilla?.length > 0 ? this.formTurnos.get('diasTurno').patchValue(planilla) : '';

    this.cargarTurnosBodegasDestinos();    
    this.getMotivosCorte();
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

  private obtenerLineaProductoTk() {
    this.idModuloDeCarga = this.procesoService.getModuloDeCarga().id;
    let lineasEmbarque = null;
    this.moduloCargaService.obtenerModuloDeCarga(this.idModuloDeCarga).subscribe(resp => {
      lineasEmbarque = resp.moduloDeCargaLineasDeEmbarque;
      this.lineas = resp.moduloDeCargaLineasDeEmbarque;
    },
      error => { },
      () => {
        this.tipoLineaProductoTk = [];
        let tipoLineas = [];
        this.tipoLineaEmbarque.forEach(function (item) {
          const filtroTipoLinea = lineasEmbarque.filter(linea => linea.tipoLineaEmbarque.id == item.id);
          if (filtroTipoLinea.length > 0) {
            var i = tipoLineas.findIndex(x => x.id == item.id);
            if (i <= -1) {
              tipoLineas.push({ id: item.id, linea: item.linea });
            }
          }
        });
        this.tipoLineaEmbarque = tipoLineas;
        this.tipoLineaEmbarque.forEach(tipo => {
          const filtroTipoLinea = lineasEmbarque.filter(item => item.tipoLineaEmbarque.id == tipo.id);

          if (filtroTipoLinea.length > 0) {
            let materialPuerto = [];
            let tkInicialPlanilla = [];

            filtroTipoLinea.forEach((item) => {
              var i = materialPuerto.findIndex(x => x.id == item.materialPuerto.id);
              if (i <= -1) {
                materialPuerto.push({ id: item.materialPuerto.id, descripcionCorta: item.materialPuerto.descripcionCorta });
              }
            });

            materialPuerto.forEach((material)=>{

                const filtroTks = lineasEmbarque.filter(item => item.tipoLineaEmbarque.id == tipo.id &&
                                                                item.materialPuerto.id == material.id );
                filtroTks.forEach((tks)=>{
                  var i = tkInicialPlanilla.findIndex(x => x.tkInicial == tks.tkInicial);
                  if (i <= -1) {
                    tkInicialPlanilla.push({ tkInicial: tks.tkInicial });
                  }
                });
                material.tkIniciales = tkInicialPlanilla
                tkInicialPlanilla = [];
            });

            this.tipoLineaProductoTk.push({
              tipoLinea: tipo,
              materialPuerto: materialPuerto
            });
            console.log('tipoLineaProductoTk--->>')
            console.log(this.tipoLineaProductoTk)
          }
        });
      });
  }

  obtenerMaterialxLinea(lineaTurno) {
    const linea = lineaTurno['controls'].tipoLineaEmbarque.value;
    let materialPuerto = [];
    const materiales = this.tipoLineaProductoTk.filter(item => item.tipoLinea?.id == linea);

    if (materiales != null || materiales != undefined) {
      if (materiales.length > 0) {
        materialPuerto = materiales[0].materialPuerto;
      }
    }
    return materialPuerto;
  }

  obtenerTkxLinea(lineaTurno) {
    const linea = lineaTurno['controls'].tipoLineaEmbarque?.value;
    const material = lineaTurno['controls'].materialPuerto?.value;
    let tkInicialPlanilla = [];

    this.tipoLineaProductoTk.forEach(item =>{
      item.materialPuerto.forEach((itemMaterial) =>{
        if (item.tipoLinea?.id == linea && itemMaterial.id == material){
          itemMaterial.tkIniciales.forEach((tks)=>{
            tkInicialPlanilla.push({tkInicial:tks.tkInicial});
          });
        }
      });
    });
    return tkInicialPlanilla;
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

    this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Success)
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

          let Observaciones: ObsCalidad = {
            fechaHoraObs: fechaHora,
            observaciones: observaciones,
            observacionVisible: observacionVisible
          };
          this.procesoCalidadService.guardarObservacionesDeCalidad(idPlanillaDeTurnos, [Observaciones]).subscribe(res => {
            console.log("::::ObsDeCalidad RES:::::", res);
          });
          this.obsCalidadForm.reset();
        }
        else
          return;
      }).catch(() => window.location.reload());
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
    let controSel = this.getTurnoDetalles(dia, turno);
    const lineaSeleccionada = result['controls'].tipoLineaEmbarque.value.linea;

    controSel['controls'][index]['controls'].linea.setValue(0)
    controSel['controls'][index]['controls'].materialPuerto.setValue(0);
    controSel['controls'][index]['controls'].temperatura.enable();
    controSel['controls'][index]['controls'].medidaInicialCM.enable();
    controSel['controls'][index]['controls'].medidaInicialMM.enable();
    controSel['controls'][index]['controls'].medidaFinalCM.enable();
    controSel['controls'][index]['controls'].medidaFinalMM.enable();
    controSel['controls'][index]['controls'].medidaInicialCMyMM.enable();
    controSel['controls'][index]['controls'].medidaFinalCMyMM.enable();
    controSel['controls'][index]['controls'].destino.enable();
    controSel['controls'][index]['controls'].tk.enable();

    if (lineaSeleccionada != null || lineaSeleccionada != undefined) {
      controSel['controls'][index]['controls'].materialPuerto.setValue(0);
      controSel['controls'][index]['controls'].tk.setValue(0);
      if (lineaSeleccionada == 'Vicentin') {
        controSel['controls'][index]['controls'].temperatura.setValue(0);
        controSel['controls'][index]['controls'].medidaInicialCM.setValue(0);
        controSel['controls'][index]['controls'].medidaInicialMM.setValue(0);
        controSel['controls'][index]['controls'].medidaFinalCM.setValue(0);
        controSel['controls'][index]['controls'].medidaFinalMM.setValue(0);
        //controSel['controls'][index]['controls'].destino.setValue(0);
        controSel['controls'][index]['controls'].tk.setValue(0);

        controSel['controls'][index]['controls'].temperatura.disable();
        controSel['controls'][index]['controls'].medidaInicialCM.disable();
        controSel['controls'][index]['controls'].medidaInicialMM.disable();
        controSel['controls'][index]['controls'].medidaFinalCM.disable();
        controSel['controls'][index]['controls'].medidaFinalMM.disable();
        controSel['controls'][index]['controls'].medidaInicialCMyMM.disable();
        controSel['controls'][index]['controls'].medidaFinalCMyMM.disable();
        //controSel['controls'][index]['controls'].destino.disable();
        controSel['controls'][index]['controls'].tk.disable();
      }
    }


  }

  agregarCorteLiquido(dia, turno, modal: any) {
    const horaInicio = this.formCorte.getRawValue().horaInicio;
    const horaFin = this.formCorte.getRawValue().horaFin;
    let motivosDeCorte = this.formCorte.getRawValue().motivosDeCorte;
    let observaciones = this.formCorte.getRawValue().observaciones;

    if (motivosDeCorte == null) {
      this.confirmationDialogService.confirm('¡Atención!', 'Debe seleccionar un motivo de corte.', 'Cerrar', '', null, null, Tipoalerta.Warning);
      return;
    }
    if (observaciones == null) {
      this.confirmationDialogService.confirm('¡Atención!', 'Debe introducir una observación para el corte.', 'Cerrar', '', null, null, Tipoalerta.Warning);
      return;
    }
    if (horaInicio == null || horaFin == null) {
      this.confirmationDialogService.confirm('¡Atención!', 'Debe seleccionar fechas para registrar un corte.', 'Cerrar', '', null, null, Tipoalerta.Warning);
      return;
    }

    const turnoSel = this.getTurnos(dia)['controls'][turno]['controls'];
    const turnoSeleccionado = turnoSel.turnoPuerto.value.turnoPuerto.orden;
    const horaTurnoInicio = this.ordenTurnoTipo(turnoSeleccionado, false);
    const horaTurnoFin = this.ordenTurnoTipo(turnoSeleccionado, true);
    let bErrorFechas = false;
    console.log('fechas 1 --> ' + horaTurnoInicio + '  ' + horaTurnoFin)
    console.log('fechas 2 --> ' + horaInicio + '  ' + horaFin)

    if (horaInicio>=horaFin){
      this.confirmationDialogService.confirm('¡Atención!', 'La fecha de inicio no puede ser mayor o igual a la fecha fin.', 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }

    if (horaFin < horaTurnoInicio) bErrorFechas = true;
    if (horaFin > horaTurnoFin) bErrorFechas = true;
    if (bErrorFechas) {
      this.confirmationDialogService.confirm('¡Atención!', 'La fecha de inicio y fin no corresponde al turno seleccionado.', 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }

    this.confirmationDialogService.confirm('Planilla de Liquido', '¿Esta seguro de querer agregar un corte en la hora indicada?', 'Aceptar', 'Cancelar', null, null, Tipoalerta.Warning)
      .then((confirmed) => {
        if (confirmed) {
          this.getCorteTurnos(dia, turno).push(this.initCorte(this.formCorte.getRawValue()));
          this._modalService.dismissAll(modal);
        }
      })
      .catch((res) => { console.log('Error en agregarCorteLiquido: ',res) });
  }

  openModalCorte(modal, dia, turno) {
    this.diaModalCorte = dia;
    this.turnoModalCorte = turno;
    this.formCorte.reset();
    const turnoSel = this.getTurnos(dia)['controls'][turno]['controls'];
    if (!turnoSel.guardadoPorTablerista.value) {
      this._modalService.open(modal, { windowClass: 'window-modal-corte', backdropClass: 'modal-corte' }).result
      .then(() => {
        console.log('_modalService.open');
        // this.agregarCorteLiquido(dia, turno);
      })
      .catch((res) => { console.log('Error en ModalCorte: ',res) });
    } else {
      this.confirmationDialogService.confirm('¡Atención!', 'No puedes agregar un corte a un turno enviado a recibidores.', 'Cerrar', '', null, null, Tipoalerta.Warning)
    }
  }

  private ordenTurnoTipo(turnoOrden, esFinal: boolean) {
    let turnoValor = '';
    switch (turnoOrden) {
      case 1:
        turnoValor = !esFinal ? '00:00' : '05:59';
        break;
      case 2:
        turnoValor = !esFinal ? '06:00' : '11:59';
        break;
      case 3:
        turnoValor = !esFinal ? '12:00' : '17:59';
        break;
      case 4:
        turnoValor = !esFinal ? '18:00' : '23:59';
        break;
    }
    return turnoValor;
  }

  calcularTotal() {

    const fechaDesde = this.formCorte.get('horaInicio').value;
    const fechaHasta = this.formCorte.get('horaFin').value;
    if (fechaDesde == null || fechaHasta == null) return;

    let desde = fechaDesde ? fechaDesde.split(':') : '',
      hasta = fechaHasta ? fechaHasta.split(':') : '',
      f_desde = new Date(),
      f_hasta = new Date(),
      total = new Date();

    f_desde.setHours(desde[0], desde[1], 0, 0);
    f_hasta.setHours(hasta[0], hasta[1], 0, 0);

    total.setHours(f_hasta.getHours() - f_desde.getHours(), f_hasta.getMinutes() - f_desde.getMinutes(), 0, 0);
    if (total != null || total != undefined) {
      this.formCorte.get('tiempoTotal').setValue(`${total?.getHours() < 10 ? '0' + total?.getHours() : total?.getHours()}:${total?.getMinutes() < 10 ? '0' + total?.getMinutes() : total?.getMinutes()}`)
    }
  }

  getRowSpan(dia: any) {
    let contador = 0;
    for (let turnos of dia.controls.turnos.controls) {
      contador += this.getRowSpanTurno(turnos);
      contador += 3;
    }
    return contador;
  }

  getRowSpanTurno(turno: any) {
    if (turno.controls.moduloDeCargaPlanillaDeTurnosCortes.length > 0)
      return turno.controls['moduloDeCargaPlanillaDeTurnosDetallesLiquido'].controls.length + 1;
    else
      return turno.controls['moduloDeCargaPlanillaDeTurnosDetallesLiquido'].controls.length;
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
    this.totalABordo =contador;
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
          (planillaTurnoDetalles as FormArray).push(this.initLinea(element, turno['controls'][turnoIndex]['controls'].guardadoPorTablerista.value));
        });

        //HAGO ESTO PARA COMPLETAR CON LINEAS VACÝAS HASTA LLEGAR A 4.
        /*for (let i = 0; i <= detalle.length - 1; i++) {
          (turno['controls'][turnoIndex]['controls']['moduloDeCargaPlanillaDeTurnosDetallesLiquido'] as FormArray).push(this.initLinea(null, turno['controls'][turnoIndex]['controls'].guardadoPorTablerista.value));
        }*/
      }
      //Si no hay detalles completo con 4 lineas vacías.
    } else {
      for (let i = 1; i <= 1; i++) {
        (turno['controls'][turnoIndex]['controls']['moduloDeCargaPlanillaDeTurnosDetallesLiquido'] as FormArray).push(this.initLinea());
      }
    }
  }

  initTurnoCortes(corte: CorteTurno[], turno: PlanillaDeTurnos, turnoIndex?: number) {
    corte.forEach(element => {
      (turno['controls'][turnoIndex]['controls']['moduloDeCargaPlanillaDeTurnosCortes'] as FormArray).push(this.initCorte(element, turno['controls'][0]['controls'].cerrado.value));
    });
  }

  initTurno(turnoPuerto?: PlanillaDeTurnos, esNuevoTurno?: boolean) {
    let fg: FormGroup;

    if (!esNuevoTurno) {
      fg = this._builder.group({
        moduloDeCargaPlanillaDeTurnosDetallesLiquido: this._builder.array([]),
        moduloDeCargaPlanillaDeTurnosCortes: this._builder.array([]),
        guardadoPorTablerista: turnoPuerto ? turnoPuerto.guardadoPorTablerista : false,
        cerrado: turnoPuerto ? turnoPuerto.guardadoPorTablerista : false,
        turnoPuerto: turnoPuerto ?? null,
        id: turnoPuerto ? turnoPuerto.id : '0'
      });
    } else {
      fg = this._builder.group({
        moduloDeCargaPlanillaDeTurnosDetallesLiquido: this._builder.array([this.initLinea()]),
        moduloDeCargaPlanillaDeTurnosCortes: this._builder.array([]),
        guardadoPorTablerista: turnoPuerto ? turnoPuerto.guardadoPorTablerista : false,
        cerrado: turnoPuerto ? turnoPuerto.guardadoPorTablerista : false,
        turnoPuerto: turnoPuerto ?? null,
        id: turnoPuerto ? turnoPuerto.id : '0'
      });
    }

    return fg;
  }

  compareFieldLineas(c1: any, c2: any) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  compareFields(c1: Exportador, c2: Exportador) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  initLinea(line?: any, guardado?: boolean) {
    let bloqueoVicentin = false;
    let destino = 0;
    let tipoLineaEmbarque = null;

    if (line != null || line != undefined) {
      const filtro = this.lineaDeEmbarque.filter(x => x.id == line.linea_Id);

      destino = line.destino?.id;
      //const linea_Id = line ? line.linea_Id : 0;   
      
      if (filtro != null || filtro != undefined) {
        if (filtro.length > 0) {          

          if (filtro[0].tipoLineaEmbarque.linea == 'Vicentin'){
            tipoLineaEmbarque = filtro[0].tipoLineaEmbarque;
            bloqueoVicentin = true;
          }else{
            tipoLineaEmbarque = filtro[0].tipoLineaEmbarque;
          }            
        }
      }
    }      

    let medidaInicialCM = line?.medidaInicialCM > 0 ? line.medidaInicialCM : 0;
    let medidaInicialMM = line?.medidaInicialMM > 0 ? line.medidaInicialMM : 0;

    let medidaFinalCM = line?.medidaFinalCM > 0 ? line.medidaFinalCM : 0;
    let medidaFinalMM = line?.medidaFinalMM > 0 ? line.medidaFinalMM : 0;

    const formulario = this._builder.group({
      linea: [{ value: line ? line.linea_Id : '', disabled: guardado },],
      tipoLineaEmbarque: [{ value: line ? tipoLineaEmbarque?.id : '', disabled: guardado },],
      exportador: [{ value: line ? line.exportador : '', disabled: guardado }],
      bodegaParcel: [{ value: line ? line.bodegaParcel : '', disabled: guardado }],
      materialPuerto: [{ value: line ? line.materialPuerto.id : '', disabled: guardado }],
      tk: [{ value: line ? line.tk : '', disabled: bloqueoVicentin? bloqueoVicentin : guardado }],
      temperatura: [{ value: line ? line.temperatura : '', disabled: bloqueoVicentin }],
      medidaInicialCMyMM: [{ value: line?.medidaInicialCM >= 0 ? line.medidaInicialMM >= 0 ? `${line.medidaInicialCM},${line.medidaInicialMM}` :`${line.medidaInicialCM},0`:"", disabled: bloqueoVicentin }],
      medidaInicialCM: [{ value: medidaInicialCM , disabled: bloqueoVicentin }],
      medidaInicialMM: [{ value: medidaInicialMM , disabled: bloqueoVicentin }],
      medidaFinalCMyMM: [{ value: line?.medidaFinalCM >= 0 ? line.medidaFinalMM >= '0' ? `${line.medidaFinalCM},${line.medidaFinalMM}` :`${line.medidaFinalCM},0`:"", disabled: bloqueoVicentin }],
      medidaFinalCM: [{ value: medidaFinalCM , disabled: bloqueoVicentin }],
      medidaFinalMM: [{ value: medidaFinalMM , disabled: bloqueoVicentin }],
      destino: [{ value: destino, disabled: guardado }],
      cantidad: [{ value: line ? Math.round(line.cantidad) : '', disabled: false }],
      id: [{ value: line ? line.id : null, disabled: false }]
    });
    return formulario;
  }

  initCorte(corte?: any, guardado?: boolean) {
    guardado = false;
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
            const lineaFiltro = this.lineas?.filter(linea => linea.id == lineaId);
            if (lineaFiltro?.length > 0) {
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
    if (this.bodegas != null || this.bodegas != undefined) {
      this.bodegas.forEach(b => {
        if (!this.destinos?.find(d => d.nombre == b.destino.nombre)) {
          this.destinos.push(b.destino);
        }
      });
    }
  }

  private calcularResultadoMediciones(lineaTurno, inicial, final, densidad){
    console.log(' resultado ==>')
    console.log(' ', inicial, final, densidad)

    let valInicial = inicial.toString();
    let valFinal = final.toString();
    let valDensidad = densidad.toString();

    valInicial = valInicial != null ? valInicial : '0';
    valFinal = valFinal != null ? valFinal : '0';
    valDensidad = valDensidad != null ? valDensidad : '0';

    valInicial = valInicial.toString().replace(',', '');
    valFinal = valFinal.toString().replace(',', '');
    valDensidad = valDensidad.toString().replace(',', '');
    
    console.log(' ', valInicial, valFinal, valDensidad)

    if (valDensidad == null || valDensidad == '0'){
      this.toastr.error('No se encontro densidad para el material y temperatura ingresada','Error ingreso de mediciones!');
      return false;
    }

    if (valInicial == null || valInicial == '0'){
      this.toastr.error('No se encontraron resultados con los valores de mediciones iniciales ingresados','Error ingreso de mediciones!');
      return false;
    }
    
    if (valFinal == null || valFinal == '0'){
      this.toastr.error('No se encontraron resultados con los valores de mediciones finales ingresados','Error ingreso de mediciones!');
      return false;
    }

    let cantidad = (Number(valInicial) - Number(valFinal)) * Number(valDensidad);
    cantidad = cantidad / 1000
    cantidad = parseInt(cantidad.toString());
    lineaTurno.cantidad.setValue(cantidad);
  }

  getCantidadLinea(linea: any) {

    let lineaTurno = linea?.controls;
    let materialPuertoSel = lineaTurno.materialPuerto.value;
    materialPuertoSel = (materialPuertoSel == undefined || materialPuertoSel == null)? '0' : materialPuertoSel;
    if (materialPuertoSel == '0')
      lineaTurno.tk.setValue(0);


    lineaTurno.cantidad.setValue(0);
    if ((lineaTurno?.medidaInicialCM.value >= 0) &&
      (lineaTurno?.medidaInicialMM.value >= 0) &&
      (lineaTurno?.medidaFinalCM.value >= 0) &&
      (lineaTurno?.medidaFinalMM.value >= 0) &&
      lineaTurno?.tk.value &&
      lineaTurno?.temperatura &&
      lineaTurno?.materialPuerto) {
      const medidaInicialCM = lineaTurno?.medidaInicialCM.value;
      const medidaInicialMM = lineaTurno?.medidaInicialMM.value;
      const medidaFinalCM = lineaTurno?.medidaFinalCM.value;
      const medidaFinalMM = lineaTurno?.medidaFinalMM.value;
      const tkLinea = lineaTurno?.tk.value.toString().padStart(3, "0");;
      const temperatura =  Math.round(lineaTurno?.temperatura.value);
      const materialPuerto = lineaTurno?.materialPuerto?.value;
      console.log(' input medidaInicialMM ==>')
      console.log(' ', medidaInicialCM, medidaInicialMM, tkLinea)
      console.log(' input medidaFinalMM ==>')
      console.log(' ', medidaFinalCM, medidaFinalMM, tkLinea)
      console.log(' input densidad ==>')
      console.log(' ', materialPuerto, temperatura)
      Promise.all([
        //await
        this.lineasService.obtenerLlenadoMilimetroPorTanque(medidaInicialCM, medidaInicialMM, tkLinea).toPromise(),
        this.lineasService.obtenerLlenadoMilimetroPorTanque(medidaFinalCM, medidaFinalMM, tkLinea).toPromise(),
        this.lineasService.obtenerDensidadPorTemperaturaDeMaterial(materialPuerto, temperatura).toPromise()
      ]).then(([inicial, final, densidad]) => {
        this.calcularResultadoMediciones(lineaTurno, inicial, final, densidad)
      }).catch((ex)=> {
        const mensaje = `No se pudo conectar al servicio ${ex.url}`;
        this.toastr.error(mensaje,'Error de conexión a los servicios!');
      });
    }
  }

  async getImgMolinos() {
    let response = await fetch('assets/iconMolinos.png');
    let buffer = await response.arrayBuffer();
    return buffer;
  }

  async onExportarExcelLiquido(){
    this.exportaPlanilla = true;
    
    if (this.toneladasLineas.length == 0) {
      this.addToneladasLineas();
    }else{
      this.toneladasLineas = [];
      this.addToneladasLineas();
    }
    
    await this.planillaTurnoExcelService.generarExcelPorParcel(this.procesoService, this.planillaDeTurnos, this.lineas,false,  false,this.totalABordo, this.toneladasLineas);
    this.exportaPlanilla = false;
  }

  private addToneladasLineas(){
    this.toneladasLineas.push({linea:'nueva', total:this.getToneladasLinea('nueva')});
      this.toneladasLineas.push({linea:'vieja', total:this.getToneladasLinea('vieja')});
      this.toneladasLineas.push({linea:'vicentin', total:this.getToneladasLinea('vicentin')});
      this.toneladasLineas.push({linea:'biodiesel', total:this.getToneladasLinea('biodiesel')});
  }

  calcularRestaEmbarcar(): number {
    let restaEmbarcar = this.pedidoPorPlano - this.getCantTotalABordo();
    return (restaEmbarcar >= 0 ? restaEmbarcar : 0);
  }

  private asignarFechaHoraTurno(planillaTurno) {

    let turnoFechaHora = this.getFechaFormato(planillaTurno.fecha);

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
    planillaTurno.fecha = turnoFechaHora;
  }

  guardarTurno(planillaTurno: PlanillaDeTurnos, reload: boolean = false) {

    planillaTurno.fecha = new Date();
    this.asignarFechaHoraTurno(planillaTurno);

    const planillaTurnoRegistro = {
      esLiquido: planillaTurno.esLiquido,
      fecha: null,
      fechaTurno: planillaTurno.fecha,
      fechaMiliseconds: planillaTurno.fechaMiliseconds,
      guardadoPorRecibidor: planillaTurno.guardadoPorRecibidor,
      guardadoPorTablerista: planillaTurno.guardadoPorTablerista,
      turnoPuerto: planillaTurno.turnoPuerto
    }

    this.moduloCargaService.guardarTurnoPlanillaDeTurnos(planillaTurnoRegistro, this.idModuloDeCarga).subscribe(res => {
      this.moduloCargaService.obtenerModuloDeCarga(this.idModuloDeCarga).subscribe(resp => {
        if (resp.moduloDeCargaPlanillaDeTurnos.length > 0) {
          this.procesoService.setEmbarque(this.embarqueId);
          this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeTurnos = [];
          const selModuloDeCargaPlanillaDeTurnos = resp.moduloDeCargaPlanillaDeTurnos;
          this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeTurnos = selModuloDeCargaPlanillaDeTurnos;
          this.fillPlanilla();
        }
      });
    }, error => {
      console.log(error);
      this.confirmationDialogService.confirm('¡Error!', 'No se ha podido guardar el turno.', 'Cerrar', '', null, null, Tipoalerta.Error)
    })
  };

  guardarTurnoDetallado(planillaTurno, moduloDeCargaPlanillaDeTurnosCortes, moduloDeCargaPlanillaDeTurnosDetallesLiquido, enviado, Turno){
    if (moduloDeCargaPlanillaDeTurnosCortes.length == 0 && moduloDeCargaPlanillaDeTurnosDetallesLiquido.length == 0) {
      var texto = "No se puede guardar, debido a que no se han completado la información para el registro del corte o turno.\nConsiderar:\nPara" +
                   " linea vicentin se debe completar linea, producto y cantidad.\nPara linea nueva, vieja o biodisel se debe completar linea, producto Tk y mediciones.\n";
      this.confirmationDialogService.confirm('¡Atención!', texto, 'Cerrar', '', null, null, Tipoalerta.Warning)
        .then((confirmed) => {
          if (confirmed)
            return;
          else
            return;
        }).catch();
    }
    else {
      this.confirmationDialogService.confirm(enviado ? "Enviar turno" : "Guardar turno", "Está seguro que desea " + (enviado ? "enviar" : "guardar") + " el turno?", "Aceptar", "Cancelar")
        .then((confirmed) => {
          if (confirmed) {
            this.bGrabandoTurnoActivo = false;
            this.moduloCargaService.guardarTurnoPlanillaDeTurnos(planillaTurno, this.idModuloDeCarga, enviado).subscribe(res => {
              const guardadoPorTablerista = Turno.guardadoPorTablerista['value'] ? true : false;
              let mensajeGuardado = guardadoPorTablerista? 'Sus cambios se enviaron a Recibidores' : 'Se guardaron los cambios en el turno correctamente';
              mensajeGuardado = enviado ?  'El turno fue enviado a Recibidores' : mensajeGuardado;
              this.confirmationDialogService.confirm('¡Atención!', mensajeGuardado, 'Aceptar', '', null, null, Tipoalerta.Success);
              if (enviado)
                this.enviarRecibidores();

              this.recargarTurnosPlanilla();
              this.bGrabandoTurnoActivo = true;
            }, error => {
              console.log(error);
              this.bGrabandoTurnoActivo = true;
              this.confirmationDialogService.confirm("¡Error!", "No se ha podido " + enviado ? "enviar" : "guardar" + " el turno.", "Cerrar", "", null, null, Tipoalerta.Error)
            })
          }
        })
        .catch((e) => {
          this.hideSpinner.emit(false)
          return;
        });
    }
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
        const turnoDestinoSel = this.destinos.filter(destino => destino.id === turnoDetalle['controls'].destino.value)
        const turnoDestinoVal = turnoDestinoSel.length > 0 ? turnoDestinoSel[0] : 0

        let tkInicial = turnoDetalle['controls'].tk.value;
        let bodegaParcelVal = turnoDetalle['controls'].bodegaParcel.value;
        let materialPuertoVal = turnoDetalle['controls'].materialPuerto.value;
        let exportadorVal = turnoDetalle['controls'].exportador.value;
        let tipoLineaEmbarqueVal = turnoDetalle['controls'].tipoLineaEmbarque.value;
        let tipoLineaEmbarqueNombre = turnoDetalle['controls'].tipoLineaEmbarque?.value?.linea;
        tipoLineaEmbarqueNombre = (tipoLineaEmbarqueNombre != undefined || tipoLineaEmbarqueNombre !=null) ? tipoLineaEmbarqueNombre : '';
        let lineaSeleccionada = null;

        if (tipoLineaEmbarqueVal == LineaDeEmbarque.VICENTIN){
          lineaSeleccionada = this.lineas.filter(linea => linea.materialPuerto.id == materialPuertoVal && linea.tipoLineaEmbarque?.id == tipoLineaEmbarqueVal);
        }            
        else{
          lineaSeleccionada = this.lineas.filter(linea => linea.materialPuerto.id == materialPuertoVal && linea.tkInicial == tkInicial && linea.tipoLineaEmbarque?.id == tipoLineaEmbarqueVal);
        }            

        if (turnoDetalle['controls'].linea.value == undefined || turnoDetalle['controls'].linea.value == null){
          turnoDetalle['controls'].linea.setValue(0)
        }
        if (turnoDetalle['controls'].linea.value == '' || turnoDetalle['controls'].linea.value == '0') {
          if (lineaSeleccionada != null || lineaSeleccionada != undefined) {
            turnoDetalle['controls'].linea.setValue(lineaSeleccionada[0]?.id)
          }
        }
        let lineaIdVal = turnoDetalle['controls'].linea.value;
        lineaIdVal = (lineaIdVal != null || lineaIdVal != undefined)? lineaIdVal : 0;      

        tipoLineaEmbarqueNombre =  this.tipoLineaEmbarque.find(x => x.id == tipoLineaEmbarqueVal).linea;

        let materialPuerto = this.tipoLineaProductoTk.find(x => x.materialPuerto.find( y => y.id == materialPuertoVal));
        let materialPuertoNombre = materialPuerto.materialPuerto.find(x => x.id == materialPuertoVal).descripcionCorta;

        if (tipoLineaEmbarqueNombre > '') {
            let bPlanillaIncompleta: boolean = this.bValidaPlanillaOtrasLineas(turnoDetalle);
            if (bPlanillaIncompleta) {
              var mensaje = "No se ha completado todos los datos requeridos para guardar el turno.";
              this.confirmationDialogService.confirm('¡Atención!', mensaje, 'Cerrar', '', null, null, Tipoalerta.Warning)
              return;
            }

            let medidaFinalCM = turnoDetalle['controls'].medidaFinalCM.value;
            let medidaFinalMM = turnoDetalle['controls'].medidaFinalMM.value;
            let medidaInicialCM = turnoDetalle['controls'].medidaInicialCM.value;
            let medidaInicialMM = turnoDetalle['controls'].medidaInicialMM.value;
            let temperatura = turnoDetalle['controls'].temperatura.value;
            let cantidad = turnoDetalle['controls'].cantidad.value;

            const objTurnosDetalles = {
              bodegaParcel: bodegaParcelVal,
              cantidad: Math.round(cantidad),
              destino: turnoDestinoVal,
              exportador: exportadorVal,
              id: turnoDetalle.value.id,
              linea_id: lineaIdVal,
              medidaFinalCM: medidaFinalCM,
              medidaFinalMM: medidaFinalMM,
              medidaInicialCM: medidaInicialCM,
              medidaInicialMM: medidaInicialMM,
              temperatura: temperatura,
              MaterialPuerto: { 'Id': materialPuertoVal, 'DescripcionCorta' : materialPuertoNombre},
              Tk: tkInicial            
            }
            moduloDeCargaPlanillaDeTurnosDetallesLiquido.push(objTurnosDetalles);
        }
      }

      let planillaTurno = {
        fecha: Turno.turnoPuerto['value'].fecha,
        fechaTurno: null,
        esLiquido: true,
        guardadoPorTablerista: Turno.guardadoPorTablerista['value'],
        id: Turno.id['value'],
        moduloDeCargaPlanillaDeTurnosCortes: moduloDeCargaPlanillaDeTurnosCortes,
        moduloDeCargaPlanillaDeTurnosDetallesLiquido: moduloDeCargaPlanillaDeTurnosDetallesLiquido,
        turnoPuerto: Turno.turnoPuerto['value'].turnoPuerto
      }

      if (planillaTurno.id == null || planillaTurno.id == 0) {
        this.asignarFechaHoraTurno(planillaTurno);
        planillaTurno.fechaTurno = planillaTurno.fecha;
        planillaTurno.fecha = null;
      }

      if (enviado){
        this.existenTurnosNoCerrados(Turno).subscribe( resp =>{
          const existeTurno = resp;
          let mensaje = "No se puede enviar el turno actual a recibidores, debido a que existen ";
          mensaje += " turnos anteriores que aun no se han enviado.";
          if (existeTurno){
            this.confirmationDialogService.confirm("¡Atención!", mensaje, "Cerrar", "", null, null, Tipoalerta.Warning);
            return;
          }else{
            this.guardarTurnoDetallado(planillaTurno, moduloDeCargaPlanillaDeTurnosCortes, moduloDeCargaPlanillaDeTurnosDetallesLiquido, enviado, Turno);
          }
        });
      }else{
        this.guardarTurnoDetallado(planillaTurno, moduloDeCargaPlanillaDeTurnosCortes, moduloDeCargaPlanillaDeTurnosDetallesLiquido, enviado, Turno);
      }

    } catch (error) {
      console.error(error);
    }
  };

  private bValidaPlanillaOtrasLineas(turnoDetalle) {

    let bPlanillaIncompleta: boolean = false;
    const lineaSeleccionada = turnoDetalle['controls'].tipoLineaEmbarque?.value;

    if (lineaSeleccionada != null || lineaSeleccionada != undefined) {
      const turnoDestinoSel = this.destinos.filter(destino => destino.id === turnoDetalle['controls'].destino.value)
      const turnoDestinoVal = turnoDestinoSel.length > 0 ? turnoDestinoSel[0].id : 0
      const tkVal = turnoDetalle['controls'].tk.value;
      let bodegaParcelVal = turnoDetalle['controls'].bodegaParcel.value;
      let materialPuertoVal = turnoDetalle['controls'].materialPuerto.value;
      let exportadorVal = turnoDetalle['controls'].exportador.value.id;
      let medidaFinalCM = '';
      let medidaFinalMM = '';
      let medidaInicialCM = '';
      let medidaInicialMM = '';
      let medidaInicialCMyMM = '';
      let medidaFinalCMyMM = '';
      let temperatura = '';

      if (turnoDetalle['controls'].medidaFinalCM.value != null || turnoDetalle['controls'].medidaFinalCM.value != undefined)
        medidaFinalCM = turnoDetalle['controls'].medidaFinalCM.value;

      if (turnoDetalle['controls'].medidaFinalMM.value != null || turnoDetalle['controls'].medidaFinalMM.value != undefined)
        medidaFinalMM = turnoDetalle['controls'].medidaFinalMM.value;

      if (turnoDetalle['controls'].medidaInicialCM.value != null || turnoDetalle['controls'].medidaInicialCM.value != undefined)
        medidaInicialCM = turnoDetalle['controls'].medidaInicialCM.value;

      if (turnoDetalle['controls'].medidaInicialMM.value != null || turnoDetalle['controls'].medidaInicialMM.value != undefined)
        medidaInicialMM = turnoDetalle['controls'].medidaInicialMM.value;

      if (turnoDetalle['controls'].medidaInicialCMyMM.value != null || turnoDetalle['controls'].medidaInicialCMyMM.value != undefined)
        medidaInicialCMyMM = turnoDetalle['controls'].medidaInicialMM.value;

      if (turnoDetalle['controls'].medidaFinalCMyMM.value != null || turnoDetalle['controls'].medidaFinalCMyMM.value != undefined)
        medidaFinalCMyMM = turnoDetalle['controls'].medidaInicialMM.value;

      if (turnoDetalle['controls'].temperatura.value != null || turnoDetalle['controls'].temperatura.value != undefined)
        temperatura = turnoDetalle['controls'].temperatura.value;

      materialPuertoVal = (materialPuertoVal == undefined || materialPuertoVal == null)? '' : materialPuertoVal;
      bodegaParcelVal = (bodegaParcelVal == undefined || bodegaParcelVal == null)? '' : bodegaParcelVal;

      if (lineaSeleccionada != LineaDeEmbarque.VICENTIN) {
        if (turnoDestinoVal == '0' ||
          (tkVal == '' || tkVal == '0') ||
          (bodegaParcelVal == '' || bodegaParcelVal == '0') ||
          (materialPuertoVal == '' || materialPuertoVal == '0') ||
          (exportadorVal == '' || exportadorVal == '0') ||
          (temperatura == '' || temperatura == '0')) {
          console.log('No es Vicentin')
          bPlanillaIncompleta = true;
        }
      }

      if (lineaSeleccionada == LineaDeEmbarque.VICENTIN) {
        if ((bodegaParcelVal == '' || bodegaParcelVal == '0') ||
          (exportadorVal == '' || exportadorVal == '0') ||
          (materialPuertoVal == '' || materialPuertoVal == '0')) {
          console.log('Es Vicentin')
          bPlanillaIncompleta = true;
        }
      }
    }

    return bPlanillaIncompleta;
  }

  private enviarRecibidores() {
    const embarque_id = this.procesoService.getEmbarqueSelected().id;
    let embarqueSel;
    this.embarqueService.obtenerEmbarque(embarque_id).subscribe(resp => {
      if (resp != null && resp !== undefined) {
        embarqueSel = resp;
      }
    },
      error => {
        console.log(error);
      },
      () => {
        if (embarqueSel != null || embarqueSel != undefined) {
          const estadoBuque = this.estadosBuque.find(e => e.descripcion.includes('ControlCalidad'));
          if (embarqueSel.estadoBuque.id != estadoBuque.id) {
            this.embarqueService.actualizarEstadoBuque(embarqueSel.id, estadoBuque.id).subscribe(res => {
            });
          }
        }
      });
  }

  onEliminarDetalleTurno(detalle, dia, turno, index) {
    const idModuloDeCargaDetalleLiquido = detalle['controls']?.id?.value;
    if (idModuloDeCargaDetalleLiquido > 0) {
      const mensaje = "¿Esta seguro que desea eliminar el detalle del turno seleccionado?";
      this.confirmationDialogService.confirm("Eliminar detalle del turno", mensaje, "Aceptar", "Cancelar")
        .then((confirmed) => {
          if (confirmed) {
            this.moduloCargaService.eliminarDetallePlanillaDeEmbarqueLiquido(idModuloDeCargaDetalleLiquido).subscribe(res => {
              this.confirmationDialogService.confirm('¡Atención!', 'Se guardaron los cambios en el turno correctamente', 'Aceptar', '', null, null, Tipoalerta.Success);
            }, error => {
              console.log(error);
              this.confirmationDialogService.confirm("¡Error!", "No se ha podido eliminar el turno.", "Cerrar", "", null, null, Tipoalerta.Error)
            }, () => {
              this.recargarTurnosPlanilla();
            })
          }
        })
        .catch((e) => {
          this.hideSpinner.emit(false)
          return;
        });
    } else {
      let lineaSel = this.getTurnos(dia)['controls'][turno]['controls'].moduloDeCargaPlanillaDeTurnosDetallesLiquido;
      let numeroLineas = lineaSel['controls'].length;
      if (numeroLineas > 1)
        lineaSel.removeAt(index);
    }
  }

  onEliminarDetalleCorte(corte, dia, turno, index) {
    const idModuloDeCargaPlanillaCorte = corte['controls']?.id?.value == undefined ? 0 : corte['controls']?.id?.value;
    console.log(corte['controls'])
    if (idModuloDeCargaPlanillaCorte > 0) {
      const mensaje = "¿Esta seguro que desea eliminar el corte seleccionado?";
      this.confirmationDialogService.confirm("Eliminar corte", mensaje, "Aceptar", "Cancelar")
        .then((confirmed) => {
          if (confirmed) {
            this.moduloCargaService.eliminarDetallePlanillaDeTurnosCortes(idModuloDeCargaPlanillaCorte).subscribe(res => {
              this.confirmationDialogService.confirm('¡Atención!', 'Se elimino el corte correctamente', 'Aceptar', '', null, null, Tipoalerta.Success);
            }, error => {
              console.log(error);
              this.confirmationDialogService.confirm("¡Error!", "No se ha podido eliminar el corte.", "Cerrar", "", null, null, Tipoalerta.Error)
            }, () => {
              this.recargarTurnosPlanilla();
            })
          }
        })
        .catch((e) => {
          this.hideSpinner.emit(false)
          return;
        });
    } else {
      let lineaSel = this.getTurnos(dia)['controls'][turno]['controls'].moduloDeCargaPlanillaDeTurnosCortes;
      const numeroLineas = lineaSel['controls'].length;
      if (numeroLineas > 0)
        lineaSel.removeAt(index);
    }
  }

  onAgregarDetalleTurno(turno, dia) {
    const esGuardadoPorTablerista = turno['controls'].guardadoPorTablerista.value;
    if (esGuardadoPorTablerista) {
      this.confirmationDialogService.confirm('¡Atención!', 'No puedes agregar un detalle a un turno enviado a recibidores.', 'Cerrar', '', null, null, Tipoalerta.Warning);
      return;
    }
    let turnoSeleccionado = turno['controls'];
    (turnoSeleccionado['moduloDeCargaPlanillaDeTurnosDetallesLiquido'] as FormArray).push(this.initLinea(null, turnoSeleccionado.guardadoPorTablerista.value));
  }

  recargarTurnosPlanilla() {
    this.moduloCargaService.obtenerModuloDeCarga(this.idModuloDeCarga).subscribe(resp => {
      if (resp.moduloDeCargaPlanillaDeTurnos.length > 0) {
        this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeTurnos = [];
        const selModuloDeCargaPlanillaDeTurnos = resp.moduloDeCargaPlanillaDeTurnos;
        const selModuloDeCargaLineasDeEmbarque = resp.moduloDeCargaLineasDeEmbarque;
        this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeTurnos = selModuloDeCargaPlanillaDeTurnos;
        this.procesoService.getModuloDeCarga().moduloDeCargaLineasDeEmbarque = selModuloDeCargaLineasDeEmbarque;
        this.fillPlanilla();
        this.recargarGraficos.emit(true);
      }
    });
  }

  private existenTurnosNoCerrados(turnoSel): Subject<boolean>{
    let moduloDeCargaPlanillaDeTurnos = null;
    let planillaDeTurnosRecibidores = null;
    let planillaDeTurnosTablerista = null;
    let subjectTurnosNoCerrados = new Subject<boolean>();
    let bResultado = false;
    this.moduloCargaService.obtenerModuloDeCarga(this.idModuloDeCarga).subscribe(resp => {
      if (resp.moduloDeCargaPlanillaDeTurnos.length > 0) {
        moduloDeCargaPlanillaDeTurnos = resp.moduloDeCargaPlanillaDeTurnos;
      }
    }, error=>{},
    ()=>{

      const fechaMiliseconds = turnoSel.turnoPuerto.value.fechaMiliseconds;
      const idTurnoPuerto = turnoSel.turnoPuerto.value.id;
      planillaDeTurnosRecibidores = moduloDeCargaPlanillaDeTurnos.filter(x => x.guardadoPorRecibidor == false && x.guardadoPorTablerista == true);
      planillaDeTurnosTablerista = moduloDeCargaPlanillaDeTurnos.filter(x => x.guardadoPorRecibidor == false && x.guardadoPorTablerista == false && x.id != idTurnoPuerto);

      planillaDeTurnosRecibidores.forEach(item => {
        item.fechaMiliseconds = new Date(item.fecha).getTime()
      });

      planillaDeTurnosTablerista.forEach(item => {
        item.fechaMiliseconds = new Date(item.fecha).getTime()
      });

      /*
      // SE COMENTA LA VALIDACION EN RECIBIDORES
      if (planillaDeTurnosRecibidores != undefined || planillaDeTurnosRecibidores != null){
        if (planillaDeTurnosRecibidores.length > 0)
            bResultado = true;
      }
      */
        planillaDeTurnosTablerista = planillaDeTurnosTablerista.filter(x=> x.fechaMiliseconds<fechaMiliseconds);
        if (planillaDeTurnosTablerista != undefined || planillaDeTurnosTablerista != null){
          if (planillaDeTurnosTablerista.length > 0)
              bResultado = true;
        }

      subjectTurnosNoCerrados.next(bResultado)
    });
    return subjectTurnosNoCerrados;
  }
  public validateMedicion(event, linea, inicial:boolean): boolean {
    var rg = new RegExp(/^(\d)*(\,)?([0-9]{1})?$/);
    var str = inicial ? linea.controls.medidaInicialCMyMM.value.toString() : linea.controls.medidaFinalCMyMM.value.toString();
    if(rg.test(str + event.key)) return true;
    return false;
  }

  splitMediciones(medicion:Number): any[] {
    let arrMedicion = medicion.toString().split(',');
    if(arrMedicion != null){
      if(arrMedicion.length == 1){
        return [arrMedicion[0] == ''? 0 :arrMedicion[0], '0']
      }
      if(arrMedicion.length == 2){
        return [arrMedicion[0] != '' ? arrMedicion[0] : '0', arrMedicion[1] != '' ? arrMedicion[1] : '0']
      }
    }else{
      return ['0','0'];
    }
  }
  setMediciones(linea, inicial:boolean){
    let altura = inicial ? linea.controls['medidaInicialCMyMM'].value : linea.controls['medidaFinalCMyMM'].value;
    let arrMediciones = this.splitMediciones(altura);
    let cm = parseInt(arrMediciones[0]);
    let mm = parseInt(arrMediciones[1]);
    if(inicial){
      linea.controls['medidaInicialCM'].setValue(cm);
      linea.controls['medidaInicialMM'].setValue(mm);
      linea.controls['medidaInicialCMyMM'].setValue(cm + ',' + mm);
    }else{
      linea.controls['medidaFinalCM'].setValue(cm);
      linea.controls['medidaFinalMM'].setValue(mm);
      linea.controls['medidaFinalCMyMM'].setValue(cm + ',' + mm);
    }
    linea.controls['medidaFinalMM'].setValue(mm);
    this.getCantidadLinea(linea);
  }

  hasPermisoTableroLiquido_AgregarTurno() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroLiquido_AgregarTurno);
  }
  hasPermisoTableroLiquido_EnviarARecibidores() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroLiquido_EnviarARecibidores);
  }
  hasPermisoTableroLiquido_AgregarCorte() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroLiquido_AgregarCorte);
  }
  hasPermisoTableroLiquido_Exportar() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroLiquido_Exportar);
  }
  hasPermisoTableroLiquido_Planilla_Editar() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroLiquido_Planilla_Editar);
  }
  hasPermisoTableroLiquido_GuardarTurno() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroLiquido_GuardarTurno);
  }
  hasPermisoTableroLiquido_AgregarLinea() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroLiquido_AgregarLinea);
  }
  hasPermisoTableroLiquido_EliminarLinea() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroLiquido_EliminarLinea);
  }

  controlarPermisos(){
    if(!this.hasPermisoTableroLiquido_Planilla_Editar()){
      this.diasTurno.controls.forEach(dia => {
        const turnos = dia['controls']['turnos']['controls'];
        turnos.forEach(turno => {
          turno['controls']['moduloDeCargaPlanillaDeTurnosDetallesLiquido'].disable();
        });
      });
    }
  }

}
