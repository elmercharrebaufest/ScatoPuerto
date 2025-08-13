import { BalanzaManual, DestinosPorMaterialPuertoBodega, MotivosFallasBalanza } from '@ScatoModels/balanza-manual/balanza-manual';
import { BodegaParcel } from '@ScatoModels/bodega-parcel';
import { Destino } from '@ScatoModels/destino';
import { Exportador } from '@ScatoModels/exportador';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BalanzasManualService } from '../balanzas-manual/balanzas-manual.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BalanzasManualBajaCargaService } from './balanzas-manual-baja-carga.service';
import { formatDate } from '@angular/common';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';

@Component({
  selector: 'app-balanzas-manual-baja-carga',
  templateUrl: './balanzas-manual-baja-carga.component.html',
  styleUrls: ['./balanzas-manual-baja-carga.component.css']
})
export class BalanzasManualBajaCargaComponent implements OnInit, OnDestroy {
  @Input() numeroBalanza: number;
  @Output() cerrar = new EventEmitter<boolean>();
  @Output() balanzaManual = new EventEmitter<BalanzaManual>();

  balanzaManualRegistro: BalanzaManual;
  destinosBodegaPorMaterial: DestinosPorMaterialPuertoBodega[] = []
  bajaCargaForm: FormGroup;
  motivosBalanzas78: MotivosFallasBalanza[] = null;
  materialesPuerto: MaterialPuerto[] = null;
  destinos: Destino[] = null;
  exportadores: Exportador[] = null;
  bodegas: BodegaParcel[] = [];
  fechaComienzoCarga: string;
  horaComienzoCarga: string;
  fechaFinalizacionCarga: string;
  horaFinalizacionCarga: string;
  balanza: any;
  horaInicioMinimo: string = '00:00';
  horaInicioMaximo: string = '23:59';
  horaCorteMinimo: string = '00:00';
  horaCorteMaximo: string = '23:59';

  private destroy$ = new Subject();

  constructor(private formBuilder: FormBuilder,
    private balanzasManualBajaCargaService: BalanzasManualBajaCargaService,
    private confirmationDialogService: ConfirmationDialogService,
    private balanzasManualService: BalanzasManualService) {
    this.cargarListas()
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

  onCargarBodegas() {
    const filtroBodegas = this.destinosBodegaPorMaterial.filter(x => x.materiales.id > 0);
    filtroBodegas.forEach(filtro => {
      const existe = this.bodegas.some(el => el.id === filtro.bodegas.id);
      if (!existe)
        this.bodegas.push(filtro.bodegas);
    });
  }

  onCargarMaterialPorBodegas() {
    const bodega = this.bajaCargaForm.controls['bodega'].value;
    const filtrosMaterial = this.destinosBodegaPorMaterial.filter(x => x.bodegas.id == bodega.id);
    this.materialesPuerto = [];
    filtrosMaterial.forEach(filtro => {
        const existe = this.materialesPuerto.some(el => el.id === filtro.materiales.id);
        if (!existe){
          this.materialesPuerto.push(filtro.materiales);
          this.bajaCargaForm.controls['material'].setValue(filtro.materiales);
        }
    });
  }

  onGuardarModalCorteManual() {
    var objBalanza = {
      id                  : this.bajaCargaForm.controls.id.value                  ,
      fechaInicio         : this.bajaCargaForm.controls.fechaInicio.value         ,
      horaInicio          : this.bajaCargaForm.controls.horaInicio.value          ,
      fechaCorte          : this.bajaCargaForm.controls.fechaCorte.value          ,
      horaCorte           : this.bajaCargaForm.controls.horaCorte.value           ,
      material            : this.bajaCargaForm.controls.material.value            ,
      bodega              : this.bajaCargaForm.controls.bodega.value              ,
      destino             : this.bajaCargaForm.controls.destino.value             ,
      exportador          : this.bajaCargaForm.controls.exportador.value          ,
      motivosFallasBalanza: this.bajaCargaForm.controls.motivosFallasBalanza.value,
      kilogramos          : this.bajaCargaForm.controls.kilogramos.value          ,
      toneladas           : this.bajaCargaForm.controls.toneladas.value           ,
      corteManual         : this.bajaCargaForm.controls.corteManual.value         ,
      observaciones       : this.bajaCargaForm.controls.observaciones.value       ,
      correlativo         : this.bajaCargaForm.controls.correlativo.value         ,
      recordatorio        : false                                                 ,
      cargaNormal         : false
    };

    let balanzaManual: BalanzaManual = new BalanzaManual(objBalanza);

    let validaFechasInicioFin= this.balanzasManualService.validarFechasInicioFin(balanzaManual.fechaInicio, balanzaManual.horaInicio, balanzaManual.fechaCorte, balanzaManual.horaCorte);
    if (!validaFechasInicioFin){
      this.confirmationDialogService.confirm('Baja carga', 'No se puede crear una baja carga cuando la fecha de inico es mayor o igual a la fecha corte', 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }
    let validaFechas = this.balanzasManualService.validarFechasIngresadas(balanzaManual.fechaInicio, balanzaManual.fechaCorte);
    if (!validaFechas) {
      this.confirmationDialogService.confirm('Baja Carga', 'No se puede ingresar una fecha mayor a la actual', 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }

     if(this.balanzasManualService.fechasIngresadasSuperan3Dias(balanzaManual.fechaInicio, balanzaManual.horaInicio, balanzaManual.fechaCorte, balanzaManual.horaCorte)){
      this.confirmationDialogService.confirm('Baja Carga', 'Solo se pueden generar registros hasta 3 días a partir de la fecha de inicio, verifique por favor.', 'Cerrar', '', null, null, Tipoalerta.Warning);
      return;
    }

    if (this.camposInvalidos(balanzaManual)) {
      let tituloMensaje = 'Todos los campos son obligatorios a excepción de la observación.';
      this.confirmationDialogService.confirm('Baja Carga', tituloMensaje, 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }
    const fechaInicioRegistro = this.balanzasManualService.convertirFecha(balanzaManual.fechaInicio, balanzaManual.horaInicio);
    const fechaFinRegistro = this.balanzasManualService.convertirFecha(balanzaManual.fechaCorte, balanzaManual.horaCorte);
    let esRegistroValido = this.balanzasManualService.validarCortesBajasCarga(this.balanza, balanzaManual, fechaInicioRegistro, fechaFinRegistro);
    if (!esRegistroValido) {
      this.confirmationDialogService.confirm('Baja Carga', `Ya existe una Baja Carga en el mismo rango de las fechas seleccionadas`, 'Cerrar', '', null, null, Tipoalerta.Warning);
      return;
    }
    this.balanzaManual.emit(balanzaManual);
    this.onCerrarModal();
  }

  private camposInvalidos(balanzaManual: BalanzaManual): boolean {
    return !balanzaManual.fechaInicio || !balanzaManual.horaInicio ||
      !balanzaManual.fechaCorte || !balanzaManual.horaCorte ||
      !balanzaManual.material || !balanzaManual.bodega ||
      !balanzaManual.kilogramos || !balanzaManual.motivosFallasBalanza?.id
  }

  onCambiarHoras(esFechaCorte: boolean = false) {
    let fechaSeleccionada: string = '';
    this.horaInicioMinimo = '00:00';
    this.horaInicioMaximo = '23:59';
    fechaSeleccionada = this.bajaCargaForm.controls[esFechaCorte ? 'fechaCorte' : 'fechaInicio'].value;
    if (fechaSeleccionada == this.fechaComienzoCarga) {
      this.horaInicioMinimo = this.horaComienzoCarga;
    }else if (fechaSeleccionada == this.fechaFinalizacionCarga){
      this.horaInicioMaximo = this.horaFinalizacionCarga;
    }
  }
  onKilosChange(event: any){
    const kilos = parseFloat(event.target.value);
    this.bajaCargaForm.controls['kilogramos'].setValue(kilos.toFixed(3));
  }
  cargarListas() {
    this.materialesPuerto = [];
    this.balanzasManualService.cargarMotivosBalanzas78().pipe(takeUntil(this.destroy$)).subscribe((data: MotivosFallasBalanza[]) => {
      this.motivosBalanzas78 = data.filter(x => x.bajaCargaSolido == true);
      this.motivosBalanzas78.sort((a, b) => a.siglas.localeCompare(b.siglas));
    });
    this.balanzasManualBajaCargaService.DestinosPorMaterialPuertoBodega.pipe(takeUntil(this.destroy$)).subscribe(destinoPorMaterial => {
      this.destinosBodegaPorMaterial = destinoPorMaterial;
    });
    this.balanzasManualBajaCargaService.PeriodoDeCarga.pipe(takeUntil(this.destroy$)).subscribe(periodoDeCarga => {
      this.fechaComienzoCarga = formatDate(periodoDeCarga.fechaComienzoCarga, 'yyyy-MM-dd', 'es-ar');
      this.fechaFinalizacionCarga = formatDate(periodoDeCarga.fechaFinalizacionCarga, 'yyyy-MM-dd', 'es-ar');
      this.horaFinalizacionCarga = periodoDeCarga.horaFinalizacionCarga;
      this.horaComienzoCarga = periodoDeCarga.horaComienzoCarga;
    });
    this.cargarFormularioEditar();
    this.balanzasManualBajaCargaService.RegistroBalanza.pipe(takeUntil(this.destroy$)).subscribe(registrosBalanza => {
      this.balanza = registrosBalanza;
      const idRegistro:string = this.bajaCargaForm.controls.id.value;
      if (idRegistro == null || idRegistro <= '0')
        this.cargarFechaHoraInicioDefecto();
    });
  }

  cargarFechaHoraInicioDefecto(){
    this.horaInicioMinimo = '00:00';
    this.horaInicioMaximo = '23:59';
    let listaFechas = [];
    for(var i = 0; i<=this.balanza.controls.length-1; i++) {
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
    this.bajaCargaForm.controls['fechaInicio'].setValue(fechaMaxima.fechaCorte);
    this.bajaCargaForm.controls['horaInicio'].setValue(fechaMaxima.horaCorte);
    this.bajaCargaForm.controls.fechaInicio.disable()
    this.bajaCargaForm.controls.horaInicio.disable()
  }
  cargarFormularioEditar() {
    this.balanzasManualBajaCargaService.BalanzaManual.pipe(takeUntil(this.destroy$)).subscribe(balanzaManual => {
      this.balanzaManualRegistro = balanzaManual;
      this.bajaCargaForm = this.crearFormularioBajaCarga();
      if (this.balanzaManualRegistro == null) {
        this.bajaCargaForm.controls['fechaInicio'].setValue(this.fechaComienzoCarga);
        this.horaInicioMinimo = this.horaComienzoCarga;
        this.horaCorteMinimo = this.horaFinalizacionCarga;
        this.onCargarBodegas();
      }else{
        this.onCargarBodegas();
        this.onCargarMaterialPorBodegas();
      }
    });
  }

  compareMotivosBalanzas(c1: MotivosFallasBalanza, c2: MotivosFallasBalanza) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  compareMaterialPuerto(c1: MaterialPuerto, c2: MaterialPuerto) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  compareExportadores(c1: Exportador, c2: Exportador) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  compareDestinos(c1: Destino, c2: Destino) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  compareBodegasParcel(c1: BodegaParcel, c2: BodegaParcel) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  private crearFormularioBajaCarga(): FormGroup {
    return this.balanzasManualBajaCargaService.inicializaCortesBajaCarga((this.balanzaManualRegistro ? this.balanzaManualRegistro : null));
  }

}
