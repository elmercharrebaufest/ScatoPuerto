import { Component, OnInit } from '@angular/core';
import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';

@Component({
  selector: 'app-nominacion-intervenciones',
  templateUrl: './nominacion-intervenciones.component.html',
  styleUrls: ['./nominacion-intervenciones.component.css']
})
export class NominacionIntervencionesComponent implements OnInit {

  private _nominacionParametros: NominacionParametros = null;

  constructor(private nominacionService: NominacionService) { 
    this.asignarNominacionParametros();
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
      if (parametro!=null){
        const nominacionParametos: NominacionParametros = {
          nominacion_Id : parametro.nominacion_Id,
          actualizarDatoTecnico : parametro.actualizarDatoTecnico,
          actualizarRecibos  : parametro.actualizarRecibos,
          actualizarIntervenciones : parametro.actualizarIntervenciones,
          nominacion : null};
        this.nominacionParametros = nominacionParametos;
      }
    });
  }

}
