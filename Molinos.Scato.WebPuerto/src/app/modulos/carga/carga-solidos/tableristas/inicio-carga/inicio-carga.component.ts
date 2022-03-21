import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { BalanzaService } from '@ScatoServicios/balanza.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { FuncionesGeneralesService } from '@ScatoServicios/funciones-generales.service';

@Component({
  selector: 'app-inicio-carga',
  templateUrl: './inicio-carga.component.html',
  styleUrls: ['./inicio-carga.component.css']
})
export class InicioCargaComponent implements OnInit {
  inicioCargaForm: FormGroup;
  embarque_Id: number = 0;
  confirmationDialogService: any;
  fechaHoraInicioCarga: string[];
  cargaIniciada: boolean = false;
  editandoFecha: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private procesoService: DatosEmbarquesProcesoService,
    private balanzaService: BalanzaService,
    private funcionesGeneralesService: FuncionesGeneralesService,
    confirmationDialogService: ConfirmationDialogService,
  ) {
    this.confirmationDialogService = confirmationDialogService;
    this.embarque_Id = this.procesoService.getEmbarqueId();
  }

  ngOnInit(): void {
    this.initInicioCarga();
  }

  initInicioCarga(){
    let fechaHoraInicioCarga_DB: Date = this.procesoService.getFechaHoraInicioCarga();
    let fechaHoraInicioCarga = String(fechaHoraInicioCarga_DB).split('T');
    
    if(fechaHoraInicioCarga[0] != 'null'){
      this.cargaIniciada = true;
      document.getElementById("FIC").setAttribute("disabled", "true");
    }

    this.inicioCargaForm = this.formBuilder.group({
      fechaInicioCarga: fechaHoraInicioCarga[0] != 'null' ? fechaHoraInicioCarga[0] : this.funcionesGeneralesService.getFechaHora(new Date(),'EN').substring(0, 10),
      horaInicioCarga: fechaHoraInicioCarga[0] != 'null' ? fechaHoraInicioCarga[1].substring(0,5) : this.funcionesGeneralesService.getFechaHora(new Date()).substring(11, 16),
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
    if (this.cargaIniciada){
      let texto = "Se perderán los datos ingresados manualmente, ¿desea continuar?";
      this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', 'Cancelar', null, null, Tipoalerta.Warning)
        .then((confirmed) => {
          if (confirmed)
            this.guardarFechaHoraInicioCarga();
          else {
            this.initInicioCarga();
            return;
          }
        });
    }else{
      this.guardarFechaHoraInicioCarga();
    }
  }

  guardarFechaHoraInicioCarga(){
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
          }
  
          this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Success);
        }, err => {
          guardadoOK = false;
          texto = "Ocurrió un error al guardar la fecha y hora";
          this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Error);
        });
    }
  }
}