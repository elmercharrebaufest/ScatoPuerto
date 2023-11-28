import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { routeConfig } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { SidebarModule } from 'ng-sidebar';
import { SharedModule } from './shared/shared.module';
import { RouterModule } from '@angular/router';
import { SharedComponentModule } from './shared/componentes/shared-components.module';
import { MessageService } from 'primeng/api';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { ProductoState } from './store/productos/material.state';
import { BuquesState } from './store/buques/buques.state';
registerLocaleData(localeEsAr, 'es-Ar');
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { AutenticadorService } from '@ScatoServicios/autenticador.service';
import { InterceptorADService } from './shared/servicios/interceptors/interceptor-ad.service';
import { ToastrModule } from 'ngx-toastr';
import { LoginComponent } from './modulos/login/login.component';
import { NgxMaskModule } from 'ngx-mask';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SharedModule,
    SharedComponentModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    SidebarModule.forRoot(),
    ToastrModule.forRoot(),
    RouterModule.forRoot(routeConfig),
    NgxsModule.forRoot([
      ProductoState, 
      BuquesState
    ]),
    ReactiveFormsModule,
    NgxMaskModule.forRoot()
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-Ar' },
    // { 
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: InterceptorADService,
    //   multi: true // para que esté atento a todas las peticiones
    // },
    DatePipe,
    MessageService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
