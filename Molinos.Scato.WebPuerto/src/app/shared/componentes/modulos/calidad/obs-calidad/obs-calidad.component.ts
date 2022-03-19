import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Usuario } from '@ScatoInterfaces/usuario';
import { SessionService } from '@ScatoServicios/session.service';
import { ProcesoCalidadService } from '@ScatoServicios/procesoCalidad.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';

@Component({
  selector: 'app-obs-calidad',
  templateUrl: './obs-calidad.component.html',
  styleUrls: ['./obs-calidad.component.css']
})
export class ObsCalidadComponent implements OnInit {
  confirmationDialogService: any;
  obsCalidadForm: FormGroup;
  private user: Usuario
  
  constructor(
    private formBuilder: FormBuilder,
    private session: SessionService,
    private procesoCalidadService: ProcesoCalidadService,
    confirmationDialogService: ConfirmationDialogService
  ) { 
    this.confirmationDialogService = confirmationDialogService;
  }

  ngOnInit(): void {
    this.user = this.session.getUser();
    this.initFormulario();
  }

  initFormulario(){
    this.obsCalidadForm = this.formBuilder.group({
      id: [''],
      fecha: [''],
      hora: [''],
      observaciones: [''],
      userCarga: this.user.username
    })
  }

  guardarObsCalidad(){
    if(this.obsCalidadForm.controls.observaciones.value === '' || this.obsCalidadForm.controls.fecha.value === '' || this.obsCalidadForm.controls.hora.value === '')
      return;
    
    let { fecha, hora } = this.obsCalidadForm.getRawValue();

    let fechaHoraIncorrecta = this.comparaFechaHora(fecha, hora);

    let texto = fechaHoraIncorrecta ? "Fecha y hora mayor a la actual. Para poder continuar, debe completarlas correctamente." :
      "Desea guardar las observaciones de calidad?";

    this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Success)
      .then((confirmed) => {
        if (confirmed && !fechaHoraIncorrecta) {
          this.procesoCalidadService.setObsCalidad(this.obsCalidadForm.getRawValue());
          this.obsCalidadForm.reset();
        }
        else
          return;
      }).catch(() => window.location.reload());
  }

  comparaFechaHora(fecha: any, hora: any): boolean{
    let lFechaHoraObs = fecha + ' ' + hora;
    let lFechaHoy = new Date();
    let lFechaObs = new Date(lFechaHoraObs);
    
    if( lFechaHoy.getTime() < lFechaObs.getTime() ){
      return true;
    } else
      return false;
  }

  // updateObsCalidad(obsCalidad){
  //   this.obsCalidadForm.patchValue(obsCalidad);
  // }

  obtenerDatosObsCalidad(){
    return this.obsCalidadForm.getRawValue();
  }

}
