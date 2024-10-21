import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import { DocumentosRoutingModule } from './documentos-routing.module';
import { DocumentosComponent } from './documentos.component';
import { MatPaginatorModule } from '@angular/material/paginator';



@NgModule({
  declarations: [DocumentosComponent],
  imports: [
    CommonModule,
    SharedModule,
    SharedComponentModule,
    DocumentosRoutingModule,
    MatPaginatorModule,
  ]
})
export class DocumentosModule { }
