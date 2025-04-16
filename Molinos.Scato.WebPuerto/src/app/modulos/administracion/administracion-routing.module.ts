import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConsultaEmbarquesComponent } from './consulta-embarques/consulta-embarques.component';
import { DetalleEmbarqueComponent } from './detalle-embarque/detalle-embarque.component';

const routes: Routes = [
  {
    path: 'consulta-embarques',
    component: ConsultaEmbarquesComponent
  },
  { path: 'embarque/:idEmb', 
    component: DetalleEmbarqueComponent 
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministracionRoutingModule { }
