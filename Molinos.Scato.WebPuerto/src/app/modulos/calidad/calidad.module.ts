import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "app/shared/shared.module";
import { CargaModule } from "../carga/carga.module";
import { CalidadRoutingModule } from "./calidad-routing.module";
import { CalidadComponent } from "./calidad.component";
import { LiquidosComponent } from "./liquidos/liquidos.component";
import { NIRComponent } from "./solidos/nir/nir.component";
import { SolidosComponent } from "./solidos/solidos.component";
import { PlanillaTurnosSolidoComponent } from "./solidos/planilla-turnos-solido/planilla-turnos-solido.component";
import { RecibodebuquepdfComponent } from "./recibo-de-buque/recibodebuquepdf.component";
import { PlanillaTurnoLiquidosCalidadComponent } from "./liquidos/planilla-turnos-liquidos-calidad/planilla-turnos-liquidos-calidad.component";
import { ModalReciboComponent } from './modal-recibo/modal-recibo.component';
import { RegistroRecibosComponent } from './registro-recibos/registro-recibos.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NirManoComponent } from "./solidos/nir/nir-mano/nir-mano.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";


@NgModule({
    imports: [
        CommonModule,
        CalidadRoutingModule,
        SharedModule,
        CargaModule,
        FormsModule,
        ReactiveFormsModule,
        NgMultiSelectDropDownModule.forRoot(),
    ],
    declarations: [
        CalidadComponent,
        NIRComponent,
        SolidosComponent,
        LiquidosComponent,
        PlanillaTurnosSolidoComponent,
        PlanillaTurnoLiquidosCalidadComponent,
        RecibodebuquepdfComponent,
        ModalReciboComponent,
        RegistroRecibosComponent,
        NirManoComponent
    ],
})

export class CalidadModule {}
