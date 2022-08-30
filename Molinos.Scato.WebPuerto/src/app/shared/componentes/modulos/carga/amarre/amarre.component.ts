import { formatDate } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';

@Component({
  selector: 'app-amarre',
  templateUrl: './amarre.component.html',
  styleUrls: ['./amarre.component.css']
})
export class AmarreComponent implements OnInit {
  @Input() ModuloDeCargaId: number;
  public solidosForm: FormGroup;
  guardando: boolean = false;

  constructor(
    private _builder: FormBuilder,
    private _confirmationDialogService: ConfirmationDialogService,
    private _moduloDeCargaService: ModuloDeCargaService
  ) { }

  ngOnInit(): void {
    this.newForm();
  }

  newForm(){
    this.solidosForm = this._builder.group({
      fechaAmarro : "",
      horaAmarro : "",
      vientoAmarro : "",
      direccionAmarro : "",
      fechaDesamarro : "",
      horaDesamarro : "",
      vientoDesamarro : "",
      direccionDesamarro : "",
      fechaHabilitacion : "",
      horaHabilitacion : "",
    })
    // this.solidosForm = this._builder.group({
    //   amarro: this.initAmarre(),
    //   desamarro: this.initAmarre(),
    //   habilitacion: this.initFechaHora()
    // })
  }

  validarAMPM(event){
    
  }

  guardarAmarre(){
    this._confirmationDialogService.confirm("Atención!", "¿Seguro que desea guardar el período de carga?", 'Aceptar', 'Cancelar', null, null, Tipoalerta.Warning)
    .then( (confirmed) => {
      if(confirmed){
        this.guardando = true;
        if (this.ModuloDeCargaId > 0){
          this._moduloDeCargaService.guardarPeriodoDeCarga(this.obtenerAmarre(),this.ModuloDeCargaId).subscribe((res: any) => {
            this.guardando = false
          });
        }        
      }    });
    
  }

  updateAmarre(amarre){
    amarre.fechaAmarro = amarre.fechaAmarro ?  formatDate(amarre.fechaAmarro, 'yyyy-MM-dd', 'es-ar') : " ";
    amarre.fechaDesamarro =  amarre.fechaDesamarro ? formatDate(amarre.fechaDesamarro, 'yyyy-MM-dd', 'es-ar') : " ";
    amarre.fechaHabilitacion = amarre.fechaHabilitacion ? formatDate(amarre.fechaHabilitacion, 'yyyy-MM-dd', 'es-ar') : " ";
    this.solidosForm.patchValue(amarre);
  }

  obtenerAmarre(){
    return this.solidosForm.getRawValue();
  }
}
