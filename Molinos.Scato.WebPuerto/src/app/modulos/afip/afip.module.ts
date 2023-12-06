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
import { CaratulaComponent } from './caratula/caratula.component';
import { CoemComponent } from './coem/coem.component';
import { CodeComponent } from './code/code.component';
import { ModalCrearCoemComponent } from './coem/modal-crear-coem/modal-crear-coem.component';
import { ModalCrearCodeComponent } from './code/modal-crear-code/modal-crear-code.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { SolicitudCaratulaComponent } from './caratula/solicitud-caratula/solicitud-caratula.component';
import { ModalCerrarCargaCoemsComponent } from './coem/modal-cerrar-carga-coems/modal-cerrar-carga-coems.component';


@NgModule({
  declarations: [
    AfipComponent,
    CoemAfipComponent,
    CoemComponent,
    ModalCrearCoemComponent,
    CodeComponent,
    ModalCrearCodeComponent,
    CodeAfipComponent,
    CaratulaComponent,
    CaratulaAfipComponent,
    ModalCrearCaratulaComponent,
    SolicitudCaratulaComponent,
    ModalCerrarCargaCoemsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AfipRoutingModule,
    SharedComponentModule,
    NgMultiSelectDropDownModule.forRoot(),
    MatPaginatorModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule
  ]
})
export class AfipModule { }
