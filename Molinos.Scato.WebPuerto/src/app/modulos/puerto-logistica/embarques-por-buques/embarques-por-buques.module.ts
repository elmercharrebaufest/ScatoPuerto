import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { EmbarquesPorBuquesRoutingModule } from './embarques-por-buques-routing.module';
import { EmbarquesPorBuquesComponent } from './embarques-por-buques.component';

@NgModule({
  declarations: [
    EmbarquesPorBuquesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedComponentModule,
    MatPaginatorModule,
    EmbarquesPorBuquesRoutingModule
  ]
})
export class EmbarquesPorBuquesModule { }
