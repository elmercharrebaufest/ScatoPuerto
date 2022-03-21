import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-amarre',
  templateUrl: './amarre.component.html',
  styleUrls: ['./amarre.component.css']
})
export class AmarreComponent implements OnInit {
  public solidosForm: FormGroup;
  constructor(
    private _builder: FormBuilder
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
