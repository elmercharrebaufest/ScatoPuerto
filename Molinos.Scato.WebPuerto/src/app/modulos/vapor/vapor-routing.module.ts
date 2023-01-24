import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { VaporComponent } from "./vapor.component";

const routes: Routes = [
    {
        path: '',
        component: VaporComponent        
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class VaporRoutingModule {}