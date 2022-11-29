import { Component, HostListener, OnInit } from '@angular/core';
import { Usuario } from '@ScatoInterfaces/usuario';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { SessionService } from '@ScatoServicios/session.service';

@Component({
  selector: 'app-toggle-menu-orden',
  templateUrl: './toggle-menu-orden.component.html',
  styleUrls: ['./toggle-menu-orden.component.css']
})
export class ToggleMenuOrdenComponent implements OnInit {
  showMenu = false;
  private wasInside = false;
  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;

  constructor(private session: SessionService,) {
    this.user = this.session.getUser();
  }

  ngOnInit(): void {

  }

  public toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  @HostListener('click')
  clickInside() {
    this.wasInside = true;
  }

  @HostListener('document:click')
  clickout() {
    if (!this.wasInside) {
      if (this.showMenu) {
        this.toggleMenu();
      }
    }
    this.wasInside = false;
  }

  hasPermisoLineUp_EditarOrdenEmbarque(){
    return this.user.permisos.find(p => p === this.permisosScato.LineUp_EditarOrdenEmbarque);
  }
}
