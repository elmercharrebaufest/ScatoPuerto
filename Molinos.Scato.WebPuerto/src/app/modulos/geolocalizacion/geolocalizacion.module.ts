import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';

import { GeolocalizacionRoutingModule } from './geolocalizacion-routing.module';
import { GeolocalizacionComponent } from './geolocalizacion.component';
import { MapaBuqueComponent } from './mapa-buque/mapa-buque.component';
import { ListaBuquesComponent } from './lista-buques/lista-buques.component';
import { TarjetaBuqueComponent } from './tarjeta-buque/tarjeta-buque.component';


@NgModule({
  declarations: [
    GeolocalizacionComponent, 
    MapaBuqueComponent,
    ListaBuquesComponent,
    TarjetaBuqueComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    GeolocalizacionRoutingModule
  ]
})
export class GeolocalizacionModule { }
