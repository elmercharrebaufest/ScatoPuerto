import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Usuario } from '@ScatoInterfaces/usuario';
import { SessionService } from '@ScatoServicios/session.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {

  permisosScato: typeof PermisosScato = PermisosScato;
  private user: Usuario;

  constructor(public session: SessionService) {
    this.user = this.session.getUser(); 
  }
  ngOnInit(): void {
  }

  tienePermisoCrearNuevoCliente() {
    return this.user.permisos.find(p => p === this.permisosScato.Clientes_Crear);
  }

}
