import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { EmbarquesRoutingModule } from './embarques-routing.module';
import { EmbarquesComponent } from './embarques.component';

@NgModule({
  declarations: [
    EmbarquesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedComponentModule,
    MatPaginatorModule,
    EmbarquesRoutingModule
  ]
})
export class EmbarquesModule { }
