import { Routes, RouterModule } from '@angular/router';
import { IniciarSesionComponent } from './shared/componentes/iniciar-sesion/iniciar-sesion.component';
import { LayoutComponent } from "./shared/componentes/layout/layout.component";
import { LoginGuard } from './shared/seguridad/login.guard';
import { RoleGuard } from './shared/seguridad/role.guard';
export const routeConfig: Routes = [
  {
    path: "",
    component: LayoutComponent,
    canActivate: [LoginGuard],
    children: [
      {
        path: '',
        redirectTo: '/lineup',
        pathMatch: 'full'
      },
      // {
      //   path: 'login',
      //   component: IniciarSesionComponent,
      // },
      {
        path: "lineup",
        canActivateChild: [RoleGuard],
        loadChildren: () => import('./modulos/lineup/lineup.module').then(m => m.LineUpModule)
      },
      {
        path: "geolocalizacion",
        canActivateChild: [RoleGuard],
        loadChildren: () => import('./modulos/geolocalizacion/geolocalizacion.module').then(m => m.GeolocalizacionModule)
      },
      {
        path: "carga",
        canActivateChild: [RoleGuard],
        loadChildren: () => import('./modulos/carga/carga.module').then(m => m.CargaModule)
      },
      {
        path: 'calidad',
        canActivateChild: [RoleGuard],
        loadChildren: () => import('./modulos/calidad/calidad.module').then(m => m.CalidadModule)
      },
      {
        path: 'buques',
        canActivateChild: [RoleGuard],
        loadChildren: () => import('./modulos/buques/buques.module').then(m => m.BuquesModule)
      }
    ]
  },
  {
    path: 'login',
    component: IniciarSesionComponent,
  }
];