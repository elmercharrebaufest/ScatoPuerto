import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '@ScatoInterfaces/usuario';
import { AutenticadorService } from '@ScatoServicios/autenticador.service';
import { SessionService } from '@ScatoServicios/session.service';
import { MessageService } from 'primeng/api';
import { Session } from 'protractor';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public iniciandoSession:boolean=false;
  constructor(private autenticarAd: AutenticadorService, private router: Router, private session: SessionService, private messageService: MessageService) {

  }

  ngOnInit(): void {

  }
  titulo = "";
  loginResponse: any;
  username = "";
  pass = "";
  loginButtonEnable = true;
  captchaOk: any = null;
  mensajeError:string=null;

public iniciarSession()
{
 this.iniciandoSession=true;
  var mensaje = document.getElementById("error");
  mensaje.style.setProperty("display","none");
  this.username=(window.document.getElementsByName("email")[0] as HTMLInputElement).value;
  this.pass= (window.document.getElementsByName("Contraseña")[0]as HTMLInputElement).value;
  this.autenticar();

}


autenticar() {
  var parametros= new Array();

  parametros.push(this.username);
  parametros.push(this.pass);
/*   this.autenticarAd.autenticarUsuarioAd(this.username, this.pass).subscribe( */
this.autenticarAd.autenticarUsuarioAd(parametros).subscribe(
    (res: Usuario) => {
      if (res) {
        console.log('========== autenticarUsuario ==========', res);
        this.session.clear();
        res.autenticado = true;
        this.autenticarAd.ObtenerGruposAD(res.permisos).subscribe(
          (respuesta: any) => {
            if(respuesta.permisos.length>0)
            {
              res.permisos = respuesta.permisos;
            this.session.setUser(res);
            // this.router.navigateByUrl('/lineup');
            this.navigate(res.permisos);
            }
            else
            {
              this.iniciandoSession=false;
              this.mensajeError="No tiene permisos para ingresar";
            }
          });


      } else {
        this.iniciandoSession=false;
        this.messageService.add({ severity: 'error', detail: 'Error al iniciar sesión', summary: 'No se ha encontrado el usuario' })
      }
    },  error => {
      this.iniciandoSession=false;
      console.log('========== error ==========');
      this.mensajeError="No se pudo autenticar el usuario";
      this.mostrarError();
    }

  )
}

mostrarError()
{
var mensaje = document.getElementById("error");
mensaje.style.removeProperty("display");

}
navigate(permisos) {
  let primerPermiso = permisos.find((p: string) => p == 'LineUp_Ver' || p == 'Carga_Ver' || p == 'Recibidores_Ver' || p == 'Geolocalizacion_Ver' || p == 'Buque_Ver');
  if(primerPermiso == undefined)
  {
    this.iniciandoSession=false;
    this.mensajeError="No tiene permisos para ingresar";
    this.mostrarError();
  }

  switch (primerPermiso) {
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
