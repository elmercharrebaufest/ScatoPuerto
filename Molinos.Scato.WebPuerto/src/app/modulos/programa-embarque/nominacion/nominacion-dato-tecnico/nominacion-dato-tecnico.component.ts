import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NominacionDatoTecnicoExportador } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-exportador';
import { NominacionDatoTecnicoDestino } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-destino';
import { NominacionDatoTecnicoCoordinador } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-coordinador';

import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';

@Component({
  selector: 'app-nominacion-dato-tecnico',
  templateUrl: './nominacion-dato-tecnico.component.html',
  styleUrls: ['./nominacion-dato-tecnico.component.css']
})
export class NominacionDatoTecnicoComponent implements OnInit, AfterViewInit {

  public datoTecnicoForm: FormGroup;
  public datoTecnicoExportador: NominacionDatoTecnicoExportador[];
  public datoTecnicoDestino: NominacionDatoTecnicoDestino[];
  public datoTecnicoCoordinador: NominacionDatoTecnicoCoordinador[];
  private _nominacionParametros: NominacionParametros = null;

  constructor(private nominacionService: NominacionService,
              private formBuilder: FormBuilder) { 
    this.asignarNominacionParametros();
  }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.inicializarForm();
  }

  private get nominacionParametros(): NominacionParametros {
    return this._nominacionParametros;
  }
  private set nominacionParametros(value: NominacionParametros){
    this._nominacionParametros = value;
  }
  private asignarNominacionParametros(){
    this.nominacionService.NominacionParametros.subscribe(parametro =>{
      
      const nominacionParametos: NominacionParametros = {
        nominacion_Id : parametro.nominacion_Id,
        actualizarDatoTecnico : parametro.actualizarDatoTecnico,
        actualizarRecibos  : parametro.actualizarRecibos,
        actualizarIntervenciones : parametro.actualizarIntervenciones};
      this.nominacionParametros = nominacionParametos;
    });
  }
  private inicializarForm(){
    this.datoTecnicoForm = this.formBuilder.group({
      id                   : [0, Validators.required],
      materialPuerto       : ['', Validators.required],
      cantidadTotal        : ['', Validators.required],
      tolerancia           : ['', Validators.required],
      observaciones        : ['', Validators.required],
      vapor                : ['', Validators.required],
      bandera              : ['', Validators.required],
      eTARecalada          : ['', Validators.required],     
      obligacionDeCarga    : ['', Validators.required],     
      muelleDeCarga        : ['', Validators.required],
      tasaDeCarga          : ['', Validators.required],
      tasaDeCargaValor     : ['', Validators.required],
      dEM                  : ['', Validators.required],
      dES                  : ['', Validators.required],
      tipoContrato         : ['', Validators.required],
      aTAPuerto            : ['', Validators.required],
      agenciaMaritimaPuerto: ['', Validators.required],
      surveyor             : ['', Validators.required],
      observacionesSurveyor: ['', Validators.required],
      datoTecnicoExportador: this.formBuilder.array([]),
      datoTecnicoDestino: this.formBuilder.array([]),
      datoTecnicoCoordinador: this.formBuilder.array([]),
    });
  }


}
