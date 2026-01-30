import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministracionRoutingModule } from './administracion-routing.module';
import { AdministracionComponent } from './administracion.component';
import { ConsultaEmbarquesComponent } from './consulta-embarques/consulta-embarques.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from 'primeng/api';
import { SharedComponentModule } from 'app/shared/componentes/shared-components.module';
import { DetalleEmbarqueComponent } from './detalle-embarque/detalle-embarque.component';
import { AlertaAdministracionComponent } from './alerta-administracion/alerta-administracion.component';
import { ProvGastosProductoComponent } from './prov-gastos-producto/prov-gastos-producto.component';
import { ProvGastosEmbarqueComponent } from './prov-gastos-embarque/prov-gastos-embarque.component';
import { TarifaProductoComponent } from './tarifa-producto/tarifa-producto.component';
import { TarifaEmbarqueComponent } from './tarifa-embarque/tarifa-embarque.component';
import { AcuerdosPorEmbarcacionComponent } from './acuerdos-por-embarcacion/acuerdos-por-embarcacion.component';
import { ProgresoEmbarcacionComponent } from './progreso-embarcacion/progreso-embarcacion.component'; // Import here

@NgModule({
  declarations: [
    AdministracionComponent, 
    ConsultaEmbarquesComponent, 
    DetalleEmbarqueComponent, 
    AlertaAdministracionComponent, 
    ProvGastosProductoComponent, 
    ProvGastosEmbarqueComponent, 
    TarifaProductoComponent, 
    TarifaEmbarqueComponent,
    AcuerdosPorEmbarcacionComponent,
    ProgresoEmbarcacionComponent
  ],
  imports: [
    SharedModule, 
    SharedComponentModule,
    CommonModule,
    AdministracionRoutingModule,
    NgMultiSelectDropDownModule.forRoot(),
    MatPaginatorModule
  ]
})
export class AdministracionModule { }