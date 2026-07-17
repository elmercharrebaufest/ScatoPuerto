import { MotivosFallasBalanza } from '@ScatoModels/balanzadas/balanza';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BalanzasManualService } from '../balanzas-manual/balanzas-manual.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BalanzaManual, DestinosPorMaterialPuertoBodega } from '@ScatoModels/balanza-manual/balanza-manual';
import { formatDate } from '@angular/common';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { BalanzasManualCargaNormalService } from './balanzas-manual-carga-normal.service';
import { BodegaParcel } from '@ScatoModels/bodega-parcel';

@Component({
  selector: 'app-balanzas-manual-carga-normal',
  templateUrl: './balanzas-manual-carga-normal.component.html',
  styleUrls: ['./balanzas-manual-carga-normal.component.css']
})
export class BalanzasManualCargaNormalComponent implements OnInit, OnDestroy {
  @Input() numeroBalanza: number;
  @Output() cerrar = new EventEmitter<boolean>();
  @Output() balanzaManual = new EventEmitter<BalanzaManual>();

  cargaNormalForm: FormGroup = null;
  motivosBalanzas78: MotivosFallasBalanza[];
  balanzaManualRegistro: BalanzaManual;
  destinosBodegaPorMaterial: DestinosPorMaterialPuertoBodega[] = []
  fechaComienzoCarga: string;
  horaComienzoCarga: string;
  fechaFinalizacionCarga: string;
  horaFinalizacionCarga: string;
  balanza: any;
  horaInicioMinimo: string = '00:00';
  horaInicioMaximo: string = '23:59';
  horaCorteMinimo: string = '00:00';
  horaCorteMaximo: string = '23:59';
  bodegas: BodegaParcel[] = [];

  private destroy$ = new Subject();

  constructor(private formBuilder: FormBuilder,
    private balanzasManualCargaNormalService: BalanzasManualCargaNormalService,
    private confirmationDialogService: ConfirmationDialogService,
    private balanzasManualService: BalanzasManualService) {
    this.cargarDatosCargaNormal();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
  }

  onCerrarModal() {
    this.cerrar.emit(true);
  }

  cargarDatosCargaNormal() {
    this.balanzasManualCargaNormalService.PeriodoDeCarga.pipe(takeUntil(this.destroy$)).subscribe(periodoDeCarga => {
      if (periodoDeCarga!=null){
        this.fechaComienzoCarga = formatDate(periodoDeCarga.fechaComienzoCarga, 'yyyy-MM-dd', 'es-ar');
        this.fechaFinalizacionCarga = formatDate(periodoDeCarga.fechaFinalizacionCarga, 'yyyy-MM-dd', 'es-ar');
        this.horaFinalizacionCarga = periodoDeCarga.horaFinalizacionCarga;
        this.horaComienzoCarga = periodoDeCarga.horaComienzoCarga;
      }
    });
    this.balanzasManualCargaNormalService.DestinosPorMaterialPuertoBodega.pipe(takeUntil(this.destroy$)).subscribe(destinoPorMaterial => {
      this.destinosBodegaPorMaterial = destinoPorMaterial;
    });
    this.cargarFormularioEditar();
    this.balanzasManualCargaNormalService.RegistroBalanza.pipe(takeUntil(this.destroy$)).subscribe(registrosBalanza => {
      this.balanza = registrosBalanza;
      const idRegistro:string = this.cargaNormalForm.controls.id.value;
      if (idRegistro == null || idRegistro <= '0')
        this.cargarFechaHoraInicioDefecto();
    });
  }

  cargarFechaHoraInicioDefecto(){
    this.horaInicioMinimo = '00:00';
    this.horaInicioMaximo = '23:59';
    let listaFechas = [];
    for(var i = 0; i<=this.balanza.controls.length-1; i++) {
      console.log('this.balanza--->>>', this.balanza);
      const controls = this.balanza.controls[i].controls;
      const fecha = controls.fechaCorte.value;
      const hora = controls.horaCorte.value;
      const fechaHora = this.balanzasManualService.convertirFecha(fecha,hora);
      listaFechas.push({
        fechaCorte : fecha,
        horaCorte : hora,
        fechaHora: fechaHora
      });
    }
    const listas = listaFechas.sort((a, b) => a.fechaHora - b.fechaHora);
    const fechaMaxima = listas.reverse()[0];
    this.cargaNormalForm.controls.fechaInicio.setValue(fechaMaxima.fechaCorte);
    this.cargaNormalForm.controls.horaInicio.setValue(fechaMaxima.horaCorte);
    // this.cargaNormalForm.controls.fechaInicio.disable()
    // this.cargaNormalForm.controls.horaInicio.disable()
  }

  cargarBodegas() {
    const filtroBodegas = this.destinosBodegaPorMaterial.filter(x => x.materiales.id > 0);
    filtroBodegas.forEach(filtro => {
      const existe = this.bodegas.some(el => el.id === filtro.bodegas.id);
      if (!existe)
        this.bodegas.push(filtro.bodegas);
    });
  }

  cargarFormularioEditar() {
    this.cargarBodegas();
    this.balanzasManualCargaNormalService.BalanzaManual.pipe(takeUntil(this.destroy$)).subscribe(balanzaManual => {
      this.balanzaManualRegistro = balanzaManual;
      this.cargaNormalForm = this.crearFormularioCargaNormal();
      if (this.balanzaManualRegistro == null) {
        this.cargaNormalForm.controls['fechaInicio'].setValue(this.fechaComienzoCarga);
        this.horaInicioMinimo = this.horaComienzoCarga;
        this.horaCorteMinimo = this.horaFinalizacionCarga;
      }
    });
  }
  compareBodegasParcel(c1: BodegaParcel, c2: BodegaParcel) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  onCambiarHoras(esFechaCorte: boolean = false) {
    let fechaSeleccionada: string = '';
    this.horaInicioMinimo = '00:00';
    this.horaInicioMaximo = '23:59';
    fechaSeleccionada = this.cargaNormalForm.controls[esFechaCorte ? 'fechaCorte' : 'fechaInicio'].value;
    if (fechaSeleccionada == this.fechaComienzoCarga) {
      this.horaInicioMinimo = this.horaComienzoCarga;
    }else if (fechaSeleccionada == this.fechaFinalizacionCarga){
      this.horaInicioMaximo = this.horaFinalizacionCarga;
    }
  }


  onGuardarModalCargaNormal() {
    var objBalanza = {
      id                  : this.cargaNormalForm.controls.id.value                  ,
      fechaInicio         : this.cargaNormalForm.controls.fechaInicio.value         ,
      horaInicio          : this.cargaNormalForm.controls.horaInicio.value          ,
      fechaCorte          : this.cargaNormalForm.controls.fechaCorte.value          ,
      horaCorte           : this.cargaNormalForm.controls.horaCorte.value           ,
      material            : this.cargaNormalForm.controls.material.value            ,
      bodega              : this.cargaNormalForm.controls.bodega.value              ,
      destino             : this.cargaNormalForm.controls.destino.value             ,
      exportador          : this.cargaNormalForm.controls.exportador.value          ,
      motivosFallasBalanza: this.cargaNormalForm.controls.motivosFallasBalanza.value,
      kilogramos          : this.cargaNormalForm.controls.kilogramos.value          ,
      toneladas           : this.cargaNormalForm.controls.toneladas.value           ,
      corteManual         : this.cargaNormalForm.controls.corteManual.value         ,
      observaciones       : this.cargaNormalForm.controls.observaciones.value       ,
      correlativo         : this.cargaNormalForm.controls.correlativo.value         ,
      recordatorio        : false        ,
      cargaNormal         : true
    };

    let balanzaManual: BalanzaManual = new BalanzaManual(objBalanza);
    let validaFechasInicioFin= this.balanzasManualService.validarFechasInicioFin(balanzaManual.fechaInicio, balanzaManual.horaInicio, balanzaManual.fechaCorte, balanzaManual.horaCorte);
    if (!validaFechasInicioFin){
      this.confirmationDialogService.confirm('Carga Normal', 'No se puede crear una carga normal cuando la fecha de inico es mayor o igual a la fecha corte', 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }
    let validaFechas = this.balanzasManualService.validarFechasIngresadas(balanzaManual.fechaInicio, balanzaManual.fechaCorte);
    if (!validaFechas) {
      this.confirmationDialogService.confirm('Carga Normal', 'No se puede ingresar una fecha mayor a la actual', 'Cerrar', '', null, null, Tipoalerta.Warning)
    }

    if(this.balanzasManualService.fechasIngresadasSuperan3Dias(balanzaManual.fechaInicio, balanzaManual.horaInicio, balanzaManual.fechaCorte, balanzaManual.horaCorte)){
      this.confirmationDialogService.confirm('Carga Normal', 'Solo se pueden generar registros hasta 3 días a partir de la fecha de inicio, verifique por favor.', 'Cerrar', '', null, null, Tipoalerta.Warning);
      return;
    }

    if (this.camposInvalidos(balanzaManual)) {
      let tituloMensaje = 'Todos los campos son obligatorios a excepción de la observación.';
      this.confirmationDialogService.confirm('Carga Normal', tituloMensaje, 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }
    const fechaInicioRegistro = this.balanzasManualService.convertirFecha(balanzaManual.fechaInicio, balanzaManual.horaInicio);
    const fechaFinRegistro = this.balanzasManualService.convertirFecha(balanzaManual.fechaCorte, balanzaManual.horaCorte);
    let esRegistroValido = this.balanzasManualService.validarCortesBajasCarga(this.balanza, balanzaManual, fechaInicioRegistro, fechaFinRegistro);
    if (!esRegistroValido) {
      this.confirmationDialogService.confirm('Corte', `Ya existe cargas en el mismo rango de las fechas seleccionadas`, 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }
    balanzaManual.cargaNormal = true;
    balanzaManual.corteManual = null;
    this.balanzaManual.emit(balanzaManual);
    this.onCerrarModal();
  }

  private camposInvalidos(balanzaManual: BalanzaManual): boolean {
    return !balanzaManual.fechaInicio || !balanzaManual.horaInicio ||
      !balanzaManual.fechaCorte || !balanzaManual.horaCorte || !balanzaManual.bodega?.id;
  }

  private crearFormularioCargaNormal(): FormGroup {
    return this.balanzasManualCargaNormalService.inicializaCargaNormal((this.balanzaManualRegistro ? this.balanzaManualRegistro : null), true);
  }

}
