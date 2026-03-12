import { RouterModule, Routes } from "@angular/router";
import { AcuerdosComponent } from "./acuerdos.component";
import { NgModule } from "@angular/core";
import { AcuerdoDetalleComponent } from "./acuerdo-detalle/acuerdo-detalle.component";
import { AcuerdoTarifaComponent } from "./acuerdo-tarifa/acuerdo-tarifa.component";
import { AcuerdosGuard } from "./acuerdos.guard"; // <-- Import your new guard

const routes: Routes = [
    {
        path: '',
        component: AcuerdosComponent,
        canActivate: [AcuerdosGuard]
    },
    {
        path: 'editar/:id',
        component: AcuerdoDetalleComponent,
        canActivate: [AcuerdosGuard]
    },
    {
        path: 'ver/:id',
        component: AcuerdoDetalleComponent,
        canActivate: [AcuerdosGuard]
    },
    {
        path: 'tarifas/:id',
        component: AcuerdoTarifaComponent,
        canActivate: [AcuerdosGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AcuerdosRoutingModule { }