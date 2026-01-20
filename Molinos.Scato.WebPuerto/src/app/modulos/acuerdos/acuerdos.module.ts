import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import { AcuerdosComponent } from './acuerdos.component';
import { AcuerdosRoutingModule } from './acuerdos-routing.module';
import { AcuerdoDetalleComponent } from './acuerdo-detalle/acuerdo-detalle.component';
import { AcuerdoListadoComponent } from './acuerdo-listado/acuerdo-listado.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [AcuerdosComponent, AcuerdoDetalleComponent, AcuerdoListadoComponent],
  imports: [
    CommonModule,
    SharedModule,
    SharedComponentModule,
    AcuerdosRoutingModule,
    NgMultiSelectDropDownModule.forRoot(),
    MatPaginatorModule
  ]
})
export class AcuerdosModule { }
