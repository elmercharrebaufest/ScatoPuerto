import { formatDate } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { LineupService } from '@ScatoServicios/lineup.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { UbicacionDeBuquePuerto } from '@ScatoModels/ubicacion-de-buque-puerto';
import { MaterialPuertoCantidad } from '@ScatoModels/material-puerto-cantidad';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { Observador } from '@ScatoInterfaces/observador';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { MessageService } from 'primeng/api';
import { SessionService } from '@ScatoServicios/session.service';
import { Usuario } from '@ScatoInterfaces/usuario';
import { TipoArchivoPuerto } from '@ScatoModels/TipoArchivoPuerto';
import { ArchivoPuerto } from '@ScatoModels/ArchivosPuerto';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ErroresGeolocalizacionEmbarqueService } from '@ScatoServicios/errores-geolocalizacion-embarque';
import { EmbarqueSharingService } from '@ScatoServicios/embarque.shared.service';
import * as htmlToImage from 'html-to-image';
import { UbicacionBuquePuerto } from '@ScatoEnums/ubicacion-buque-puerto';
import { ErroresGeolocalizacion } from '@ScatoModels/geolocalizacion/errores-geolocalizacion';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PeriodoDeCarga } from '@ScatoModels/periodo-carga';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
// <ARMOA005-1421 Dylan Lopez>
import { HistoricoEmbarqueLineUpService } from '@ScatoServicios/historicoEmbarqueLineup.service';
import { HistoricoEmbarqueLineUp } from '@ScatoModels/historicoEmbarqueLineup';
// </ ARMOA005-1421 Dylan Lopez>
@Component({
  selector: 'app-lineup-embarque',
  templateUrl: './lineup-embarque.component.html',
  styleUrls: ['./lineup-embarque.component.css']
})
export class LineupEmbarqueComponent implements OnInit {
  @Input() buquesGeolocalizacion;
  @Input() index: number;
  @Input() instanciaWorkflow: any;
  @Input() observador: Observador;
  @Output() showSpinner = new EventEmitter<boolean>();
  @Input() ubicacionDeBuquePuerto: UbicacionDeBuquePuerto[];
  @Input() listadoEmbarques: InstanciaWorkflowPuerto[];
  @Input() listaErroresEmbarques: ErroresGeolocalizacion[];
  @ViewChild('periodoCarga') modalPeriodoCarga: ElementRef;

  acciones: string[];
  listadoUbicacionDeBuquePuerto: string[];
  showMenu = false;
  fechaCarta: string;
  horaCarta: string;
  permisosScato: typeof PermisosScato = PermisosScato;
  posicionesDeLineUps: number[];
  embarquesPuerto: InstanciaWorkflowPuerto[];
  hayBuque = true;
  ListTipoArchivoPuerto: TipoArchivoPuerto[];
  ArchivosPuertoDb: ArchivoPuerto[];
  ArchivosPuerto: ArchivoPuerto[];
  ListFilesToErase: ArchivoPuerto[];
  mensajeBuque: string;
  imagePath: any;
  TipoArchivosDbList: TipoArchivoPuerto[] = [];
  nombreArchivo: TipoArchivoPuerto;
  fileToUpload: any | null = null;
  mostrarSpinnerCaptura: boolean = false;
  colorMapa: string = 'color-text-espera';
  private listaBuquesGeolocalizacion;
  private user: Usuario;
  ruta: string = 'assets/esperaBuque.svg';
  private embarqueSeleccionado:number = 0;

  public formPeriodoCarga: FormGroup;

  constructor(
    private _sanitizer: DomSanitizer,
    private lineUpService: LineupService,
    private workflowService: WorkflowService,
    private router: Router,
    private confirmationDialogService: ConfirmationDialogService,
    private _procesoService: DatosEmbarquesProcesoService,
    private messageService: MessageService,
    private session: SessionService,
    private _modalService: NgbModal,
    private embarqueService: EmbarqueService,
    private erroresGeolocalizacionEmbarqueService: ErroresGeolocalizacionEmbarqueService,
    private embarqueSharingService: EmbarqueSharingService,
    private moduloDeCargaService: ModuloDeCargaService,
    private formBuilder: FormBuilder,
    // <ARMOA005-1421 Dylan Lopez>
    private historicoEmbarqueLineUpService: HistoricoEmbarqueLineUpService
    // </ ARMOA005-1421 Dylan Lopez>
  ) {
    this.user = this.session.getUser();
  }

  ngOnInit(): void {
    if (this.instanciaWorkflow.lineUp.cartaDeSubidaAprobada) {
      this.fechaCarta = formatDate(this.instanciaWorkflow.lineUp.cartaDeSubidaAprobada, 'yyyy-MM-dd', 'es-ar');
      this.horaCarta = formatDate(this.instanciaWorkflow.lineUp.cartaDeSubidaAprobada, 'HH:mm', 'es-ar');
    }

    this.initForm();
    this.cargarBuqueGeolocalizacion(this.instanciaWorkflow.embarque.id);
    this._procesoService.disposeData();

    this.embarquesPuerto = this.observador != null ? 
      this.observador.ListarEmbarques().filter(u => u.embarque.vicentin == this.instanciaWorkflow.embarque.vicentin && 
        u.embarque.noryon == this.instanciaWorkflow.embarque.noryon && 
        u.embarque.sanBenito == this.instanciaWorkflow.embarque.sanBenito && 
        u.embarque.otrosMuelles == this.instanciaWorkflow.embarque.otrosMuelles) : 
      [];
    this.posicionesDeLineUps = Array.from({ length: this.embarquesPuerto.length }, (v, k) => k + 1);
    this.listadoUbicacionDeBuquePuerto = this.ubicacionDeBuquePuerto.map(u => u.nombre);
  }

  private initForm() {
    this.formPeriodoCarga = this.formBuilder.group({
      fechaAmarre: ['', [Validators.required]],
      fechaDesamarre: ['', [Validators.required]],
    });

    const periodoDeCarga = this.instanciaWorkflow.lineUp.moduloDeCarga.moduloDeCargaPeriodoDeCarga[0] as PeriodoDeCarga;
    if (!periodoDeCarga) {
      return;
    }

    const hoy = new Date();
    const horaActual = ('0' + hoy.getHours()).slice(-2) + ":" + ('0' + hoy.getMinutes()).slice(-2);

    const fechaAmarre = formatDate(periodoDeCarga.fechaAmarro || new Date(), 'yyyy-MM-dd', 'es-ar') + 'T' + (periodoDeCarga.horaAmarro || horaActual);
    const fechaDesamarre = formatDate(periodoDeCarga.fechaDesamarro || new Date(), 'yyyy-MM-dd', 'es-ar') + 'T' + (periodoDeCarga.horaDesamarro || horaActual);

    this.formPeriodoCarga.get('fechaAmarre').setValue(fechaAmarre);
    this.formPeriodoCarga.get('fechaDesamarre').setValue(fechaDesamarre);
  }

  counter(i: number) {
    return new Array(i);
  }

  cargarBuqueGeolocalizacion(id: number) {
    this.mensajeBuque = "No se encontro existen datos incorrectos en el buque.";
    this.hayBuque = false;
    const embarquePosicion = this.buquesGeolocalizacion.embarque?.embarquePosicion;
    if (embarquePosicion.length == 0) {
      const errores = this.erroresGeolocalizacionEmbarqueService.obtenerEmbarquesErrores(this.listaErroresEmbarques ,id);
        if (errores != null){
          this.mensajeBuque = errores.mensaje;
          this.hayBuque =  false;
        }else{
          this.mensajeBuque = "No se encontró. Completar IMO";
          this.hayBuque =  false;
        }

    }else{
      this.mensajeBuque = "Ver en el mapa."
      this.hayBuque =  true;
    }
    this.ruta = this.hayBuque ? "assets/verMapa.svg" : "assets/existImo.svg";
    this.colorMapa = this.hayBuque ? 'color-text-mapa' : 'color-text-imo';
  }

  getListaBuquesGeolocalizacion() {
    return this.listaBuquesGeolocalizacion;
  }

  verGeolocalizacion(flagVerGeo: any, embarque_Id: number) {
    if (flagVerGeo) {
      this.router.navigate(['/geolocalizacion'], { queryParams: { embarque_id: embarque_Id, tipo: 'zoom' } });
    }
  }

  public modificarLineUp(campo: string) {
    if (this.hasPermisoLineUp_EditarChecksEmbarque()) {
      switch (campo) {
        case "CartaDeSubidaEnviada": {
          this.instanciaWorkflow.lineUp.cartaDeSubidaEnviada = !this.instanciaWorkflow.lineUp.cartaDeSubidaEnviada;
          break;
        }
        case "CargaEnSap": {
          this.instanciaWorkflow.lineUp.cargaEnSap = !this.instanciaWorkflow.lineUp.cargaEnSap;
          break;
        }
        case "NominacionDePractico": {
          this.instanciaWorkflow.lineUp.nominacionDePractico = !this.instanciaWorkflow.lineUp.nominacionDePractico;
          break;
        }
        case "SeguridadPortuaria": {
          this.instanciaWorkflow.lineUp.seguridadPortuaria = !this.instanciaWorkflow.lineUp.seguridadPortuaria;
          break;
        }
        case "InspeccionSenasa": {
          this.instanciaWorkflow.lineUp.inspeccionSenasa = !this.instanciaWorkflow.lineUp.inspeccionSenasa;
          break;
        }
        case "ControlSenasa": {
          this.instanciaWorkflow.lineUp.controlSenasa = !this.instanciaWorkflow.lineUp.controlSenasa;
          break;
        }
        case "ControlPrivado": {
          this.instanciaWorkflow.lineUp.controlPrivado = !this.instanciaWorkflow.lineUp.controlPrivado;
          break;
        }
        case "Amarrador": {
          this.instanciaWorkflow.lineUp.amarrador = !this.instanciaWorkflow.lineUp.amarrador;
          break;
        }
        case "AgenciaContactada": {
          this.instanciaWorkflow.lineUp.agenciaContactada = !this.instanciaWorkflow.lineUp.agenciaContactada;
          break;
        }
      }
      let lineUpDto = JSON.parse(JSON.stringify(this.instanciaWorkflow.lineUp));
      lineUpDto.moduloDeCarga = null;
      lineUpDto.planoDeCarga = null;
      this.lineUpService.modificarLineUp(lineUpDto).subscribe(res => console.log(res));
    }
  }

  public editarEmbarque() {
    this.router.navigate([`/lineup/alta-embarque/${this.instanciaWorkflow.embarque.id}/lineup`]);
  }

  public armarPlanoCarga() {
    if(this.hasPermisoPDC_Ver())
      this.router.navigate([`/lineup/plano-de-carga/${this.instanciaWorkflow.embarque.id}`]);
    else
      this.showWarning();
  }

  public eliminarEmbarque() {
    this.openConfirmationDialog('¡Atención!', 'Está a punto de eliminar por completo un buque', 'Eliminar buque', 'Cancelar');
  }

  public openConfirmationDialog(titulo: string, texto: string, button1: string = 'OK', button2: string = 'Cancel') {
    this.confirmationDialogService.confirm(titulo, texto, button1, button2).then((confirmed) => {
      if (confirmed) {
        this.showSpinner.emit(true)
        this.workflowService.eliminar(this.instanciaWorkflow.id).subscribe(res => {
          this.showSpinner.emit(false)
          this.confirmationDialogService.confirm('¡Felicitaciones!', 'Ha eliminado con éxito el embarque del buque "' + this.instanciaWorkflow.embarque.nombreBuque + '"', 'Cerrar', '')
            .then((confirmed) => { if (this.observador) this.observador.Actualizar(this); });
        }, errmess => {
          this.confirmationDialogService.confirm('¡Error!', 'Error al eliminar el embarque: ' + <any>errmess.error, 'Cerrar', '', null, null, Tipoalerta.Error);
          this.showSpinner.emit(false)
        });
      }
    }).catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }

  public fechaRecaladaCorrecta() {
    var date = new Date();

    if (!this.instanciaWorkflow.embarque.fechaRecalada) return 'warning';
    if (new Date(this.instanciaWorkflow.embarque.fechaRecalada).getTime() > date.getTime()) return 'success';
    return 'danger';
  }

  public async onSelectAction(accion) {
    this.embarqueSeleccionado = this.instanciaWorkflow.embarque.id;
    if (this.hasPermisoLineUp_EditarUbicacionEmbarque()) {
      accion = this.numeroUbicacionDeBuquePuerto(accion);
      /**Muelle de Carga**/
      if (accion == UbicacionBuquePuerto.MuelleDeCarga) {
        if (this.BarcoEnMuelleActualmente(this.listadoEmbarques)) {
          this.confirmationDialogService.confirm('¡Error!', 'Actualmente ya se encuentra otro buque en muelle', 'Cerrar', '', null, null, Tipoalerta.Error);
          return;
        } else {
          this.mostrarSpinnerCaptura = true;
          this.actualizarUbicacion(accion);
        }
      } else if (accion == UbicacionBuquePuerto.Zarpo) {
        /**Zarpó**/
        // <ARMOA005-1421 Dylan Lopez>
        let lineUpDto = JSON.parse(
          JSON.stringify(this.instanciaWorkflow.lineUp)
        );
        lineUpDto.moduloDeCarga = null;
        lineUpDto.planoDeCarga = null;
        
        this.guardarHistoricoEmbarqueLineUp(lineUpDto);
        // </ ARMOA005-1421 Dylan Lopez>

        this._modalService.open(this.modalPeriodoCarga, { size: 'sm' });
        // Desde el modal se llama a guardarAmarre() al aceptar
      } else {
        this.actualizarUbicacion(accion);
      }
    }
  }

  // <ARMOA005-1421 Dylan Lopez>
  guardarHistoricoEmbarqueLineUp = (lineUpDto: any) => {
    this.embarquesPuerto.forEach((embarquePuerto) => {
      // console.log(embarquePuerto);

      let historicoEmbarqueLineUp: HistoricoEmbarqueLineUp = {
        vaporNombre: embarquePuerto.embarque.nombreBuque,
        actualizado: embarquePuerto.fechaUltimaModificacion?.toString(),
        ubicacion: embarquePuerto.embarque.ubicacion?.toString(),
        cartaSubidaEnviada: embarquePuerto.lineUp.cartaDeSubidaEnviada,
        cartaSubidaAprobada: embarquePuerto.lineUp.cartaDeSubidaAprobada,
        cargaEnSap: embarquePuerto.lineUp.cargaEnSap,
        nominacionDePractico: embarquePuerto.lineUp.nominacionDePractico,
        seguridadPortuaria: embarquePuerto.lineUp.seguridadPortuaria,
        inspeccionSenasa: embarquePuerto.lineUp.inspeccionSenasa,
        controlSenasa: embarquePuerto.lineUp.controlSenasa,
        controlPrivado: embarquePuerto.lineUp.controlPrivado,
        amarrador: embarquePuerto.lineUp.amarrador,
        agenciaContactada: embarquePuerto.lineUp.agenciaContactada,
        fechaRecalada: embarquePuerto.embarque.fechaRecalada?.toString(),
        puertoActual: '',
        observaciones: embarquePuerto.embarque.observaciones,
        materiales: '',
        planoDeCargaEnviado: embarquePuerto.lineUp.planoDeCargaEnviado,
        obligacionCarga: embarquePuerto.embarque.obligacionCarga?.toString(),
        agenteNombre: this.extraeNombre(embarquePuerto.embarque.agencias),
        ataNombre: this.extraeNombre(embarquePuerto.embarque.ata),
        lineUpId: lineUpDto.id,
        embarqueId: this.instanciaWorkflow.embarque.id,
      };

      embarquePuerto.lineUp.planoDeCarga.planoDeCargaBodegas.forEach(
        (planoDeCargaBodega) => {
          historicoEmbarqueLineUp.materiales += `(${planoDeCargaBodega.cantidad}) ${planoDeCargaBodega.materialPuerto.descripcionCorta} <br> `;
        }
      );

      // console.log(historicoEmbarqueLineUp);
      this.historicoEmbarqueLineUpService.crearHistoricoEmbarqueLineUp(historicoEmbarqueLineUp)
        .subscribe((x) => {
          console.log(' HistoricoEmbarqueLineUp Guardado, buque: ', historicoEmbarqueLineUp.vaporNombre);
        });
    });
  }
  // </ ARMOA005-1421 Dylan Lopez>

  actualizarUbicacion(accion) {
    this.instanciaWorkflow.embarque.ubicacion = accion;
    this.instanciaWorkflow.lineUp.ubicacion = accion;
    let lineUpDto = JSON.parse(JSON.stringify(this.instanciaWorkflow.lineUp));
    lineUpDto.moduloDeCarga = null;
    lineUpDto.planoDeCarga = null;
    this.lineUpService.modificarLineUp(lineUpDto).subscribe((x) => {}, 
      (error) => {},
      () => {
        if (this.embarqueSeleccionado > 0 && accion == UbicacionBuquePuerto.MuelleDeCarga)
          this.crearImagenLineUp();
        if (this.observador) 
          this.observador.Actualizar();

        this.mostrarSpinnerCaptura = false;
      });
  }

  private crearImagenLineUp(){

    const divEmbarqueLineUp = document.getElementById('divEmbarqueLineUp');
    let divLineUpAcciones = document.getElementById('listadoAcciones');

    divLineUpAcciones.className += 'ocultar-division';
    divLineUpAcciones.classList.add('ocultar-division')
    let base64data='';
    htmlToImage.toPng(divEmbarqueLineUp, { 
      quality: 0.8, 
      backgroundColor: '#ffffff'}).then(function (url) {
        var img = new Image();
        img.src = url;
        base64data = img.src;
      }).catch(function (error) {
        base64data = '';
      }).finally(() => {
        if (base64data != null || base64data != undefined)
          this.guardarImagenLineUp(base64data);
          divLineUpAcciones.classList.remove('ocultar-division')
        });
  }

  guardarImagenLineUp =(base64data) => {
    const capturaImagenLineUp = {
      embarque_Id : this.instanciaWorkflow.embarque.id,
      filePathImgLineUp : base64data,
    };
    this.embarqueService.guardarCapturaImagenLineUp(capturaImagenLineUp).subscribe(res => console.log(res));
  }

  actualizarOrden(posicion) {
    if (this.hasPermisoLineUp_EditarOrdenEmbarque()) {
        var posicionActual = this.embarquesPuerto.indexOf(this.instanciaWorkflow) + 1;

        if (posicion > posicionActual){
          this.embarquesPuerto[posicionActual - 1].lineUp.orden = posicion + 0.5
        }else{
          this.embarquesPuerto[posicionActual - 1].lineUp.orden = posicion - 0.5
        }

        this.embarquesPuerto = this.embarquesPuerto.sort((a,b) => a.lineUp.orden - b.lineUp.orden);
        let index = 1
        this.embarquesPuerto.forEach(embarquePuerto => {
          embarquePuerto.lineUp.orden = index;
          index += 1;
        });
        let idsYorden: { [key: number]: number; } = {};
        this.embarquesPuerto.forEach( embarquePuerto => {
          idsYorden[embarquePuerto.lineUp.id] = embarquePuerto.lineUp.orden;
        });

        this.instanciaWorkflow.lineUp.orden = posicion;
        this.lineUpService.modificarOrdenLineUp(idsYorden).subscribe(x => {
          if (this.observador) this.observador.Actualizar();
        });
    }
  }

  BarcoEnMuelleActualmente(listado: InstanciaWorkflowPuerto[]): boolean {
    if (!this.instanciaWorkflow.embarque.vicentin && !this.instanciaWorkflow.embarque.otrosMuelles && !this.instanciaWorkflow.embarque.noryon)
      return listado.find(x => x.embarque.ubicacion == 2 && x.embarque.id != this.instanciaWorkflow.embarque.id
        && !x.embarque.vicentin && !x.embarque.otrosMuelles && !x.embarque.noryon) != null;

    else if (this.instanciaWorkflow.embarque.vicentin)
      return listado.find(x => x.embarque.ubicacion == 2 && x.embarque.id != this.instanciaWorkflow.embarque.id
        && x.embarque.vicentin) != null;
    else if (this.instanciaWorkflow.embarque.noryon)
      return listado.find(x => x.embarque.ubicacion == 2 && x.embarque.id != this.instanciaWorkflow.embarque.id
        && x.embarque.noryon) != null;
    else
      return (
        listado.find(
          (x) =>
            x.embarque.ubicacion == 2 &&
            x.embarque.id != this.instanciaWorkflow.embarque.id &&
            x.embarque.otrosMuelles
        ) != null
      );
  }

  public guardarFechaCarta() {
    if (this.hasPermisoLineUp_EditarChecksEmbarque()) {
      // console.log(this.fechaCarta + ' ' + this.horaCarta)
      if (this.fechaCarta && this.horaCarta) {
        this.instanciaWorkflow.lineUp.cartaDeSubidaAprobada = this.fechaCarta + ' ' + this.horaCarta;
        let lineUpDto = JSON.parse(JSON.stringify(this.instanciaWorkflow.lineUp));
        lineUpDto.moduloDeCarga = null;
        lineUpDto.planoDeCarga = null;
        this.lineUpService.modificarLineUp(lineUpDto).subscribe(
          ret => console.log(ret));
      }
    }
  }

  nombreUbicacionDeBuquePuerto(numero): string {
    return numero > 0 &&
      numero != null &&
      this.ubicacionDeBuquePuerto != null &&
      this.ubicacionDeBuquePuerto.find((x) => x.orden == numero) != undefined ? 
      this.ubicacionDeBuquePuerto.find((x) => x.orden == numero).nombre.toString() : 
      '';
  }

  numeroUbicacionDeBuquePuerto(nombre): number {
    return nombre.length > 0 &&
      nombre != null &&
        this.ubicacionDeBuquePuerto != null ? 
        this.ubicacionDeBuquePuerto.find(
            (x) => x.nombre.toLowerCase().trim() == nombre.toLowerCase().trim()
          ).orden : 
        0;
  }

  extraeNombre(objeto): string {
    return objeto != null ? objeto?.nombre?.toString() : '';
  }

  get filteredMaterialList(): MaterialPuertoCantidad[] {
    return this.instanciaWorkflow.embarque.materialesPuertoCantidad.filter(
      (x) => x.cantidad > 0
    );
  }

  colorDelMuelle() {
    return this.instanciaWorkflow.embarque.sanBenito ? 'color-muelle-sanbenito' : 
      this.instanciaWorkflow.embarque.vicentin ? 'color-muelle-vicentin' : 
      this.instanciaWorkflow.embarque.noryon ? 'color-muelle-nouryon' : 
      'color-muelle-otros-muelles';
  }

  public get width() {
    return window.innerWidth;
  }

  showWarning() {
    this.messageService.add({
      severity: 'error', 
      summary: 'Acceso Denegado',
      detail: 'No posee permisos para la acción',
      key: 'access-lineup',
    });
  }

  hasPermisoLineUp_EliminarBuque() {
    return this.user.permisos.find(
      (p) => p === this.permisosScato.LineUp_EliminarBuque
    );
  }

  hasPermisoLineUp_EditarBuque() {
    return this.user.permisos.find(
      (p) => p === this.permisosScato.LineUp_EditarBuque
    );
  }

  hasPermisoLineUp_EditarChecksEmbarque() {
    return this.user.permisos.find(
      (p) => p === this.permisosScato.LineUp_EditarChecksEmbarque
    );
  }

  hasPermisoLineUp_EditarUbicacionEmbarque() {
    return this.user.permisos.find(
      (p) => p === this.permisosScato.LineUp_EditarUbicacionEmbarque
    );
  }

  hasPermisoLineUp_EditarOrdenEmbarque() {
    return this.user.permisos.find(
      (p) => p === this.permisosScato.LineUp_EditarOrdenEmbarque
    );
  }

  hasPermisoPDC_Ver() {
    return this.user.permisos.find((p) => p === this.permisosScato.PDC_Ver);
  }

  hasPermisoLineUp_Adjuntar() {
    return this.user.permisos.find(
      (p) => p === this.permisosScato.LineUp_Adjuntar
    );
  }

  //------------------------------------------------------------------------------------------------------------
  //------------------------------------------Sistema de archivos-----------------------------------------------
  //------------------------------------------------------------------------------------------------------------

  openModalFiles(Modal: any) {
    //embarqueid
    this.initializeModalArchivos();
    this.embarqueService
      .obtenerArchivos(this.instanciaWorkflow.embarque.id)
      .subscribe((res) => (this.ArchivosPuerto = res));
    this.embarqueService.obtenerTipoArchivos().subscribe((res) => {
      this.TipoArchivosDbList = res;
    });

    this._modalService.open(Modal);
  }

  downloadFile(file: ArchivoPuerto) {
    //Me fijo si el archivo a descargar es de alguno de los siguientes formatos.
    if (
      file.archivo.includes('data:image') ||
      file.archivo.includes('openxmlformats') ||
      file.archivo.includes('data:application/pdf') ||
      file.archivo.includes('text/plain')
    ) {
      const linkSource = file.archivo;
      const downloadLink = document.createElement('a');
      downloadLink.href = linkSource;
      downloadLink.download = file.nombreArchivo;
      downloadLink.click();
      //En caso de no ser, le aviso que no se puede descargar.
    } else {
      this.confirmationDialogService.confirm(
        '¡Atención!',
        'El archivo tiene un formato inválido para la acción que desea realizar.',
        'Aceptar',
        '',
        null,
        null,
        Tipoalerta.Warning
      );
    }
  }

  previewFile(Modal: any, file: ArchivoPuerto) {
    if (file.archivo.includes('data:image')) {
      this.convertB64ToImg(file);
      this._modalService.open(Modal);
    } else if (file.archivo.includes('data:application/pdf')) {
      let pdfWindow = window.open('');
      pdfWindow.document.write(
        "<iframe width='100%' height='100%' src='" +
          encodeURI(file.archivo) +
          "'></iframe>"
      );
    } else {
      this.confirmationDialogService.confirm(
        '¡Atención!',
        'El tipo de archivo no se puede mostrar',
        'Aceptar',
        '',
        null,
        null,
        Tipoalerta.Warning
      );
    }
  }

  convertB64ToImg(file: ArchivoPuerto) {
    this.imagePath = this._sanitizer.bypassSecurityTrustResourceUrl(
      file.archivo
    );
  }

  initializeModalArchivos() {
    this.nombreArchivo = null;
  }

  guardarArchivos(){
    this.confirmationDialogService.confirm('¡Atención!', "Estás seguro que deseas guardar los cambios?", 'Aceptar', 'Cerrar', null, null, Tipoalerta.Warning)
    .then((confirmed) => {
      if (confirmed) {
        this.embarqueService.guardarArchivos(this.instanciaWorkflow.embarque.id, this.ArchivosPuerto).subscribe(res => {
          this._modalService.dismissAll();
        })
      }
    })
  }

  eliminarArchivo(reg: ArchivoPuerto) {
    if (reg.id > 0) {
      this.ArchivosPuerto.forEach((element, index) => {
        if (element.id == reg.id) this.ArchivosPuerto.splice(index, 1);
      });
    } else {
      this.ArchivosPuerto.forEach((element, index) => {
        if (element.nombreArchivo == reg.nombreArchivo)
          this.ArchivosPuerto.splice(index, 1);
      });
    }
  }

  handleFileInput(files: any) {
    this.fileToUpload = files.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.fileToUpload);
    reader.onload = () => {
      console.log(reader.result);
    };
  }

  addFileToSave(){
    if(this.fileToUpload == null){
      this.confirmationDialogService.confirm('Atención','No has seleccionado ningún archivo.', 'Cerrar', '', null, null, Tipoalerta.Warning);
      return;
    }

    if(!this.nombreArchivo[0] || this.nombreArchivo[0].tipoArchivo == undefined || this.nombreArchivo[0].tipoArchivo == ""){
      this.confirmationDialogService.confirm('Atención','No has seleccionado un tipo de archivo.', 'Cerrar', '', null, null, Tipoalerta.Warning);
      return;
    }

    if (this.fileToUpload.name  == "" ){
      this.confirmationDialogService.confirm('Atención','El archivo no tiene nombre.', 'Cerrar', '', null, null, Tipoalerta.Warning);
      return;
    }

    if(this.fileToUpload.size >= 5000000){
      this.confirmationDialogService.confirm('Atención','El tamaño del archivo debe ser menor a 5MB.', 'Cerrar', '', null, null, Tipoalerta.Warning);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.fileToUpload);
    reader.onload = () => {
      var file = reader.result.toString();
      if (
        file.includes('data:image') ||
        file.includes('openxmlformats') ||
        file.includes('data:application/pdf') ||
        file.includes('text/plain')
      ) {
          let fileToAdd = new ArchivoPuerto();
          fileToAdd.archivo = file;
          fileToAdd.fecha = new Date;
          fileToAdd.embarque_Id = this.instanciaWorkflow.embarque.id;
          fileToAdd.nombreArchivo = this.fileToUpload.name
          fileToAdd.tipoArchivoPuerto = this.nombreArchivo[0];
          fileToAdd.id = 0;

          this.ArchivosPuerto.push(fileToAdd);
          this.ArchivosPuerto = this.ArchivosPuerto.sort((a,b) => a.id - b.id)
          this.nombreArchivo = null;
          this.fileToUpload = null

      }else{
        this.confirmationDialogService.confirm('Atención','El archivo tiene un formato inválido.', 'Cerrar', '', null, null, Tipoalerta.Warning);
      }
    }
  }
}

//------------------------------------------------------------------------------------------------------------
//------------------------------------------Fin sistema de archivos-------------------------------------------
//------------------------------------------------------------------------------------------------------------
