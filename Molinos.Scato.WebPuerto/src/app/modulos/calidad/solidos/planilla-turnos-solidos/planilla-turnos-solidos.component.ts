import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModuloDeCarga } from '@ScatoModels/modulo-carga';
import { MotivosDeCorte } from '@ScatoModels/planilla-turnos/motivo-de-corte';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { TurnosService } from '@ScatoServicios/turnos.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-planilla-turnos-solidos',
  templateUrl: './planilla-turnos-solidos.component.html',
  styleUrls: ['./planilla-turnos-solidos.component.css']
})
export class PlanillaTurnosSolidosComponent implements OnInit {
  formTurnos: FormGroup;
  formCorte: FormGroup;
  moduloCarga: ModuloDeCarga;
  exportadores: any[];
  partidas: any[];
  producto: any[];
  hoy: any;
  bodegas: any[] = [];
  productos: any[];
  destinos: any[];
  turnos = ['00-06', '06-12', '12-18', '18-24'];
  turnoPuerto: any[];
  motivosCorte: MotivosDeCorte[];
  idModuloDeCarga: number;
  constructor(
    private _builder: FormBuilder,
    private _modalService: NgbModal,
    private _procesoService: DatosEmbarquesProcesoService,
    private datePipe: DatePipe,
    private _turnosService: TurnosService,
    private moduloCargaService: ModuloDeCargaService,
    private procesoService: DatosEmbarquesProcesoService,
    private messageService: MessageService,
  ) {
    this._turnosService.sendBodega.subscribe(res => {
      this.bodegas = res;
      this.getProductos();
      this.getDestinos();
    });
  }

  ngOnInit(): void {
    this.newForm()
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
    this.formCorte.get('tiempoTotal').disable();
    this.getCombos();
  }
  getCombos() {
    let exportadoresForm = this._turnosService.getExportadores();
    this.exportadores = new Array();
    for (let e of exportadoresForm) {
      if (e.exportador) this.exportadores.push(e.exportador);
    }
    this.hoy = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
    this.bodegas = this._turnosService.getBodega();

    this.idModuloDeCarga = this.procesoService.getModuloDeCargaId();

    let planilla = this.procesoService.getModuloDeCarga()?.moduloDeCargaPlanillaDeTurnosTurnos;
    planilla?.length > 0 ? this.formTurnos.get('diasTurno').patchValue(planilla) : '';
    this.getDestinos();
    this.getProductos();
    this.getMotivosCorte();
  }

  getMotivosCorte() {
    this.moduloCargaService.obtenerMotivosDeCorte().subscribe(
      res => {
        this.motivosCorte = res;
        this.getTurnoPuerto();
      }
    )
  }

