import { formatDate } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { BalanzaService } from '@ScatoServicios/balanza.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { FuncionesGeneralesService } from '@ScatoServicios/funciones-generales.service';
import { Usuario } from '@ScatoInterfaces/usuario';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { SessionService } from '@ScatoServicios/session.service';
import { BuqueService } from '@ScatoServicios/buque.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BalanzasManualService } from '../balanzas-manual/balanzas-manual.service';
import { InicioFinalizacionCargaService } from '../inicio-finalizacion-carga.services';
import { ModuloDeCarga } from '@ScatoModels/modulo-carga';

@Component({
  selector: 'app-finalizacion-carga',
  templateUrl: './finalizacion-carga.component.html',
  styleUrls: ['./finalizacion-carga.component.css']
})
export class FinalizacionCargaComponent implements OnInit, OnDestroy {
  finalizacionCargaForm: FormGroup;
  embarqueSelected: any;
  embarque_Id: number = 0;
  confirmationDialogService: any;
  fechaHoraFinalizacionCarga: string[];
  cargaFinalizada: boolean = false;
  editandoFecha: boolean = false;
  @Output() finalizacionCarga = new EventEmitter<boolean>();
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
    this.embarque_Id = this.procesoService.getEmbarqueId();
    this.embarqueSelected = this.procesoService.getEmbarqueSelected();
    this.finalizacionCargaForm = this.formBuilder.group({
      fechaFinalizacionCarga: ['', Validators.required],
      horaFinalizacionCarga: ['', Validators.required]
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
  ngOnInit(): void {
    this.initFinalizacionCarga();
    if(!this.hasPermisoIniciarCargaBalanzas()) this.finalizacionCargaForm.disable();
  }

  initFinalizacionCarga = () => {
    this.moduloCargaService.obtenerPeriodoDeCargaPorIdModuloDeCarga(this.embarqueSelected.moduloDeCargaId).subscribe((response: any) => {
      let isNull = false;
      let sFechaFinalizacionCarga: string = null;
      let sHoraFinalizacionCarga:string = null;
      if (response == null || (response?.fechaFinalizacionCarga == null && response?.horaFinalizacionCarga == null) 
      || (response?.fechaFinalizacionCarga == '' && response?.horaFinalizacionCarga == '')) {
        isNull = true;
        sFechaFinalizacionCarga = null;
        sHoraFinalizacionCarga = null;
      } else {
        sFechaFinalizacionCarga = formatDate(response.fechaFinalizacionCarga, 'yyyy-MM-dd', 'en-US');
        sHoraFinalizacionCarga = response.horaFinalizacionCarga;
      }
      if(!isNull){
        this.cargaFinalizada = true;
        this.finalizacionCarga.emit(true);        
        document.getElementById("FFC").setAttribute("disabled", "true");
      }
      this.finalizacionCargaForm.setValue({
        fechaFinalizacionCarga: sFechaFinalizacionCarga,
        horaFinalizacionCarga: sHoraFinalizacionCarga
      });      
    });
  }

  toggleEditarFecha = () => {
    this.editandoFecha = !this.editandoFecha;
    if (this.editandoFecha)
      document.getElementById("FFC").removeAttribute("disabled");
    else{
      document.getElementById("FFC").setAttribute("disabled","true" );
      this.initFinalizacionCarga();
    }
  }

  preguntarGuardarFinalizacionCarga = () => {
    if (this.finalizacionCargaForm.controls.fechaFinalizacionCarga.value == '' || this.finalizacionCargaForm.controls.fechaFinalizacionCarga.value == undefined) {
      this.confirmationDialogService.confirm('¡Atención!', 'Debe ingresar una fecha de finalización de carga.', 'Aceptar', '', null, null, Tipoalerta.Warning);
      return;
    }

    if (this.finalizacionCargaForm.controls.horaFinalizacionCarga.value == '' || this.finalizacionCargaForm.controls.horaFinalizacionCarga.value == undefined) {
      this.confirmationDialogService.confirm('¡Atención!', 'Debe ingresar una hora de finalización de carga.', 'Aceptar', '', null, null, Tipoalerta.Warning);
      return;
    }

    let fechaFinalizacionCarga = '';
    fechaFinalizacionCarga = formatDate(this.finalizacionCargaForm.controls.fechaFinalizacionCarga.value, 'yyyy-MM-dd', 'en-US');
    fechaFinalizacionCarga = fechaFinalizacionCarga + ' ' + this.finalizacionCargaForm.controls.horaFinalizacionCarga.value;

    forkJoin([
      this.balanzasManualService.listarBalanzaManual(this.embarqueSelected.moduloDeCargaId),
      this.moduloCargaService.obtenerModuloDeCarga(this.embarqueSelected.moduloDeCargaId),
      this.moduloCargaService.obtenerPlanillaTurnos(this.embarqueSelected.moduloDeCargaId)
    ]).pipe(takeUntil(this.destroy$)).subscribe(([balanzaManual,moduloDeCarga,planillaTurnos]) => {
      let fechaInicioCargaPeriodo = '';
      let fechaFinCorteBajaCarga = '';
      let fechaFinCargaNormal = '';
      let fechaUltimaCarga = '';

      if (balanzaManual!=null){
        fechaFinCorteBajaCarga = this.inicioFinalizacionCargaService.obtenerFechaCorteBajaCarga(balanzaManual, true);
      }
      if(planillaTurnos != null){
        fechaUltimaCarga = this.inicioFinalizacionCargaService.obtenerFechaUltimaCarga(planillaTurnos);
      }
      if (moduloDeCarga!=null){
        if (moduloDeCarga.moduloDeCargaPeriodoDeCarga!=null && moduloDeCarga.moduloDeCargaPeriodoDeCarga.length > 0){
          fechaInicioCargaPeriodo = this.inicioFinalizacionCargaService.obtenerFechaPeriodoCarga(moduloDeCarga.moduloDeCargaPeriodoDeCarga, false);
        }
        fechaFinCargaNormal = this.inicioFinalizacionCargaService.obtenerFechaCargaNormal(moduloDeCarga.moduloDeCargaPlanillaDeTurnos,true);
      }
      if (fechaInicioCargaPeriodo>''){
        if (fechaInicioCargaPeriodo > fechaFinalizacionCarga){
          this.confirmationDialogService.confirm('¡Atención!', 'La fecha de inicio de carga no puede ser mayor a la fecha de finalización de carga.', 'Aceptar', '', null, null, Tipoalerta.Warning);
          return;
        }
      }
      if (fechaFinCargaNormal>''){
        if (fechaFinalizacionCarga < fechaFinCargaNormal){
          this.confirmationDialogService.confirm('¡Atención!', 'La fecha de finalización de carga es menor a las fechas de los turnos registrados.', 'Aceptar', '', null, null, Tipoalerta.Warning);
          return;
        }
      }
      if (fechaFinCorteBajaCarga>''){
        if (fechaFinalizacionCarga < fechaFinCorteBajaCarga){
          this.confirmationDialogService.confirm('¡Atención!', 'La fecha de finalización de carga es menor a las fechas de corte y baja carga registrados.', 'Aceptar', '', null, null, Tipoalerta.Warning);
          return;
        }
      }
      if (fechaUltimaCarga != '' && fechaFinalizacionCarga < fechaUltimaCarga){
        this.confirmationDialogService.confirm('¡Atención!', 'La fecha de finalización de carga es menor a las fechas de cargas registradas en la planilla de turnos.', 'Aceptar', '', null, null, Tipoalerta.Warning);
        return;
      }
      this.guardarFechaFinalizacionCarga();
    });
  }
  private guardarFechaFinalizacionCarga(){
    if (this.cargaFinalizada){
      let texto = "Se visualizarán los datos posteriores a la fecha ingresada, ¿desea continuar?";
      this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', 'Cancelar', null, null, Tipoalerta.Warning)
        .then((confirmed) => {
          this.guardarFinalizacionPeriodoDeCarga();
        });
    }else{
        this.guardarFinalizacionPeriodoDeCarga();
    }  
  }
  guardarFinalizacionPeriodoDeCarga = () => {
    let texto = "";
    let fechaFinalizacionCarga = String(this.finalizacionCargaForm.controls.fechaFinalizacionCarga.value);
    let horaFinalizacionCarga = String(this.finalizacionCargaForm.controls.horaFinalizacionCarga.value);
    let periodoCargarActualizar: any = {
      idModuloDeCarga: this.embarqueSelected.moduloDeCargaId,
      fechaFinalizacionCarga: fechaFinalizacionCarga,
      horaFinalizacionCarga: horaFinalizacionCarga
    };
    this.moduloCargaService.actualizarFechasPeriodoDeCarga(periodoCargarActualizar, this.embarqueSelected.moduloDeCargaId, false).subscribe((res: any) => {
      if(this.cargaFinalizada){
        texto = "Se modificó la fecha de finalización de carga correctamente.";
      }else{
        texto = "Se finalizó la carga correctamente";
        this.cargaFinalizada = true;
      }
      this.finalizacionCarga.emit(true);
      this.toggleEditarFecha();
      this.editandoFecha = false;
      this.cargaFinalizada = true;
      this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Success);
    });
  }

  hasPermisoIniciarCargaBalanzas = () => {
    return this.user.permisos.find(p => p === this.permisosScato.TableroSolido_IniciarCargaBalanzas);
  }

  obtenerFechaFinCarga(): Date {
    if(this.finalizacionCargaForm.controls.fechaFinalizacionCarga.value != null && this.finalizacionCargaForm.controls.fechaFinalizacionCarga.value!= ''){
      return new Date(this.finalizacionCargaForm.controls.fechaFinalizacionCarga.value); 
    }else{
      return null;
    }
  }

  obtenerHoraFinCarga(): string {
    if(this.finalizacionCargaForm.controls.horaFinalizacionCarga.value != null && this.finalizacionCargaForm.controls.horaFinalizacionCarga.value!= ''){
      return this.finalizacionCargaForm.controls.horaFinalizacionCarga.value; 
    }else{
      return null;
    }
  }

}