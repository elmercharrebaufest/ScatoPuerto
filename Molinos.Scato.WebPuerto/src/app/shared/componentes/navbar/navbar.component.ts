import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NotificacionProgramaDeEmbarque } from '@ScatoModels/programa-embarque/notificacionProgramaDeEmbarque';
import { NotificacionService } from '@ScatoServicios/notificacionProgramaDeEmbarque.service';
import { SessionService } from '@ScatoServicios/session.service';
// <ARMOA005-1820 Dylan Lopez>
import { MsalService } from '@azure/msal-angular';
import { environment } from 'environments/environment';
// </ ARMOA005-1820 Dylan Lopez>
import { interval, Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  @Input() onClickHandler: any;

  notificaciones: NotificacionProgramaDeEmbarque[] = [];
  private origenNotif: 'lineup' | 'programaEmbarque' = 'lineup';

  notificacionesVisibles: boolean = false;
  _cantidadNotificaciones: number = 0;
  public navClass = 'env-' + environment.envName;

  private destroy$ = new Subject();

  constructor(
    public session: SessionService,
    public router: Router,
    private _notificacionService: NotificacionService,
    private msalService: MsalService) {

  }

  ngOnInit(): void {
    this.actualizarOrigenNotif(this.router.url);
    this.obtenerNotificaciones();

    this.router.events.pipe(filter(ev => ev instanceof NavigationEnd), takeUntil(this.destroy$)).subscribe((ev: NavigationEnd) => {
      this.actualizarOrigenNotif(ev.urlAfterRedirects);
      this.obtenerNotificaciones();
    });

    interval(30000).pipe(takeUntil(this.destroy$)).subscribe(() => this.obtenerNotificaciones());

    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => this._cantidadNotificaciones = this.notificaciones.length);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  private actualizarOrigenNotif(url: string) {
    if (url.includes('/programa')) {
      this.origenNotif = 'programaEmbarque';
    } else {
      this.origenNotif = 'lineup';
    }
  }

  showNotificacionesVisibles() {
    if (this.notificaciones.length > 0 || this.notificacionesVisibles) {
      this.notificacionesVisibles = !this.notificacionesVisibles;
    }
  }

  obtenerNotificaciones() {
    let obsObtener: Observable<NotificacionProgramaDeEmbarque[]>;

    switch (this.origenNotif) {
      case 'programaEmbarque':
        obsObtener = this._notificacionService.obtenerNotificacionesDocumentacion();
        break;
      case 'lineup':
      default:
        obsObtener = this._notificacionService.obtenerNotificaciones();
        break;
    }

    obsObtener.subscribe((res: NotificacionProgramaDeEmbarque[]) => {
      this.notificaciones = res;
    });
  }

  cantidadNotificaciones(cantidad: number) {
    this._cantidadNotificaciones = cantidad;
  }

  eliminarNotificacion(item: NotificacionProgramaDeEmbarque) {
    let obsEliminar: Observable<Object>;

    switch (this.origenNotif) {
      case 'programaEmbarque':
        obsEliminar = this._notificacionService.eliminarNotificacionDocumentacion(item.id);
        break;
      case 'lineup':
      default:
        obsEliminar = this._notificacionService.eliminarNotificacion(item);
        break;
    }

    obsEliminar.subscribe();

    this.notificaciones.splice(this.notificaciones.findIndex((e) => e.id === item.id), 1);
    this._cantidadNotificaciones = this.notificaciones.length;
  }

  showNotifications(visible: boolean) {
    this.notificacionesVisibles = visible;
  }

  // <ARMOA005-1820 Dylan Lopez>
  logout = () => {
    console.log('logout');
    console.log(this.session.getUser());

    this.session.setUser = null;
    this.session.clear();
    this.msalService.logout();
    console.log(this.session.getUser());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('accountId');
    window.localStorage.setItem('logout-event', Math.random().toString())
    this.session.logOut()
  }
  // </ ARMOA005-1820 Dylan Lopez>
}
