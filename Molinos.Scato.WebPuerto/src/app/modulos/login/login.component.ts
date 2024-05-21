import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '@ScatoInterfaces/usuario';
import { AutenticadorService } from '@ScatoServicios/autenticador.service';
import { SessionService } from '@ScatoServicios/session.service';
import { environment } from 'environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// <ARMOA005-1819 Dylan Lopez>
import { MsalService } from '@azure/msal-angular';
import { MsalConfigService } from '../../shared/seguridad/msal-config.service';
import { AuthenticationResult } from '@azure/msal-browser';
import { GraphMicrosoftService } from '../../shared/servicios/graph/graph-microsoft.service';
// </ ARMOA005-1819 Dylan Lopez>

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // <ARMOA005-1819 Dylan Lopez>
  private accessToken: string = '';
  private accountId?: string = '';
  public apiResponse: string = '';
  frmLogin: FormGroup;
  private selectedCompany: string = '';
  private gruposAD: string[] = [];
  // </ ARMOA005-1819 Dylan Lopez>

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
    // <ARMOA005-1819 Dylan Lopez>
    // private messageService: MessageService, 
    private formBuilder: FormBuilder,
    private msalService: MsalService,
    private msalConfigService: MsalConfigService,
    private graphMicrosoftService: GraphMicrosoftService
    // </ ARMOA005-1819 Dylan Lopez>
  ) {
    this.initFrmLogin();
  }

  // <ARMOA005-1819 Dylan Lopez>
  initFrmLogin = () => {
    this.frmLogin = null;
    this.frmLogin = this.formBuilder.group({
      company: ['0', Validators.required],
    });
  }
  // </ ARMOA005-1819 Dylan Lopez>

  ngOnInit(): void {
    console.log('ngOnInit');
    this.msalService.instance.handleRedirectPromise().then(
      res => {
        // console.log(' res: ', res);
        if (res != null && res.account != null) {
          this.msalService.instance.setActiveAccount(res.account);
        } else {
          const accounts = this.msalService.instance.getAllAccounts();
          // console.log(' accounts: ', accounts);
          if (accounts && accounts.length > 0) {
            // console.log(' accounts[0]: ', accounts[0]);
            this.msalService.instance.setActiveAccount(accounts[0]);
          }
        }
      }
    );
  }

  // <ARMOA005-1819 Dylan Lopez>
  selectCompany = (selectedValue: string) => {
    console.log('selectCompany');
    this.selectedCompany = selectedValue;
    if (this.selectedCompany == '0') {
      this.mensajeError = "Debe elegir una compañía para poder ingresar";
      this.mostrarError();
      return;
    }

    const msalInstance = this.msalConfigService.createMsalInstance(this.selectedCompany);
    this.msalService.instance = msalInstance;
    console.log(' set msalInstance: ', msalInstance);
  }

  login = () => {
    console.log('login');

    if (this.selectedCompany == '0') {
      console.error('Debe elegir una compañía para poder ingresar');
      this.mensajeError = 'Debe elegir una compañía para poder ingresar';
      this.mostrarError();
      return;
    }

    this.msalService.loginPopup().subscribe(
      (response: AuthenticationResult) => {
        this.iniciandoSession = true;
        this.msalService.instance.setActiveAccount(response.account)
        // console.log(' response', response);
        this.accountId = response.account?.localAccountId;
        this.accessToken = response.accessToken;
        this.username = response.account?.username;

        if (this.accessToken != undefined) {
          localStorage.setItem('accessToken', this.accessToken);
        }
        if (this.accountId != undefined) {
          localStorage.setItem('accountId', this.accountId);
        }
        this.checkTokenExpiration(this.accessToken);
      }
    );
  }

  checkTokenExpiration = async (token: string) => {
    console.log('checkTokenExpiration');
    const decodedToken = this.decodeJwt(token);
    const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    if (decodedToken.exp < currentTime) {
      console.log(' token expired');
    } else {
      console.log(' token is valid');
      if (!this.qa && !this.production) {
        console.log(' Develop');
        this.gruposAD = ["LAD_MOAAPP_PUERTO_SISTEMA"];
      }
      else if (this.qa && this.verPermisos && this.permisosRoles.some(p => p.checked)){
        this.gruposAD = this.permisosRoles.filter(p => p.checked).map(p => p.permiso);
      }
      else {
        await this.getPermissions();
      }

      // DESMARCAR LA SIGUIENTE LINEA SI SE QUIERE HACER PRUEBAS DE LOS GRUPOS EN DEV
      // await this.getPermissions();
      // console.log(' gruposAD: ', this.gruposAD);

      if (this.gruposAD && this.gruposAD.length > 0) {
        let user = {} as Usuario;
        user.username = this.username;
        user.autenticado = true;
        user.permisos = this.gruposAD;
        this.obtenerGruposAD(user);
      } else{
        this.iniciandoSession = false;
        this.mensajeError = "No tiene roles asignados";
        this.mostrarError();
      }
    }
  }

  // <ARMOA005-1819 Dylan Lopez>
  decodeJwt = (token: string) => {
    console.log('decodeJwt');
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  }

  getPermissions = async () => {
    console.log('getPermissions');
    // this.graphMicrosoftService.cargarRoles(this.accessToken).subscribe(
    //   grupos => this.gruposAD = grupos,
    //   error => console.error('Error fetching groups', error)
    // );
    try {
      this.gruposAD = await (await this.graphMicrosoftService.cargarRoles(this.accessToken)).toPromise();
      // console.log('Fetched groups:', this.gruposAD);
    } catch (error) {
      console.error('Error fetching groups', error);
    }
  }

  // public iniciarSession() {
  //   this.iniciandoSession = true;
  //   var mensaje = document.getElementById("error");
  //   mensaje.style.setProperty("display", "none");
  //   this.username = (window.document.getElementsByName("email")[0] as HTMLInputElement).value;
  //   this.pass = (window.document.getElementsByName("Contraseña")[0] as HTMLInputElement).value;

  //   if (this.production) {
  //     this.autenticar();
  //   }
  //   else {
  //     let permi: string[] = ["LAD_MOAAPP_PUERTO_SISTEMA"];
  //     let user = {} as Usuario;
  //     user.username = this.username.split("@")[0].toString();
  //     user.autenticado = true;
  //     user.permisos = permi;
  //     this.obtenerGruposAD(user);
  //   }
  // }

  // autenticar() {
  //   var parametros = new Array();

  //   parametros.push(this.username);
  //   parametros.push(this.pass);
  //   /*   this.autenticarAd.autenticarUsuarioAd(this.username, this.pass).subscribe( */

  //   this.autenticarAd.autenticarUsuarioAd(parametros).subscribe(
  //     (res: Usuario) => {
  //       if (res) {
  //         console.log('========== autenticarUsuario ==========', res);
  //         this.session.clear();
  //         res.autenticado = true;


  //         this.obtenerGruposAD(res);


  //       } else {
  //         this.iniciandoSession = false;
  //         this.messageService.add({ severity: 'error', detail: 'Error al iniciar sesión', summary: 'No se ha encontrado el usuario' })
  //       }
  //     }, error => {
  //       this.iniciandoSession = false;
  //       console.log('========== error ==========');
  //       this.mensajeError = "No se pudo autenticar el usuario";
  //       this.mostrarError();
  //     }

  //   )
  // }
  // </ ARMOA005-1819 Dylan Lopez>

  obtenerGruposAD = (res: Usuario) => {
    console.log('obtenerGruposAD');
    // console.log(' res: ', res);
    var usuario = this.username.split("@")[0].toString();
    // console.log(' usuario: ', usuario);

    this.autenticarAd.ObtenerGruposAD(res.permisos, usuario).subscribe(
      (respuesta: any) => {
        // console.log(' respuesta: ', respuesta);
        if (respuesta.permisos.length > 0) {
          res.permisos = respuesta.permisos;
          this.session.setUser(res);
          this.navigate(res.permisos);
        }
        else {
          this.iniciandoSession = false;
          this.mensajeError = "No tiene permisos para ingresar";
        }
      });
  }

  mostrarError = () => {
    var mensaje = document.getElementById("error");
    mensaje.style.removeProperty("display");
  }

  navigate = (permisos) => {
    console.log('navigate');
    let primerPermiso = permisos.find((p: string) => 
      p == 'Comex_Nominacion_Ver' || 
      p == 'LineUp_Ver' || 
      p == 'Carga_Ver' || 
      p == 'Recibidores_Ver' || 
      p == 'Geolocalizacion_Ver' || 
      p == 'Buque_Ver' || 
      p == 'Coem_Visualizar' || 
      p == 'Caratula_Visualizar');
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
