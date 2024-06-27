import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DestinosComponent } from "./destinos.component";

const routes: Routes = [
    {
        path: '',
        component: DestinosComponent
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DestinosRoutingModule {}
