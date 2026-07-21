import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ConsultaEmbarquesBuquesRoutingModule } from './consulta-embarques-buques-routing.module';
import { ConsultaEmbarquesBuquesComponent } from './consulta-embarques-buques.component';

@NgModule({
  declarations: [
    ConsultaEmbarquesBuquesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedComponentModule,
    MatPaginatorModule,
    ConsultaEmbarquesBuquesRoutingModule
  ]
})
export class ConsultaEmbarquesBuquesModule { }
