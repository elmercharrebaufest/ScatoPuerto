import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Notificacion } from '@ScatoModels/programa-embarque/notificaciones';
import { NotificacionService } from '@ScatoServicios/notificacion.service';
import { SessionService } from '@ScatoServicios/session.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  @Input() onClickHandler: any;

  notificaciones: Notificacion[] = [];

  notificacionesVisibles: boolean = false;
  _cantidadNotificaciones: number = 0;
  constructor(
    public session: SessionService,
    private router: Router,
    private _notificacionService: NotificacionService) { }

  ngOnInit(): void {
    this.obtenerNotificaciones();    
    setInterval(() => {
      this.obtenerNotificaciones();      
    }, 30000);

    setInterval(() => {
      if(this.router.url.includes('/programa')){
        this._cantidadNotificaciones = this.notificaciones.length;
      } else{
        this._cantidadNotificaciones = 0
      }
    }, 1000);
  } 

  showNotificacionesVisibles(){
    if(this.router.url.includes('/programa') && this.notificaciones.length > 0 || this.notificacionesVisibles)
      this.notificacionesVisibles = !this.notificacionesVisibles;
  }

  obtenerNotificaciones(){
    this._notificacionService.obtenerNotificaciones().subscribe((res: Notificacion[]) => {
      this.notificaciones = res;
    })
  }

  cantidadNotificaciones(cantidad: number){
    this._cantidadNotificaciones = cantidad;
  }

  eliminarNotificacion(item: Notificacion){
    this._notificacionService.eliminarNotificacion(item).subscribe((res: any) => {
      
    })

    this.notificaciones.splice(this.notificaciones.findIndex((e) => e.id === item.id),1);
    this._cantidadNotificaciones = this.notificaciones.length;
  }

  showNotifications(visible: boolean){
    this.notificacionesVisibles = visible;
  }

}
