import { RouterModule, Routes } from "@angular/router";
import { AcuerdosComponent } from "./acuerdos.component";
import { NgModule } from "@angular/core";
import { AcuerdoDetalleComponent } from "./acuerdo-detalle/acuerdo-detalle.component";
import { AcuerdoTarifaComponent } from "./acuerdo-tarifa/acuerdo-tarifa.component";

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
    },
    {
        path: 'tarifas/:id',
        component: AcuerdoTarifaComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AcuerdosRoutingModule { }