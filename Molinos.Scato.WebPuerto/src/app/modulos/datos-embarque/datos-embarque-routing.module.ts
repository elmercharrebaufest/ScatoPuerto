import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AgenciasMaritimasATAComponent } from './agencias-maritimas-ata/agencias-maritimas-ata.component';
import { CargadoresComponent } from './cargadores/cargadores.component';
import { ProductosComponent } from './productos/productos.component';

const routes: Routes = [
  {
    path: 'agencias',
    component: AgenciasMaritimasATAComponent
  },
  {
    path: 'cargadores',
    component: CargadoresComponent
  },
  {
    path: 'productos',
    component: ProductosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatosEmbarqueRoutingModule { }
