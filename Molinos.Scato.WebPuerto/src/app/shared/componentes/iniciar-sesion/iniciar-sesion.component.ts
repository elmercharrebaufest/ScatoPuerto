import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutenticadorService } from '@ScatoServicios/autenticador.service';
import { SessionService } from '@ScatoServicios/session.service';
import { Usuario } from '@ScatoInterfaces/usuario';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-iniciar-sesion',
  templateUrl: './iniciar-sesion.component.html',
  styleUrls: ['./iniciar-sesion.component.css']
})
export class IniciarSesionComponent implements OnInit {
  permisos: any;

  constructor(
    private router: Router,
    private messageService: MessageService,
    private auth: AutenticadorService,
    private session: SessionService) { }

  ngOnInit(): void {
    this.autenticar();
  }

  autenticar() {
    this.auth.autenticarUsuario().subscribe(
      (res: Usuario) => {
        if (res) {
          console.log('========== autenticarUsuario ==========', res);
          this.session.clear();
          res.autenticado = true;
          this.session.setUser(res);
          // this.router.navigateByUrl('/lineup');
          this.navigate(res.permisos);
        } else {
          this.messageService.add({ severity: 'error', detail: 'Error al iniciar sesión', summary: 'No se ha encontrado el usuario' })
        }
      }
    )
  }

  navigate(permisos){
    let primerPermiso = permisos.find((p: string)=> p == 'LineUp_Ver' || p == 'Carga_Ver' || p == 'Recibidores_Ver' || p == 'Geolocalizacion_Ver' || p == 'Buque_Ver');
    switch(primerPermiso){
        case 'LineUp_Ver': {
            this.router.navigate(['/lineup']);
            break;
        };
        case 'Carga_Ver': {
            this.router.navigate(['/carga']);
            break;
        }
        case 'Recibidores_Ver': {
            this.router.navigate(['/calidad']);
            break;
        }
        case 'Geolocalizacion_Ver': {
            this.router.navigate(['/geolocalizacion']);
            break;
        }
        case 'Buque_Ver': {
            this.router.navigate(['/buques']);
            break;
        }

        case 'Vapor_Visualizar': {
          this.router.navigate(['/vapor']);
          break;
      }

      case 'Comex_Nominacion_Ver': {
        this.router.navigate(['/programa']);
        break;
    }
    }
  }

}
