import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent, Event } from '@angular/router';
import { BuqueSharingService } from '@ScatoServicios/buque.shared.service';
import { SessionService } from '@ScatoServicios/session.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  variable: boolean = true;
  opened: boolean = false;
  animate: boolean = true;
  keyClose: boolean = false;
  private user: any;
  rutaActual: string;

  constructor(
    private router: Router,
    private session: SessionService,
    private buqueSharingService: BuqueSharingService,
  ) {
    this.user = this.session.getUser();
    this.rutaActual = this.router.url.replace('/', '');
    router.events.pipe(
      filter((e: Event): e is RouterEvent => e instanceof RouterEvent)
    ).subscribe((e: RouterEvent) => {
      this.rutaActual = e.url.replace('/', '');
    });
  }

  ngOnInit(): void {
  }

  change(param) {
    this.variable = param;
  }

  toggleCloseFocusOut() {
    this.opened = false;
  }

  toggleOpened(): void {
    this.opened = !this.opened;
  }

  toggleAnimate(): void {
    this.animate = !this.animate;
  }

  toggleKeyClose(): void {
    this.keyClose = !this.keyClose;
  }

  goHome() {
    if (this.user.permisos.find(x => x === 'LineUp_Ver'))
      this.router.navigate(['/lineup']);
    if (this.user.permisos.find(x => x === 'Carga_Ver'))
      this.router.navigate(['/carga'])
    if (this.user.permisos.find(x => x === 'Recibidores_Ver'))
      this.router.navigate(['/calidad'])
    if (this.user.permisos.find(x => x === 'Geolocalizacion_Ver'))
      this.router.navigate(['/geolocalizacion'])
    if (this.user.permisos.find(x => x === 'Buque_Ver'))
      this.router.navigate(['/buques'])
    this.opened = false;
  }

  showSubmenu(menu: HTMLElement, submenu: HTMLElement) {
    this.closeSubmenus(menu, submenu);
    submenu.classList.contains('submenu-active') ? submenu.classList.remove('submenu-active') : submenu.classList.add('submenu-active');
  }

  closeSubmenus(menu: HTMLElement, submenu?: HTMLElement) {
    // limpiando datos comportidos para buque
    this.buqueSharingService.setFiltroBusques(null);
    this.buqueSharingService.setFiltroBusques(null);

    for (let child of menu.children) {
      if (child != submenu)
        child.classList.contains('submenu-active') ? child.classList.remove('submenu-active') : '';
    }
    if (!submenu)
      this.opened = false;
  }

  tienePermiso(permiso: string) {
    return this.user.permisos.find(x => x === permiso);
  }

  openSidebar() {
    this.opened = true;
  }

  closeSidebar() {
    this.opened = false;
  }
}
