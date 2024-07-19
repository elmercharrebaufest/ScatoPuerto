import { formatDate } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
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
// </ ARMOA005-1988 Dylan Lopez>

@Component({
  selector: 'app-inicio-carga',
  templateUrl: './inicio-carga.component.html',
  styleUrls: ['./inicio-carga.component.css']
})
export class InicioCargaComponent implements OnInit {
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
  periodoDeCarga = null;
  constructor(
    private formBuilder: FormBuilder,
    private procesoService: DatosEmbarquesProcesoService,
    private balanzaService: BalanzaService,
    private funcionesGeneralesService: FuncionesGeneralesService,
    confirmationDialogService: ConfirmationDialogService,
    private session: SessionService,
    private _buqueService: BuqueService,
    private moduloCargaService: ModuloDeCargaService
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

  ngOnInit(): void {
    this.initInicioCarga();

    if(!this.hasPermisoIniciarCargaBalanzas()) this.inicioCargaForm.disable();
  }

  initInicioCarga(){
    this.moduloCargaService.obtenerPeriodoDeCargaPorIdModuloDeCarga(this.embarqueSelected.moduloDeCargaId).subscribe((response: any) => {
      this.periodoDeCarga = response;
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
    if (this.periodoDeCarga.fechaFinalizacionCarga != null){
      let fechaFinalizacionCargaPeriodo = formatDate(this.periodoDeCarga.fechaFinalizacionCarga, 'yyyy-MM-dd', 'en-US');
      let fechaInicioCarga = formatDate(this.inicioCargaForm.controls.fechaInicioCarga.value, 'yyyy-MM-dd', 'en-US');

      if (fechaInicioCarga> fechaFinalizacionCargaPeriodo){
        this.confirmationDialogService.confirm('¡Atención!', 'La fecha de inicio de carga no puede ser mayor a la fecha de finalización de carga.', 'Aceptar', '', null, null, Tipoalerta.Warning);
        return;
      }
    }
    if (this.cargaIniciada){
      let texto = "Se visualizarán los datos posteriores a la fecha ingresada, ¿desea continuar?";
      this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', 'Cancelar', null, null, Tipoalerta.Warning)
        .then((confirmed) => {
          this.actualizarFechasPeriodoDeCarga();
          if (confirmed){
            this.inicioCarga.emit(true);
          }else {
            this.initInicioCarga();
            return;
          }
        });
    } else {
      this.actualizarFechasPeriodoDeCarga();
      this.inicioCarga.emit(true);
      this.cargaIniciada = true;
      this.editandoFecha = false;
    }
  }

  guardarFechaHoraInicioCarga() {
    let fechaInicioCarga = String(this.inicioCargaForm.controls.fechaInicioCarga.value);
    let horaInicioCarga = String(this.inicioCargaForm.controls.horaInicioCarga.value);
    let fechaHorastring = `${fechaInicioCarga} ${horaInicioCarga}`;
    let guardadoOK = false;
    let texto = "";
    this.embarque_Id = this.procesoService.getEmbarqueId();

    if(fechaHorastring != ' '){
      this.balanzaService.guardarFechaInicioCarga(this.embarque_Id, fechaHorastring)
        .pipe(finalize(() => {
          if(guardadoOK){
            let fechaHorastringParaSet = `${fechaInicioCarga}T${horaInicioCarga}`;
            this.procesoService.setFechaHoraInicioCarga(fechaHorastringParaSet);
            this.toggleEditarFecha();
          }
        }))
        .subscribe( res => {
          guardadoOK = true;

          if(this.cargaIniciada){
            texto = "Se modificó la fecha de inicio de carga correctamente.";
          }else{
            texto = "Se inició la carga correctamente";
            this.cargaIniciada = true;
            document.getElementById("FIC").setAttribute("disabled","true");
            this._buqueService.GuardarHistoricoOperador(this.embarque_Id, "Inició carga").subscribe();
          }
  
          this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Success);
        }, err => {
          guardadoOK = false;
          texto = "Ocurrió un error al guardar la fecha y hora";
          this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Error);
        });
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
    });
  }

  hasPermisoIniciarCargaBalanzas() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroSolido_IniciarCargaBalanzas);
  }
}