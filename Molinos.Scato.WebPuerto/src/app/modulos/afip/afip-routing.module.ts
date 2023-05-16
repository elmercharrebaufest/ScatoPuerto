import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AfipComponent } from './afip.component';
import { CaratulaComponent } from './caratula/caratula.component';
import { CoemComponent } from './coem/coem.component';
import { CodeComponent } from './code/code.component';

const routes: Routes = [
  {
    path: 'caratula',
    component: CaratulaComponent
  },
  {
    path: 'coem',
    component: CoemComponent
  },
  {
    path: 'code',
    component: CodeComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AfipRoutingModule { }
