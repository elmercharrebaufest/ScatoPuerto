import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestinosComponent } from './destinos.component';
import { SharedModule } from 'primeng/api';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import { DestinosRoutingModule } from './destinos-routing.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatPaginatorModule } from '@angular/material/paginator';



@NgModule({
  declarations: [DestinosComponent],
  imports: [
    CommonModule,
    SharedModule,
    SharedComponentModule,
    DestinosRoutingModule,
    NgMultiSelectDropDownModule.forRoot(),
    MatPaginatorModule,
  ]
})
export class DestinosModule { }
