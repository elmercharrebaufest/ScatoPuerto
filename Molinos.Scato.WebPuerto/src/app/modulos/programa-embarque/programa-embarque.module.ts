import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { ProgramaEmbarqueRoutingModule } from './programa-embarque-routing.module';
import { FiltroProgramaEmbarqueComponent } from './filtro-programa-embarque/filtro-programa-embarque.component';
import { ListadoProgramaEmbarqueComponent } from './listado-programa-embarque/listado-programa-embarque.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ProgramaEmbarqueComponent } from './programa-embarque.component';



@NgModule({
  declarations: [
    FiltroProgramaEmbarqueComponent, 
    ListadoProgramaEmbarqueComponent,
    ProgramaEmbarqueComponent
  ],
  imports: [
    CommonModule,
    SharedModule, 
    ProgramaEmbarqueRoutingModule,
    NgMultiSelectDropDownModule.forRoot(),
  ]
})
export class ProgramaEmbarqueModule { }
