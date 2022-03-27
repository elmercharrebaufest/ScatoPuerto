import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { GraficoCargaComponent } from './operaciones/grafico-carga/grafico-carga.component';
import { AutenticadorService } from '@ScatoServicios/autenticador.service';
import { SentidoManoDeEmbarque } from '@ScatoModels/sentido-mano-embarque';
import { CeldaManoDeEmbarque } from '@ScatoModels/celda-mano-embarque';
import { ModuloDeCarga } from '@ScatoModels/modulo-carga';
import { Mail } from '@ScatoModels/mail';
import { Embarque } from '@ScatoModels/embarque';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { Alerta } from '@ScatoModels/alerta';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { AlertService } from '@ScatoServicios/alert.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { PlanoDeCargaService } from '@ScatoServicios/plano-de-carga.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { ProcesoGuardarService } from '@ScatoServicios/procesoGuardar.service';
import { ManosComponent } from './operaciones/manos/manos.component';
import { SessionService } from '@ScatoServicios/session.service';
import { Usuario } from '@ScatoInterfaces/usuario';
import { BalanzasComponent } from './tableristas/balanzas/balanzas.component';
// import { BalanzadasAgrupadas } from '@ScatoModels/balanzadas/balanza78';
import { UmapComponent } from './tableristas/umap/umap.component';
import { InicioCargaComponent } from './tableristas/inicio-carga/inicio-carga.component';
// import { ModuloDeCargaBalanzasBack } from '@ScatoModels/balanzadas/balanza';
// import { ListadoTotalBalanzadasBack } from '@ScatoModels/balanzadas/balanza';

@Component({
  selector: 'app-carga-solidos',
  templateUrl: './carga-solidos.component.html',
  styleUrls: ['./carga-solidos.component.css']
})
export class CargaSolidosComponent implements OnInit {
  @Output() hideSpinner = new EventEmitter<boolean>();
  @Output() guardarPlano = new EventEmitter<boolean>();
  @ViewChild(GraficoCargaComponent) graficoCarga: GraficoCargaComponent;
  @ViewChild(ManosComponent) manosComponent: ManosComponent;
  @ViewChild(BalanzasComponent) balanzasComponent: BalanzasComponent;
  @ViewChild(UmapComponent) umapComponent: UmapComponent;
  @ViewChild(InicioCargaComponent) inicioCargaComponent: InicioCargaComponent;

  @Input() cargaComercialIncompleto: boolean;
  
  embarqueSelected: EmbarqueNav;
  sentidosManoDeEmbarque: SentidoManoDeEmbarque[];
  celdasManoDeEmbarque: CeldaManoDeEmbarque[];
  enviado: boolean;
  usuarioFinalizacion: string;
  embarque: Embarque;
  materialesPuerto: MaterialPuerto[];
  adjunto: any;
  cargaPdf: boolean = false;
  // balanzadasEmbarque: ListadoTotalBalanzadasBack[];
  // balanzasEmbarque: BalanzadasAgrupadas[];
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
        if (res.moduloDeCargaUmap.length > 0) {
          this.umapComponent.updateUMAP(res.moduloDeCargaUmap);
        }
        if(res.moduloDeCargaPeriodoDeCarga.length > 0){
          this.umapComponent.updateAmarre(res.moduloDeCargaPeriodoDeCarga[0]);
        }
      });
  }

  imprimir(imprimir: boolean = false) {
    this.graficoCarga.expandir();
    this.manosComponent.expandir();
    this.cargaPdf = true;
    let doc: jspdf = new jspdf('l', 'mm', 'a4', true);

    let textareas: HTMLCollection = document.getElementsByClassName('replaceToDiv');
    while(textareas.length){
      let div = document.createElement('div');
      div.setAttribute("contenteditable","true");
      let text = document.createTextNode((<HTMLInputElement>textareas[0]).value);
      div.appendChild(text);
      textareas[0].replaceWith(div);
  }
  
    html2canvas(document.getElementById('graficoCargaCanva'), { backgroundColor: '#fff' }).then((canvas) => {
      canvas.style.backgroundColor = 'white';
      canvas.style.whiteSpace = 'normal'; 
      let img = canvas.toDataURL('image/jpg');
      doc.addImage(img, 'JPG', 15, 15, 260, 160);
      html2canvas(document.getElementById('manosDeEmbarque'), { backgroundColor: '#fff' }).then((canvas2) => {
        doc.addPage('a4', 'l');
        canvas.style.backgroundColor = 'white';
        canvas2.style.wordBreak = "break-all"
        let img2 = canvas2.toDataURL('image/jpg');
        doc.addImage(img2, 'JPG', 15, 15, 270, 130);

        if (!imprimir) {
          this.cargaPdf = false;
          doc.output('pdfobjectnewwindow');
        } else {
          let file = doc.output('blob');
          this.cargarPDF(file);
        }
      })
    })
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

  guardar(finalizar: boolean) {
    // SI LA CARGA YA ESTABA FINALIZADA, Y LE DA GUARDAR, AVISA QUE SE REALIZARON
    // CAMBIOS, POR LO QUE DEBERÍA DARLE FINALIZAR PARA QUE ENVIE EL MAIL
   alert("guardarSolido");
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
      }
      else
        this.guardarContinuacion(finalizar);
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

    // this.balanzadasEmbarque = this.balanzasComponent.obtenerBalanzadas78();
    // console.log('balanzasEmbarque a guardar: ', this.balanzadasEmbarque);
    console.log('obtenerAmarre: ', this.umapComponent.obtenerAmarre());
    console.log('obtenerUmap: ', this.umapComponent.obtenerUmap());

    let moduloCarga = new ModuloDeCarga(this.embarqueSelected.moduloDeCargaId, this.enviado, this.usuarioFinalizacion, elementosGraficos,
      this.manosComponent.obtenerManosDeEmbarque(), this.manosComponent.obtenerTabiques(), null, null,
      [this.umapComponent.obtenerAmarre()], this.umapComponent.obtenerUmap());

    this.moduloCargaService.guardarModuloDeCarga(moduloCarga).subscribe(res => {
      if (finalizar)
        this.confirmationDialogService.confirm('¡Felicitaciones!', 'Ha cargado con éxito el modulo de Carga', 'Cerrar', '', null, null, Tipoalerta.Success)
          .then(() => {this.imprimir(finalizar)},
            error => {
              this.confirmationDialogService.confirm('¡Error!', 'Error al crear el modulo de carga: ' + <any>error.error, 'Cerrar', '', null, null, Tipoalerta.Error);
            }).catch(() => window.location.reload())
      else {
        this.confirmationDialogService.confirm('¡Felicitaciones!', 'Ha cargado con éxito el modulo de Carga', 'Cerrar', '', null, null, Tipoalerta.Success)
          .then(() => {},
            error => {
              this.confirmationDialogService.confirm('¡Error!', 'Error al crear el modulo de carga: ' + <any>error.error, 'Cerrar', '', null, null, Tipoalerta.Error);
            }).catch(() => window.location.reload())
      }

      this._procesoGuardar.sendGuardar.emit([finalizar, true]);
      this.cargaPdf = true;
    });
  }

  modificarEstadoBuque(estado: string){
    let estadoBuque = this.estadosBuque.find( e => e.descripcion.includes(estado));
    this.embarqueService.actualizarEstadoBuque(this.embarqueSelected.id, estadoBuque.id).subscribe( res => {
      console.log(res);

      let texto = "Se envió a Tableristas correctamente";
      this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Success);
    } );
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
