import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConsultaEmbarquesComponent } from './consulta-embarques/consulta-embarques.component';
import { DetalleEmbarqueComponent } from './detalle-embarque/detalle-embarque.component';
import { ProvGastosProductoComponent } from './prov-gastos-producto/prov-gastos-producto.component';
import { ProvGastosEmbarqueComponent } from './prov-gastos-embarque/prov-gastos-embarque.component';
import { TarifaProductoComponent } from './tarifa-producto/tarifa-producto.component';
import { TarifaEmbarqueComponent } from './tarifa-embarque/tarifa-embarque.component';

const routes: Routes = [
  {
    path: 'consulta-embarques',
    component: ConsultaEmbarquesComponent
  },
  { path: 'embarque/:idEmb', 
    component: DetalleEmbarqueComponent 
  },
  {
    path: 'tarifa-producto',
    component: TarifaProductoComponent
  },  
  {
    path: 'tarifa-embarque',
    component: TarifaEmbarqueComponent
  }, 
  {
    path: 'prov-gastos-producto',
    component: ProvGastosProductoComponent
  },  
  {
    path: 'prov-gastos-embarque',
    component: ProvGastosEmbarqueComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministracionRoutingModule { }
