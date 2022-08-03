import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { forkJoin } from 'rxjs';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';
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
import { AutenticadorService } from '@ScatoServicios/autenticador.service';
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
import { Usuario } from '@ScatoInterfaces/usuario';

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
  mostrarTableristaOperando: boolean = false;
  terminaImprimir: boolean = false;
  
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
    private _procesoGuardar: ProcesoGuardarService
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
        let estado = res.estadoBuque.descripcion.trim();
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
      
    this.drawGraphic();
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

  cargarModuloCarga() {
    this.moduloCargaService.obtenerModuloDeCarga(this.embarqueSelected.moduloDeCargaId)
      .subscribe(res => {

        console.log('obtenerModuloDeCarga: ', res);
        

        this.enviado = res.enviado;
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
        if (res.moduloDeCargaUmap.length > 0 && this.mostrarTableristaOperando) {
          this.umapComponent.updateUMAP(res.moduloDeCargaUmap);
        }
        if(res.moduloDeCargaPeriodoDeCarga.length > 0 && this.mostrarTableristaOperando){
          this.umapComponent.updateAmarre(res.moduloDeCargaPeriodoDeCarga[0]);
        }
      });
  }

  imprimir(imprimir: boolean = false, finalizado?: boolean){
    
    this.ocultarBotonesImpresion();

    if ( this.mostrarTableristaOperando == true && this.inicioCarga == true) {
      document.getElementById('balanza7-scroll').classList.remove('max-5vh');
      document.getElementById('balanza8-scroll').classList.remove('max-5vh');
    }

    this.cargaPdf = true;

    let element = document.getElementById('imprimirCargaSolidos');
    let opt = {
      margin:       [.1, 0],
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
          document.getElementById('balanza7-scroll').classList.add('max-5vh');
          document.getElementById('balanza8-scroll').classList.add('max-5vh');
      }
      this.terminaImprimir = true;
    }
  }

  ocultarBotonesImpresion(){
    let valueBotonTerminarYExportarPLanillasSolidos = '';
    let botonCorteManualBalanzasSolidos = this.mostrarTableristaOperando == true && this.inicioCarga == true ? document.getElementsByName('ocultarImpresionTableristaSolido') : null;
    let botonTerminarYExportarPLanillasSolidos = this.mostrarTableristaOperando == true && this.inicioCarga == true ? document.getElementById('btn-terminar-exportar-planillas') : null;
    if(botonTerminarYExportarPLanillasSolidos != null) valueBotonTerminarYExportarPLanillasSolidos = botonTerminarYExportarPLanillasSolidos.style.display;
    if(botonTerminarYExportarPLanillasSolidos != null) botonTerminarYExportarPLanillasSolidos.style.display = 'none';
    if(botonCorteManualBalanzasSolidos != null) botonCorteManualBalanzasSolidos.forEach(btns => btns.style.display = 'none');
      
    setTimeout(() => {
      if(this.mostrarTableristaOperando == true && this.inicioCarga == true) {
        if(botonCorteManualBalanzasSolidos != null) botonCorteManualBalanzasSolidos.forEach(btns => btns.style.display = 'block');
        if(botonTerminarYExportarPLanillasSolidos != null) botonTerminarYExportarPLanillasSolidos.style.display = valueBotonTerminarYExportarPLanillasSolidos;
      }

      if(botonTerminarYExportarPLanillasSolidos != null) botonTerminarYExportarPLanillasSolidos.style.display = 'none';
    },6500);
  }


  guardar(finalizar: boolean) {
    // SI LA CARGA YA ESTABA FINALIZADA, Y LE DA GUARDAR, AVISA QUE SE REALIZARON
    // CAMBIOS, POR LO QUE DEBERÍA DARLE FINALIZAR PARA QUE ENVIE EL MAIL
    if( this.cargaComercialIncompleto ){
      let texto = "Por favor, verificar que los datos de la Carga Comercial esten completos.";

      this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Success)
        .then((confirmed) => {
          if (confirmed) return;
        }).catch(() => window.location.reload());
    } else {

      if (this.enviado && !finalizar) {
        var texto = "Se ha modificado con éxito la carga. Si desea informar los cambios, haga click en FINALIZAR.";
        this.confirmationDialogService.confirm('¡Atención!', texto, 'Cerrar', '', null, null, Tipoalerta.Success)
          .then((confirmed) => {
            if (confirmed)
              this.guardarContinuacion(finalizar);
            else
              return;
          }).catch(() => window.location.reload());
      } else {
        this.guardarContinuacion(finalizar);

        if(finalizar){
          this.embarqueService.obtenerEmbarque(this.embarqueSelected.id).subscribe( (resp: Embarque) => {
            if(resp.estadoBuque.id<2) this.modificarEstadoBuque('Cargando');
          });
        }
      }
    }
  }

  guardarContinuacion(finalizar: boolean) {
    if (!this.enviado)
      this.enviado = finalizar;

    if (finalizar)
      this.usuarioFinalizacion = this.user.username;
    else
      this.usuarioFinalizacion = null;

    let elementosGraficos = this.graficoCarga.obtenerElementosGraficos();

    let moduloCarga = new ModuloDeCarga(this.embarqueSelected.moduloDeCargaId, this.enviado, this.usuarioFinalizacion, elementosGraficos,
      this.manosComponent.obtenerManosDeEmbarque(), this.manosComponent.obtenerTabiques(), null, null,
      this.umapComponent ? [this.umapComponent.obtenerAmarre()] : null, null, this.umapComponent ? this.umapComponent.obtenerUmap() : null);

    this.moduloCargaService.guardarModuloDeCarga(moduloCarga).subscribe(res => {
      if (finalizar)
        this.confirmationDialogService.confirm('¡Felicitaciones!', 'Ha cargado con éxito el modulo de Carga', 'Cerrar', '', null, null, Tipoalerta.Success)
          .then(() => {this.imprimir(true, finalizar)},
            error => {
              this.confirmationDialogService.confirm('¡Error!', 'Error al crear el modulo de carga: ' + <any>error.error, 'Cerrar', '', null, null, Tipoalerta.Error);
            }).catch(() => window.location.reload())
      else {
        this.confirmationDialogService.confirm('¡Felicitaciones!', 'Ha cargado con éxito el modulo de Carga', 'Cerrar', '', null, null, Tipoalerta.Success)
          .then(() => {},
            error => {
              this.confirmationDialogService.confirm('¡Error!', 'Error al crear el modulo de carga: ' + <any>error.error, 'Cerrar', '', null, null, Tipoalerta.Error);
            }).catch(() => window.location.reload());

        this.cargaPdf = false;
      }

      this._procesoGuardar.sendGuardar.emit([finalizar, true]);
    });
  }

  modificarEstadoBuque(estado: string){
    let estadoBuque = this.estadosBuque.find( e => e.descripcion.includes(estado));
    this.embarqueService.actualizarEstadoBuque(this.embarqueSelected.id, estadoBuque.id).subscribe( res => {
      console.log(res);

      let texto = "Se envió a Tableristas correctamente";
      this.mostrarTableristaOperando = true;
      this.cargarModuloCarga();

      this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Success);
    } );
  }
  
  obtenerInicioCarga(inicioCarga){
    this.inicioCarga = inicioCarga;
  }

  enviarMail() {
    var titulo = "Enviar carga por mail";
    var text = "Cuerpo del mail:";
    var inputTitle = "Destinatarios";
    var mail = new Mail(`${this.embarque.nombreBuque}. ${this.embarque.materialesPuertoCantidad[0].descripcionCorta}. Muelle: San Benito. Plano de carga, nominación, adjunto comunicación previa y gráfico de celdas.`);
    mail.adjunto = this.adjunto.split("base64,")[1];
    mail.nombre = "GráficoDeCeldas.pdf"
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
        console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)');
        this.hideSpinner.emit(false);
      });
  }
}
