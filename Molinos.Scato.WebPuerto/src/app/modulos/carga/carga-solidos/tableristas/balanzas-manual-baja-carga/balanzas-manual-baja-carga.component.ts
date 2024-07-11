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
    const material = this.bajaCargaForm.controls['material'].value;
    const filtroBodegas = this.destinosBodegaPorMaterial.filter(x => x.materiales.id == material.id);
    filtroBodegas.forEach(filtro => {
      const existe = this.bodegas.some(el => el.id === filtro.bodegas.id);
      if (!existe)
        this.bodegas.push(filtro.bodegas);
    });
  }

  onCargarDestinoPorBodegas() {
    const material = this.bajaCargaForm.controls['material'].value;
    const bodega = this.bajaCargaForm.controls['bodega'].value;
    const filtros = this.destinosBodegaPorMaterial.filter(x => x.materiales.id == material.id);
    const filtroDestinos = filtros.filter(x => x.bodegas.id == bodega.id);
    this.destinos = [];
    filtroDestinos.forEach(filtro => {
      filtro.destinos.forEach(destino => {
        const existe = this.destinos.some(el => el.id === destino.id);
        if (!existe)
          this.destinos.push(destino);
      })
    });
  }

  onGuardarModalCorteManual() {
    let balanzaManual: BalanzaManual = new BalanzaManual(this.bajaCargaForm.value);
    let validaFechas = this.balanzasManualService.validarFechasIngresadas(balanzaManual.fechaInicio, balanzaManual.fechaCorte);
    if (validaFechas) {
      if (balanzaManual.fechaInicio == '' || balanzaManual.horaInicio == '' ||
        balanzaManual.fechaCorte == '' || balanzaManual.horaCorte == '' ||
        balanzaManual.material == null || balanzaManual.bodega == null ||
        balanzaManual.destino == null || balanzaManual.exportador == null ||
        balanzaManual.kilogramos == 0 ||
        balanzaManual.motivosFallasBalanza == null || balanzaManual.motivosFallasBalanza.id == 0) {
        let tituloMensaje = 'Todos los campos son obligatorios a excepción de la observación.';
        this.confirmationDialogService.confirm('Baja Carga', tituloMensaje, 'Cerrar', '', null, null, Tipoalerta.Warning)
        return;
      } else {
        this.balanzaManual.emit(balanzaManual);
        this.onCerrarModal();
      }
    }else{
      this.confirmationDialogService.confirm('Baja Carga', 'No se puede ingresar una fecha mayor a la actual', 'Cerrar', '', null, null, Tipoalerta.Warning)
    }
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

  cargarListas() {
    this.materialesPuerto = [];
    this.exportadores = [];
    this.balanzasManualService.cargarMotivosBalanzas78().pipe(takeUntil(this.destroy$)).subscribe((data: MotivosFallasBalanza[]) => {
      this.motivosBalanzas78 = data.filter(x => x.liquido == false && x.corte == false);
    });
    this.balanzasManualBajaCargaService.DestinosPorMaterialPuertoBodega.pipe(takeUntil(this.destroy$)).subscribe(destinoPorMaterial => {
      this.destinosBodegaPorMaterial = destinoPorMaterial;
      destinoPorMaterial.forEach(filtro => {
        const existe = this.materialesPuerto.some(el => el.id === filtro.materiales.id);
        if (!existe)
          this.materialesPuerto.push(filtro.materiales);
      });

    });
    this.balanzasManualBajaCargaService.ExportadorPorMaterialPuerto.pipe(takeUntil(this.destroy$)).subscribe(exportadorPorMaterial => {
      exportadorPorMaterial.forEach(filtro => {
        const existe = this.exportadores.some(el => el.id === filtro.exportadores.id);
        if (!existe)
          this.exportadores.push(filtro.exportadores);
      });
    });
    this.balanzasManualBajaCargaService.PeriodoDeCarga.pipe(takeUntil(this.destroy$)).subscribe(periodoDeCarga => {
      this.fechaComienzoCarga = formatDate(periodoDeCarga.fechaComienzoCarga, 'yyyy-MM-dd', 'es-ar');
      this.fechaFinalizacionCarga = formatDate(periodoDeCarga.fechaFinalizacionCarga, 'yyyy-MM-dd', 'es-ar');
      this.horaFinalizacionCarga = periodoDeCarga.horaFinalizacionCarga;
      this.horaComienzoCarga = periodoDeCarga.horaComienzoCarga;
    });
    this.cargarFormularioEditar();
  }

  cargarFormularioEditar() {
    this.balanzasManualBajaCargaService.BalanzaManual.pipe(takeUntil(this.destroy$)).subscribe(balanzaManual => {
      this.balanzaManualRegistro = balanzaManual;
      this.bajaCargaForm = this.crearFormularioBajaCarga();
      if (this.balanzaManualRegistro == null) {
        this.bajaCargaForm.controls['fechaInicio'].setValue(this.fechaComienzoCarga);
        this.bajaCargaForm.controls['fechaCorte'].setValue(this.fechaFinalizacionCarga);
        this.horaInicioMinimo = this.horaComienzoCarga;
        this.horaCorteMinimo = this.horaFinalizacionCarga;
      }
      if (this.balanzaManualRegistro != null) {
        this.onCargarBodegas();
        this.onCargarDestinoPorBodegas();
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