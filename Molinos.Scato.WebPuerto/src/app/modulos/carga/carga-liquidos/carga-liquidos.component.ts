import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ModuloDeCarga } from '@ScatoModels/modulo-carga';
import { Mail } from '@ScatoModels/mail';
import { Embarque } from '@ScatoModels/embarque';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { Alerta } from '@ScatoModels/alerta';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { AutenticadorService } from '@ScatoServicios/autenticador.service';
import { LineasDeEmbarque } from '@ScatoModels/linea-embarque';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';
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
import { PeriodoCargaComponent } from 'app/shared/componentes/modulos/carga/periodo-carga/periodo-carga.component';
import { PlanillaEmbarqueComponent } from './tableristas/planilla-embarque/planilla-embarque.component';
import { PlanillaTurnoLiquidosComponent } from './tableristas/planilla-turno-liquidos/planilla-turno-liquidos.component';

@Component({
  selector: 'app-carga-liquidos',
  templateUrl: './carga-liquidos.component.html',
  styleUrls: ['./carga-liquidos.component.css']
})

export class CargaLiquidosComponent implements OnInit {
  @Input() datosGrafico: any;
  @Output() hideSpinner = new EventEmitter<boolean>();
  @ViewChild(LineasComponent) lineasComponent: LineasComponent;
  @ViewChild(PeriodoCargaComponent) periodoDeCargaComponent: PeriodoCargaComponent;
  @ViewChild(PlanillaEmbarqueComponent) planillaEmbarqueComponent: PlanillaEmbarqueComponent;
  @ViewChild(PlanillaTurnoLiquidosComponent) planillaTurnoLiquidosComponent:PlanillaEmbarqueComponent;
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
  private user: Usuario;
  estadosBuque = [{id: 1, descripcion: 'PreOperativo'}, 
                  {id: 2, descripcion: 'Cargando'}, 
                  {id: 3, descripcion: 'ControlCalidad'}, 
                  {id: 4, descripcion: 'PostOperativo'}];

  constructor(
    private _procesoService: DatosEmbarquesProcesoService,
    private _tanquesService: EstadoTanquesService,
    private moduloCargaService: ModuloDeCargaService,
    private confirmationDialogService: ConfirmationDialogService,
    private session: SessionService,
    private embarqueService: EmbarqueService,
    private planoDeCargaService: PlanoDeCargaService,
    private alertService: AlertService,
    private _procesoGuardar: ProcesoGuardarService
  ) {
    this.user = this.session.getUser();
  }

  ngOnInit(): void {
    this._procesoService.sendEmbarque.subscribe(
      res => this.embarqueSelected = res
    )
    if (!this.embarqueSelected)
      this.embarqueSelected = this._procesoService.getEmbarqueSelected();
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

  initFormulario() {
    this.embarqueService.obtenerEmbarque(this.embarqueSelected.id).subscribe(
      res => {
        this.embarque = res;
        // this.mostrarTableristaOperando = res.estadoBuque.descripcion == "Operando";
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
      if (resp.moduloDeCargaPeriodoDeCarga){
        // console.log('resp.moduloDeCargaPeriodoDeCarga[0]: ', resp.moduloDeCargaPeriodoDeCarga[0]);
        if(!resp.moduloDeCargaPeriodoDeCarga[0])
          return
        else
          this.periodoDeCargaComponent.updatePeriodoCarga(resp.moduloDeCargaPeriodoDeCarga[0]);
      }
    });
  }

  imprimir(imprimir: boolean = false) {
    this.lineasComponent.expandir();
    this.planillaEmbarqueComponent.expandir();
    this.planillaTurnoLiquidosComponent.expandir();
    this.cargaPdf = true;
    let doc: jspdf = new jspdf('l', 'mm', 'a4', true);
    html2canvas(document.getElementById('lineas-embarque-print'), { backgroundColor: '#fff' }).then((canvas) => {
      canvas.style.backgroundColor = 'white';
      let img = canvas.toDataURL('image/jpg');
      doc.addImage(img, 'JPG', 15, 15, 260, 160);
      html2canvas(document.getElementById('planilla-embarque'), { backgroundColor: '#fff' }).then((canvas2) => {
        doc.addPage('a4', 'l')
        canvas.style.backgroundColor = 'white';
        let img2 = canvas2.toDataURL('image/jpg');
        doc.addImage(img2, 'JPG', 15, 15, 270, 130);
        html2canvas(document.getElementById('turno-liquidos'), { backgroundColor: '#fff' }).then((canvas3) => {
          doc.addPage('a4', 'l')
          canvas.style.backgroundColor = 'white';
          let img3 = canvas3.toDataURL('image/jpg');
          doc.addImage(img3, 'JPG', 15, 15, 270, 100);
        if (!imprimir) {
          this.cargaPdf = false;
          doc.output('pdfobjectnewwindow');
        } else {
          let file = doc.output('blob');
          this.cargarPDF(file);
        }
      })
    })
  })
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
    //SI LA CARGA YA ESTABA FINALIZADA, Y LE DA GUARDAR, AVISA QUE SE REALIZARON
    //CAMBIOS, POR LO QUE DEBERÍA DARLE FINALIZAR PARA QUE ENVIE EL MAIL
    this.hideSpinner.emit(true);
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

  guardarContinuacion(finalizar: boolean) {
    if (!this.enviado)
      this.enviado = finalizar;

    if (finalizar)
      this.usuarioFinalizacion = this.user.username;
    else
      this.usuarioFinalizacion = null;

    let lineasEmbarque = this.lineasComponent.obtenerLineasEmbarque();
    let periodoCarga = this.periodoDeCargaComponent.obtenerDatosPeriodoCarga();
    let planillaDeEmbarque = this.planillaEmbarqueComponent.obtenerDatosPlanillaDeEmbarque();
    console.log('planillaDeEmbarque -->>');
    console.log(planillaDeEmbarque);
    let moduloCarga = new ModuloDeCarga(this.embarqueSelected.moduloDeCargaId, this.enviado, this.usuarioFinalizacion, null,
      null, null, [this.tanquesValue], lineasEmbarque, [periodoCarga], planillaDeEmbarque);
    // let moduloCarga = new ModuloDeCarga(this.embarqueSelected.moduloDeCargaId, this.enviado, this.usuarioFinalizacion, null,
    //   null, null, [this.tanquesValue], null, [periodoCarga]);
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
      this.hideSpinner.emit(false);
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
    var mail = new Mail(`${this.embarque.nombreBuque}. ${this.embarque.materialesPuertoCantidad[0].descripcionCorta}. Muelle: San Benito. Plano de carga, nominación, adjunto comunicación previa y habilitación de tanques.`);
    mail.adjunto = this.adjunto.split("base64,")[1];
    mail.nombre = "HabilitaciónDeTanques.pdf"
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
                    return
                  }
                  else
                    window.location.reload();
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

  //initFechaHora(){
  //  return this.formBuilder.group({
  //    id: '',
  //    fecha: '',
  //    hora: '',
  //  });
  //}

  //initAmarre(){
  //  return this.formBuilder.group({
  //    id: '',
  //    fecha: '',
  //    hora: '',
  //    viento: '',
  //    direccion: ''
  //  });
  //}
}
