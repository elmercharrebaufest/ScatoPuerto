import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConsultaEmbarquesComponent } from './consulta-embarques/consulta-embarques.component';

const routes: Routes = [
  {
    path: 'consulta-embarques',
    component: ConsultaEmbarquesComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministracionRoutingModule { }
