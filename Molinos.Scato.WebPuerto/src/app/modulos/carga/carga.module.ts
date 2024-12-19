import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { CargaLiquidosComponent } from "./carga-liquidos/carga-liquidos.component";
import { LineasComponent } from "./carga-liquidos/operaciones/lineas/lineas.component";
import { TanquesComponent } from "./carga-liquidos/operaciones/tanques/tanques.component";
import { PlanillaEmbarqueComponent } from "./carga-liquidos/tableristas/planilla-embarque/planilla-embarque.component";
import { PlanillaTurnoLiquidosComponent } from './carga-liquidos/tableristas/planilla-turno-liquidos/planilla-turno-liquidos.component';
import { CargaRoutingModule } from "./carga-routing.module";
import { CargaSolidosComponent } from "./carga-solidos/carga-solidos.component";
import { GraficoCargaComponent } from "./carga-solidos/operaciones/grafico-carga/grafico-carga.component";
import { ManosComponent } from "./carga-solidos/operaciones/manos/manos.component";
import { BalanzasRitmosComponent } from "./carga-solidos/tableristas/balanzas-ritmos/balanzas-ritmos.component";
import { BalanzasComponent } from "./carga-solidos/tableristas/balanzas/balanzas.component";
import { InfoAdicionalComponent } from "./carga-solidos/tableristas/info-adicional/info-adicional.component";
import { UmapComponent } from "./carga-solidos/tableristas/umap/umap.component";
import { CargaComponent } from "./carga.component";
import {ListboxModule} from 'primeng/listbox';
import { BodegasComponent } from './carga-solidos/tableristas/bodegas/bodegas.component';
import { InicioCargaComponent } from "./carga-solidos/tableristas/inicio-carga/inicio-carga.component";
import { FinalizacionCargaComponent } from "./carga-solidos/tableristas/finalizacion-carga/finalizacion-carga.component";
import { PlanillaCargaComponent } from './carga-solidos/planilla-carga/planilla-carga.component';
import { BalanzasManualComponent } from './carga-solidos/tableristas/balanzas-manual/balanzas-manual.component';
import { BalanzasManualCorteComponent } from './carga-solidos/tableristas/balanzas-manual-corte/balanzas-manual-corte.component';
import { BalanzasManualBajaCargaComponent } from './carga-solidos/tableristas/balanzas-manual-baja-carga/balanzas-manual-baja-carga.component';
import { BalanzasManualCargaNormalComponent } from './carga-solidos/tableristas/balanzas-manual-carga-normal/balanzas-manual-carga-normal.component';

const components = [
    CargaComponent,
    CargaSolidosComponent,
    GraficoCargaComponent,
    ManosComponent,
    BalanzasComponent,
    BalanzasRitmosComponent,
    InfoAdicionalComponent,
    UmapComponent,
    PlanillaEmbarqueComponent,
    CargaLiquidosComponent,
    TanquesComponent,
    LineasComponent,
    PlanillaTurnoLiquidosComponent,
    BodegasComponent,
    InicioCargaComponent,
    FinalizacionCargaComponent,
    PlanillaCargaComponent,
    BalanzasManualComponent,
    BalanzasManualCorteComponent,
    BalanzasManualBajaCargaComponent,
]
@NgModule({
    imports: [
        CargaRoutingModule,
        CommonModule,
        SharedModule,
        ListboxModule,
    ],
    declarations: [
        components,
        BalanzasManualCargaNormalComponent,
    ],
    exports: [
        components,
    ]
})
export class CargaModule {}
