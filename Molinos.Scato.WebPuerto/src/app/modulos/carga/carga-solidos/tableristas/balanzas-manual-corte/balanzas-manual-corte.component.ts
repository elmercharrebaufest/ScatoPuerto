import { MotivosFallasBalanza } from '@ScatoModels/balanzadas/balanza';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BalanzasManualService } from '../balanzas-manual/balanzas-manual.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BalanzaManual } from '@ScatoModels/balanza-manual/balanza-manual';
import { BalanzasManualCorteService } from './balanzas-manual-corte.service';
import { formatDate } from '@angular/common';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';

@Component({
  selector: 'app-balanzas-manual-corte',
  templateUrl: './balanzas-manual-corte.component.html',
  styleUrls: ['./balanzas-manual-corte.component.css']
})
export class BalanzasManualCorteComponent implements OnInit, OnDestroy {
  @Input() numeroBalanza: number;
  @Output() cerrar = new EventEmitter<boolean>();
  @Output() balanzaManual = new EventEmitter<BalanzaManual>();

  corteManualForm: FormGroup = null;
  motivosBalanzas78: MotivosFallasBalanza[];
  balanzaManualRegistro: BalanzaManual;

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
    private balanzasManualCorteService: BalanzasManualCorteService,
    private confirmationDialogService: ConfirmationDialogService,
    private balanzasManualService: BalanzasManualService) {
    this.cargarMotivosBalanzas();
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

  compareMotivosBalanzas(c1: MotivosFallasBalanza, c2: MotivosFallasBalanza) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  cargarMotivosBalanzas() {
    this.balanzasManualCorteService.PeriodoDeCarga.pipe(takeUntil(this.destroy$)).subscribe(periodoDeCarga => {
      if (periodoDeCarga!=null){
        this.fechaComienzoCarga = formatDate(periodoDeCarga.fechaComienzoCarga, 'yyyy-MM-dd', 'es-ar');
        this.fechaFinalizacionCarga = formatDate(periodoDeCarga.fechaFinalizacionCarga, 'yyyy-MM-dd', 'es-ar');
        this.horaFinalizacionCarga = periodoDeCarga.horaFinalizacionCarga;
        this.horaComienzoCarga = periodoDeCarga.horaComienzoCarga;
      }
    });
    this.balanzasManualService.cargarMotivosBalanzas78().pipe(takeUntil(this.destroy$)).subscribe((data: MotivosFallasBalanza[]) => {
      this.motivosBalanzas78 = data.filter(x => x.liquido == false && x.corte == true);
      this.cargarFormularioEditar();
    });
  }

  cargarFormularioEditar() {
    this.balanzasManualCorteService.BalanzaManual.pipe(takeUntil(this.destroy$)).subscribe(balanzaManual => {
      this.balanzaManualRegistro = balanzaManual;
      this.corteManualForm = this.crearFormularioCorte();
      if (this.balanzaManualRegistro == null) {
        this.corteManualForm.controls['fechaInicio'].setValue(this.fechaComienzoCarga);
        this.corteManualForm.controls['fechaCorte'].setValue(this.fechaFinalizacionCarga);
        this.horaInicioMinimo = this.horaComienzoCarga;
        this.horaCorteMinimo = this.horaFinalizacionCarga;
      }
    });
  }

  onCambiarHoras(esFechaCorte: boolean = false) {
    let fechaSeleccionada: string = '';
    this.horaInicioMinimo = '00:00';
    this.horaInicioMaximo = '23:59';
    fechaSeleccionada = this.corteManualForm.controls[esFechaCorte ? 'fechaCorte' : 'fechaInicio'].value;
    if (fechaSeleccionada == this.fechaComienzoCarga) {
      this.horaInicioMinimo = this.horaComienzoCarga;
    }else if (fechaSeleccionada == this.fechaFinalizacionCarga){
      this.horaInicioMaximo = this.horaFinalizacionCarga;
    }
  }


  onGuardarModalCorteManual() {
    let balanzaManual: BalanzaManual = new BalanzaManual(this.corteManualForm.value);
    let validaFechas = this.balanzasManualService.validarFechasIngresadas(balanzaManual.fechaInicio, balanzaManual.fechaCorte);
    if (validaFechas) {
      if (balanzaManual.fechaInicio == '' || balanzaManual.horaInicio == '' ||
        balanzaManual.fechaCorte == '' || balanzaManual.horaCorte == '' ||
        balanzaManual.motivosFallasBalanza == null || balanzaManual.motivosFallasBalanza.id == 0) {
        let tituloMensaje = 'Todos los campos son obligatorios a excepción de la observación.';
        this.confirmationDialogService.confirm('Corte', tituloMensaje, 'Cerrar', '', null, null, Tipoalerta.Warning)
        return;
      } else {
        this.balanzaManual.emit(balanzaManual);
        this.onCerrarModal();
      }
    }else{
      this.confirmationDialogService.confirm('Corte', 'No se puede ingresar una fecha mayor a la actual', 'Cerrar', '', null, null, Tipoalerta.Warning)
    }
  }

  private crearFormularioCorte(): FormGroup {
    return this.balanzasManualCorteService.inicializaCortesBajaCarga((this.balanzaManualRegistro ? this.balanzaManualRegistro : null), true);
  }

}
