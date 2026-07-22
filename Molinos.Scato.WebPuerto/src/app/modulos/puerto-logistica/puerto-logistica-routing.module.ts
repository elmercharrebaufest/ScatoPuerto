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
    path: 'reportes-por-turnos',
    canActivateChild: [RoleGuard],
    loadChildren: () => import('./reportes-por-turnos/reportes-por-turnos.module').then(m => m.ReportesPorTurnosModule)
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
    path: 'consulta-embarques-buques',
    canActivateChild: [RoleGuard],
    loadChildren: () => import('./consulta-embarques-buques/consulta-embarques-buques.module').then(m => m.ConsultaEmbarquesBuquesModule)
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
