import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ModuloDeCarga } from '@ScatoModels/modulo-carga';
import { Mail } from '@ScatoModels/mail';
import { Embarque } from '@ScatoModels/embarque';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { Alerta } from '@ScatoModels/alerta';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { LineasDeEmbarque } from '@ScatoModels/linea-embarque';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { LineasComponent } from './operaciones/lineas/lineas.component';
import { AlertService } from '@ScatoServicios/alert.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EstadoTanquesService } from '@ScatoServicios/estado-tanques.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { PlanoDeCargaService } from '@ScatoServicios/plano-de-carga.service';
import { ProcesoGuardarService } from '@ScatoServicios/procesoGuardar.service';
import { SessionService } from '@ScatoServicios/session.service';
import { Usuario } from '@ScatoInterfaces/usuario';
import { PlanillaEmbarqueComponent } from './tableristas/planilla-embarque/planilla-embarque.component';
import { TanquesComponent } from './operaciones/tanques/tanques.component';
import * as html2pdf from 'html2pdf.js';
import { PlanillaTurnoLiquidosComponent } from './tableristas/planilla-turno-liquidos/planilla-turno-liquidos.component';
import { GraficosRitmosComponent } from 'app/shared/componentes/modulos/carga/graficos-ritmos/graficos-ritmos.component';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { BuqueService } from '@ScatoServicios/buque.service';
import { take, takeUntil } from 'rxjs/operators';
import { AmarreNuevoComponent } from 'app/shared/componentes/modulos/carga/amarre-nuevo/amarre-nuevo.component';
import { ModuloNotificacion, SignalRService } from '@ScatoServicios/signal-r.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-carga-liquidos',
  templateUrl: './carga-liquidos.component.html',
  styleUrls: ['./carga-liquidos.component.css']
})

export class CargaLiquidosComponent implements OnInit, OnDestroy {

  @Input() datosGrafico: any;
  @Output() hideSpinner = new EventEmitter<boolean>();
  @Output() recargar = new EventEmitter<boolean>();
  @ViewChild(LineasComponent) lineasComponent: LineasComponent;
  @ViewChild(AmarreNuevoComponent) amarreComponent: AmarreNuevoComponent;
  @ViewChild(PlanillaEmbarqueComponent) planillaEmbarqueComponent: PlanillaEmbarqueComponent;
  @ViewChild(TanquesComponent) tanquesComponent: TanquesComponent;
  @ViewChild(PlanillaTurnoLiquidosComponent) planillaTurnoLiquidosComponent: PlanillaTurnoLiquidosComponent;
  @ViewChild(GraficosRitmosComponent) graficosRitmosComponent: GraficosRitmosComponent;

  datatanks: any;
  enviado: boolean;
  usuarioFinalizacion: string;
  embarque: Embarque;
  materialesPuerto: MaterialPuerto[];
  adjunto: any;
  embarqueSelected: EmbarqueNav;
  tanquesValue: any;
  lineasEmbarque: LineasDeEmbarque[];
  cargaPdf: boolean = false;
  mostrarTableristaOperando = true;
  estaGuardando: boolean;
  tanquesSeleccionados: any;
  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;
  estadosBuque = [{ id: 1, descripcion: 'PreOperativo' },
  { id: 2, descripcion: 'Cargando' },
  { id: 3, descripcion: 'ControlCalidad' },
  { id: 4, descripcion: 'PostOperativo' }];
  private gruposNotificacion: ModuloNotificacion[] = ['planoCarga', 'moduloCarga', 'periodoCarga', 'lineasEmbarque', 'planillaEmbarque', 'turnosLiquidos'];
  private destroy$ = new Subject();

  constructor(
    private _procesoService: DatosEmbarquesProcesoService,
    private _tanquesService: EstadoTanquesService,
    private moduloCargaService: ModuloDeCargaService,
    private confirmationDialogService: ConfirmationDialogService,
    private session: SessionService,
    private embarqueService: EmbarqueService,
    private planoDeCargaService: PlanoDeCargaService,
    private alertService: AlertService,
    private _procesoGuardar: ProcesoGuardarService,
    private _buqueService: BuqueService,
    private signalr: SignalRService,
    private elem: ElementRef,
    private _changeDetector: ChangeDetectorRef
  ) {
    this.user = this.session.getUser();
    this.moduloCargaService.actualizarPlanillaLiquido.subscribe(data => {
      if (data) {
        this.obtenerModuloDeCarga();
      }
    });

  }

  ngOnInit(): void {
    this._procesoService.sendEmbarque.subscribe(
      res => this.embarqueSelected = res
    )
    if (!this.embarqueSelected) {
      this.embarqueSelected = this._procesoService.getEmbarqueSelected();
      this.suscribirNotificaciones();
    }
    this._tanquesService.sendData.subscribe(
      res => {
        this.tanquesValue = res.getRawValue();
        let tanks = new Array();
        for (var [key, value] of Object.entries(res.value)) {
          let tank = { [key]: value, value: key.substr(6) }
          tanks.push(tank);
        }
        this.datatanks = tanks;
      }
    )
    this.initFormulario();
    this.obtenerModuloDeCarga();
  }

  ngOnDestroy(): void {
    this.desuscribirNotificaciones();
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  private suscribirNotificaciones() {
    const moduloDeCargaId = this.embarqueSelected.moduloDeCargaId;
    for (const modulo of this.gruposNotificacion) {
      this.signalr.suscribirAGrupo(modulo, moduloDeCargaId);
    }
    this.signalr.notif$.pipe(takeUntil(this.destroy$)).subscribe(notif => this.signalr.alertar(notif));
  }

  private desuscribirNotificaciones() {
    const moduloDeCargaId = this.embarqueSelected.moduloDeCargaId;
    for (const modulo of this.gruposNotificacion) {
      this.signalr.desuscribirDeGrupo(modulo, moduloDeCargaId);
    }
  }

  initFormulario() {

    this.embarqueService.obtenerEmbarque(this.embarqueSelected.id).subscribe(
      res => {
        this.embarque = res;

        // this.mostrarTableristaOperando = res.estadoBuque.descripcion == "Operando";
        //Lo dejo como PreOperativo si no trae estado.

        let estado = res.estadoBuque ? res.estadoBuque.descripcion.trim() : "PreOperativo";
        this.mostrarTableristaOperando = (estado != "PreOperativo")

        this.materialesPuerto = res.materialesPuertoCantidad.map(m => ({
          id: m.materialId,
          descripcionCorta: m.descripcionCorta,
          descripcion: '',
          almacenDesc: '',
          almacenId: 0,
          codigoSAP: '',
          esLiquido: m.esLiquido,
          color: m.color
        }));
      });
    this.hideSpinner.emit(false);
  }

  obtenerModuloDeCarga() {
    this.moduloCargaService.obtenerModuloDeCarga(this.embarqueSelected.moduloDeCargaId).subscribe(resp => {
      this.enviado = resp.enviado;
      localStorage.setItem("desabilitar", "");
      if (this.enviado) {
        if (this.planillaTurnoLiquidosComponent!=null && this.planillaTurnoLiquidosComponent!=undefined)
          this.planillaTurnoLiquidosComponent.desabilitarTurno();
        localStorage.setItem("desabilitar", "false");
      }
      if (resp.moduloDeCargaPeriodoDeCarga && this.mostrarTableristaOperando && this.amarreComponent) {
        this.amarreComponent.cargarDatos();
      }
    });
  }

  ocultarBotonesParaImpresion() {
    //OBTENGO TODOS LOS BOTONES QUE HAY QUE OCULTAR PARA LA IMPRESION
    // #region ObtenerBotones
    let valueBotonExpTurnosLiquidos = '';
    let botonEnviarTableristas = this.mostrarTableristaOperando == false ? document.getElementById("btn-enviar-a-tablerista") : null;
    let scrollTurnosLiquidos = this.mostrarTableristaOperando == true ? document.getElementById("scroll-bar-turnos-liquidos") : null;
    let scrollValue = this.mostrarTableristaOperando == true && scrollTurnosLiquidos.style.height;
    let botonAgregarTurnosLiquidos = this.mostrarTableristaOperando == true ? document.getElementById("btn-agregar-turnos-liquidos") : null;

    let botonTurnoEnviadoLiquidos = this.mostrarTableristaOperando == true ? document.getElementById("btn-turno-enviado-liquidos") : null;
    let botonExportarTurnoLiquidos = this.mostrarTableristaOperando == true ? document.getElementById("btn-exportar-planilla-liquidos") : null;
    if (botonExportarTurnoLiquidos != null) valueBotonExpTurnosLiquidos = botonExportarTurnoLiquidos.style.display;
    let btonConformacionLineasEmbarque = document.getElementById("guardar-conformacion-lineas-embarque");
    let valueGuardarLieasEmbarque = btonConformacionLineasEmbarque.style.display
    let iconosRelojes = document.getElementsByName('relojPeriodo');
    //Botones que siempre tienen que estar ocultos.
    let guardarPeriodoDeCarga = document.getElementById("guardarPeriodoDeCarga");
    let collapse = this.elem.nativeElement.querySelectorAll("#ocultarCollapse");
    let agregarNuevaFila = document.getElementById("btn-add-container-lineas");
    let guardarPlanillaEmbarque = document.getElementById("guardarPlanillaEmbarque");
    let guardarTurnoLiquido = this.elem.nativeElement.querySelectorAll("#btn-guardar-turno-liquidos");
    let ocultarAgregarLinea = this.elem.nativeElement.querySelectorAll(".ocultarAgregarLinea");
    let ocultarAgregarCorte = this.elem.nativeElement.querySelectorAll(".ocultarAgregarCorte");
    let ocultarEliminarTurno = document.getElementsByClassName("ocultarEliminarTurno");
    let enviarTurnoARecibidor = this.elem.nativeElement.querySelectorAll("#btn-turno-enviado-liquidos");
    let IconoTotalABordo = this.elem.nativeElement.querySelectorAll(".img-tn");
    let totalABordo = document.getElementById("totalABordo");
    let eliminarLineas = this.elem.nativeElement.querySelectorAll(".ocultarEliminarFila");
    let tablaTurno = this.elem.nativeElement.querySelectorAll(".turnos");
    let eliminarLineasDeEmbarque = this.elem.nativeElement.querySelectorAll(".btn-eliminar");
    let ocultarPdf = this.elem.nativeElement.querySelectorAll(".ocultarPdf");
    let selects = this.elem.nativeElement.querySelectorAll(".seleccionable");
    let selectsLineasEmb = this.elem.nativeElement.querySelectorAll(".custom-select");

    // #endregion


    //UNA VEZ OBTENIDOS LOS BOTONES LOS OCULTOS CAMBIANDO SU DYSPLAY = 'none'
    // #region OcultarBotones

    iconosRelojes.forEach(reloj => reloj.style.display = 'none');

    btonConformacionLineasEmbarque.style.display = 'none';


    if (botonEnviarTableristas != null) botonEnviarTableristas.style.display = 'none';

    if (this.mostrarTableristaOperando == true) {
      if (botonAgregarTurnosLiquidos != null) botonAgregarTurnosLiquidos.style.display = 'none';

      if (botonTurnoEnviadoLiquidos != null) botonTurnoEnviadoLiquidos.style.display = 'none';
      if (botonExportarTurnoLiquidos != null) botonExportarTurnoLiquidos.style.display = 'none';
      if (scrollTurnosLiquidos != null) scrollTurnosLiquidos.style.height = 'auto';

      //Botones que siempre tienen que estar ocultos
      if (guardarPeriodoDeCarga != null) guardarPeriodoDeCarga.style.display = 'none';
      if (agregarNuevaFila != null) agregarNuevaFila.style.display = 'none';
      if (guardarPlanillaEmbarque != null) guardarPlanillaEmbarque.style.display = 'none';
      if (totalABordo != null) totalABordo.style.display = 'none';

      if (tablaTurno != null) {
        for (let i = 0; i < tablaTurno.length; i++) {
          tablaTurno[i].classList.add('borrarBordes');
        }
      }
      this.ocultarCamposEnPDFListas(collapse, "none");
      this.ocultarCamposEnPDFListas(ocultarPdf, "none");
      this.ocultarCamposEnPDFListas(eliminarLineasDeEmbarque, "none");
      this.ocultarCamposEnPDFListas(eliminarLineas, "none");
      this.ocultarCamposEnPDFListas(guardarTurnoLiquido, "none");
      this.ocultarCamposEnPDFListas(ocultarEliminarTurno, "none");
      this.ocultarCamposEnPDFListas(ocultarAgregarLinea, "none");
      this.ocultarCamposEnPDFListas(ocultarAgregarCorte, "none");
      this.ocultarCamposEnPDFListas(enviarTurnoARecibidor, "none");
      this.ocultarCamposEnPDFListas(IconoTotalABordo, "none");
      if (selects != null) {
        for (let i = 0; i < selects.length; i++) {
          selects[i].classList.add('ocultarBackground');
          selects[i].classList.remove('mostrarBackground');
        }
      }

      if(selectsLineasEmb != null){
        for (let i = 0; i < selectsLineasEmb.length; i++) {
          selectsLineasEmb[i].disabled = true;
        }
      }
    }
    // #endregion

    // Arreglo de scroll de lineas de embarque
    let lineas = document.getElementsByClassName('table-responsive-lineas')[0] as HTMLDivElement;
    if(lineas !== undefined){
      lineas.className = '';
      lineas.style.height = "100%";
      lineas.style.width = "100%";
      lineas.style.marginLeft = "-30px";
    }

    let tdFechaIni = document.getElementsByClassName('td-fecha')[0] as HTMLDivElement;
    let tdFechaFin = document.getElementsByClassName('td-fecha')[1] as HTMLDivElement;
    if(tdFechaIni !== undefined){
      tdFechaIni.className = '';
      tdFechaIni.style.maxWidth = "40px";
    }
    if(tdFechaFin !== undefined){
      tdFechaFin.className = '';
      tdFechaFin.style.maxWidth = "40px";
    }

    //SETEO SUS VALORES A COMO ESTABAN, PARA QUE VUELVAN A APARECER
    // #region setValores
    setTimeout(() => {
      iconosRelojes.forEach(reloj => reloj.style.display = 'block');

      btonConformacionLineasEmbarque.style.display = valueGuardarLieasEmbarque;
      if (this.mostrarTableristaOperando == true) {
        if (botonAgregarTurnosLiquidos != null) botonAgregarTurnosLiquidos.style.display = 'block';
        if (botonTurnoEnviadoLiquidos != null) botonTurnoEnviadoLiquidos.style.display = 'block';
        if (botonExportarTurnoLiquidos != null) botonExportarTurnoLiquidos.style.display = valueBotonExpTurnosLiquidos;
        if (scrollTurnosLiquidos != null) scrollTurnosLiquidos.style.height = scrollValue;
        //Botones que siempre tienen que estar ocultos
        if (guardarPeriodoDeCarga != null) guardarPeriodoDeCarga.style.display = 'block';
        if (agregarNuevaFila != null) agregarNuevaFila.style.display = 'block';
        if (guardarPlanillaEmbarque != null) guardarPlanillaEmbarque.style.display = 'block';
        if (totalABordo != null) totalABordo.style.display = 'block';
        this.ocultarCamposEnPDFListas(eliminarLineasDeEmbarque, "block");
        this.ocultarCamposEnPDFListas(guardarTurnoLiquido, "block");
        this.ocultarCamposEnPDFListas(ocultarEliminarTurno, "revert");
        this.ocultarCamposEnPDFListas(ocultarAgregarLinea, "block");
        this.ocultarCamposEnPDFListas(ocultarAgregarCorte, "block");
        this.ocultarCamposEnPDFListas(collapse, "block");
        this.ocultarCamposEnPDFListas(enviarTurnoARecibidor, "block");
        this.ocultarCamposEnPDFListas(IconoTotalABordo, "block");
        this.ocultarCamposEnPDFListas(eliminarLineas, "flex");
        this.ocultarCamposEnPDFListas(ocultarPdf, "block");
        if (tablaTurno != null) {
          for (let i = 0; i < tablaTurno.length; i++) {
            tablaTurno[i].classList.add('agregarBordes');
            tablaTurno[i].classList.remove('borrarBordes');
          }
        }

        if (selects != null) {
          for (let i = 0; i < selects.length; i++) {
            selects[i].classList.add("mostrarBackground");
            selects[i].classList.remove("ocultarBackground");
          }
        }

        if (selectsLineasEmb != null) {
          for (let i = 0; i < selectsLineasEmb.length; i++) {
            selectsLineasEmb[i].disabled = false;
          }
        }

        if(lineas != undefined)
          lineas.className = 'table-responsive-lineas';
        if(tdFechaIni != undefined)
          tdFechaIni.className = 'td-fecha';
        if(tdFechaFin != undefined)
          tdFechaFin.className = 'td-fecha';
      }
    }, 5000);
    // #endregion
  }

  imprimir(imprimir: boolean = false, finalizado?: boolean) {
    this.ocultarBotonesParaImpresion();
    this.cargaPdf = true;
    //OBTENGO EL ID DE QUE ESTABLECÍ EN EL HTML
    let element = document.getElementById('imprimirCargaLiquidos');
    let opt = {
      margin: [0.2, 0],
      filename: 'Pantalla Operaciones.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, letterRendering: true },                 //IMPRIMO PANTALLA DE LIQUIDOS USANDO LIBRERIA JS2PDF, SETEANDO
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }     // PROPIEDADES Y VALORES DE LA IMPRESION
    };

    let archivo = html2pdf().from(element).set(opt).outputPdf().then(() => { if (!imprimir) { this.cargaPdf = false; } });

    if (finalizado) {
      let fileBlobParaAdjuntar = archivo.output('blob');
      fileBlobParaAdjuntar.then(() => this.cargarPDF(fileBlobParaAdjuntar._result));
    } else {
      archivo.save();
    }
  }

  cargarPDF(file) {
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.adjunto = reader.result
        this.enviarMail();
      }
    }
  }

  guardar(finalizar: boolean) {

    this.deshabilitarGuardado();

    if (finalizar) {
      if (this.planillaTurnoLiquidosComponent != undefined || this.planillaTurnoLiquidosComponent != null) {
        this.planillaTurnoLiquidosComponent.desabilitarTurno();
      }
    }

    let fechasHorasOK = this.mostrarTableristaOperando ? this.amarreComponent.validarFechas() : false;
    if (!fechasHorasOK && this.mostrarTableristaOperando){
      this.habilitarGuardado();
      return;
    }
    //SI LA CARGA YA ESTABA FINALIZADA, Y LE DA GUARDAR, AVISA QUE SE REALIZARON
    //CAMBIOS, POR LO QUE DEBERIA DARLE FINALIZAR PARA QUE ENVIE EL MAIL
    this.guardarContinuacion(finalizar);
  }

  private habilitarGuardado() {
    this.estaGuardando = false;
    this._changeDetector.detectChanges();
  }

  private deshabilitarGuardado() {
    this.estaGuardando = true;
    this._changeDetector.detectChanges();
  }

  cambiarEstado() {
    this.embarqueService.obtenerEmbarque(this.embarqueSelected.id).subscribe((resp: Embarque) => {
      if (resp.estadoBuque.id < 2) this.modificarEstadoBuque('Cargando');
    });
  }

  mensajeGenerico(text: string) {
    this.confirmationDialogService.confirm("Atención!", text, 'Aceptar', '', null, null, Tipoalerta.Success)
      .then((confirmed) => {
        if (confirmed) console.log('Mensaje: ' + text);
      })
      .catch(() => {
        console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)');
      });
  }

  async guardarContinuacion(finalizar: boolean) {
    if (!this.enviado)
      this.enviado = finalizar;

    if (finalizar)
      this.usuarioFinalizacion = this.user.username;
    else
      this.usuarioFinalizacion = null;

    let planillaDeEmbarque = this.planillaEmbarqueComponent ? this.planillaEmbarqueComponent.obtenerDatosPlanillaDeEmbarque() : null;
    let lineasEmbarque = this.lineasComponent ? this.lineasComponent.obtenerLineasEmbarque() : null;

    if (lineasEmbarque == null) {
      this.confirmationDialogService.confirm('¡Atención!', 'Debe ingrear lineas de embarque para enviar al tablerista.', 'Aceptar', '', null, null, Tipoalerta.Success);
      this.habilitarGuardado();
      return;
    }

    if (planillaDeEmbarque!=null && planillaDeEmbarque!=undefined) {
      if (planillaDeEmbarque.length == 0){
        let msj = "No se puede guardar cuando no se ha ingresado datos a la planilla.";
        if(finalizar)
          msj = msj.replace("guardar", "finalizar");
        this.confirmationDialogService.confirm('¡Atención!', msj, 'Aceptar', '', null, null, Tipoalerta.Success);
        this.habilitarGuardado();
        return;
      }
      if (!this.validarExportadorYPartida(planillaDeEmbarque)) {
        this.confirmationDialogService.confirm('¡Atención!', 'Revise la planilla de embarque, la combinación de Exportador y Partida no se puede repetir.', 'Aceptar', '', null, null, Tipoalerta.Success);
        this.habilitarGuardado();
        return;
      }
    }

    if (this.amarreComponent && !await this.amarreComponent.validarFechas()) {
      this.habilitarGuardado();
      return;
    }

    let moduloCarga = new ModuloDeCarga(this.embarqueSelected.moduloDeCargaId, this.enviado, this.usuarioFinalizacion, null, null, null, [this.tanquesValue], this.lineasComponent ? this.lineasComponent.obtenerLineasEmbarque() : null, null, planillaDeEmbarque, null);

    this._procesoGuardar.sendGuardar.emit([finalizar, true]);

    let ok = await this._procesoGuardar.planoCargaOk.pipe(take(1)).toPromise();
    if (ok) {
      this.guardarModuloDeCarga(finalizar, moduloCarga);
    }
    this.habilitarGuardado();
  }

  async guardarModuloDeCarga(finalizar: boolean, moduloCarga: ModuloDeCarga) {
    try {
      await this.moduloCargaService.guardarModuloDeCarga(moduloCarga).pipe(take(1)).toPromise();
      if (this.amarreComponent) {
        await this.amarreComponent.guardarExterno();
      }
      await this.confirmationDialogService.exito('Ha cargado con éxito el modulo de Carga');
      if (finalizar) {
        this._buqueService.GuardarHistoricoOperador(this.embarqueSelected.id, "Envió a tablerista").subscribe();
        this.cambiarEstado();
        this.imprimir(true, finalizar)
      } else {
        this.cargaPdf = false;
      }
      await this.signalr.enviarNotificacion('moduloCarga', moduloCarga.id);
    } catch (error) {
      console.error(error);
      this.confirmationDialogService.error('Error al guardar el modulo de carga');
    }
  }


  modificarEstadoBuque(estado: string) {
    let estadoBuque = this.estadosBuque.find(e => e.descripcion.includes(estado));
    this.embarqueService.actualizarEstadoBuque(this.embarqueSelected.id, estadoBuque.id).subscribe(res => {

      let texto = "Se envió a Tableristas correctamente";
      this.mostrarTableristaOperando = true;
      this.obtenerModuloDeCarga();
      this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Success);
      // window.location.reload();
    });
  }

  enviarMail() {
    var titulo = "Enviar carga por mail";
    var text = "Cuerpo del mail:";
    var inputTitle = "Destinatarios";
    var mail = new Mail(`${this.embarque.nombreBuque}. ${this.embarque.materialesPuertoCantidad[0].descripcionCorta}. Muelle: San Benito. Plano de carga, nominación, adjunto comunicación previa y habilitación de tanques.`);
    mail.adjunto = this.adjunto.split("base64,")[1];
    mail.nombre = this.embarque.nombreBuque + "planilla de tablerista.pdf"
    this.planoDeCargaService.obtenerBodyPlanoDeCarga(this.embarqueSelected.planoDeCargaId, this.embarque).subscribe(x => { mail.body = x });
    this.planoDeCargaService.obtenerDestinatariosPlanoDeCarga().subscribe(x => mail.destinatarios = x);
    var button1 = 'Enviar';
    var button2 = 'Cancelar';
    this.cargaPdf = false;
    this.confirmationDialogService.confirm(titulo, text, button1, button2, 'xl', mail, null, inputTitle, true)
      .then((confirmed) => {
        if (confirmed) {
          this.hideSpinner.emit(true);
          this.planoDeCargaService.enviarPorMail(mail, this.embarqueSelected.planoDeCargaId).subscribe(
            data => {
              this.confirmationDialogService.confirm('¡Felicitaciones!', 'Ha enviado con éxito el mail con la carga', 'Cerrar', '', null, null, Tipoalerta.Success)
                .then((confirmed) => {
                  if (confirmed) {
                    this.hideSpinner.emit(false)
                    return;
                  }
                  else {
                    window.location.reload();
                  }
                }).catch(() => window.location.reload());
            }, error => {
              this.alertService.mostrar(new Alerta(<any>error.error, Tipoalerta.Error));
              this.hideSpinner.emit(false);
            })
        }
        else
          this.hideSpinner.emit(false);
      })
      .catch(() => {
        console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)');
        this.hideSpinner.emit(false);
      });
  }

  onTanquesSeleccionados(tanques) {
    this.tanquesSeleccionados = tanques;
  }

  recargarGraficoRitmos(recargar: boolean) {
    if (recargar) {
      this.graficosRitmosComponent.ngOnInit();
    }
  }

  hasPermisoPlanoDeCarga_Guardar() {
    return this.user.permisos.find(p => p === this.permisosScato.PlanoDeCarga_Guardar);
  }
  hasPermisoPlanoDeCarga_Finalizar() {
    return this.user.permisos.find(p => p === this.permisosScato.PlanoDeCarga_Finalizar);
  }
  hasPermisoPlanoDeCarga_Imprimir() {
    return this.user.permisos.find(p => p === this.permisosScato.PlanoDeCarga_Imprimir);
  }
  hasPermisoPlanoDeCarga_Cancelar() {
    return this.user.permisos.find(p => p === this.permisosScato.PlanoDeCarga_Cancelar);
  }
  hasPermisoEnviarATablerista() {
    return this.user.permisos.find(p => p === this.permisosScato.Operadores_EnviarATablerista);
  }

  private ocultarCamposEnPDFListas(selector, ocultarMostrar: string) {
    if (selector != null) {
      for (let i = 0; i < selector.length; i++) {
        selector[i].style.display = ocultarMostrar;
      }
    }
  }

  private validarExportadorYPartida(planilla: any[]): boolean {
    for (let i = 0; i <= planilla.length - 1; i++) {
      if (i < planilla.length - 1)
        for (let j = i + 1; j <= planilla.length - 1; j++) {
          if (planilla[i].exportador != null && planilla[i].bodegaParcel != null && planilla[j].exportador != null && planilla[j].bodegaParcel != null) {
            if (planilla[i].exportador.nombre == planilla[j].exportador.nombre && planilla[i].bodegaParcel == planilla[j].bodegaParcel) {
              return false;
            }
          }
        }
    }
    return true;
  }
}
