import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent, Event } from '@angular/router';
import { BuqueSharingService } from '@ScatoServicios/buque.shared.service';
import { SessionService } from '@ScatoServicios/session.service';
import { environment } from 'environments/environment';
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
  public envClass = 'env-' + environment.envName;
  public esSoloAduana: boolean = false;

  constructor(
    private router: Router,
    private session: SessionService,
    private buqueSharingService: BuqueSharingService,
  ) {
    this.user = this.session.getUser();
    this.rutaActual = this.router.url.replace('/', '');
    this.esSoloAduana = this.tieneSoloPermisoAduana();
    router.events.pipe(
      filter((e: Event): e is RouterEvent => e instanceof RouterEvent)
    ).subscribe((e: RouterEvent) => {
      if (this.esSoloAduana && !this.esRutaAduana(e.url)) {
        this.router.navigate(['/aduana/pesadas-online']);
        return;
      }
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
    if (this.user.permisos.find(x => x === 'Aduana_Consultar'))
      this.router.navigate(['/aduana/pesadas-online']);
    if (this.user.permisos.find(x => x === 'LineUp_Ver'))
      this.router.navigate(['/lineup']);
    if (this.user.permisos.find(x => x === 'Carga_Ver'))
      this.router.navigate(['/carga'])
    if (this.user.permisos.find(x => x === 'Recibidores_Ver'))
      this.router.navigate(['/calidad'])
    if (this.user.permisos.find(x => x === 'Geolocalizacion_Ver'))
      this.router.navigate(['/geolocalizacion'])
    if (this.user.permisos.find(x => x === 'Buque_Ver')) // TODO MODIFICAR PERMISO
      this.router.navigate(['/embarque/agencias'])
    if (this.user.permisos.find(x => x === 'Buque_Ver'))
      this.router.navigate(['/buques'])
    if (this.user.permisos.find(x => x === 'Clientes_Visualizar'))
      this.router.navigate(['/clientes'])
    if (this.user.permisos.find(x => x === 'Exportadores_Visualizar'))
      this.router.navigate(['/embarque/cargadores'])
    if (this.user.permisos.find(x => x === 'Comex_Nominacion_Ver'))
      this.router.navigate(['/programa'])
    if (this.user.permisos.find(x => x === 'Vapor_Visualizar'))
      this.router.navigate(['/vapor'])
    if (this.user.permisos.find(x => x === 'Caratula_Visualizar'))
      this.router.navigate(['/afip/caratula'])
    if (this.user.permisos.find(x => x === 'Coem_Visualizar'))
      this.router.navigate(['/afip/coem'])
    if (this.user.permisos.find(x => x === 'Destinos_Visualizar'))
      this.router.navigate(['/destinos'])
    if (this.user.permisos.find(x => x === 'Productos_Visualizar'))
      this.router.navigate(['/embarque/productos'])
    if (this.user.permisos.find(x => x === 'Administracion_Visualizar'))
      this.router.navigate(['/administracion/consulta-embarques'])
    if (this.user.permisos.find(x => x === 'Acuerdos_Lectura_Visualizar'))
      this.router.navigate(['/acuerdos'])
    if (this.user.permisos.find(x => x === 'Embarques_Ver'))
      this.router.navigate(['/puerto-logistica/embarques'])
    if (this.user.permisos.find(x => x === 'ReportePesada_Ver'))
      this.router.navigate(['/puerto-logistica/reportes-por-turnos'])
    if (this.user.permisos.find(x => x === 'ConfiguracionPuerto_Ver'))
      this.router.navigate(['/puerto-logistica/configuracion-puerto/balanza-puerto'])
    if (this.user.permisos.find(x => x === 'EmbarquesPorBuques_Ver'))
      this.router.navigate(['/puerto-logistica/embarques-por-buques'])
    if (this.user.permisos.find(x => x === 'EtiquetaPuerto_Ver'))
      this.router.navigate(['/puerto-logistica/etiquetas-puerto'])
    this.opened = false;
  }

  tieneSoloPermisoAduana(): boolean {
    return !!this.user?.permisos?.length && this.user.permisos.every(x => x === 'Aduana_Consultar');
  }

  esRutaAduana(url: string): boolean {
    return !!url && (url === '/aduana' || url.startsWith('/aduana/'));
  }

  showSubmenu(menu: HTMLElement, submenu: HTMLElement) {
    this.closeSubmenus(menu, submenu);
    submenu.classList.contains('submenu-active') ? submenu.classList.remove('submenu-active') : submenu.classList.add('submenu-active');
  }

  closeSubmenus(menu: HTMLElement, submenu?: HTMLElement) {
    // limpiando datos compartidos para buque
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

  tieneAccesoPuertoLogistica(): boolean {
    return !!this.user?.permisos?.find(x =>
      x === 'Embarques_Ver' ||
      x === 'ReportePesada_Ver' ||
      x === 'ConfiguracionPuerto_Ver' ||
      x === 'EmbarquesPorBuques_Ver' ||
      x === 'EtiquetaPuerto_Ver' ||
      x === 'LineUp_Ver' ||
      x === 'Administracion_Visualizar' ||
      x === 'Comex_Nominacion_Ver');
  }

  tieneAccesoReportePorTurnos(): boolean {
    return !!this.user?.permisos?.find(x =>
      x === 'ReportePesada_Ver' ||
      x === 'LineUp_Ver' ||
      x === 'Embarques_Ver' ||
      x === 'Comex_Nominacion_Ver' ||
      x === 'Administracion_Visualizar');
  }

  tieneAccesoConsultaEmbarquesBuques(): boolean {
    return !!this.user?.permisos?.find(x =>
      x === 'EmbarquesPorBuques_Ver' ||
      x === 'Embarques_Ver' ||
      x === 'LineUp_Ver' ||
      x === 'Comex_Nominacion_Ver' ||
      x === 'Administracion_Visualizar');
  }

  openSidebar() {
    this.opened = true;
  }

  closeSidebar() {
    this.opened = false;
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
