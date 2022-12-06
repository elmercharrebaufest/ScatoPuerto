import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ProgramaEmbarqueComponent } from "./programa-embarque.component";

const routes: Routes = [
    {
        path: '',
        component: ProgramaEmbarqueComponent
    }    
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProgramaEmbarqueRoutingModule {}