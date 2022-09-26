import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RoleGuard } from "app/shared/seguridad/role.guard";
import { BuquesComponent } from './buques.component';

const routes: Routes = [
    {
        path: '',
        component: BuquesComponent
    },
    {
        path: 'operatoria',
        canActivateChild: [RoleGuard],
        loadChildren: () => import('./resumen-de-operatoria/resumen-de-operatoria.module').then(m => m.ResumenDeOperatoriaModule)
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BuquesRoutingModule {}
