import { formatDate } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, takeUntil } from 'rxjs/operators';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { BalanzaService } from '@ScatoServicios/balanza.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { FuncionesGeneralesService } from '@ScatoServicios/funciones-generales.service';
import { Usuario } from '@ScatoInterfaces/usuario';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { SessionService } from '@ScatoServicios/session.service';
import { BuqueService } from '@ScatoServicios/buque.service';
// <ARMOA005-1988 Dylan Lopez>
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { BalanzasManualService } from '../balanzas-manual/balanzas-manual.service';
import { forkJoin, Subject } from 'rxjs';
import { InicioFinalizacionCargaService } from '../inicio-finalizacion-carga.services';
import { PlanillaDeTurnos } from '@ScatoModels/planilla-turnos/planilla-de-turnos';
// </ ARMOA005-1988 Dylan Lopez>

@Component({
  selector: 'app-inicio-carga',
  templateUrl: './inicio-carga.component.html',
  styleUrls: ['./inicio-carga.component.css']
})
export class InicioCargaComponent implements OnInit, OnDestroy {
  inicioCargaForm: FormGroup;
  embarqueSelected: any;
  embarque_Id: number = 0;
  confirmationDialogService: any;
  fechaHoraInicioCarga: string[];
  cargaIniciada: boolean = false;
  editandoFecha: boolean = false;
  @Output() inicioCarga = new EventEmitter<boolean>();
  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;
  private destroy$ = new Subject();

  constructor(
    private formBuilder: FormBuilder,
    private procesoService: DatosEmbarquesProcesoService,
    private balanzaService: BalanzaService,
    private funcionesGeneralesService: FuncionesGeneralesService,
    confirmationDialogService: ConfirmationDialogService,
    private session: SessionService,
    private _buqueService: BuqueService,
    private moduloCargaService: ModuloDeCargaService,
    private balanzasManualService: BalanzasManualService,
    private inicioFinalizacionCargaService: InicioFinalizacionCargaService
  ) {
    this.user = this.session.getUser();
    this.confirmationDialogService = confirmationDialogService;
    // <ARMOA005-1988 Dylan Lopez>
    this.embarque_Id = this.procesoService.getEmbarqueId();
    this.embarqueSelected = this.procesoService.getEmbarqueSelected();
    this.inicioCargaForm = this.formBuilder.group({
      fechaInicioCarga: ['', Validators.required],
      horaInicioCarga: ['', Validators.required]
    });
    // </ ARMOA005-1988 Dylan Lopez>
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
  ngOnInit(): void {
    this.initInicioCarga();

    if(!this.hasPermisoIniciarCargaBalanzas()) this.inicioCargaForm.disable();
  }

  initInicioCarga(){
    this.moduloCargaService.obtenerPeriodoDeCargaPorIdModuloDeCarga(this.embarqueSelected.moduloDeCargaId).subscribe((response: any) => {
      let isNull = false;
      let sFechaInicioCarga: string = null;
      let sHoraInicioCarga:string = null;
      if (response == null || (response?.fechaComienzoCarga == null && response?.horaComienzoCarga == null)) {
        isNull = true;
        let fechaHoraInicioCarga_DB = this.procesoService.getFechaHoraInicioCarga();
        let fechaHoraInicioCarga = String(fechaHoraInicioCarga_DB).split('T');

        sFechaInicioCarga = fechaHoraInicioCarga[0] != 'null' ? fechaHoraInicioCarga[0] : this.funcionesGeneralesService.getFechaHora(new Date(),'EN').substring(0, 10);
        sHoraInicioCarga = fechaHoraInicioCarga[0] != 'null' ? fechaHoraInicioCarga[1].substring(0,5) : this.funcionesGeneralesService.getFechaHora(new Date()).substring(11, 16);
      } else {
        sFechaInicioCarga =formatDate(response.fechaComienzoCarga, 'yyyy-MM-dd', 'en-US');
        sHoraInicioCarga = response.horaComienzoCarga;
      }
      
      if(!isNull){
        this.cargaIniciada = true;
        this.inicioCarga.emit(true);
        document.getElementById("FIC").setAttribute("disabled", "true");
      }
      this.inicioCargaForm.setValue({
        fechaInicioCarga: sFechaInicioCarga,
        horaInicioCarga: sHoraInicioCarga
      });      
    });
  }

  toggleEditarFecha(){
    this.editandoFecha = !this.editandoFecha;
    if (this.editandoFecha)
      document.getElementById("FIC").removeAttribute("disabled");
    else{
      document.getElementById("FIC").setAttribute("disabled","true" );
      this.initInicioCarga();
    }
  }

  preguntarGuardarInicioCarga(){
    let fechaInicioCarga = '';
    fechaInicioCarga = formatDate(this.inicioCargaForm.controls.fechaInicioCarga.value, 'yyyy-MM-dd', 'en-US');
    fechaInicioCarga = fechaInicioCarga + ' ' + this.inicioCargaForm.controls.horaInicioCarga.value;

    forkJoin([
      this.balanzasManualService.listarBalanzaManual(this.embarqueSelected.moduloDeCargaId),
      this.moduloCargaService.obtenerModuloDeCarga(this.embarqueSelected.moduloDeCargaId),
      this.moduloCargaService.obtenerPlanillaTurnos(this.embarqueSelected.moduloDeCargaId)
    ]).pipe(takeUntil(this.destroy$)).subscribe(([balanzaManual,moduloDeCarga,planillaTurnos]) => {
      let fechaFinalizacionCargaPeriodo = '';
      let fechaInicioCorteBajaCarga = '';
      let fechaInicioCargaNormal = '';
      let fechaPrimeraCarga = '';

      if (balanzaManual!=null){
        fechaInicioCorteBajaCarga = this.inicioFinalizacionCargaService.obtenerFechaCorteBajaCarga(balanzaManual, false);
      }
      if(planillaTurnos != null){
        fechaPrimeraCarga = this.inicioFinalizacionCargaService.obtenerFechaPrimeraCarga(planillaTurnos);
      }
      if (moduloDeCarga!=null){
        if (moduloDeCarga.moduloDeCargaPeriodoDeCarga!=null && moduloDeCarga.moduloDeCargaPeriodoDeCarga.length > 0){
          fechaFinalizacionCargaPeriodo = this.inicioFinalizacionCargaService.obtenerFechaPeriodoCarga(moduloDeCarga.moduloDeCargaPeriodoDeCarga, true);
        }
        fechaInicioCargaNormal = this.inicioFinalizacionCargaService.obtenerFechaCargaNormal(moduloDeCarga.moduloDeCargaPlanillaDeTurnos,false);
      }
      if (fechaFinalizacionCargaPeriodo>''){
        if (fechaInicioCarga > fechaFinalizacionCargaPeriodo){
          this.confirmationDialogService.confirm('¡Atención!', 'La fecha de inicio de carga no puede ser mayor a la fecha de finalización de carga.', 'Aceptar', '', null, null, Tipoalerta.Warning);
          return;
        }
      }
      if (fechaInicioCargaNormal>''){
        if (fechaInicioCarga > fechaInicioCargaNormal){
          this.confirmationDialogService.confirm('¡Atención!', 'La fecha de inicio de carga es mayor a las fechas de los turnos registrados.', 'Aceptar', '', null, null, Tipoalerta.Warning);
          return;
        }
      }
      if (fechaInicioCorteBajaCarga>''){
        if (fechaInicioCarga > fechaInicioCorteBajaCarga){
          this.confirmationDialogService.confirm('¡Atención!', 'La fecha de inicio de carga es mayor a las fechas de corte y baja carga registrados.', 'Aceptar', '', null, null, Tipoalerta.Warning);
          return;
        }
      }
      if (fechaPrimeraCarga != '' && fechaInicioCarga > fechaPrimeraCarga){
        this.confirmationDialogService.confirm('¡Atención!', 'La fecha de inicio de carga es mayor a las fechas de carga registradas en la planilla de turnos.', 'Aceptar', '', null, null, Tipoalerta.Warning);
        return;
      }
      this.guardarFechaInicioCarga();
    });
  }
  private guardarFechaInicioCarga(){
    if (this.cargaIniciada){
      let texto = "Se visualizarán los datos posteriores a la fecha ingresada, ¿desea continuar?";
      this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', 'Cancelar', null, null, Tipoalerta.Warning)
        .then((confirmed) => {
          if(confirmed)
            this.actualizarFechasPeriodoDeCarga();
          this.editandoFecha = false;
          return;
        });
    } else {
      this.actualizarFechasPeriodoDeCarga();
      this.editandoFecha = false;
    }
  }
  
  actualizarFechasPeriodoDeCarga = () => {
    let fechaInicioCarga = String(this.inicioCargaForm.controls.fechaInicioCarga.value);
    let horaInicioCarga = String(this.inicioCargaForm.controls.horaInicioCarga.value);
    let periodoCargarActualizar: any = {
      idModuloDeCarga: this.embarqueSelected.moduloDeCargaId,
      fechaComienzoCarga: fechaInicioCarga,
      horaComienzoCarga: horaInicioCarga
    };
    this.moduloCargaService.actualizarFechasPeriodoDeCarga(periodoCargarActualizar, this.embarqueSelected.moduloDeCargaId, true).subscribe((res: any) => {
      this.cargaIniciada = true;
      this.editandoFecha = false;
      document.getElementById("FIC").setAttribute("disabled", "true");
      this.initInicioCarga();
      this.inicioCarga.emit(true);
    });
  }

  hasPermisoIniciarCargaBalanzas() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroSolido_IniciarCargaBalanzas);
  }

  obtenerFechaInicioCarga(): Date {
    if(this.inicioCargaForm.controls.fechaInicioCarga.value != null && this.inicioCargaForm.controls.fechaInicioCarga.value!= ''){
      return new Date(this.inicioCargaForm.controls.fechaInicioCarga.value); 
    }else{
      return null;
    }
  }

  obtenerHoraInicioCarga(): string {
    if(this.inicioCargaForm.controls.horaInicioCarga.value != null && this.inicioCargaForm.controls.horaInicioCarga.value!= ''){
      return this.inicioCargaForm.controls.horaInicioCarga.value; 
    }else{
      return null;
    }
  }
}