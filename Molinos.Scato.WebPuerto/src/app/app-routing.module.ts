import { Routes } from '@angular/router';
import { LoginComponent } from './modulos/login/login.component';
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
    //   redirectTo: '/login',
        pathMatch: 'full'
      },
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
      },
      {
        path: 'programa',
        canActivateChild: [RoleGuard],
        loadChildren: () => import('./modulos/programa-embarque/programa-embarque.module').then(m => m.ProgramaEmbarqueModule)
      },
      {
        path: 'vapor',
        canActivateChild: [RoleGuard],
        loadChildren: () => import('./modulos/vapor/vapor.module').then(m => m.VaporModule)
      },
      {
        path: 'clientes',
        canActivateChild: [RoleGuard],
        loadChildren: () => import('./modulos/clientes/clientes.module').then(m => m.ClientesModule)
      },
      {
        path: 'afip',
        loadChildren: () => import('./modulos/afip/afip.module').then(m => m.AfipModule)
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent,
  }
];
