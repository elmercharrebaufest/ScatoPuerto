import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DocumentosComponent } from "./documentos.component";
import { AdministracionDocumentosComponent } from "./administracion-documentos/administracion-documentos.component";

const routes: Routes = [
  {
    path: '',
    component: DocumentosComponent
  },
  {
    path: 'administracion/:idnominacion',
    component: AdministracionDocumentosComponent
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentosRoutingModule { }
