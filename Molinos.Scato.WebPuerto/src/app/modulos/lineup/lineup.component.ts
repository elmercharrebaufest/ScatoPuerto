import { DatePipe, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Observador } from '@ScatoInterfaces/observador';
import { Usuario } from '@ScatoInterfaces/usuario';
import { Alerta } from '@ScatoModels/alerta';
import { EstadoPuerto } from '@ScatoModels/estado-puerto';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { Mail } from '@ScatoModels/mail';
import { UbicacionDeBuquePuerto } from '@ScatoModels/ubicacion-de-buque-puerto';
import { AlertService } from '@ScatoServicios/alert.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { GeolocalizacionService } from '@ScatoServicios/geolocalizacion.services';
import { LineupService } from '@ScatoServicios/lineup.service';
import { ParametrosService } from '@ScatoServicios/parametros.service';
import { SessionService } from '@ScatoServicios/session.service';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { MessageService } from 'primeng/api';
import { AutenticadorService } from '@ScatoServicios/autenticador.service';

import { EmbarqueSharingService } from '@ScatoServicios/embarque.shared.service';
import { Embarque } from '@ScatoModels/embarque';
import { ErroresGeolocalizacionEmbarqueService } from '@ScatoServicios/errores-geolocalizacion-embarque';
import { EmbarqueGeolocalizacion } from '@ScatoModels/geolocalizacion/errores-geolocalizacion-embarque';
import { ErroresGeolocalizacion } from '@ScatoModels/geolocalizacion/errores-geolocalizacion';

@Component({
  selector: 'app-lineup',
  templateUrl: './lineup.component.html',
  styleUrls: ['./lineup.component.css'],
  providers: [DatePipe]
})
export class LineupComponent implements OnInit, Observador {
  mostrarSpinner: boolean = true;
  mostrarContent: boolean = false;
  mostrarErroresGeolocalizacion: boolean = false;
  listadoEmbarques: InstanciaWorkflowPuerto[] = null;
  sanBenito: InstanciaWorkflowPuerto[];
  sanBenitoCargandoMuelle: InstanciaWorkflowPuerto;
  noryon: InstanciaWorkflowPuerto[];
  vicentin: InstanciaWorkflowPuerto[];
  otrosMuelles: InstanciaWorkflowPuerto[];
  fechaActualizacion: Date;
  mostrarCalendario: boolean = false;
  estadoPuerto: EstadoPuerto;
  isLoading = false;
  permisosScato: typeof PermisosScato = PermisosScato;
  observador: Observador = this;
  estadoCalado: string;
  estadoUbicacion: string;
  estadoAltura: string;
  ubicacionDeBuquePuerto: UbicacionDeBuquePuerto[];
  LogCount: number = 0;
  private user: Usuario;
  estadoVicentinLp: string;
  estadoNoryonLp: string;
  estadoSanBenitoLp: string;
  estadoOtrosLp: string;
  embarqueCapturaLineUp: Embarque;
  listaErroresEmbarques: ErroresGeolocalizacion[];
  listaEmbarquesOcultos: InstanciaWorkflowPuerto[];
  mensajeCantidadEmbarques: string;
  existenEmbarquesOcultos: boolean;
  mostrarEmbarquesOcultos: boolean;
  primerEmbarqueSanBenito: number = 0;
  constructor(
    private workflowService: WorkflowService,
    private alertService: AlertService,
    private router: Router,
    private lineupService: LineupService,
    private confirmationDialogService: ConfirmationDialogService,
    private datepipe: DatePipe,
    private embarqueService: EmbarqueService,
    private _messageService: MessageService,
    private session: SessionService,
    private auth: AutenticadorService,
    private embarqueSharingService: EmbarqueSharingService,
    private geolocalizacionService: GeolocalizacionService

  ) {
    this.auth.renovarAuthUsuario();

    this.user = this.session.getUser()
    this.sanBenito = new Array();
    this.noryon = new Array();
    this.vicentin = new Array();
    this.otrosMuelles = new Array();
    this.cargarEstadoLineUp();

    this.lineupService.dataRecargarListado$.subscribe(recargar => {
      if (recargar!=null && recargar){
        this.mostrarSpinner = true;
        this.cargarWorkflows();
      }
    });

  }

  cargarGeolocalizacionLineUp() {
    this.cargarWorkflows();
  }

  cargarEstadoLineUp() {
    this.embarqueService.obtenerListadoUbicacionDeBuquePuerto().subscribe(res => {
      this.ubicacionDeBuquePuerto = res;
      this.estadoVicentinLp = this.estadoVicentin();
      console.log('estadoVicentinLp ' + this.estadoVicentinLp);
      this.estadoNoryonLp = this.estadoNoryon();
      console.log('estadoNoryonLp ' + this.estadoNoryonLp);
      this.estadoSanBenitoLp = this.estadoSanBenito();
      console.log('estadoSanBenitoLp ' + this.estadoSanBenitoLp);
      this.estadoOtrosLp = this.estadoOtros();
      console.log('estadoOtrosLp ' + this.estadoOtrosLp);
    });
  }


  ngOnInit(): void {
    this.cargarWorkflows(true);
  }

  Actualizar(subject?: any) {
    let actualDate = new Date();
    let function_name = 'Actualizar';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())

    this.cargarWorkflows(true);
    function_name = 'Actualizar - FIN';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())
  }

  ListarEmbarques(): any[] {
    return this.listadoEmbarques;
  }

  mostrarSoloEmbarquesOcultos(){
    this.mostrarEmbarquesOcultos = true;
    this.mostrarSpinner = true;
    this.lineupService.restaurarEmbarquesOcultosLineUp().subscribe(resultado=>{
      this.cargarWorkflows(true);
    });
  }
  private cargarWorkflows(blockUI: boolean = false) {
    console.log('INICIO LINEUP ', new Date())
    this.workflowService.obtenerListado().subscribe(ret => {
      if (this.mostrarEmbarquesOcultos){
        this.mostrarEmbarquesOcultos = false;
        this.listadoEmbarques = ret;
      }else
        this.listadoEmbarques = ret.filter(data=> data.lineUp.ocultar == false);

      this.listaEmbarquesOcultos = ret.filter(data=> data.lineUp.ocultar == true);
      this.mensajeCantidadEmbarques = this.listaEmbarquesOcultos.length > 1 ? `Existen ${this.listaEmbarquesOcultos.length} embarques ocultos` : `Existe ${this.listaEmbarquesOcultos.length} embarque oculto`;
      this.existenEmbarquesOcultos = this.listaEmbarquesOcultos.length > 0 ? true : false;
      this.fechaActualizacion = new Date();
      if (!blockUI) { setTimeout(x => this.cargarWorkflows(), 120000); }
    }, errmess => {
      this.alertService.mostrar(new Alerta(<any>errmess.error, Tipoalerta.Error))
    }, () => {
      this.filtrarMuelles();
      this.mostrarContent = true;
      this.mostrarSpinner = false;
      this.cargarErroresGeolocalizacion();
      console.log('FIN LINEUP ', new Date());
    });
  }

  private cargarErroresGeolocalizacion() {
    let listaEmbarques: EmbarqueGeolocalizacion[] = new Array<EmbarqueGeolocalizacion>();
    this.listadoEmbarques.forEach(item => {
      listaEmbarques.push(new EmbarqueGeolocalizacion(item.embarque.id));
    });
    this.geolocalizacionService.ListarErroresGeolocalizacionPorEmbarque(listaEmbarques).subscribe(errores => {
      this.listaErroresEmbarques = errores;
    }, error => { }, () => {
      this.mostrarErroresGeolocalizacion = true;
    });
  }

  filtrarMuelles() {
    let actualDate = new Date();
    let function_name = 'filtrarMuelles - INICIO';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())

    this.sanBenito = this.listadoEmbarques ? this.listadoEmbarques.filter(i => i.embarque.sanBenito || (!i.embarque.vicentin && !i.embarque.otrosMuelles && !i.embarque.noryon)) : new Array();
    let primerEmbarque = this.sanBenito.filter(x=> x.lineUp.ocultar == false);
    this.primerEmbarqueSanBenito = (primerEmbarque !=null && primerEmbarque.length >0) ? primerEmbarque[0].lineUp.id : 0; 
    this.sanBenitoCargandoMuelle = this.sanBenito.find(m => m.embarque?.estadoBuque?.descripcion.includes('ControlCalidad') || m.embarque?.estadoBuque?.descripcion.includes('Cargando'));
    if (this.sanBenitoCargandoMuelle!=null){
      const esOculto = this.sanBenitoCargandoMuelle.lineUp.ocultar;
      if (!esOculto)
        this.primerEmbarqueSanBenito = 0;
    }
    this.noryon = this.listadoEmbarques ? this.listadoEmbarques.filter(i => i.embarque.noryon) : new Array();
    this.vicentin = this.listadoEmbarques ? this.listadoEmbarques.filter(i => i.embarque.vicentin) : new Array();
    this.otrosMuelles = this.listadoEmbarques ? this.listadoEmbarques.filter(i => i.embarque.otrosMuelles) : new Array();
    let posicion = 0;
    
    if (this.sanBenitoCargandoMuelle!=null || this.sanBenitoCargandoMuelle != undefined){
      let filtroSanBenito = this.sanBenito.filter(x => x.lineUp.id == this.sanBenitoCargandoMuelle.lineUp.id);
      if (filtroSanBenito!=null){
        posicion++;
        filtroSanBenito[0].posicion = posicion;
      }
    }
    this.sanBenito.forEach(item =>{
      if (item.lineUp.id != this.sanBenitoCargandoMuelle?.lineUp?.id){
        posicion++;
        item.posicion = posicion;
      }
    });
    posicion = 0;
    this.noryon.forEach(item =>{ 
      posicion++;
      item.posicion = posicion;
    });
    posicion = 0;
    this.vicentin.forEach(item =>{ 
      posicion++;
      item.posicion = posicion;
    });
    posicion = 0;
    this.otrosMuelles.forEach(item =>{ 
      posicion++;
      item.posicion = posicion;
    });

    function_name = 'filtrarMuelles - FIN';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())
  }

  public altaEmbarque() {
    let actualDate = new Date();
    let function_name = 'altaEmbarque';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())
    if (this.hasPermisoAltaEmbarque()) {
      localStorage.removeItem('embarque');
      this.router.navigate(['/lineup/alta-embarque/0/line-up']);
    } else {
      this._messageService.add({ severity: 'error', summary: 'Acceso Denegado', detail: 'No posee permisos para la acción', key: 'access-lineup' });
    }
    function_name = 'altaEmbarque - FIN';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())

  }

  public exportarEmbarques() {
    let actualDate = new Date();
    let function_name = 'exportarEmbarques';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())

    this.mostrarSpinner = true;
    this.lineupService.exportarEmbarques().subscribe(data => {
      const element = document.createElement('a');
      element.href = URL.createObjectURL(data);
      element.download = "Line Up " + formatDate(new Date(), 'yyyy-MM-dd', 'en') + '.xls';
      document.body.appendChild(element);
      element.click();
      this.mostrarSpinner = false;
    }, error => this.alertService.mostrar(new Alerta(<any>error.error, Tipoalerta.Error)));
    function_name = 'exportarEmbarques - FIN';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())

  }

  public enviarPorMail() {
    let actualDate = new Date();
    let function_name = 'enviarPorMail';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())

    var titulo = "Enviar Line Up por mail";
    var text = "Cuerpo del mail:";
    var mail = new Mail("", this.generarBodyModal());
    this.lineupService.obtenerDestinatariosLineUp().subscribe(x => mail.destinatarios = x);
    var button1 = 'Enviar';
    var button2 = 'Cancelar';
    this.confirmationDialogService.confirm(titulo, text, button1, button2, 'xl', mail, null, null, true).then((confirmed) => {
      if (confirmed) {
        this.mostrarSpinner = true;
        this.lineupService.enviarPorMail(mail).subscribe(data => {
          this.confirmationDialogService.confirm('¡Felicitaciones!', 'Ha enviado con éxito el excel de lineup por mail', 'Cerrar', '');
          this.mostrarSpinner = false;
        }, error => {
          this.alertService.mostrar(new Alerta(<any>error.error, Tipoalerta.Error));
          this.mostrarSpinner = false;
        });
      }
    }).catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }

  // CARACTERES NO IMPRIMIBLES:
  // Enter: (\n -> <br/>)
  // Tabulador: (\t -> &nbsp;&nbsp;&nbsp;&nbsp;)
  // Negrita: (\f -> <b>) (\f\f -> </b>)
  // Subrayado: (\0 -> <u>) (\0\0 -> </u>)
  private generarBodyModal(): string {
    let actualDate = new Date();
    let function_name = 'generarBodyModal';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())

    var fecha = this.datepipe.transform(new Date(), 'dd-MM-yyyy');
    var body = `Adjunto encontrara el archivo de line up generado por el sistema Scato Puerto, creado el dia: ${fecha} por el usuario ${this.user.username}.\n\n`;
    var sanBenito = this.sanBenito;
    sanBenito = sanBenito.filter(x=> x.lineUp.ocultar == false);
    if (sanBenito.length > 0) {
      body += `\f\0- San Benito:\0\0\f\f\n`;
      sanBenito.slice(0, 3).forEach((x, index) => {
        body += `\t\f${index + 1}. ${x.embarque.nombreBuque}\f\f - ${x.embarque.materialesPuertoCantidad.map(e => `${e.cantidad.toLocaleString('es-ar')} ${e.descripcionCorta}`).join(",")} -
      \t\t${x.embarque.observaciones != null ? x.embarque.observaciones.length > 0 ? "Observaciones: " + x.embarque.observaciones + "\n" : "" : ""}`;
      });
    }

    var vicentin = this.vicentin;
    if (vicentin.length > 0) {
      body += `\n\f\0- Vicentin:\0\0\f\f\n`;
      vicentin.slice(0, 3).forEach((x, index) => {
        body += `\t\f${index + 1}. ${x.embarque.nombreBuque}\f\f - ${x.embarque.materialesPuertoCantidad.map(e => `${e.cantidad.toLocaleString('es-ar')} ${e.descripcionCorta}`).join(",")} -
      \t\t${x.embarque.observaciones != null ? x.embarque.observaciones.length > 0 ? "Observaciones: " + x.embarque.observaciones + "\n" : "" : ""}`;
      });
    }

    var noryon = this.noryon;
    if (noryon.length > 0) {
      body += `\n\f\0- Nouryon:\0\0\f\f\n`;
      noryon.slice(0, 3).forEach((x, index) => {
        body += `\t\f${index + 1}. ${x.embarque.nombreBuque}\f\f - ${x.embarque.materialesPuertoCantidad.map(e => `${e.cantidad.toLocaleString('es-ar')} ${e.descripcionCorta}`).join(",")} -
      \t\t${x.embarque.observaciones != null ? x.embarque.observaciones.length > 0 ? "Observaciones: " + x.embarque.observaciones + "\n" : "" : ""}`;
      });
    }

    var otrosM = this.otrosMuelles;
    if (otrosM.length > 0) {
      body += `\n\f\0- Otros Muelles:\0\0\f\f\n`;
      otrosM.slice(0, 3).forEach((x, index) => {
        body += `\t\f${index + 1}. ${x.embarque.nombreBuque}\f\f - ${x.embarque.materialesPuertoCantidad.map(e => `${e.cantidad.toLocaleString('es-ar')} ${e.descripcionCorta}`).join(",")} -
      \t\t${x.embarque.observaciones != null ? x.embarque.observaciones.length > 0 ? "Observaciones: " + x.embarque.observaciones + "\n" : "" : ""}`;
      });
    }

    return body;
  }

  public cambiarVista() {
    let actualDate = new Date();
    let function_name = 'cambiarVista';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())

    this.mostrarCalendario = !this.mostrarCalendario;
  }

  public cambiarGeolocalizacion() {
    let actualDate = new Date();
    let function_name = 'cambiarGeolocalizacion';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())

    this.router.navigate(['geolocalizacion']);
  }

  estadoSanBenito() {
    let actualDate = new Date();
    let function_name = 'estadoSanBenito';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())

    let ubicacion = this.ubicacionDeBuquePuerto ? this.ubicacionDeBuquePuerto.find(x => x.orden == 2).id : '';
    return this.sanBenito && this.sanBenito.find(m => m.embarque.ubicacion == ubicacion) ? 'Operando' : 'No Operando';
  }

  estadoVicentin() {
    let actualDate = new Date();
    let function_name = 'estadoVicentin';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())

    let ubicacion = this.ubicacionDeBuquePuerto.find(x => x.orden == 2).id;
    return this.vicentin && this.vicentin.find(m => m.embarque.ubicacion == ubicacion) ? 'Operando' : 'No Operando';
  }

  estadoNoryon() {
    let actualDate = new Date();
    let function_name = 'estadoNoryon';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())

    let ubicacion = this.ubicacionDeBuquePuerto.find(x => x.orden == 2).id;
    return this.noryon && this.noryon.find(m => m.embarque.ubicacion == ubicacion) ? 'Operando' : 'No Operando';
  }

  estadoOtros() {
    let actualDate = new Date();
    let function_name = 'estadoOtros';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())

    let ubicacion = this.ubicacionDeBuquePuerto.find(x => x.orden == 2).id;
    return this.otrosMuelles && this.otrosMuelles.find(m => m.embarque.ubicacion == ubicacion) ? 'Operando' : 'No Operando';
  }

  showSpinner(event) {
    this.mostrarSpinner = event;
  }

  goVicentin() {
    let actualDate = new Date();
    let function_name = 'goVicentin';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())

    if (document.getElementById('muelleVicentin'))
      document.getElementById('muelleVicentin').scrollIntoView()
  }

  goNouryon() {
    let actualDate = new Date();
    let function_name = 'goNouryon';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())

    if (document.getElementById('muelleNouryon'))
      document.getElementById('muelleNouryon').scrollIntoView()
  }

  goOtrosMuelles() {
    let actualDate = new Date();
    let function_name = 'goOtrosMuelles';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" + actualDate.getUTCMinutes() + ":" + actualDate.getUTCSeconds() + "." + actualDate.getUTCMilliseconds())

    if (document.getElementById('muelleOtrosMuelles'))
      document.getElementById('muelleOtrosMuelles').scrollIntoView()
  }

  hasPermisoAltaEmbarque() {
    return this.user.permisos.find(p => p === this.permisosScato.LineUp_AltaEmbarque);
  }
  hasPermisoVerCalendario() {
    return this.user.permisos.find(p => p === this.permisosScato.LineUp_VerCalendario);
  }
  hasPermisoVerGeo() {
    return this.user.permisos.find(p => p === this.permisosScato.LineUp_VerGeo);
  }
  hasPermisoMail() {
    return this.user.permisos.find(p => p === this.permisosScato.LineUp_EnviarMail);
  }
  hasPermisoExcel() {
    return this.user.permisos.find(p => p === this.permisosScato.LineUp_Exportar);
  }

}
