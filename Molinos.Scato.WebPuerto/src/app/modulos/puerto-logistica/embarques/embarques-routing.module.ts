import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmbarquesComponent } from './embarques.component';

const routes: Routes = [
  { path: '', component: EmbarquesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmbarquesRoutingModule { }
