import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmbarquesPorBuquesComponent } from './embarques-por-buques.component';

const routes: Routes = [
  { path: '', component: EmbarquesPorBuquesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmbarquesPorBuquesRoutingModule { }
