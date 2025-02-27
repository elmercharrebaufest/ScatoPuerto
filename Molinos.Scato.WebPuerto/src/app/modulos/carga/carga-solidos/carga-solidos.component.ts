import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { forkJoin } from 'rxjs';
import * as html2pdf from 'html2pdf.js';

// MODELOS
import { Alerta } from '@ScatoModels/alerta';
import { CeldaManoDeEmbarque } from '@ScatoModels/celda-mano-embarque';
import { Embarque } from '@ScatoModels/embarque';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { Mail } from '@ScatoModels/mail';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { ModuloDeCarga } from '@ScatoModels/modulo-carga';
import { SentidoManoDeEmbarque } from '@ScatoModels/sentido-mano-embarque';
// SERVICIOS
import { AlertService } from '@ScatoServicios/alert.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { PlanoDeCargaService } from '@ScatoServicios/plano-de-carga.service';
import { ProcesoGuardarService } from '@ScatoServicios/procesoGuardar.service';
import { SessionService } from '@ScatoServicios/session.service';
// COMPONENTES
import { BalanzasComponent } from './tableristas/balanzas/balanzas.component';
import { GraficoCargaComponent } from './operaciones/grafico-carga/grafico-carga.component';
import { ManosComponent } from './operaciones/manos/manos.component';
import { NIRComponent } from '../../calidad/solidos/nir/nir.component';
import { UmapComponent } from './tableristas/umap/umap.component';

import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Usuario } from '@ScatoInterfaces/usuario';
import { BuqueService } from '@ScatoServicios/buque.service';
import { InicioCargaComponent } from './tableristas/inicio-carga/inicio-carga.component';
import { FinalizacionCargaComponent } from './tableristas/finalizacion-carga/finalizacion-carga.component';
import { take } from 'rxjs/operators';
import { AmarreNuevoComponent } from 'app/shared/componentes/modulos/carga/amarre-nuevo/amarre-nuevo.component';

@Component({
  selector: 'app-carga-solidos',
  templateUrl: './carga-solidos.component.html',
  styleUrls: ['./carga-solidos.component.css']
})
export class CargaSolidosComponent implements OnInit {
  @Input() cargaComercialIncompleto: boolean;
  @Output() guardarPlano = new EventEmitter<boolean>();
  @Output() hideSpinner = new EventEmitter<boolean>();
  @ViewChild(BalanzasComponent) balanzasComponent: BalanzasComponent;
  @ViewChild(GraficoCargaComponent) graficoCarga: GraficoCargaComponent;
  @ViewChild(ManosComponent) manosComponent: ManosComponent;
  @ViewChild(NIRComponent) nirComponent: NIRComponent;
  @ViewChild(UmapComponent) umapComponent: UmapComponent;
  @ViewChild(AmarreNuevoComponent) amarreComponent: AmarreNuevoComponent;
  // @ViewChild(InicioCargaComponent) inicioCargaComponent: InicioCargaComponent;
  // @ViewChild(FinalizacionCargaComponent) finalizacionCargaComponent: FinalizacionCargaComponent;

  embarqueSelected: EmbarqueNav;
  sentidosManoDeEmbarque: SentidoManoDeEmbarque[];
  celdasManoDeEmbarque: CeldaManoDeEmbarque[];
  enviado: boolean;
  usuarioFinalizacion: string;
  embarque: Embarque;
  materialesPuerto: MaterialPuerto[];
  adjunto: any;
  cargaPdf: boolean = false;
  inicioCarga: boolean = false;
    // <ARMOA005-1988 Dylan Lopez>
  finalizacionCarga: boolean = false;
    // </ ARMOA005-1988 Dylan Lopez>
  ingresoManualSolido: boolean = false;
  existeFechasPeriodoDeCarga: boolean = false;
  moduloDeCarga = null;
  mostrarTableristaOperando: boolean = false;
  terminaImprimir: boolean = false;
  estaGuardando: boolean;
  permisosScato: typeof PermisosScato = PermisosScato;
  private user: Usuario;
  estadosBuque = [{id: 1, descripcion: 'PreOperativo'},
                  {id: 2, descripcion: 'Cargando'},
                  {id: 3, descripcion: 'ControlCalidad'},
                  {id: 4, descripcion: 'PostOperativo'}];

  constructor(
    private moduloCargaService: ModuloDeCargaService,
    private confirmationDialogService: ConfirmationDialogService,
    private session: SessionService,
    private embarqueService: EmbarqueService,
    private planoDeCargaService: PlanoDeCargaService,
    private alertService: AlertService,
    private _procesoService: DatosEmbarquesProcesoService,
    private _changeDetector: ChangeDetectorRef,
    private _procesoGuardar: ProcesoGuardarService,
    private _buqueService: BuqueService,
    private elem: ElementRef
  ) {
    this.user = this.session.getUser();
   }


  ngOnInit(): void {
    this._procesoService.sendEmbarque.subscribe(
      res => {
        this.embarqueSelected = res;
      }
    )
    if (!this.embarqueSelected)
      this.embarqueSelected = this._procesoService.getEmbarqueSelected();

    this.embarqueService.obtenerEmbarque(this.embarqueSelected.id).subscribe(
      res => {
        this.embarque = res;
        let estado = res.estadoBuque?.descripcion.trim();
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
      }, error =>{},
      ()=>{
        this.drawGraphic()
      });
  }

  drawGraphic() {
    forkJoin([
      this.moduloCargaService.obtenerListadoSentidoManoDeEmbarque(),
      this.moduloCargaService.obtenerListadoCeldaManoDeEmbarque()
    ]).subscribe(([res1, res2]) => {
      this.sentidosManoDeEmbarque = res1;
      this.celdasManoDeEmbarque = res2;
      this._changeDetector.detectChanges();
      if (this.embarqueSelected.moduloDeCargaId) this.cargarModuloCarga();
    });

    this.hideSpinner.emit(false);
  }

  agregarTabique(tabique, entreColumna, yColumna) {
    this.graficoCarga.agregarTabique(tabique, entreColumna, yColumna);
  }

  agregarManoDeEmbarque(item) {
    let { celda, sentido } = item;
    this.graficoCarga.agregarManoDeEmbarque(celda, sentido);
  }
  recargarPeriodoDeCarga(event){
    if (event)
      this.cargarModuloCarga();
  }
  cargarModuloCarga() {
    this.moduloCargaService.obtenerModuloDeCarga(this.embarqueSelected.moduloDeCargaId)
      .subscribe(res => {
        this.moduloDeCarga = res;
        this.enviado = res.enviado;
        this.ingresoManualSolido = res.ingresoManualSolido;
        this.usuarioFinalizacion = res.usuarioFinalizacion;
        this.graficoCarga.limpiarGraficoCarga();
        this.manosComponent.resetForm();
        if (res.moduloDeCargaElementoGrafico) {
          this.graficoCarga.agregarElementosGraficos(res.moduloDeCargaElementoGrafico);
        }
        if (res.moduloDeCargaManosDeEmbarque.length > 0) {
          this.manosComponent.patchManosDeEmbarque(res.moduloDeCargaManosDeEmbarque);
        }
        if (res.moduloDeCargaManosDeEmbarque.length > 0) {
          this.manosComponent.patchTabiques(res.moduloDeCargaTabiquesDeEmbarque);
        }
        if (res.moduloDeCargaUmap.length > 0) {
          this.umapComponent.updateUMAP(res.moduloDeCargaUmap);
        }
        if(res.moduloDeCargaPeriodoDeCarga.length > 0){
          let moduloDeCargaPeriodoDeCarga = res.moduloDeCargaPeriodoDeCarga[0];

          if (moduloDeCargaPeriodoDeCarga.fechaComienzoCarga !=null &&
              moduloDeCargaPeriodoDeCarga.horaComienzoCarga !=null){
            this.existeFechasPeriodoDeCarga = true;
          }
          this.umapComponent.updateAmarre(res.moduloDeCargaPeriodoDeCarga[0]);
        }
      });
  }

  imprimir(imprimir: boolean = false, finalizado?: boolean){

    this.cargaPdf = true;

    this.ocultarBotonesImpresion();

    if ( this.mostrarTableristaOperando == true && this.inicioCarga == true) {
      document.getElementById('divBalanza7').classList.remove('max-5vh');
      document.getElementById('divBalanza8').classList.remove('max-5vh');
    }

    let element = document.getElementById('imprimirCargaSolidos');
    let opt = {
      margin:       [0.5, 0],
      filename:     'Pantalla Operaciones.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 3, letterRendering:true},                         //IMPRIMO PANTALLA DE SOLIDOS USANDO LIBRERIA HTML2PDF, SETEANDO
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }     // PROPIEDADES Y VALORES DE LA IMPRESION
    };

    if(finalizado){
      let fileBlobParaAdjuntar = html2pdf().from(element).set(opt).outputPdf()
        .then(() => this.siNoImprime(imprimir) ).output('blob');

      fileBlobParaAdjuntar.then(()=> this.cargarPDF(fileBlobParaAdjuntar._result));
    }else{
      html2pdf().from(element).set(opt).outputPdf()
        .then(() => this.siNoImprime(imprimir) ).save();
    }
  }

  cargarPDF(file) {
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.adjunto = reader.result;
        this.enviarMail();
      }
    }
  }

  siNoImprime(imprimir: boolean = false){
    if (!imprimir){
      this.cargaPdf = false;
      if ( this.mostrarTableristaOperando == true && this.inicioCarga == true) {
          document.getElementById('divBalanza7').classList.add('max-5vh');
          document.getElementById('divBalanza8').classList.add('max-5vh');
      }
      this.terminaImprimir = true;
    }
  }

  ocultarBotonesImpresion(){
    let valueBotonTerminarYExportarPLanillasSolidos = '';
    let botonCorteManualBalanzasSolidos = this.mostrarTableristaOperando == true && this.inicioCarga == true ? document.getElementsByName('ocultarImpresionTableristaSolido') : null;
    if(botonCorteManualBalanzasSolidos != null) botonCorteManualBalanzasSolidos.forEach(btns => btns.style.display = 'none');
    let ocultarBotones = this.elem.nativeElement.querySelectorAll(".ocultarPdf");
    let ocultarCollapse= this.elem.nativeElement.querySelectorAll(".ocultarCollapse");
    let mostrarPdf= this.elem.nativeElement.querySelectorAll(".mostrarPdf");
    this.ocultarExportacion(ocultarBotones);
    this.ocultarExportacion(ocultarCollapse);
    this.ocultarCamposEnPDFListas(mostrarPdf, "block");
    this.ajustarOverflowExportacion();

    setTimeout(() => {
      if(this.mostrarTableristaOperando == true && this.inicioCarga == true) {
        if(botonCorteManualBalanzasSolidos != null) botonCorteManualBalanzasSolidos.forEach(btns => btns.style.display = 'block');
      }

      this.restaurarExportacion(ocultarBotones);
      this.restaurarExportacion(ocultarCollapse);
      this.ocultarCamposEnPDFListas(mostrarPdf, "none");
      this.restaurarOverflowPdf();
    },6500);
  }


  async guardar(finalizar: boolean) {
    // SI LA CARGA YA ESTABA FINALIZADA, Y LE DA GUARDAR, AVISA QUE SE REALIZARON
    // CAMBIOS, POR LO QUE DEBERÍA DARLE FINALIZAR PARA QUE ENVIE EL MAIL
    this.deshabilitarGuardado();

    if (this.cargaComercialIncompleto) {
      let texto = "Por favor, verificar que los datos de la Carga Comercial esten completos.";
      await this.confirmationDialogService.alertar(texto);
      this.habilitarGuardado();
      return;
    }
    if (this.amarreComponent && !await this.amarreComponent.validarFechas()) {
      this.habilitarGuardado();
      return;
    }
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

  async guardarContinuacion(finalizar: boolean) {
    if (!this.enviado)
      this.enviado = finalizar;

    if (finalizar)
      this.usuarioFinalizacion = this.user.username;
    else
      this.usuarioFinalizacion = null;

    let elementosGraficos = this.graficoCarga.obtenerElementosGraficos();

    let moduloCarga = new ModuloDeCarga(this.embarqueSelected.moduloDeCargaId, this.enviado, this.usuarioFinalizacion, elementosGraficos,
      this.manosComponent.obtenerManosDeEmbarque(), this.manosComponent.obtenerTabiques(), null, null,
      null, null, this.umapComponent ? this.umapComponent.obtenerUmap() : null);

    this.actualizarFechaInicioFinCarga(moduloCarga);

    try {
      await this.moduloCargaService.guardarModuloDeCarga(moduloCarga).pipe(take(1)).toPromise();
      if (this.amarreComponent) {
        await this.amarreComponent.guardarExterno();
      }
      console.log('Emitiendo sendGuardar:', finalizar);

      this._procesoGuardar.sendGuardar.emit([finalizar, true]);
      let ok = await this._procesoGuardar.planoCargaOk.pipe(take(1)).toPromise();
      if (!ok) {
        this.habilitarGuardado();
        return;
      }
      if (this.ingresoManualSolido && this.inicioCarga) {
        this._procesoGuardar.sendGuardarCargas.emit();
        ok = await this._procesoGuardar.cargasManualesOk.pipe(take(1)).toPromise();
        if (!ok) {
          this.habilitarGuardado();
          return;
        }
      }
      await this.confirmationDialogService.exito('Ha cargado con éxito el modulo de Carga', '¡Felicitaciones!');
      if (finalizar) {
        this._buqueService.GuardarHistoricoOperador(this.embarqueSelected.id, "Envió a tablerista").subscribe();
        this.cambiarEstado();
        this.imprimir(true, finalizar);
      }
      else {
        this.cargaPdf = false;
        window.location.reload();
      }
      this.habilitarGuardado();
    } catch (error) {
      console.error(error);
      this.habilitarGuardado();
    }
  }

  modificarEstadoBuque(estado: string){
    let estadoBuque = this.estadosBuque.find( e => e.descripcion.includes(estado));
    this.embarqueService.actualizarEstadoBuque(this.embarqueSelected.id, estadoBuque.id).subscribe( res => {
      let texto = "Se envió a Tableristas correctamente";
      this.mostrarTableristaOperando = true;
      this.cargarModuloCarga();
      this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Success);
    } );
  }

  obtenerInicioCarga(inicioCarga){
    console.log('entroooo obtenerInicioCarga');
    this.inicioCarga = inicioCarga;
    this.cargarModuloCarga();
  }

  // <ARMOA005-1988 Dylan Lopez>
  obtenerFinalizacionCarga(finalizacionCarga){
    this.finalizacionCarga = finalizacionCarga;
    this.cargarModuloCarga();
  }
  // </ ARMOA005-1988 Dylan Lopez>

  enviarMail() {
    var titulo = "Enviar carga por mail";
    var text = "Cuerpo del mail:";
    var inputTitle = "Destinatarios";
    var mail = new Mail(`${this.embarque.nombreBuque}. ${this.embarque.materialesPuertoCantidad[0].descripcionCorta}. Muelle: San Benito. Plano de carga, nominación, adjunto comunicación previa y gráfico de celdas.`);
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
                  if (confirmed){
                    this.hideSpinner.emit(false)
                    return
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
        this.hideSpinner.emit(false);
      });
  }

  cambiarEstado() {
    this.embarqueService.obtenerEmbarque(this.embarqueSelected.id).subscribe((resp: Embarque) => {
      if (resp.estadoBuque.id < 2) this.modificarEstadoBuque('Cargando');
    });
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
  hasPermisoTableroSolido_VerRitmosEmbarqueBlzas78() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroSolido_VerRitmosEmbarqueBlzas78);
  }
  hasPermisoTableroSolido_VerCargasBodegas() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroSolido_VerCargasBodegas);
  }
  hasPermisoTableroSolido_VerRitmos() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroSolido_VerRitmos);
  }
  hasPermisoTableroSolido_VerInformacionAdicional() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroSolido_VerInformacionAdicional);
  }

  private ocultarCamposEnPDFListas(selector, ocultarMostrar: string){
    if (selector != null) {
      for (let i = 0; i < selector.length; i++) {
        selector[i].style.display = ocultarMostrar;
      }
    }
  }

  private ocultarExportacion(elementos: HTMLElement[]) {
    for (const elemento of elementos) {
      elemento.classList.add('d-none');
    }
  }

  private restaurarExportacion(elementos: HTMLElement[]) {
    for (const elemento of elementos) {
      elemento.classList.remove('d-none');
    }
  }

  private ajustarOverflowExportacion() {
    const elements: HTMLElement[] = this.elem.nativeElement.querySelectorAll('.overflow-pdf');
    for (const element of elements) {
      element.classList.add('overflow-pdf-exportar');
    }

    const contenedores: HTMLElement[] = this.elem.nativeElement.querySelectorAll('.tabla-cargas-container');
    for (const contenedor of contenedores) {
      contenedor.classList.add('carga-exportar');
    }
  }

  private restaurarOverflowPdf() {
    const elements: HTMLElement[] = this.elem.nativeElement.querySelectorAll('.overflow-pdf');
    for (const element of elements) {
      element.classList.remove('overflow-pdf-exportar');
    }

    const contenedores: HTMLElement[] = this.elem.nativeElement.querySelectorAll('.tabla-cargas-container');
    for (const contenedor of contenedores) {
      contenedor.classList.remove('carga-exportar');
    }
  }

  actualizarFechaInicioFinCarga(modulo: ModuloDeCarga) {
    if (modulo?.moduloDeCargaPeriodoDeCarga != null && modulo?.moduloDeCargaPeriodoDeCarga.length == 1 && this.amarreComponent != null) {
      modulo.moduloDeCargaPeriodoDeCarga[0].fechaComienzoCarga = this.amarreComponent.obtenerFechaInicioCarga();
      modulo.moduloDeCargaPeriodoDeCarga[0].horaComienzoCarga = this.amarreComponent.obtenerHoraInicioCarga();
      modulo.moduloDeCargaPeriodoDeCarga[0].fechaFinalizacionCarga = this.amarreComponent.obtenerFechaFinCarga();
      modulo.moduloDeCargaPeriodoDeCarga[0].horaFinalizacionCarga = this.amarreComponent.obtenerHoraFinCarga();
    }
  }
}
