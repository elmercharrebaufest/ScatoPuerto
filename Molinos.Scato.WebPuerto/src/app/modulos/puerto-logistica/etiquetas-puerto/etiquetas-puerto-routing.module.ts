import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EtiquetasPuertoComponent } from './etiquetas-puerto.component';

const routes: Routes = [
  { path: '', component: EtiquetasPuertoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EtiquetasPuertoRoutingModule { }
