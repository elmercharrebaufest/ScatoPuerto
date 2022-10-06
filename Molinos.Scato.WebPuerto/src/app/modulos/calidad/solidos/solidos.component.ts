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

@Component({
  selector: 'app-solidos',
  templateUrl: './solidos.component.html',
  styleUrls: ['./solidos.component.css']
})
export class SolidosComponent implements OnInit {
  @Output() hideSpinner = new EventEmitter<boolean>();
  @ViewChild(GraficoCargaComponent) graficoCarga: GraficoCargaComponent;
  @ViewChild(ManosComponent) manosComponent: ManosComponent;

  embarqueSelected: EmbarqueNav;
  celdasManoDeEmbarque: CeldaManoDeEmbarque[];
  sentidosManoDeEmbarque: SentidoManoDeEmbarque[];
  embarque: Embarque;
  materialesPuerto: MaterialPuerto[];
  enviado: boolean;
  usuarioFinalizacion: string;
  RecibidoresPdf: boolean = false;
  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;

  constructor(
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
        this.enviado = res.enviado;
        this.usuarioFinalizacion = res.usuarioFinalizacion;
        this.graficoCarga.limpiarGraficoCarga();
        this.manosComponent.resetForm();
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
