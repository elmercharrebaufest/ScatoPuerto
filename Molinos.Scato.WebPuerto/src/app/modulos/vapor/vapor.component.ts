import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Usuario } from '@ScatoInterfaces/usuario';
import { SessionService } from '@ScatoServicios/session.service';


@Component({
  selector: 'app-vapor',
  templateUrl: './vapor.component.html',
  styleUrls: ['./vapor.component.css']
})
export class VaporComponent implements OnInit {

  permisosScato: typeof PermisosScato = PermisosScato;
  private user: Usuario;

  constructor(private route: Router,public session: SessionService) {
    this.user = this.session.getUser(); 
  }

  ngOnInit(): void {
  }  
 
  
  tienePermisoEnviarALineUp() {
    return this.user.permisos.find(p => p === this.permisosScato.Comex_Nominacion_Enviar_LineUp);
  }
  tienePermisoCrearNuevaNominacion() {
    return this.user.permisos.find(p => p === this.permisosScato.Comex_Nominacion_Guardar);
  }

}
