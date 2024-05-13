import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '@ScatoInterfaces/usuario';
import { AutenticadorService } from '@ScatoServicios/autenticador.service';
import { SessionService } from '@ScatoServicios/session.service';
import { environment } from 'environments/environment';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public iniciandoSession: boolean = false;
  titulo = "";
  loginResponse: any;
  username = "";
  pass = "";
  loginButtonEnable = true;
  captchaOk: any = null;
  mensajeError: string = null;
  production: boolean = environment.production;

  public qa: boolean = environment.qa;
  public verPermisos: boolean = false;
  private posicionCodigo: number = 0;
  private codigoPermisos: string[] = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a', 'Enter'];
  public permisosRoles = [
    { nombre: 'Coordinacion', permiso: 'LAD_MOAAPP_PUERTO_COORDINADORES', checked: false },
    { nombre: 'Operadores', permiso: 'LAD_MOAAPP_PUERTO_OPERADORES', checked: false },
    { nombre: 'Tableristas', permiso: 'LAD_MOAAPP_PUERTO_TABLERISTA', checked: false },
    { nombre: 'Recibidores', permiso: 'LAD_MOAAPP_PUERTO_RECIBIDORES', checked: false },
    { nombre: 'Geolocalizacion', permiso: 'LAD_MOAAPP_PUERTO_GEOLOCALIZACION', checked: false },
    { nombre: 'Comex', permiso: 'LAD_MOAAPP_PUERTO_COMEX', checked: false },
    { nombre: 'Sistemas', permiso: 'LAD_MOAAPP_PUERTO_SISTEMA', checked: false },
  ];

  constructor(
    private autenticarAd: AutenticadorService,
    private router: Router,
    private session: SessionService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void { }

  public iniciarSession() {
    this.iniciandoSession = true;
    var mensaje = document.getElementById("error");
    mensaje.style.setProperty("display", "none");
    this.username = (window.document.getElementsByName("email")[0] as HTMLInputElement).value;
    this.pass = (window.document.getElementsByName("Contraseña")[0] as HTMLInputElement).value;

    if (this.production) {
      this.autenticar();
    }
    else {
      let permi: string[] = ["LAD_MOAAPP_PUERTO_SISTEMA"];
      let user = {} as Usuario;
      user.username = this.username.split("@")[0].toString();
      user.autenticado = true;
      user.permisos = permi;
      this.obtenerGruposAD(user);
    }

  }

  autenticar() {
    var parametros = new Array();

    parametros.push(this.username);
    parametros.push(this.pass);
    /*   this.autenticarAd.autenticarUsuarioAd(this.username, this.pass).subscribe( */

    this.autenticarAd.autenticarUsuarioAd(parametros).subscribe((res: Usuario) => {
      if (!res) {
        this.iniciandoSession = false;
        this.messageService.add({ severity: 'error', detail: 'Error al iniciar sesión', summary: 'No se ha encontrado el usuario' })
        return;
      }
      console.log('========== autenticarUsuario ==========', res);
      this.session.clear();
      res.autenticado = true;
      this.obtenerGruposAD(res);
    }, error => {
      this.iniciandoSession = false;
      console.log('========== error ==========');
      console.error(error);
      this.mensajeError = "No se pudo autenticar el usuario";
      this.mostrarError();
    }

    )
  }

  obtenerGruposAD(res: Usuario) {
    var usuario = this.username.split("@")[0].toString();

    if (this.qa && this.verPermisos && this.permisosRoles.some(p => p.checked)) {
      res.permisos = this.permisosRoles.filter(p => p.checked).map(p => p.permiso);
    }

    this.autenticarAd.ObtenerGruposAD(res.permisos, usuario).subscribe((respuesta: any) => {
      if (respuesta.permisos.length > 0) {
        res.permisos = respuesta.permisos;
        this.session.setUser(res);
        // this.router.navigateByUrl('/lineup');
        this.navigate(res.permisos);
      }
      else {
        this.iniciandoSession = false;
        this.mensajeError = "No tiene permisos para ingresar";
        this.mostrarError();
      }
    }, (err) => {
      console.error(err);
      this.iniciandoSession = false;
      this.mensajeError = "Ocurrió un error al obtener los permisos";
      this.mostrarError();
    });

  }

  mostrarError() {
    var mensaje = document.getElementById("error");
    mensaje.style.removeProperty("display");
  }

  navigate(permisos) {
    let primerPermiso = permisos.find((p: string) => p == 'Comex_Nominacion_Ver' || p == 'LineUp_Ver' || p == 'Carga_Ver' || p == 'Recibidores_Ver' || p == 'Geolocalizacion_Ver' || p == 'Buque_Ver'
      || p == 'Coem_Visualizar' || p == 'Caratula_Visualizar');
    if (primerPermiso == undefined) {
      this.iniciandoSession = false;
      this.mensajeError = "No tiene permisos para ingresar";
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
      case 'Caratula_Visualizar': {
        this.router.navigate(['/afip/caratula']);
        break;
      }
      case 'Coem_Visualizar': {
        this.router.navigate(['afip/coem']);
        break;
      }
      case 'Clientes_Visualizar': {
        this.router.navigate(['/clientes']);
        break;
      }
      case 'Destinos_Visualizar': {
        this.router.navigate(['/destinos']);
        break;
      }
    }
  }

  @HostListener('window:keyup', ['$event'])
  KeyUp(event: KeyboardEvent) {
    if (!this.qa) {
      return;
    }
    if (event.key == this.codigoPermisos[this.posicionCodigo]) {
      this.posicionCodigo++;
      if (this.posicionCodigo == this.codigoPermisos.length) {
        this.verPermisos = true;
      }
    } else {
      this.posicionCodigo = 0;
    }
  }
}

