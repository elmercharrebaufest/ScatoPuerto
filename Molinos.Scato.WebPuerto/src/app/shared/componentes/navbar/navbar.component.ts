import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificacionProgramaDeEmbarque } from '@ScatoModels/programa-embarque/notificacionProgramaDeEmbarque';
import { NotificacionService } from '@ScatoServicios/notificacionProgramaDeEmbarque.service';
import { SessionService } from '@ScatoServicios/session.service';
// <ARMOA005-1820 Dylan Lopez>
import { MsalService } from '@azure/msal-angular';
// </ ARMOA005-1820 Dylan Lopez>

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  @Input() onClickHandler: any;

  notificaciones: NotificacionProgramaDeEmbarque[] = [];

  notificacionesVisibles: boolean = false;
  _cantidadNotificaciones: number = 0;
  constructor(
    public session: SessionService,
    public router: Router,
    private _notificacionService: NotificacionService,
    private msalService: MsalService) { }

  ngOnInit(): void {
    this.obtenerNotificaciones();    
    setInterval(() => {
      this.obtenerNotificaciones();      
    }, 30000);

    setInterval(() => {
        this._cantidadNotificaciones = this.notificaciones.length;
    }, 1000);
  } 

  showNotificacionesVisibles = () => {
    if(this.notificaciones.length > 0 || this.notificacionesVisibles)
      this.notificacionesVisibles = !this.notificacionesVisibles;
  }

  obtenerNotificaciones = () => {
      this._notificacionService.obtenerNotificaciones().subscribe((res: NotificacionProgramaDeEmbarque[]) => {
        this.notificaciones = res;
      })
  }

  cantidadNotificaciones = (cantidad: number) => {
    this._cantidadNotificaciones = cantidad;
  }

  eliminarNotificacion = (item: NotificacionProgramaDeEmbarque) => {
    this._notificacionService.eliminarNotificacion(item).subscribe((res: any) => {
      
    })

    this.notificaciones.splice(this.notificaciones.findIndex((e) => e.id === item.id),1);
    this._cantidadNotificaciones = this.notificaciones.length;
  }

  showNotifications = (visible: boolean) => {
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
  }
  // </ ARMOA005-1820 Dylan Lopez>
}