  getTurnoPuerto() {
    this.moduloCargaService.obtenerTurnoPuerto().subscribe(
      res => {
        this.turnoPuerto = res;
        this.diasTurno['controls'].forEach((dia,diaIndex)=>{
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

  getTurnos(dia): FormArray {
    return this.diasTurno["controls"][dia]['controls'].turnos as FormArray;
  }

  getTurno(d, t): FormArray {
    return this.getTurnos(d)['controls'][t]['controls'].moduloDeCargaPlanillaDeTurnosTurnosDetalles as FormArray;
  }

  getCorteTurnos(d, t): FormArray {
    return this.getTurnos(d)['controls'][t]['controls'].moduloDeCargaPlanillaDeTurnosTurnosCortes as FormArray;
  }

  openModalCorte(modal, dia, turno) {
    this.formCorte.reset();
    if (this.getTurnos(dia)['controls'][turno].enabled) {
      this._modalService.open(modal, { windowClass: 'window-modal-corte', backdropClass: 'modal-corte' }).result.then(() => {
        this.getCorteTurnos(dia, turno).push(this.initCorte(this.formCorte.getRawValue()));
      })
    }
  }

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
      contador += 3;
    }
    return contador;
  }

  getRowSpanTurno(turno: any) {
    if (turno.controls.moduloDeCargaPlanillaDeTurnosTurnosCortes.length > 0)
      return turno.controls['moduloDeCargaPlanillaDeTurnosTurnosDetalles'].controls.length + 1;
    else
      return turno.controls['moduloDeCargaPlanillaDeTurnosTurnosDetalles'].controls.length;
  }

  getTurnoHorario(dia, turno) {
    let fecha = new Date();
    let horario = fecha.getHours();
    let returnHorario = this.turnoPuerto.find(h => horario >= Number(h.nombre.split('-')[0]) && horario < Number(h.nombre.split('-')[1]));
    this.getTurnos(dia)['controls'][turno]['controls'].turnoPuerto.setValue(returnHorario);
    return returnHorario;
  }

  async enviarTurno(dia, turno) {
    let turnoAEnviar = new Object;
    turnoAEnviar['moduloDeCargaPlanillaDeTurnosTurnos'] = this.getTurnos(dia)['controls'][turno].value;
    turnoAEnviar['fecha'] = new Date();
    turnoAEnviar['id'] = null;
    turnoAEnviar['moduloDeCargaPlanillaDeTurnosTurnos'].moduloDeCargaPlanillaDeTurnosTurnosDetalles = turnoAEnviar['moduloDeCargaPlanillaDeTurnosTurnos'].moduloDeCargaPlanillaDeTurnosTurnosDetalles.filter(m =>
      m.exportador ||
      m.linea ||
      m.bodegaParcel ||
      m.materialPuerto ||
      m.tk ||
      m.temperatura ||
      m.medicionInicialCM ||
      m.medicionInicialMM ||
      m.medicionFinalCM ||
      m.medicionFinalMM ||
      m.destino ||
      m.cantidad)
    if (turnoAEnviar['moduloDeCargaPlanillaDeTurnosTurnos'].moduloDeCargaPlanillaDeTurnosTurnosDetalles.length > 0) {
      // if (turnoAEnviar['moduloDeCargaPlanillaDeTurnosTurnos'].moduloDeCargaPlanillaDeTurnosTurnosDetalles.filter(m =>
      //   m.exportador &&
      //   m.linea &&
      //   m.bodegaParcel &&
      //   m.materialPuerto &&
      //   m.tk &&
      //   m.temperatura &&
      //   m.medicionInicialCM &&
      //   m.medicionInicialMM &&
      //   m.medicionFinalCM &&
      //   m.medicionFinalMM &&
      //   m.destino &&
      //   m.cantidad).length > 0) {

        // await this.moduloCargaService.guardarPlanillaDeTurnos(turnoAEnviar, this.idModuloDeCarga).toPromise().then(
        //   res => {
            if (!this.getTurnos(dia)['controls'][turno]['controls'].cerrado.value) {
              if (this.diasTurno['controls'][dia]['controls'].turnos.length < 4) {
                this.getTurnos(dia)['controls'][turno]['controls'].cerrado.setValue(true);
                this.getTurnos(dia).push(this.initTurno())
              } else {
                this.getTurnos(dia)['controls'][turno]['controls'].cerrado.setValue(true);
                this.diasTurno.push(this.initDia());
              }
              this.sendRitmos(dia, turno);
            }
          // },
          // error => {
          //   console.log(error)
          // }
        // );
      // } else {
      //   this.messageService.add({ severity: 'warn', detail: 'Error de Datos', summary: 'Verificar que todos los datos esten completos', key: 'enviar-turno' });
      // }
    }
    else this.messageService.add({ severity: 'warn', detail: 'Error de Datos', summary: 'No hay datos a enviar', key: 'enviar-turno' });
  }

  sendRitmos(dia, turno) {
    this._turnosService.setTurnos(this.getTurnos(dia).controls[turno].value)
  }

  getCantTurno(t) {
    let contador = 0;
    for (let turno of t['controls']['moduloDeCargaPlanillaDeTurnosTurnosDetalles'].controls) {
      contador += turno.controls.cantidad.value ? turno.controls.cantidad.value : 0;
    }
    return contador;
  }

  getCantDia(d) {
    let contador = 0;
    for (let turno of d['controls']['turnos']['controls']) {
      contador += this.getCantTurno(turno);
    }
    return contador;
  }

  getCantTotalABordo() {
    let contador = 0;
    for (let dia of this.formTurnos['controls']['diasTurno']['controls']) {
      contador += this.getCantDia(dia);
    }
    return contador;
  }

  initDia() {
    // let turnos = this.turnos.map(x => this.initTurno(x));
    return this._builder.group({
      turnos: this._builder.array([this.initTurno()])
    });
  }

  initTurno(turnoPuerto?) {
    console.log(turnoPuerto);
    return this._builder.group({
      moduloDeCargaPlanillaDeTurnosTurnosDetalles: this._builder.array([this.initLinea(), this.initLinea(), this.initLinea(), this.initLinea()]),
      moduloDeCargaPlanillaDeTurnosTurnosCortes: this._builder.array([]),
      moduloDeCargaPlanillaDeTurnosTurnosObservaciones: this._builder.array([]),
      enviado: false,
      cerrado: false,
      turnoPuerto: turnoPuerto ?? null
    })
  }

  initLinea() {
    return this._builder.group({
      exportador: '',
      bodegaParcel: '',
      materialPuerto: '',
      destino: '',
      cantidad: '',
    })
  }

  initCorte(corte?: any) {
    return this._builder.group({
      motivosDeCorte: [(corte && corte.motivosDeCorte ? corte.motivosDeCorte : ''), Validators.required],
      horaInicio: [(corte && corte.horaInicio ? corte.horaInicio : '00:00'), Validators.required],
      horaFin: [(corte && corte.horaFin ? corte.horaFin : '00:00'), Validators.required],
      tiempoTotal: [(corte && corte.tiempoTotal ? corte.tiempoTotal : '00:00'), Validators.required],
      observaciones: [(corte && corte.observaciones ? corte.observaciones : ''), Validators.required]
    })
  }

  getToneladasParcelDia(bodega: number, d: number) {
    let dia = this.getTurnos(d);
    let cantidad = 0;
    for (let turno of dia.controls) {
      for (let linea of turno['controls']['moduloDeCargaPlanillaDeTurnosTurnosDetalles']['controls']) {
        cantidad += (linea.controls.bodegaParcel.value == bodega ? Number(linea.controls.cantidad.value) : 0);
      }
    }
    return cantidad;
  }

  getToneladasParcelTurno(bodega: number, d: number, t: number) {
    let turno = this.getTurno(d, t);
    let cantidad = 0;
    for (let linea of turno.controls) {
      cantidad += (linea['controls'].bodegaParcel.value == bodega ? Number(linea['controls'].cantidad.value) : 0);
    }
    return cantidad;
  }

  getToneladasLinea(linea: string) {
    const value = linea.toLowerCase();
    let contador = 0;
    this.diasTurno.controls.forEach(dia => {
      dia['controls']['turnos']['controls'].forEach(turno => {
        turno['controls']['moduloDeCargaPlanillaDeTurnosTurnosDetalles']['controls'].forEach(linea => {
          contador += (linea.get('linea').value.toLowerCase() == value ? Number(linea.get('cantidad').value) : 0);
        })
      });
    })

    return contador;
  }

  getProductos() {
    this.productos = new Array();
    this.bodegas.forEach(b => {
      if (b.materialPuerto && !this.productos.find(p => p == b.materialPuerto.descripcionCorta)) this.productos.push(b.materialPuerto)
    })
  }

  getDestinos() {
    this.destinos = new Array();
    this.bodegas.forEach(b => {
      if (!this.destinos.find(d => d == b.destino)) this.destinos.push(b.destino)
    })
  }


}
