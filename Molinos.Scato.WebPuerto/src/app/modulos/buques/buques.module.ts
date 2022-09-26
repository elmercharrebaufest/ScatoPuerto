import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuquesComponent } from './buques.component';
import { SharedModule } from "app/shared/shared.module";
import { BuquesRoutingModule } from "./buques-routing.module";
import { FiltroBuquesComponent } from './filtro-buques/filtro-buques.component';
import { HistorialBuquesComponent } from './historial-buques/historial-buques.component'
import { BuqueFilterPipe } from './buques-pipe-filter';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    BuquesRoutingModule,
    NgMultiSelectDropDownModule.forRoot(),
  ],
  declarations: [
    BuquesComponent,
    FiltroBuquesComponent,
    HistorialBuquesComponent,
    BuqueFilterPipe,
  ],
  exports: [HistorialBuquesComponent]
})
export class BuquesModule { }
