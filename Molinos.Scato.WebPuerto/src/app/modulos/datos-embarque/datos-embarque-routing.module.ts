import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AgenciasMaritimasATAComponent } from './agencias-maritimas-ata/agencias-maritimas-ata.component';


const routes: Routes = [
  {
    path: 'agencias',
    component: AgenciasMaritimasATAComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatosEmbarqueRoutingModule { }
