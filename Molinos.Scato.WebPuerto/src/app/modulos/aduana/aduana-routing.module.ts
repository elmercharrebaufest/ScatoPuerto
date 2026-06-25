import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CamarasComponent } from './camaras/camaras.component';
import { DetalleCargaComponent } from './detalle-carga/detalle-carga.component';
import { PesadasHistoricasComponent } from './pesadas-historicas/pesadas-historicas.component';
import { PesadasOnlineComponent } from './pesadas-online/pesadas-online.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'pesadas-online',
    pathMatch: 'full'
  },
  {
    path: 'pesadas-online',
    component: PesadasOnlineComponent
  },
  {
    path: 'pesadas-historicas',
    component: PesadasHistoricasComponent
  },
  {
    path: 'detalle-carga',
    component: DetalleCargaComponent
  },
  {
    path: 'camaras',
    component: CamarasComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AduanaRoutingModule { }
