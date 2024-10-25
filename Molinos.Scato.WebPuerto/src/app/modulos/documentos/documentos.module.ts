import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import { DocumentosRoutingModule } from './documentos-routing.module';
import { DocumentosComponent } from './documentos.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AdministracionDocumentosComponent } from './administracion-documentos/administracion-documentos.component';
import { AdjuntarDocumentosComponent } from './administracion-documentos/adjuntar-documentos/adjuntar-documentos.component';
import { ModalComentariosComponent } from './administracion-documentos/adjuntar-documentos/modal-comentarios/modal-comentarios.component';
import { ActualizarEstadoDocumentosComponent } from './administracion-documentos/actualizar-estado-documentos/actualizar-estado-documentos.component';



@NgModule({
  declarations: [DocumentosComponent, AdministracionDocumentosComponent, AdjuntarDocumentosComponent, ModalComentariosComponent, ActualizarEstadoDocumentosComponent],
  imports: [
    CommonModule,
    SharedModule,
    SharedComponentModule,
    DocumentosRoutingModule,
    MatPaginatorModule,
  ]
})
export class DocumentosModule { }
