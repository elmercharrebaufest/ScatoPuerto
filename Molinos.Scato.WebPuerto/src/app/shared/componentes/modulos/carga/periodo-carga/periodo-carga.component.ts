import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-periodo-carga',
  templateUrl: './periodo-carga.component.html',
  styleUrls: ['./periodo-carga.component.css']
})
export class PeriodoCargaComponent implements OnInit {

  periodoCargaForm: FormGroup;
  
  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initFormulario();
  }
  initFormulario(){
    // this.periodoCargaForm = this.formBuilder.group({
    //   amarro: this.initAmarre(),
    //   desamarro: this.initAmarre(),
    //   habilitacion: this.initFechaHora(),
    //   conexionManguera: this.initFechaHora(),
    //   desconexionManguera: this.initFechaHora(),
    //   comienzoCarga: this.initFechaHora(),
    //   finCarga: this.initFechaHora()
    // })

    this.periodoCargaForm = this.formBuilder.group({
      id: "",
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
      fechaConexionMangueras : "",
      fechaDesconexionMangueras : "",
      fechaComienzoCarga : "",
      fechaFinalizacionCarga : "",
      horaConexionMangueras : "",
      horaDesconexionMangueras : "",
      horaComienzoCarga : "",
      horaFinalizacionCarga : ""
    });
  }
  // this.fechaCarta = formatDate(this.instanciaWorkflow.lineUp.cartaDeSubidaAprobada, 'yyyy-MM-dd', 'es-ar');
  // this.horaCarta = formatDate(this.instanciaWorkflow.lineUp.cartaDeSubidaAprobada, 'HH:mm', 'es-ar');
  // initFechaHora(){
  //   return this.formBuilder.group({
  //     id: '',
  //     fecha: '',
  //     hora: '',
  //   });
  // }

  // initAmarre(){
  //   return this.formBuilder.group({
  //     id: '',
  //     fecha: '',
  //     hora: '',
  //     viento: '',
  //     direccion: ''
  //   });

  updatePeriodoCarga(periodoCarga = null){
    // console.log('periodoCarga: ', periodoCarga);
    let pc = periodoCarga;
    pc.fechaAmarro = pc?.fechaAmarro ? formatDate(pc.fechaAmarro, 'yyyy-MM-dd', 'es-ar') : "";
    pc.fechaDesamarro = pc?.fechaDesamarro ? formatDate(pc.fechaDesamarro, 'yyyy-MM-dd', 'es-ar') : "";
    pc.fechaComienzoCarga = pc?.fechaComienzoCarga ? formatDate(pc.fechaComienzoCarga, 'yyyy-MM-dd', 'es-ar') : " ";
    pc.fechaConexionMangueras = pc?.fechaConexionMangueras ? formatDate(pc.fechaConexionMangueras, 'yyyy-MM-dd', 'es-ar') : " ";
    pc.fechaDesconexionMangueras = pc?.fechaDesconexionMangueras ? formatDate(pc.fechaDesconexionMangueras, 'yyyy-MM-dd', 'es-ar') : " ";
    pc.fechaFinalizacionCarga = pc?.fechaFinalizacionCarga ? formatDate(pc.fechaFinalizacionCarga, 'yyyy-MM-dd', 'es-ar') : " ";
    pc.fechaHabilitacion = pc?.fechaHabilitacion ? formatDate(pc.fechaHabilitacion, 'yyyy-MM-dd', 'es-ar') : " ";
    this.periodoCargaForm.patchValue(pc);
  }

  obtenerDatosPeriodoCarga(){
    return this.periodoCargaForm.getRawValue();
  }

  clForm(){
    console.log(this.periodoCargaForm.getRawValue());
  }
}