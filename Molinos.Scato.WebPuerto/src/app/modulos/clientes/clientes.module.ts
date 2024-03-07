import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import { MatPaginatorModule} from '@angular/material/paginator';
import { FiltroClientesComponent } from './filtro-clientes/filtro-clientes.component';
import { ListadoClientesComponent } from './listado-clientes/listado-clientes.component';
import { ClientesComponent } from './clientes.component';
import { ClientesRoutingModule } from './clientes-routing.module';

@NgModule({
  declarations: [    
    FiltroClientesComponent,
    ListadoClientesComponent,
    ClientesComponent,
  ],
  imports: [
    CommonModule,
    SharedModule, 
    SharedComponentModule,
    ClientesRoutingModule,
    NgMultiSelectDropDownModule.forRoot(),
    MatPaginatorModule,
  ]
})
export class ClientesModule { }
