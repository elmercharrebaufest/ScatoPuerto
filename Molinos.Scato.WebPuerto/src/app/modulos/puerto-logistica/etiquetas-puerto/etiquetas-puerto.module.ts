import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { EtiquetasPuertoRoutingModule } from './etiquetas-puerto-routing.module';
import { EtiquetasPuertoComponent } from './etiquetas-puerto.component';

@NgModule({
  declarations: [
    EtiquetasPuertoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedComponentModule,
    MatPaginatorModule,
    EtiquetasPuertoRoutingModule
  ]
})
export class EtiquetasPuertoModule { }
