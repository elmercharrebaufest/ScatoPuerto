import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConsultaEmbarquesBuquesComponent } from './consulta-embarques-buques.component';

const routes: Routes = [
  { path: '', component: ConsultaEmbarquesBuquesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsultaEmbarquesBuquesRoutingModule { }
