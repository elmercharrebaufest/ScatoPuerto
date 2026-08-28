import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EmbarquesRoutingModule } from './embarques-routing.module';
import { EmbarquesComponent } from './embarques.component';
import { EmbarqueModificarComponent } from './embarque-modificar/embarque-modificar.component';
import { ModalCrearCargaComponent } from './modal-crear-carga/modal-crear-carga.component';
import { ModalCrearEmbarqueLiquidoComponent } from './modal-crear-embarque-liquido/modal-crear-embarque-liquido.component';

@NgModule({
  declarations: [
    EmbarquesComponent,
    EmbarqueModificarComponent,
    ModalCrearCargaComponent,
    ModalCrearEmbarqueLiquidoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedComponentModule,
    MatPaginatorModule,
    NgbModule,
    EmbarquesRoutingModule
  ],
  entryComponents: [
    ModalCrearCargaComponent,
    ModalCrearEmbarqueLiquidoComponent
  ]
})
export class EmbarquesModule { }
