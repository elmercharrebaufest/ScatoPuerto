import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import { AcuerdosComponent } from './acuerdos.component';
import { AcuerdosRoutingModule } from './acuerdos-routing.module';



@NgModule({
  declarations: [AcuerdosComponent],
  imports: [
    CommonModule,
    SharedModule,
    SharedComponentModule,
    AcuerdosRoutingModule
  ]
})
export class AcuerdosModule { }
