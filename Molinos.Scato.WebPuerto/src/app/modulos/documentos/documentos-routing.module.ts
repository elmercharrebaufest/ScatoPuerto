import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DocumentosComponent } from "./documentos.component";
import { AdministracionDocumentosComponent } from "./administracion-documentos/administracion-documentos.component";
import { AdministracionDocumentosEstadoComponent } from "./administracion-documentos-estado/administracion-documentos-estado.component";

const routes: Routes = [
  {
    path: '',
    component: DocumentosComponent
  },
  {
    path: 'administracion/:idnominacion',
    component: AdministracionDocumentosComponent
  },
  {
    path: 'administracion/estado-documento/:idnominacion',
    component: AdministracionDocumentosEstadoComponent
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentosRoutingModule { }
