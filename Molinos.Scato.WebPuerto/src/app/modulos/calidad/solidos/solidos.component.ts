import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
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
import { FormBuilder, FormGroup } from '@angular/forms';
import { formatDate } from '@angular/common';
import { time } from 'console';
import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';
import { PeriodoDeCarga } from '@ScatoModels/periodo-carga';


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
  fechaAmarro: Date;
  horaAmarro: string;
  fechaDesamarro: Date;
  horaDesamarro: string;
  constructor(
    private _builder: FormBuilder,
    private modalService: NgbModal,
    private _procesoService: DatosEmbarquesProcesoService,
    private embarqueService: EmbarqueService,
    private moduloCargaService: ModuloDeCargaService,
    private balanzas78Service: Balanzas78Service,
    private _changeDetector: ChangeDetectorRef,
    private _CalidadSharedService: CalidadSharedService,
    private session: SessionService,) {
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

      if (this.embarqueSelected.moduloDeCargaId) this.cargarModuloCarga();

          // TODO: Evangelino - Se asigna el Modulo de carga para cargar los ritmo de carga
          this.balanzas78Service.setEmbarqueBalanzaCalidad(this.embarqueSelected.moduloDeCargaId);
          this.balanzas78Service.setBalanzadaAgrupada7(this.balanzas78Service.getBalanzada7());
          this.balanzas78Service.setBalanzadaAgrupada8(this.balanzas78Service.getBalanzada8());
          this.balanzas78Service.setBalanzada7Kilos(this.balanzas78Service.getBalanzada7());
          this.balanzas78Service.setBalanzada8Kilos(this.balanzas78Service.getBalanzada8());
    });

    this.hideSpinner.emit(false);
  }

  guardarAmarre()
  {
    // let periodoCargarActualizar= this.listadoEmbarques.find(x=>x.embarque.id = this.embarqueId)['lineUp']['moduloDeCarga']['moduloDeCargaPeriodoDeCarga'][0];
    // periodoCargarActualizar.horaAmarro="";
    // periodoCargarActualizar.fechaAmarro="";
    // periodoCargarActualizar.horaDesamarro="";
    // periodoCargarActualizar.fechaDesamarro="";

    // this.moduloDeCargaService.guardarPeriodoDeCarga(periodoCargarActualizar, this.listadoEmbarques.find(x=>x.embarque.id = this.embarqueId)['lineUp']['moduloDeCarga'].id).subscribe((res: any) => {

  //   });
  }
  cargarHorasDesamarro(amarre)
  {
    var newDate = new Date();
    var horaActual = newDate.getHours() + ":"+newDate.getMinutes();

    amarre.fechaAmarro = this.fechaAmarro? formatDate(this.fechaAmarro, 'yyyy-MM-dd', 'es-ar') : "";
    amarre.horaAmarro = this.horaAmarro=='' ? horaActual : this.horaAmarro ;
    amarre.fechaDesamarro = this.fechaDesamarro? formatDate(this.fechaDesamarro, 'yyyy-MM-dd', 'es-ar') : formatDate(Date.now(), 'yyyy-MM-dd', 'es-ar');
    amarre.horaDesamarro = this.horaDesamarro=='' ?  horaActual : this.horaDesamarro ;

    this.amarreForm.patchValue(amarre);
    if(this.amarreForm.value.fechaAmarro!='')
      this.amarreForm.controls.fechaAmarro.disable();

    if(this.amarreForm.value.horaAmarro!='')
       this.amarreForm.controls.horaAmarro.disable();

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


  cargarModuloCarga() {
    this.moduloCargaService.obtenerModuloDeCarga(this.embarqueSelected.moduloDeCargaId)
      .subscribe(res => {
        this.enviado = res.enviado;
        this.usuarioFinalizacion = res.usuarioFinalizacion;
        this.graficoCarga.limpiarGraficoCarga();
        this.manosComponent.resetForm();
        if(res.moduloDeCargaPeriodoDeCarga.length > 0){
          this.periodoDeCarga=res.moduloDeCargaPeriodoDeCarga[0];
          this.fechaAmarro = res.moduloDeCargaPeriodoDeCarga[0].fechaAmarro;
          this.horaAmarro = res.moduloDeCargaPeriodoDeCarga[0].horaAmarro;
          this.fechaDesamarro = res.moduloDeCargaPeriodoDeCarga[0].fechaDesamarro;
          this.horaDesamarro = res.moduloDeCargaPeriodoDeCarga[0].horaDesamarro;
        }
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
      });
  }

  finalizaCalidad():void{
    this._CalidadSharedService.emitFinalizaEnCalidad(false);
  }
  newFormAmarre(){
    this.amarreForm = this._builder.group({
      fechaAmarro : [{ value: ''}],
      horaAmarro :'',
      fechaDesamarro : [{ value: ''}],
      horaDesamarro : '',
    })
  }

  imprimir(imprimir: boolean = false){
     // #region Imprimir Recibidores Liquido
      this._CalidadSharedService.ocultarBotonesImprimir();

     this.RecibidoresPdf = true;


     let element = document.getElementById('imprimirRecibidoresSolido');
     let opt = {
       margin:       0,
       filename:     'Pantalla Recibidores.pdf',
       image:        { type: 'jpeg', quality: 0.98 },
       html2canvas:  { scale: 3, letterRendering:true},                         //IMPRIMO PANTALLA DE SOLIDOS USANDO LIBRERIA HTML2PDF, SETEANDO
       jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }     // PROPIEDADES Y VALORES DE LA IMPRESION
     };

     html2pdf().from(element).set(opt).outputPdf()
     .then(() => {
       if (!imprimir) this.RecibidoresPdf = false
     }).save();
     // #endregion
  }

	hasPermisoRecibidores_Imprimir() {
    	return this.user.permisos.find(p => p === this.permisosScato.Recibidores_Imprimir);
	}
}
