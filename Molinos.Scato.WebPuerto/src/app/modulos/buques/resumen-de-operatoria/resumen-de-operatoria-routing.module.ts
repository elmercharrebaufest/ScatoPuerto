import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ResumenDeOperatoriaComponent } from "./resumen-de-operatoria.component";

const routes: Routes =[
    {
        path: '',
        component: ResumenDeOperatoriaComponent
    },
    {
        path: ':vaporid/:embarqueid/:state',
        component: ResumenDeOperatoriaComponent
    },
    
]
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ResumenDeOperatoriaRoutingModule {}