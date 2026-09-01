import { Routes } from '@angular/router';
import { LoginComponent } from './modulos/login/login.component';
import { LayoutComponent } from "./shared/componentes/layout/layout.component";
import { RoleGuard } from './shared/seguridad/role.guard';
import { MaslGuard } from './shared/seguridad/masl.guard';

export const routeConfig: Routes = [
  {
    path: "",
    component: LayoutComponent,
    canActivate: [MaslGuard],
    canActivateChild: [RoleGuard],
    children: [
      {
        path: '',
        redirectTo: '/lineup',
        pathMatch: 'full'
      },
      {
        path: "lineup",
        loadChildren: () => import('./modulos/lineup/lineup.module').then(m => m.LineUpModule)
      },
      {
        path: "geolocalizacion",
        loadChildren: () => import('./modulos/geolocalizacion/geolocalizacion.module').then(m => m.GeolocalizacionModule)
      },
      {
        path: "carga",
        loadChildren: () => import('./modulos/carga/carga.module').then(m => m.CargaModule)
      },
      {
        path: 'calidad',
        loadChildren: () => import('./modulos/calidad/calidad.module').then(m => m.CalidadModule)
      },
      {
        path: 'embarque',
        loadChildren: () => import('./modulos/datos-embarque/datos-embarque.module').then(m => m.DatosEmbarqueModule)
      },
      {
        path: 'buques',
        loadChildren: () => import('./modulos/buques/buques.module').then(m => m.BuquesModule)
      },
      {
        path: 'programa',
        loadChildren: () => import('./modulos/programa-embarque/programa-embarque.module').then(m => m.ProgramaEmbarqueModule)
      },
      {
        path: 'vapor',
        loadChildren: () => import('./modulos/vapor/vapor.module').then(m => m.VaporModule)
      },
      {
        path: 'clientes',
        loadChildren: () => import('./modulos/clientes/clientes.module').then(m => m.ClientesModule)
      },
      {
        path: 'destinos',
        loadChildren: () => import('./modulos/destinos/destinos.module').then(m => m.DestinosModule)
      },
      {
        path: 'afip',
        loadChildren: () => import('./modulos/afip/afip.module').then(m => m.AfipModule)
      },
      {
        path: 'documentos',
        loadChildren: () => import('./modulos/documentos/documentos.module').then(m => m.DocumentosModule)
      },
      {
        path: 'administracion',
        loadChildren: () => import('./modulos/administracion/administracion.module').then(m => m.AdministracionModule)
      },
      {
        path: 'comprobantes',
        loadChildren: () => import('./modulos/comprobantes/comprobantes.module').then(m => m.ComprobantesModule)
      },
      {
        path: 'carga-otros-muelles',
        loadChildren: () => import('./modulos/carga-otros-muelles/carga-otros-muelles.module').then(m => m.CargaOtrosMuellesModule)
      },
      {
        path: 'acuerdos',
        loadChildren: () => import('./modulos/acuerdos/acuerdos.module').then(m => m.AcuerdosModule)
      },
      {
        path: 'aduana',
        loadChildren: () => import('./modulos/aduana/aduana.module').then(m => m.AduanaModule)
      },
      {
        path: 'puerto-logistica',
        loadChildren: () => import('./modulos/puerto-logistica/puerto-logistica.module').then(m => m.PuertoLogisticaModule)
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent,
  }
];
