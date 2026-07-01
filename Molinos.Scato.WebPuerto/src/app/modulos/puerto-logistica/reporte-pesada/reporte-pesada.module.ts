import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReportePesadaRoutingModule } from './reporte-pesada-routing.module';
import { ReportePesadaComponent } from './reporte-pesada.component';

@NgModule({
  declarations: [
    ReportePesadaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedComponentModule,
    MatPaginatorModule,
    ReportePesadaRoutingModule
  ]
})
export class ReportePesadaModule { }
