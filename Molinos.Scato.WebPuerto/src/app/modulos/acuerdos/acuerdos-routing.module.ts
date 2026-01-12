import { RouterModule, Routes } from "@angular/router";
import { AcuerdosComponent } from "./acuerdos.component";
import { NgModule } from "@angular/core";
import { AcuerdoDetalleComponent } from "./acuerdo-detalle/acuerdo-detalle.component";

const routes: Routes = [
    {
        path: '',
        component: AcuerdosComponent
    },
    {
        path: 'editar/:id',
        component: AcuerdoDetalleComponent
    },
    {
        path: 'ver/:id',
        component: AcuerdoDetalleComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AcuerdosRoutingModule { }