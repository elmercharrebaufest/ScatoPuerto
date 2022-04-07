import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GeolocalizacionComponent } from './geolocalizacion.component';

const routes: Routes = [
  {
    path: '',
    component: GeolocalizacionComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeolocalizacionRoutingModule { }
