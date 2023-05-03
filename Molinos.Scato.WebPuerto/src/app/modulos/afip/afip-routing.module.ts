import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AfipComponent } from './afip.component';

const routes: Routes = [
  {
    path: '',
    component: AfipComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AfipRoutingModule { }
