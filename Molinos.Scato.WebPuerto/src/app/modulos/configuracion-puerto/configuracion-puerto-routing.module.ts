import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfiguracionPuertoComponent } from './configuracion-puerto.component';

const routes: Routes = [
  { path: '', component: ConfiguracionPuertoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfiguracionPuertoRoutingModule { }
