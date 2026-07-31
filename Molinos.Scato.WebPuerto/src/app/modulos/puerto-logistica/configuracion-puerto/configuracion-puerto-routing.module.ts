import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BalanzaPuertoComponent } from './balanza-puerto/balanza-puerto.component';
import { BodegaComponent } from './bodega/bodega.component';

const routes: Routes = [
  { path: '', redirectTo: 'balanza-puerto', pathMatch: 'full' },
  { path: 'balanza-puerto', component: BalanzaPuertoComponent },
  { path: 'bodega', component: BodegaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfiguracionPuertoRoutingModule { }
