import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CalendarModule } from "angular-calendar";
import { PlanoContentComponent } from "app/modulos/lineup/plano-de-carga/plano-content/plano-content.component";
import { SidebarModule } from "ng-sidebar";
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
import { EnvioMailDialogComponent } from "./envio-mail-dialog/envio-mail-dialog.component";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { EditarCrearBuquesComponent } from "./editar-crear-buques/editar-crear-buques.component";

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
    EnvioMailDialogComponent,    
    ModalCrearBuqueComponent
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
]

@NgModule({
    imports: [
        libs
    ],
    declarations: [
        components,
        IniciarSesionComponent
    ],
    exports: [
        components,
        libs,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class SharedComponentModule { }
