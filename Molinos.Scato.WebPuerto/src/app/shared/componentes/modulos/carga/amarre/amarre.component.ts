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
  @Input() esSoloLectura: boolean = false;

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
      fechaAmarro : [{ value: '', disabled: this.esSoloLectura }],
      horaAmarro : [{ value: '', disabled: this.esSoloLectura }],
      vientoAmarro : [{ value: '', disabled: this.esSoloLectura }],
      direccionAmarro : [{ value: '', disabled: this.esSoloLectura }],
      fechaDesamarro : [{ value: '', disabled: this.esSoloLectura }],
      horaDesamarro : [{ value: '', disabled: this.esSoloLectura }],
      vientoDesamarro : [{ value: '', disabled: this.esSoloLectura }],
      direccionDesamarro : [{ value: '', disabled: this.esSoloLectura }],
      fechaHabilitacion : [{ value: '', disabled: this.esSoloLectura }],
      horaHabilitacion : [{ value: '', disabled: this.esSoloLectura }],
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
