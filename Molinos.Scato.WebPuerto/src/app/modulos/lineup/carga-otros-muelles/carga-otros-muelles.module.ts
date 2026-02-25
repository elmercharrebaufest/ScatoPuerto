import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IngresoDeCargaComponent } from './ingreso-de-carga/ingreso-de-carga.component';
import { SharedModule } from 'app/shared/shared.module';
import { CargaOtrosMuellesRoutingModule } from './carga-otros-muelles-routing.module';
import { DetalleDeCargaComponent } from './detalle-de-carga/detalle-de-carga.component';
import { FumigacionBodegaOtrosMuellesComponent } from './fumigacion-bodega-otros-muelles/fumigacion-bodega-otros-muelles.component';


@NgModule({
  declarations: [IngresoDeCargaComponent, DetalleDeCargaComponent, FumigacionBodegaOtrosMuellesComponent],
  imports: [
    CommonModule,
    SharedModule,
    CargaOtrosMuellesRoutingModule
  ]
})
export class CargaOtrosMuellesModule { }
