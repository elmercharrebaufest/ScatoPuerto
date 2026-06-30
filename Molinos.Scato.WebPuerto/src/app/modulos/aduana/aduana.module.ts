import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { AduanaRoutingModule } from './aduana-routing.module';
import { AduanaComponent } from './components/aduana/aduana.component';
import { PesadasComponent } from './components/pesadas/pesadas.component';
import { DetalleCargaComponent } from './detalle-carga/detalle-carga.component';
import { CamarasComponent } from './camaras/camaras.component';
import { PesadasOnlineComponent } from './pesadas-online/pesadas-online.component';
import { PesadasHistoricasComponent } from './pesadas-historicas/pesadas-historicas.component';
import { CamarasService } from './servicios/camaras.service';
import { PesadasService } from './servicios/pesadas.service';

@NgModule({
  declarations: [
    AduanaComponent,
    PesadasComponent,
    DetalleCargaComponent,
    CamarasComponent,
    PesadasOnlineComponent,
    PesadasHistoricasComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AduanaRoutingModule
  ],
  providers: [PesadasService, CamarasService]
})
export class AduanaModule { }
