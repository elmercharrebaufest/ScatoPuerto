import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import { AfipRoutingModule } from './afip-routing.module';
import { AfipComponent } from './afip.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CoemAfipComponent } from './coem/coem-afip/coem-afip.component';
import { CodeAfipComponent } from './code/code-afip/code-afip.component';
import { CaratulaAfipComponent } from './caratula/caratula-afip/caratula-afip.component';
import { ModalCrearCaratulaComponent } from './caratula/modal-crear-caratula/modal-crear-caratula.component';



@NgModule({
  declarations: [
    AfipComponent,
    CoemAfipComponent,
    CodeAfipComponent,
    CaratulaAfipComponent,
    ModalCrearCaratulaComponent
  ],
  imports: [
    CommonModule,
    SharedModule, 
    AfipRoutingModule,
    SharedComponentModule,
    NgMultiSelectDropDownModule.forRoot(),
    MatPaginatorModule
  ]
})
export class AfipModule { }
