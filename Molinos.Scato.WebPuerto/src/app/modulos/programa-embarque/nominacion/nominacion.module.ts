import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NominacionRoutingModule } from './nominacion-routing.module';
import { NominacionRegistroComponent } from './nominacion-registro/nominacion-registro.component';
import { NominacionDatoTecnicoComponent } from './nominacion-dato-tecnico/nominacion-dato-tecnico.component';
import { NominacionRecibosComponent } from './nominacion-recibos/nominacion-recibos.component';
import { NominacionIntervencionesComponent } from './nominacion-intervenciones/nominacion-intervenciones.component';
import { SharedModule } from 'app/shared/shared.module';
import { FormsModule } from '@angular/forms';


const libComponents = [
  NominacionRegistroComponent, 
  NominacionDatoTecnicoComponent, 
  NominacionRecibosComponent, 
  NominacionIntervencionesComponent
];
@NgModule({

  declarations: [libComponents],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NominacionRoutingModule
  ]
})
export class NominacionModule { }
