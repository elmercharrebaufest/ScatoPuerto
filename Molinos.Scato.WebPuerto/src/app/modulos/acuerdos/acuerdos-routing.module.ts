import { RouterModule, Routes } from "@angular/router";
import { AcuerdosComponent } from "./acuerdos.component";
import { NgModule } from "@angular/core";

const routes: Routes = [
    {
        path: '',
        component: AcuerdosComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AcuerdosRoutingModule { }