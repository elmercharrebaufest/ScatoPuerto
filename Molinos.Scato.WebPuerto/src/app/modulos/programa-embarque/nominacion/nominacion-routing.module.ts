import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NominacionRegistroComponent } from './nominacion-registro/nominacion-registro.component';

const routes: Routes =[
  {
      path: '',
      component: NominacionRegistroComponent
  },
  {
      path: ':nominacionid/:state',
      component: NominacionRegistroComponent
  },
  
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NominacionRoutingModule { }
