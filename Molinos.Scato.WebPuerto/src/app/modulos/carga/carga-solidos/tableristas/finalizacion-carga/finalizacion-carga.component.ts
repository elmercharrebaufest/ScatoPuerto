import { formatDate } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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

@Component({
  selector: 'app-finalizacion-carga',
  templateUrl: './finalizacion-carga.component.html',
  styleUrls: ['./finalizacion-carga.component.css']
})
export class FinalizacionCargaComponent implements OnInit {
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
    this.embarque_Id = this.procesoService.getEmbarqueId();
    this.embarqueSelected = this.procesoService.getEmbarqueSelected();
    // this.embarque_Id = this.embarqueSelected.moduloDeCargaId;

    this.finalizacionCargaForm = this.formBuilder.group({
      fechaFinalizacionCarga: ['', Validators.required],
      horaFinalizacionCarga: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.initFinalizacionCarga();

    if(!this.hasPermisoIniciarCargaBalanzas()) this.finalizacionCargaForm.disable();
  }

  initFinalizacionCarga = () => {
    console.log('initFinalizacionCarga');
    // let fechaHoraFinalizacionCarga_DB: Date = this.procesoService.getFechaHoraFinCarga();
    // let fechaHoraFinalizacionCarga = String(fechaHoraFinalizacionCarga_DB).split('T');
    // console.log(' fechaHoraFinalizacionCarga_DB: ', fechaHoraFinalizacionCarga_DB);
    // console.log(' fechaHoraFinalizacionCarga: ', fechaHoraFinalizacionCarga);

    this.moduloCargaService.obtenerPeriodoDeCargaPorIdModuloDeCarga(this.embarqueSelected.moduloDeCargaId).subscribe((response: any) => {
      console.log(' response: ', response);
      let isNull = false;
      let sFechaFinalizacionCarga: string = null;
      let sHoraFinalizacionCarga:string = null;
      if (response == null || (response?.fechaFinalizacionCarga == null && response?.horaFinalizacionCarga == null)) {
        isNull = true;
        let fechaHoraFinalizacionCarga_DB = this.procesoService.getFechaHoraInicioCarga();
        let fechaHoraFinalizacionCarga = String(fechaHoraFinalizacionCarga_DB).split('T');

        sFechaFinalizacionCarga = fechaHoraFinalizacionCarga[0] != 'null' ? fechaHoraFinalizacionCarga[0] : this.funcionesGeneralesService.getFechaHora(new Date(),'EN').substring(0, 10);
        sHoraFinalizacionCarga = fechaHoraFinalizacionCarga[0] != 'null' ? fechaHoraFinalizacionCarga[1].substring(0,5) : this.funcionesGeneralesService.getFechaHora(new Date()).substring(11, 16);
      } else {
        sFechaFinalizacionCarga = formatDate(response.fechaFinalizacionCarga, 'yyyy-MM-dd', 'en-US');
        sHoraFinalizacionCarga = response.horaFinalizacionCarga;
      }
      
      console.log(' isNull: ', isNull);
      if(!isNull){
        this.cargaFinalizada = true;
        this.finalizacionCarga.emit(true);
        
        document.getElementById("FFC").setAttribute("disabled", "true");
      }
      
      console.log(' sFechaFinalizacionCarga: ', sFechaFinalizacionCarga);
      console.log(' sHoraFinalizacionCarga: ', sHoraFinalizacionCarga);

      this.finalizacionCargaForm.setValue({
        fechaFinalizacionCarga: sFechaFinalizacionCarga,
        horaFinalizacionCarga: sHoraFinalizacionCarga
      });
      
      console.log(' finalizacionCargaForm: ', this.finalizacionCargaForm);
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
    console.log('preguntarGuardarFinalizacionCarga');
    if (this.cargaFinalizada) {
      let texto = "Se visualizarán los datos posteriores a la fecha ingresada, ¿desea continuar?";
      this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', 'Cancelar', null, null, Tipoalerta.Warning)
        .then((confirmed) => {
          this.guardarFinalizacionPeriodoDeCarga();
          if (confirmed){
            this.finalizacionCarga.emit(true);
          } else {
            this.initFinalizacionCarga();
            return;
          }
        });
    } else{
      this.guardarFinalizacionPeriodoDeCarga();
      this.finalizacionCarga.emit(true);
    }
  }

  guardarFinalizacionPeriodoDeCarga = () => {
    console.log('guardarFinalizacionPeriodoDeCarga');
    let texto = "";
    let fechaFinalizacionCarga = String(this.finalizacionCargaForm.controls.fechaFinalizacionCarga.value);
    let horaFinalizacionCarga = String(this.finalizacionCargaForm.controls.horaFinalizacionCarga.value);
    console.log(' fechaFinalizacionCarga: ', fechaFinalizacionCarga);
    console.log(' horaFinalizacionCarga: ', horaFinalizacionCarga);
    console.log(' moduloDeCarga_Id: ', this.embarqueSelected.moduloDeCargaId);
    let periodoCargarActualizar: any = {
      idModuloDeCarga: this.embarqueSelected.moduloDeCargaId,
      fechaFinalizacionCarga: fechaFinalizacionCarga,
      horaFinalizacionCarga: horaFinalizacionCarga
    };
    // periodoCargarActualizar.idModuloDeCarga = this.embarque_Id;
    // periodoCargarActualizar.fechaComienzoCarga = fechaInicioCarga;
    // periodoCargarActualizar.horaComienzoCarga = horaInicioCarga;
    console.log(' periodoCargarActualizar: ', periodoCargarActualizar);
    this.moduloCargaService.guardarPeriodoDeCarga(periodoCargarActualizar, this.embarqueSelected.moduloDeCargaId).subscribe((res: any) => {
      console.log(' res: ', res);

      if(this.cargaFinalizada){
        texto = "Se modificó la fecha de finalización de carga correctamente.";
      }else{
        texto = "Se finalizó la carga correctamente";
        this.cargaFinalizada = true;
        document.getElementById("FFC").setAttribute("disabled","true");
        this._buqueService.GuardarHistoricoOperador(this.embarque_Id, "Inició carga").subscribe();
      }

      this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Success);
    });
  }

  hasPermisoIniciarCargaBalanzas = () => {
    return this.user.permisos.find(p => p === this.permisosScato.TableroSolido_IniciarCargaBalanzas);
  }
}