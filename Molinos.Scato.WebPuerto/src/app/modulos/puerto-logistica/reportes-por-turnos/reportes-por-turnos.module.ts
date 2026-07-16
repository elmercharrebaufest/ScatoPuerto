import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReportesPorTurnosRoutingModule } from './reportes-por-turnos-routing.module';
import { ReportesPorTurnosComponent } from './reportes-por-turnos.component';

@NgModule({
  declarations: [
    ReportesPorTurnosComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedComponentModule,
    MatPaginatorModule,
    ReportesPorTurnosRoutingModule
  ]
})
export class ReportesPorTurnosModule { }
