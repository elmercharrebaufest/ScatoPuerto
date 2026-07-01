import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoleGuard } from 'app/shared/seguridad/role.guard';

const routes: Routes = [
  {
    path: 'embarques',
    canActivateChild: [RoleGuard],
    loadChildren: () => import('./embarques/embarques.module').then(m => m.EmbarquesModule)
  },
  {
    path: 'reporte-pesada',
    canActivateChild: [RoleGuard],
    loadChildren: () => import('./reporte-pesada/reporte-pesada.module').then(m => m.ReportePesadaModule)
  },
  {
    path: 'configuracion-puerto',
    canActivateChild: [RoleGuard],
    loadChildren: () => import('./configuracion-puerto/configuracion-puerto.module').then(m => m.ConfiguracionPuertoModule)
  },
  {
    path: 'embarques-por-buques',
    canActivateChild: [RoleGuard],
    loadChildren: () => import('./embarques-por-buques/embarques-por-buques.module').then(m => m.EmbarquesPorBuquesModule)
  },
  {
    path: 'etiquetas-puerto',
    canActivateChild: [RoleGuard],
    loadChildren: () => import('./etiquetas-puerto/etiquetas-puerto.module').then(m => m.EtiquetasPuertoModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PuertoLogisticaRoutingModule { }
