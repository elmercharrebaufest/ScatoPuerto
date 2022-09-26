import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { ClimaComponent } from "./clima/clima.component";
import { FechasRitmosComponent } from "./fechas-ritmos/fechas-ritmos.component";
import { LineupComponent } from "./lineup/lineup.component";
import { NavtabsBuqueComponent } from "./navtabs-buque/navtabs-buque.component";
import { ResumenDeOperatoriaRoutingModule } from "./resumen-de-operatoria-routing.module";
import { ResumenDeOperatoriaComponent } from "./resumen-de-operatoria.component";
import { OpTableroComponent } from './op-tablero/op-tablero.component';
import { BuquesModule } from "../buques.module";
import { ResumenActoresComponent } from './resumen-actores/resumen-actores.component';
import { ArchivosComponent } from "./archivos/archivos.component";

@NgModule({
    imports: [
        ResumenDeOperatoriaRoutingModule,
        CommonModule,
        SharedModule,
        BuquesModule
    ],
    declarations: [
        ResumenDeOperatoriaComponent,
        NavtabsBuqueComponent,
        LineupComponent,
        FechasRitmosComponent,
        ClimaComponent,
        OpTableroComponent,
        ResumenActoresComponent,
        ArchivosComponent
    ],
})
export class ResumenDeOperatoriaModule {
}