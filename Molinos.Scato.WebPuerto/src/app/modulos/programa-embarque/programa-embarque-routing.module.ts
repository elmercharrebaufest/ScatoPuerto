import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ListadoPruebaPrimengComponent } from "./listado-prueba-primeng/listado-prueba-primeng.component";
import { ProgramaEmbarqueComponent } from "./programa-embarque.component";

const routes: Routes = [
    {
        path: '',
        component: ProgramaEmbarqueComponent
    },
    {
        path: 'listado-primeng',
        component: ListadoPruebaPrimengComponent
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProgramaEmbarqueRoutingModule {}