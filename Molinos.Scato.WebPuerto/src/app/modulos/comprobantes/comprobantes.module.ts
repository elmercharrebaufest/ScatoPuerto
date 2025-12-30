import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComprobantesComponent } from './comprobantes.component';
import { ComprobantesRoutingModule } from './comprobantes-routing.module';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';



@NgModule({
  declarations: [ComprobantesComponent],
  imports: [
    CommonModule,
    ComprobantesRoutingModule,
    SharedComponentModule,
  ]
})
export class ComprobantesModule { }
