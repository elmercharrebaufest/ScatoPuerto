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
  balanza: any;
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
      ///this.motivosBalanzas78 = data.filter(x => x.liquido == false && x.corte == true && x.nombre != 'Normal');
      this.motivosBalanzas78 = data.filter(x => x.liquido == false && x.corte == true && x.nombre != '');
      this.motivosBalanzas78.sort((a, b) => a.siglas.localeCompare(b.siglas));
    });
    this.cargarFormularioEditar();
    this.balanzasManualCorteService.RegistroBalanza.pipe(takeUntil(this.destroy$)).subscribe(registrosBalanza => {
      this.balanza = registrosBalanza;
      const idRegistro:string = this.corteManualForm.controls.id.value;
      if (idRegistro == null || idRegistro <= '0')
        this.cargarFechaHoraInicioDefecto();
    });
  }

  cargarFechaHoraInicioDefecto(){
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
    this.corteManualForm.controls['fechaInicio'].setValue(fechaMaxima.fechaCorte);
    this.corteManualForm.controls['horaInicio'].setValue(fechaMaxima.horaCorte);
    this.corteManualForm.controls.fechaInicio.disable()
    this.corteManualForm.controls.horaInicio.disable()
  }

  cargarFormularioEditar() {
    this.balanzasManualCorteService.BalanzaManual.pipe(takeUntil(this.destroy$)).subscribe(balanzaManual => {
      this.balanzaManualRegistro = balanzaManual;
      this.corteManualForm = this.crearFormularioCorte();
      if (this.balanzaManualRegistro == null) {
        this.corteManualForm.controls['fechaInicio'].setValue(this.fechaComienzoCarga);
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
    var objBalanza = {
      id                  : this.corteManualForm.controls.id.value                  ,
      fechaInicio         : this.corteManualForm.controls.fechaInicio.value         ,
      horaInicio          : this.corteManualForm.controls.horaInicio.value          ,
      fechaCorte          : this.corteManualForm.controls.fechaCorte.value          ,
      horaCorte           : this.corteManualForm.controls.horaCorte.value           ,
      material            : this.corteManualForm.controls.material.value            ,
      bodega              : this.corteManualForm.controls.bodega.value              ,
      destino             : this.corteManualForm.controls.destino.value             ,
      exportador          : this.corteManualForm.controls.exportador.value          ,
      motivosFallasBalanza: this.corteManualForm.controls.motivosFallasBalanza.value,
      kilogramos          : this.corteManualForm.controls.kilogramos.value          ,
      toneladas           : this.corteManualForm.controls.toneladas.value           ,
      corteManual         : this.corteManualForm.controls.corteManual.value         ,
      observaciones       : this.corteManualForm.controls.observaciones.value       ,
      correlativo         : this.corteManualForm.controls.correlativo.value         ,
      recordatorio        : this.corteManualForm.controls.recordatorio.value        ,
      cargaNormal         : false
    };

    let balanzaManual: BalanzaManual = new BalanzaManual(objBalanza);
    
    //Si es alta con recordatorio se deja fecha corte igual a fecha inicio salteando algunas validaciones.
    if(balanzaManual.recordatorio && this.balanzaManualRegistro == null){
      balanzaManual.fechaCorte = balanzaManual.fechaInicio;
      balanzaManual.horaCorte = balanzaManual.horaInicio;
    }
    //Si es edicion y se editó fecha corte, se deshabilita recordatorio.
    if(this.balanzaManualRegistro != null && 
      (balanzaManual.fechaCorte != this.balanzaManualRegistro.fechaCorte ||
      balanzaManual.horaCorte != this.balanzaManualRegistro.horaCorte)
    ){
      balanzaManual.recordatorio = false;
    }

    let validaFechasInicioFin= balanzaManual.recordatorio? true : this.balanzasManualService.validarFechasInicioFin(balanzaManual.fechaInicio, balanzaManual.horaInicio, balanzaManual.fechaCorte, balanzaManual.horaCorte);
    if (!validaFechasInicioFin){
      this.confirmationDialogService.confirm('Corte', 'No se puede crear un corte cuando la fecha de inicio es mayor o igual a la fecha corte', 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }
    let validaFechas = this.balanzasManualService.validarFechasIngresadas(balanzaManual.fechaInicio, balanzaManual.fechaCorte);
    if (validaFechas) {
      if (this.camposInvalidos(balanzaManual)) {
        let tituloMensaje = 'Todos los campos son obligatorios a excepción de la observación.';
        this.confirmationDialogService.confirm('Corte', tituloMensaje, 'Cerrar', '', null, null, Tipoalerta.Warning)
        return;
      } else {
        const fechaInicioRegistro = this.balanzasManualService.convertirFecha(balanzaManual.fechaInicio, balanzaManual.horaInicio);
        const fechaFinRegistro = this.balanzasManualService.convertirFecha(balanzaManual.fechaCorte, balanzaManual.horaCorte);
        let esRegistroValido = this.balanzasManualService.validarCortesBajasCarga(this.balanza,balanzaManual,fechaInicioRegistro,fechaFinRegistro);
        if (!esRegistroValido){
          this.confirmationDialogService.confirm('Corte', `Ya existe un Corte en el mismo rango de las fechas seleccionadas`, 'Cerrar', '', null, null, Tipoalerta.Warning)
        }else{
          this.balanzaManual.emit(balanzaManual);
          this.onCerrarModal();
        }
      }
    }else{
      this.confirmationDialogService.confirm('Corte', 'No se puede ingresar una fecha mayor a la actual', 'Cerrar', '', null, null, Tipoalerta.Warning)
    }
  }

  private camposInvalidos(balanzaManual: BalanzaManual): boolean{
    if(balanzaManual.recordatorio){
      return balanzaManual.fechaInicio == '' || balanzaManual.horaInicio == '' ||
      balanzaManual.motivosFallasBalanza == null || balanzaManual.motivosFallasBalanza.id == 0;
    }else{
      return balanzaManual.fechaInicio == '' || balanzaManual.horaInicio == '' ||
      balanzaManual.fechaCorte == '' || balanzaManual.horaCorte == '' ||
      balanzaManual.motivosFallasBalanza == null || balanzaManual.motivosFallasBalanza.id == 0;
    }
  }

  private crearFormularioCorte(): FormGroup {
    return this.balanzasManualCorteService.inicializaCortesBajaCarga((this.balanzaManualRegistro ? this.balanzaManualRegistro : null), true);
  }

}
