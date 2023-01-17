import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import {MatPaginatorModule} from '@angular/material/paginator';
import { FiltroVaporComponent } from './filtro-vapor/filtro-vapor.component';
import { ListadoVaporComponent } from './listado-vapor/listado-vapor.component';
import { VaporComponent } from './vapor.component';
import { VaporRoutingModule } from './vapor-routing.module';

@NgModule({
  declarations: [    
    FiltroVaporComponent,
    ListadoVaporComponent,
    VaporComponent
  ],
  imports: [
    CommonModule,
    SharedModule, 
    SharedComponentModule,
    VaporRoutingModule,
    NgMultiSelectDropDownModule.forRoot(),
    MatPaginatorModule,
    
  ]
})
export class VaporModule { }
