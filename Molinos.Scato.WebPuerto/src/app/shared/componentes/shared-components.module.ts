import { CommonModule, DatePipe } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CalendarModule } from "angular-calendar";
import { PlanoContentComponent } from "app/modulos/lineup/plano-de-carga/plano-content/plano-content.component";
import { SidebarModule } from "ng-sidebar";ConfirmationDialogComponent
import { TagInputModule } from "ngx-chips";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { AlertComponent } from "./alert/alert.component";

import { CollapseButtonComponent } from "./collapse-button/collapse-button.component";
import { ConfirmationDialogComponent } from "./confirmation-dialog/confirmation-dialog.component";
import { EstadosPuertoContentComponent } from "./estados-puerto/estados-puerto-content.component";
import { LayoutComponent } from "./layout/layout.component";
import { GraficosRitmosComponent } from "./modulos/carga/graficos-ritmos/graficos-ritmos.component";
import { ObsCalidadComponent } from "./modulos/calidad/obs-calidad/obs-calidad.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { NavtabsComponent } from "./navtabs/navtabs.component";
import { ToggleMenuAccionesComponent } from "./toggle-menu-acciones/toggle-menu-acciones.component";
import { ToggleMenuOrdenComponent } from "./toggle-menu-orden/toggle-menu-orden.component";
import { KnobModule } from 'primeng/knob';
import { SpinnerComponent } from './spinner/spinner.component'
import { PeriodoCargaComponent } from "./modulos/carga/periodo-carga/periodo-carga.component";
import { AmarreComponent } from "./modulos/carga/amarre/amarre.component";
import { ToastModule } from 'primeng/toast';
import { IniciarSesionComponent } from './iniciar-sesion/iniciar-sesion.component';
import { NavtabsCalidadComponent } from "./navtabs-calidad/navtabs-calidad.component";
import { CardBuqueComponent } from './modulos/geo/card-buque/card-buque.component';
import { ModalCrearBuqueComponent } from "./modal-crear-buque/modal-crear-buque.component";
import { RelojBalanzasComponent } from "./modulos/carga/reloj-balanzas/reloj-balanzas.component";
import { AltaBajaMantenimientoComponent } from './alta-baja-mantenimiento/alta-baja-mantenimiento.component';
import { NotificacionesComponent } from "./notificaciones/notificaciones.component";
import { RitmoEmbarqueBalanzaComponent } from "./ritmo-embarque-balanza/ritmo-embarque-balanza.component";
import { SemaforoRitmoEmbarqueComponent } from "./semaforo-ritmo-embarque/semaforo-ritmo-embarque.component";
import { EnvioMailDialogComponent } from "./envio-mail-dialog/envio-mail-dialog.component";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { EditarCrearBuquesComponent } from "./editar-crear-buques/editar-crear-buques.component";
import { NgxMaskModule } from "ngx-mask";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { MatPaginatorModule } from "@angular/material/paginator";
import { EditarCrearClienteComponent } from './editar-crear-cliente/editar-crear-cliente.component';
import { ModalCrearClienteComponent } from './modal-crear-cliente/modal-crear-cliente.component';
import { ModalModificarAgenciasMaritimasAtaComponent } from "./modulos/agencias-maritimas-ata/modificar-agenciamaritima-ata.component";
import { EditarCrearCargadorComponent } from './editar-crear-cargador/editar-crear-cargador.component';
import { RitmoEmbarqueCargaManualComponent } from './ritmo-embarque-carga-manual/ritmo-embarque-carga-manual.component';
import { AmarreNuevoComponent } from './modulos/carga/amarre-nuevo/amarre-nuevo.component';
import { FumigacionBodegaComponent } from "./fumigacion-bodega/fumigacion-bodega.component";
import { ListadoComprobantesComponent } from './listado-comprobantes/listado-comprobantes.component';
import { FiltroCargasComponent } from './filtro-cargas/filtro-cargas.component';
import { TablaCargasComponent } from './tabla-cargas/tabla-cargas.component';
import { FiltroReportePesadaComponent } from './filtro-reporte-pesada/filtro-reporte-pesada.component';

const components = [
    AlertComponent,
    CollapseButtonComponent,
    ConfirmationDialogComponent,
    EstadosPuertoContentComponent,
    LayoutComponent,
    GraficosRitmosComponent,
    RelojBalanzasComponent,
    ObsCalidadComponent,
    ToggleMenuOrdenComponent,
    ToggleMenuAccionesComponent,
    NavbarComponent,
    NavtabsComponent,
    PlanoContentComponent,
    SpinnerComponent,
    PeriodoCargaComponent,
    AmarreComponent,
    NavtabsCalidadComponent,
    CardBuqueComponent,
    EditarCrearBuquesComponent,
    AltaBajaMantenimientoComponent,
    NotificacionesComponent,
    RitmoEmbarqueBalanzaComponent,
    SemaforoRitmoEmbarqueComponent,
    EnvioMailDialogComponent,
    ModalCrearBuqueComponent,
    EditarCrearClienteComponent,
    ModalCrearClienteComponent,
    ModalModificarAgenciasMaritimasAtaComponent,
    EditarCrearCargadorComponent,
    RitmoEmbarqueCargaManualComponent,
    AmarreNuevoComponent,
    FumigacionBodegaComponent,
    ListadoComprobantesComponent,
    FiltroCargasComponent,
    TablaCargasComponent,
    FiltroReportePesadaComponent
]
const libs = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgxMaterialTimepickerModule,
    TagInputModule,
    FlexLayoutModule,
    PerfectScrollbarModule,
    SidebarModule,
    CalendarModule,
    RouterModule,
    KnobModule,
    ToastModule,
    CKEditorModule,
    NgxMaskModule,
    NgMultiSelectDropDownModule,
    MatPaginatorModule
]

@NgModule({
    imports: [
        libs,
    ],
    declarations: [
        components,
        IniciarSesionComponent
    ],
    exports: [
        components,
        libs,
    ],
    providers: [DatePipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class SharedComponentModule { }
