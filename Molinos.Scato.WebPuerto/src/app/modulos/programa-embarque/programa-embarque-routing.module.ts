import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RoleGuard } from "app/shared/seguridad/role.guard";
import { ProgramaEmbarqueComponent } from "./programa-embarque.component";

const routes: Routes = [
    {
        path: '',
        component: ProgramaEmbarqueComponent
    },
    {
        path: 'nominacion',
        canActivateChild: [RoleGuard],
        loadChildren: () => import('./nominacion/nominacion.module').then(m => m.NominacionModule)
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProgramaEmbarqueRoutingModule {}