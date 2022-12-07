import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { ClimaComponent } from "./clima/clima.component";
import { LineupComponent } from "./lineup/lineup.component";
import { NavtabsBuqueComponent } from "./navtabs-buque/navtabs-buque.component";
import { ResumenDeOperatoriaRoutingModule } from "./resumen-de-operatoria-routing.module";
import { ResumenDeOperatoriaComponent } from "./resumen-de-operatoria.component";
import { OpTableroComponent } from './op-tablero/op-tablero.component';
import { BuquesModule } from "../buques.module";
import { ResumenActoresComponent } from './resumen-actores/resumen-actores.component';
import { ArchivosComponent } from "./archivos/archivos.component";
import { CargaModule } from "../../carga/carga.module";
import { FechasPuertoComponent } from './fechas-puerto/fechas-puerto.component';
import { OperacionesComponent } from './operaciones/operaciones.component';
import { RecibidoresComponent } from './recibidores/recibidores.component';
import { CalidadModule } from "../../calidad/calidad.module";
import { FechasRitmosComponent } from "./fechas-ritmos/fechas-ritmos.component";
import { ProgramaEmbarqueModule } from "app/modulos/programa-embarque/programa-embarque.module";

@NgModule({
    imports: [
        ResumenDeOperatoriaRoutingModule,
        CommonModule,
        SharedModule,
        BuquesModule,
        CargaModule,
        CalidadModule
    ],
    declarations: [
        ResumenDeOperatoriaComponent,
        NavtabsBuqueComponent,
        LineupComponent,
        FechasRitmosComponent,
        ClimaComponent,
        OpTableroComponent,
        ResumenActoresComponent,
        ArchivosComponent,
        FechasPuertoComponent,
        OperacionesComponent,
        RecibidoresComponent
    ],
})
export class ResumenDeOperatoriaModule {
}