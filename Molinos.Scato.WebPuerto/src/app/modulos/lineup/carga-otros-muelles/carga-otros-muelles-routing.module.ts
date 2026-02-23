import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { IngresoDeCargaComponent } from "./ingreso-de-carga/ingreso-de-carga.component";

const routes: Routes =[
    {
        path: '',
        component: IngresoDeCargaComponent
    }
]
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CargaOtrosMuellesRoutingModule {}