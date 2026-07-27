import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfiguracionPuertoRoutingModule } from './configuracion-puerto-routing.module';
import { BalanzaPuertoComponent } from './balanza-puerto/balanza-puerto.component';
import { BodegaComponent } from './bodega/bodega.component';
import { ModalBalanzaPuertoComponent } from './balanza-puerto/modal-balanza-puerto/modal-balanza-puerto.component';
import { ModalBodegaComponent } from './bodega/modal-bodega/modal-bodega.component';

@NgModule({
  declarations: [
    BalanzaPuertoComponent,
    BodegaComponent,
    ModalBalanzaPuertoComponent,
    ModalBodegaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedComponentModule,
    MatPaginatorModule,
    NgbModule,
    ConfiguracionPuertoRoutingModule
  ],
  entryComponents: [
    ModalBalanzaPuertoComponent,
    ModalBodegaComponent
  ]
})
export class ConfiguracionPuertoModule { }

