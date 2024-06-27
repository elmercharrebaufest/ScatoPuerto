import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { ProgramaEmbarqueRoutingModule } from './programa-embarque-routing.module';
import { FiltroProgramaEmbarqueComponent } from './filtro-programa-embarque/filtro-programa-embarque.component';
import { ListadoProgramaEmbarqueComponent } from './listado-programa-embarque/listado-programa-embarque.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ProgramaEmbarqueComponent } from './programa-embarque.component';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import {MatPaginatorModule} from '@angular/material/paginator';
import { ModalProgramaEmbarqueComponent } from './modal-programa-embarque/modal-programa-embarque.component';
import { NominacionEnviarLineupComponent } from './nominacion-enviar-lineup/nominacion-enviar-lineup.component';
import { PipeTnKg } from 'app/shared/pipes/pipe-tn-kg';

@NgModule({
  declarations: [
    FiltroProgramaEmbarqueComponent, 
    ListadoProgramaEmbarqueComponent,
    ProgramaEmbarqueComponent,
    ModalProgramaEmbarqueComponent,
    NominacionEnviarLineupComponent,
    PipeTnKg
  ],
  imports: [
    CommonModule,
    SharedModule, 
    SharedComponentModule,
    ProgramaEmbarqueRoutingModule,
    NgMultiSelectDropDownModule.forRoot(),
    MatPaginatorModule,
    
  ]
})
export class ProgramaEmbarqueModule { }
