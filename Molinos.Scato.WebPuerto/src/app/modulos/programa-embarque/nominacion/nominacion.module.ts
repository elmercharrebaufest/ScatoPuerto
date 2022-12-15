import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NominacionRoutingModule } from './nominacion-routing.module';
import { NominacionRegistroComponent } from './nominacion-registro/nominacion-registro.component';
import { NominacionDatoTecnicoComponent } from './nominacion-dato-tecnico/nominacion-dato-tecnico.component';
import { NominacionRecibosComponent } from './nominacion-recibos/nominacion-recibos.component';
import { NominacionIntervencionesComponent } from './nominacion-intervenciones/nominacion-intervenciones.component';
import { SharedModule } from 'app/shared/shared.module';
import { VaporState } from 'app/store/programa-embarque/vapor/vapor.state';
import { NgxsModule } from '@ngxs/store';
import { DestinoState } from 'app/store/programa-embarque/destino/destino.state';
import { ExportadorState } from 'app/store/programa-embarque/exportador/exportador.state';
import { ProductoState } from 'app/store/productos/material.state';
import { AgenciaMaritimaPuertoState } from 'app/store/programa-embarque/agencia-maritima-puerto/agencia-maritima-puerto.state';
import { ATAPuertoState } from 'app/store/programa-embarque/ata-puerto/ata-puerto.state';
import { CoordinadorPuertoState } from 'app/store/programa-embarque/coordinador-puerto/coordinador-puerto.state';
import { BanderaState } from 'app/store/programa-embarque/bandera/bandera.state';
import { FormsModule } from '@angular/forms';

const libComponents = [
  NominacionRegistroComponent, 
  NominacionDatoTecnicoComponent, 
  NominacionRecibosComponent, 
  NominacionIntervencionesComponent
];
const libState = [
  DestinoState,
  ExportadorState,
  CoordinadorPuertoState,
  VaporState,
  ATAPuertoState,
  AgenciaMaritimaPuertoState,
  BanderaState
]
@NgModule({

  declarations: [libComponents],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NominacionRoutingModule,
    NgxsModule.forRoot(
      libState
    )
  ]
})
export class NominacionModule { }
