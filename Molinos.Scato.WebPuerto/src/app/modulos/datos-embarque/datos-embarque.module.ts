import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import { DatosEmbarqueRoutingModule } from './datos-embarque-routing.module';
import { AgenciasMaritimasATAComponent } from './agencias-maritimas-ata/agencias-maritimas-ata.component';

import { MatPaginatorModule } from '@angular/material/paginator';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { CargadoresComponent } from './cargadores/cargadores.component';

@NgModule({
  declarations: [
    AgenciasMaritimasATAComponent,
    CargadoresComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DatosEmbarqueRoutingModule,
    SharedComponentModule,
    NgMultiSelectDropDownModule.forRoot(),
    MatPaginatorModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule
  ]
})
export class DatosEmbarqueModule { }