import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ConfiguracionPuertoRoutingModule } from './configuracion-puerto-routing.module';
import { ConfiguracionPuertoComponent } from './configuracion-puerto.component';

@NgModule({
  declarations: [
    ConfiguracionPuertoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedComponentModule,
    MatPaginatorModule,
    ConfiguracionPuertoRoutingModule
  ]
})
export class ConfiguracionPuertoModule { }
