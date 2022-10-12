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
          this.router.navigateByUrl('/lineup');
        } else {
          this.messageService.add({ severity: 'error', detail: 'Error al iniciar sesión', summary: 'No se ha encontrado el usuario' })
        }
      }
    )
  }
}
