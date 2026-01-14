import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

// Components
import { AcuerdosComponent } from "./acuerdos.component";
import { AcuerdoDetalleComponent } from "./acuerdo-detalle/acuerdo-detalle.component";
import { ConsultaAcuerdosComponent } from "./consulta-acuerdo/consulta-acuerdo.component";

const routes: Routes = [
    {
        path: '',
        component: AcuerdosComponent
    },
    {
        path: 'agregar',
        component: AcuerdosComponent
    },
    {
        path: 'consulta',
        component: ConsultaAcuerdosComponent
    },
    {
        path: 'consulta/:idEmb',
        component: ConsultaAcuerdosComponent
    },
    {
        path: 'detalle/:id',
        component: AcuerdoDetalleComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AcuerdosRoutingModule { }