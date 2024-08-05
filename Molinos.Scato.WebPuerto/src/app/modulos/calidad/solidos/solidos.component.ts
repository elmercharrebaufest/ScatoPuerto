import { ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CeldaManoDeEmbarque } from '@ScatoModels/celda-mano-embarque';
import { Embarque } from '@ScatoModels/embarque';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { SentidoManoDeEmbarque } from '@ScatoModels/sentido-mano-embarque';
import { Balanzas78Service } from '@ScatoServicios/balanzas78.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { GraficoCargaComponent } from 'app/modulos/carga/carga-solidos/operaciones/grafico-carga/grafico-carga.component';
import { ManosComponent } from 'app/modulos/carga/carga-solidos/operaciones/manos/manos.component';
import { forkJoin } from 'rxjs';
import * as html2pdf from 'html2pdf.js';
import { CalidadSharedService } from '@ScatoServicios/calidad-shared.service';
import { Usuario } from '@ScatoInterfaces/usuario';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { SessionService } from '@ScatoServicios/session.service';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { time } from 'console';
import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';
import { PeriodoDeCarga } from '@ScatoModels/periodo-carga';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
// <ARMOA005-1421 Dylan Lopez>
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { HistoricoEmbarqueLineUpService } from '@ScatoServicios/historicoEmbarqueLineup.service';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { HistoricoEmbarqueLineUp } from '@ScatoModels/historicoEmbarqueLineup';
import { ModuloDeCarga } from '@ScatoModels/modulo-carga';
import { TurnosCerrados } from '@ScatoModels/calidad/turnos-cerrados';
import { BalanzasRitmosService } from '@ScatoServicios/calidad/balanzas-ritmos.service';
// </ ARMOA005-1421 Dylan Lopez>

@Component({
  selector: 'app-solidos',
  templateUrl: './solidos.component.html',
  styleUrls: ['./solidos.component.css']
})
export class SolidosComponent implements OnInit {

  @Output() hideSpinner = new EventEmitter<boolean>();
  @ViewChild(GraficoCargaComponent) graficoCarga: GraficoCargaComponent;
  @ViewChild(ManosComponent) manosComponent: ManosComponent;

  public amarreForm: FormGroup;
  embarqueSelected: EmbarqueNav;
  celdasManoDeEmbarque: CeldaManoDeEmbarque[];
  periodoDeCarga: PeriodoDeCarga;
  sentidosManoDeEmbarque: SentidoManoDeEmbarque[];
  embarque: Embarque;
  materialesPuerto: MaterialPuerto[];
  enviado: boolean;
  usuarioFinalizacion: string;
  RecibidoresPdf: boolean = false;
  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;
  errorMessage: boolean = false;
  fechaAmarro: Date = new Date();
  horaAmarro: string = '';
  fechaDesamarro: Date = new Date();
  horaDesamarro: string = '';
  listadoEmbarques: InstanciaWorkflowPuerto[] = null;
  ingresoManualSolido: boolean = false;
  turnosCerradosSolido: boolean = false;
  moduloDeCarga: ModuloDeCarga =null;
  turnosModuloDeCarga: TurnosCerrados = null;
  constructor(
    private _builder: FormBuilder,
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private _procesoService: DatosEmbarquesProcesoService,
    private embarqueService: EmbarqueService,
    private moduloCargaService: ModuloDeCargaService,
    private balanzas78Service: Balanzas78Service,
    private _changeDetector: ChangeDetectorRef,
    private _CalidadSharedService: CalidadSharedService,
    private elem: ElementRef,
    private session: SessionService,
    // <ARMOA005-1421 Dylan Lopez>
    private workflowService: WorkflowService,
    private historicoEmbarqueLineUpService: HistoricoEmbarqueLineUpService,
    private balanzasRitmosService: BalanzasRitmosService
    // </ ARMOA005-1421 Dylan Lopez>
  ) {
    this.user = this.session.getUser();
    this.embarqueSelected = this._procesoService.getEmbarqueSelected();

  }

  ngOnInit(): void {

    this._procesoService.sendEmbarque.subscribe(
      res => {
        this.embarqueSelected = res;
      }
    )
    if (!this.embarqueSelected)
      this.embarqueSelected = this._procesoService.getEmbarqueSelected();
    this.newFormAmarre();
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

      if (this.embarqueSelected.moduloDeCargaId)
        this.cargarModuloCarga();
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
  public openModalCargarAmarre(modal: any) {
    this.cargarHorasDesamarro(this.amarreForm);
    this.errorMessage = false;
    this.modalService.open(modal, { size: 'm', centered: true, backdrop: 'static', keyboard: false });
  }

  recargarModuloDeCarga(event:any){
    if (event)
      this.cargarModuloCarga();
  }

  cargarModuloCarga() {
    this.moduloCargaService.obtenerModuloDeCarga(this.embarqueSelected.moduloDeCargaId)
      .subscribe(res => {
        this.turnosModuloDeCarga = {
          turnosCerrados : false,
          todosTurnosCerrados: false,
          cargaFinalizada : false
        };
        this.moduloDeCarga = res;
        this.enviado = res.enviado;
        this.usuarioFinalizacion = res.usuarioFinalizacion;
        this.graficoCarga.limpiarGraficoCarga();
        this.manosComponent.resetForm();
        this.ingresoManualSolido = res.ingresoManualSolido;
        if (res.moduloDeCargaPlanillaDeTurnos.length > 0){
          let turnos = res.moduloDeCargaPlanillaDeTurnos.filter(x=> x.cerrado == true);
          if (turnos != null && turnos.length > 0)
            this.turnosModuloDeCarga.turnosCerrados = true;
          turnos = res.moduloDeCargaPlanillaDeTurnos.filter(x=> x.cerrado == false);
          if (turnos == null || turnos.length == 0)
            this.turnosModuloDeCarga.todosTurnosCerrados = true;
        }

        if (res.moduloDeCargaPeriodoDeCarga.length > 0) {
          this.periodoDeCarga = res.moduloDeCargaPeriodoDeCarga[0];
          this.fechaAmarro = res.moduloDeCargaPeriodoDeCarga[0].fechaAmarro;
          this.horaAmarro = res.moduloDeCargaPeriodoDeCarga[0].horaAmarro;
          this.fechaDesamarro = res.moduloDeCargaPeriodoDeCarga[0].fechaDesamarro;
          this.horaDesamarro = res.moduloDeCargaPeriodoDeCarga[0].horaDesamarro;
          this.turnosModuloDeCarga.cargaFinalizada = res.moduloDeCargaPeriodoDeCarga[0].fechaFinalizacionCarga!=null? true : false;
        }
        this.balanzasRitmosService.TurnosCalidad = this.turnosModuloDeCarga;
        if (res.moduloDeCargaElementoGrafico) {
          this.graficoCarga.agregarElementosGraficos(res.moduloDeCargaElementoGrafico);
        }
        if (res.moduloDeCargaManosDeEmbarque.length > 0) {
          this.manosComponent.patchManosDeEmbarque(res.moduloDeCargaManosDeEmbarque);
          this._CalidadSharedService.setManosDeEmbarque(res.moduloDeCargaManosDeEmbarque);
        }
        if (res.moduloDeCargaManosDeEmbarque.length > 0) {
          this.manosComponent.patchTabiques(res.moduloDeCargaTabiquesDeEmbarque);
        }
        if (!res.ingresoManualSolido) {
          this.balanzas78Service.setEmbarqueBalanzaCalidad(this.embarqueSelected.moduloDeCargaId);
          this.balanzas78Service.setBalanzadaAgrupada7(this.balanzas78Service.getBalanzada7());
          this.balanzas78Service.setBalanzadaAgrupada8(this.balanzas78Service.getBalanzada8());
          this.balanzas78Service.setBalanzada7Kilos(this.balanzas78Service.getBalanzada7());
          this.balanzas78Service.setBalanzada8Kilos(this.balanzas78Service.getBalanzada8());
        }
      });
  }

  finalizaCalidad(): void {
    this._CalidadSharedService.emitFinalizaEnCalidad(false);
  }


  imprimir(imprimir: boolean = false) {
    // #region Imprimir Recibidores Liquido
    this._CalidadSharedService.ocultarBotonesImprimir();
    let ocultarBotones = this.elem.nativeElement.querySelectorAll(".ocultarPdf");
    this.ocultarCamposEnPDFListas(ocultarBotones, "none");



    this.RecibidoresPdf = true;


    let element = document.getElementById('imprimirRecibidoresSolido');
    let opt = {
      margin: [0.3, 0],
      filename: 'Pantalla Recibidores',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3, letterRendering: true },                         //IMPRIMO PANTALLA DE SOLIDOS USANDO LIBRERIA HTML2PDF, SETEANDO
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
      pagebreak: { after: '.page-break' }
    };


    let ele = Array.from(document.getElementsByClassName('break'));

    // html2pdf().from(element).set(opt).outputPdf()
    // .then(() => {
    // if (!imprimir) this.RecibidoresPdf = false
    //}).save();

    let html = html2pdf()
      .set(opt)
      .from(ele[0]);

    if (ele.length > 1) {
      html = html.toPdf();
      ele.slice(1).forEach((ele, index) => {
        html = html
          .get('pdf')
          .then(pdf => {
            pdf.addPage()
          })
          .from(ele)
          .toContainer()
          .toCanvas()
          .toPdf()
      })
    }

    html = html.then(() => {
      if (!imprimir) this.RecibidoresPdf = false
      this.ocultarCamposEnPDFListas(ocultarBotones, "block");
    }).save();
    // #endregion
  }




  hasPermisoRecibidores_Imprimir() {
    return this.user.permisos.find(p => p === this.permisosScato.Recibidores_Imprimir);
  }
  hasPermisoRecibidores_Finalizar() {
    return this.user.permisos.find(p => p === this.permisosScato.Recibidores_Finalizar);
  }

  /* SECCION GUARDAR FECHA DESAMARRE Y ZARPAR */
  newFormAmarre() {
    this.amarreForm = this._builder.group({
      fechaAmarro: ['', [Validators.required]],
      horaAmarro: ['', [Validators.required]],
      fechaDesamarro: ['', [Validators.required]],
      horaDesamarro: ['', [Validators.required]],
    })
  }

  async guardarAmarre() {
    if (
      (this.amarreForm.value.fechaAmarro == '' || this.amarreForm.value.fechaAmarro == null || this.amarreForm.value.fechaAmarro == undefined) ||
      (this.amarreForm.value.fechaDesamarro == '' || this.amarreForm.value.fechaDesamarro == null || this.amarreForm.value.fechaDesamarro == undefined)
    ) {
      this.confirmationDialogService.confirm('¡Atención!', 'No se ha ingresado la fecha amarró o fecha desamarró.', 'Aceptar', '', null, null, Tipoalerta.Warning)
      return false;
    }
    if (this.amarreForm.value.fechaAmarro > this.amarreForm.value.fechaDesamarro || (this.amarreForm.value.fechaAmarro == this.amarreForm.value.fechaDesamarro &&
      this.amarreForm.value.horaAmarro > this.amarreForm.value.horaDesamarro)) {
      this.confirmationDialogService.confirm('¡Atención!', 'La fecha y hora de Amarro es posterior a la de Desamarro.', 'Aceptar', '', null, null, Tipoalerta.Warning)
    } else {
      // <ARMOA005-1421 Dylan Lopez>
      await this.cargarLineUp();
      await this.guardarHistoricoEmbarqueLineUp(this.embarque.id);
      // </ ARMOA005-1421 Dylan Lopez>

      this.moduloCargaService.obtenerModuloDeCarga(this.embarqueSelected.moduloDeCargaId).subscribe((res: any) => {
        let periodoCargarActualizar = res['moduloDeCargaPeriodoDeCarga'][0];
        periodoCargarActualizar.horaAmarro = this.amarreForm.value.horaAmarro;
        periodoCargarActualizar.fechaAmarro = this.amarreForm.value.fechaAmarro;
        periodoCargarActualizar.horaDesamarro = this.amarreForm.value.horaDesamarro;
        periodoCargarActualizar.fechaDesamarro = this.amarreForm.value.fechaDesamarro;

        this.moduloCargaService.guardarPeriodoDeCarga(periodoCargarActualizar, this.embarqueSelected.moduloDeCargaId).subscribe((res: any) => {
          this.modalService.dismissAll();
          this.finalizaCalidad();
        });
      });
    }
  }

  // <ARMOA005-1421 Dylan Lopez>
  cargarLineUp = async () => {
    const listadoEmbarques = await this.workflowService.obtenerListado().toPromise();
    this.listadoEmbarques = listadoEmbarques;
  }

  guardarHistoricoEmbarqueLineUp = async (embarqueId: number) => {
    try {
      // this.listadoEmbarquesFiltrado.forEach((embarquePuerto) => {
      this.listadoEmbarques.forEach((embarquePuerto) => {
        // console.log(embarquePuerto);

        let lineUpDto = JSON.parse(JSON.stringify(embarquePuerto.lineUp));

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
          embarqueId: embarqueId
        };

        let materiales = '';
        embarquePuerto.lineUp.planoDeCarga.planoDeCargaBodegas.forEach((planoDeCargaBodega) => {
          if (planoDeCargaBodega.materialPuerto) {
            if (planoDeCargaBodega.materialPuerto.descripcionCorta && planoDeCargaBodega.materialPuerto.descripcionCorta != '') {
              materiales += `(${planoDeCargaBodega.cantidad}) ${planoDeCargaBodega.materialPuerto.descripcionCorta} <br> `;
            }
          }
          // historicoEmbarqueLineUp.materiales += `(${planoDeCargaBodega.cantidad}) ${planoDeCargaBodega.materialPuerto.descripcionCorta} <br> `;
        });

        historicoEmbarqueLineUp.materiales = materiales;
        // console.log(historicoEmbarqueLineUp);
        this.historicoEmbarqueLineUpService.crearHistoricoEmbarqueLineUp(historicoEmbarqueLineUp).subscribe(x => {
          console.log(' HistoricoEmbarqueLineUp Guardado, buque: ', historicoEmbarqueLineUp.vaporNombre);
        });
      });
    } catch (err) {
      console.error('Ocurrio un error inesperado: ', err.message);
    }
  }

  extraeNombre(objeto): string {
    return objeto != null ? objeto?.nombre?.toString() : '';
  }
  // </ ARMOA005-1421 Dylan Lopez>

  cargarHorasDesamarro(amarre) {
    var newDate = new Date();
    var horaActual = newDate.getHours() + ":" + newDate.getMinutes();

    amarre.fechaAmarro = this.fechaAmarro ? formatDate(this.fechaAmarro, 'yyyy-MM-dd', 'es-ar') : formatDate(Date.now(), 'yyyy-MM-dd', 'es-ar');
    amarre.horaAmarro = this.horaAmarro == '' ? horaActual : this.horaAmarro;
    amarre.fechaDesamarro = this.fechaDesamarro ? formatDate(this.fechaDesamarro, 'yyyy-MM-dd', 'es-ar') : formatDate(Date.now(), 'yyyy-MM-dd', 'es-ar');
    amarre.horaDesamarro = this.horaDesamarro == '' ? horaActual : this.horaDesamarro;

    this.amarreForm.patchValue(amarre);
  }
  private ocultarCamposEnPDFListas(selector, ocultarMostrar: string) {
    if (selector != null) {
      for (let i = 0; i < selector.length; i++) {
        selector[i].style.display = ocultarMostrar;
      }
    }
  }
}
