import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';

@Component({
  selector: 'app-nominacion-dato-tecnico',
  templateUrl: './nominacion-dato-tecnico.component.html',
  styleUrls: ['./nominacion-dato-tecnico.component.css']
})
export class NominacionDatoTecnicoComponent implements OnInit, AfterViewInit {

  private _nominacionParametros: NominacionParametros = null;

  constructor(private nominacionService: NominacionService) { 
    this.asignarNominacionParametros();
  }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
  }

  get nominacionParametros(): NominacionParametros {
    return this._nominacionParametros;
  }
  set nominacionParametros(value: NominacionParametros){
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

}
