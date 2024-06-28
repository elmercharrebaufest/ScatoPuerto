import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { AltaEmbarqueRoutingModule } from "./alta-embarque-routing.module";
import { AltaEmbarqueComponent } from "./alta-embarque.component";
import { NominacionModule } from "app/modulos/programa-embarque/nominacion/nominacion.module";

@NgModule({
    imports: [
        AltaEmbarqueRoutingModule,
        CommonModule,
        SharedModule,
        NominacionModule
    ],
    declarations: [
        AltaEmbarqueComponent
    ]
})
export class AltaEmbarqueModule {}
