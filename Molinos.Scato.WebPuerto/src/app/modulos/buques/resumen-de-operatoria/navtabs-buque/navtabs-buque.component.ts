import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { EmbarqueSharingService } from '@ScatoServicios/embarque.shared.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { BalanzasComponent } from '../../../carga/carga-solidos/tableristas/balanzas/balanzas.component';
import { UmapComponent } from '../../../carga/carga-solidos/tableristas/umap/umap.component';
import { PeriodoCargaComponent } from 'app/shared/componentes/modulos/carga/periodo-carga/periodo-carga.component';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { TurnosService } from '@ScatoServicios/turnos.service';
import { PlanoDeCargaService } from '@ScatoServicios/plano-de-carga.service';
import { Balanzas78Service } from '@ScatoServicios/balanzas78.service';
import { CalidadSharedService } from '@ScatoServicios/calidad-shared.service';
import { BuqueSharingService } from '@ScatoServicios/buque.shared.service';
import { ResumenOperatoriaEmbarque } from '@ScatoModels/Buques/resumenOperatoria';
import { HistoricoEmbarqueLineUpService } from '@ScatoServicios/historicoEmbarqueLineup.service';
import { HistoricoEmbarqueLineUp } from '@ScatoModels/historicoEmbarqueLineup';
import { SessionService } from '@ScatoServicios/session.service';
import { Usuario } from '@ScatoInterfaces/usuario';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
@Component({
  selector: 'app-navtabs-buque',
  templateUrl: './navtabs-buque.component.html',
  styleUrls: ['./navtabs-buque.component.css']
})
export class NavtabsBuqueComponent implements OnInit {

  @Input() esEmbarqueLiquido: boolean = false;
  @Input() paramEmbarqueSel: any;
  @ViewChild(PeriodoCargaComponent) periodoDeCargaComponent: PeriodoCargaComponent;
  @ViewChild(UmapComponent) umapComponent: UmapComponent;
  @ViewChild(BalanzasComponent) balanzasComponent: BalanzasComponent;
  vistaSeleccionada: string = 'lineup-tab';
  cargandoInformacion: boolean = false;
  moduloDeCargaManosDeEmbarque;
  historicosEmbarqueLineUp: HistoricoEmbarqueLineUp[] = null;
  public esSupervisor: boolean;
  public esAdministrativo: boolean;

  constructor(
    private moduloCargaService: ModuloDeCargaService,
    private procesoService: DatosEmbarquesProcesoService,
    private balanzas78Service: Balanzas78Service,
    private turnosService: TurnosService,
    private planoDeCargaService: PlanoDeCargaService,
    private calidadSharedService: CalidadSharedService,
    private buqueSharingService: BuqueSharingService,
    private embarqueSharingService: EmbarqueSharingService,
    private historicoEmbarqueLineUpService: HistoricoEmbarqueLineUpService,
    private session: SessionService
    ) {
    this.buqueSharingService.getActualizarResumenOperatoria().subscribe(res=>{
      const resumenOperatoriaEmbarque: ResumenOperatoriaEmbarque = res;
      if (resumenOperatoriaEmbarque !=null && resumenOperatoriaEmbarque.actualizarDatos) {
        if (resumenOperatoriaEmbarque.actualizarDatos)
          this.embarqueSharingService.getParametrosIdsEmbarque().subscribe(res =>{
            this.paramEmbarqueSel = res;
          });
          this.onClickHandlerClient('lineup-tab');
      }
    });
  }

  ngOnInit(): void {
    this.setCargarEmbarquesWorklow();
    this.cargarHistoricoEmbarqueLineUp();
  }

  private setCargarEmbarquesWorklow(){
      let embarqueItem:EmbarqueNav = new EmbarqueNav();
      let embarqueList:EmbarqueNav[] = new Array();
      embarqueItem.cargado = true;
      embarqueItem.esLiquido = this.paramEmbarqueSel.esLiquido;
      embarqueItem.id = this.paramEmbarqueSel.embarque_Id;
      embarqueItem.moduloDeCargaId = this.paramEmbarqueSel.moduloDeCarga_Id;
      embarqueItem.nombreBuque = '';
      embarqueItem.nombreUbicacion = '';
      embarqueItem.planoDeCargaId = this.paramEmbarqueSel.planoDeCarga_Id;
      embarqueList.push(embarqueItem);
      this.procesoService.setEmbarquesList(embarqueList);
      this.procesoService.setEmbarque(this.paramEmbarqueSel.embarque_Id);
      this.procesoService.setPlanoDeCarga(this.paramEmbarqueSel.planoDeCarga_Id);
      this.procesoService.setModulodDeCarga(this.paramEmbarqueSel.moduloDeCarga_Id);

      const usuario = this.session.getUser() as Usuario;
      this.esSupervisor = usuario.permisos.includes(PermisosScato.TableroSolido_EditarCargaHistorial);
      this.esAdministrativo = usuario.permisos.includes(PermisosScato.Administracion_VerHistorialDeBuques);
      
      this.setCargarEmbarquesPlanillas();
  }

  cargarHistoricoEmbarqueLineUp = async () => {
    const historicosEmbarqueLineUp = await this.historicoEmbarqueLineUpService.cargarHistoricoEmbarqueLineUp(this.paramEmbarqueSel.embarque_Id).toPromise();
    this.historicosEmbarqueLineUp = historicosEmbarqueLineUp;
  }

  private setCargarEmbarquesPlanillas(){
    this.cargandoInformacion = true;
    this.planoDeCargaService.obtenerPlanoDeCarga(this.paramEmbarqueSel.planoDeCarga_Id).subscribe(res => {
      this.turnosService.setExportadores(res.cargasComerciales);
      this.turnosService.setBodega(res.planoDeCargaBodegas);
    });

    this.moduloCargaService.obtenerModuloDeCarga(this.paramEmbarqueSel.moduloDeCarga_Id).subscribe( res => {
        this.procesoService.setModuloDeCarga(res);
        this.cargandoInformacion = false;
        if (res.moduloDeCargaManosDeEmbarque.length > 0 && !this.paramEmbarqueSel.esLiquido) {
          this.moduloDeCargaManosDeEmbarque = res.moduloDeCargaManosDeEmbarque;
          this.calidadSharedService.setManosDeEmbarque(this.moduloDeCargaManosDeEmbarque);
          this.calidadSharedService.Manos.emit(this.moduloDeCargaManosDeEmbarque);
        }
    });

    if (!this.paramEmbarqueSel.esLiquido && !this.paramEmbarqueSel.ingresoManualSolido){
      // console.log(' paramEmbarqueSel.moduloDeCarga_Id: ', this.paramEmbarqueSel.moduloDeCarga_Id);
      this.balanzas78Service.setEmbarqueBalanzaCalidad(this.paramEmbarqueSel.moduloDeCarga_Id);
      this.balanzas78Service.actualizarBodegas(this.paramEmbarqueSel.moduloDeCarga_Id);
    }
  }

  private setCargarPeriodoDeCarga() {
    this.moduloCargaService.obtenerModuloDeCarga(this.paramEmbarqueSel.moduloDeCarga_Id)
      .subscribe(res => {
        if (res !== undefined || res !== null) {
          if (res.moduloDeCargaPeriodoDeCarga.length > 0) {
            this.periodoDeCargaComponent.updatePeriodoCarga(res.moduloDeCargaPeriodoDeCarga[0]);
          }
        }
      });
  }

  private setCargarInfoUmap() {
    this.moduloCargaService.obtenerModuloDeCarga(this.paramEmbarqueSel.moduloDeCarga_Id)
      .subscribe(res => {
        if (res !== undefined || res !== null) {

          if (res.moduloDeCargaUmap && res.moduloDeCargaUmap.length > 0)
            this.umapComponent.updateUMAP(res.moduloDeCargaUmap);

          if (res.moduloDeCargaPeriodoDeCarga && res.moduloDeCargaPeriodoDeCarga.length > 0)
            this.umapComponent.updateAmarre(res.moduloDeCargaPeriodoDeCarga[0]);
        }
      });
  }

  onClickHandlerClient(idElemento: string) {
    this.embarqueSharingService.setParametrosIdsEmbarque(this.paramEmbarqueSel);
    var idElementoModif = idElemento.slice(0, -4);
    this.vistaSeleccionada = idElemento;
    for (let i = 0; i < 2; i++) {
      var elementoDeseleccionado = document.getElementsByClassName("active")[0];
      if (elementoDeseleccionado != null)
        elementoDeseleccionado.classList.remove("active");
    }

    var elementoDeseleccionado = document.getElementsByClassName("show")[0];
    if (elementoDeseleccionado != null)
      elementoDeseleccionado.classList.remove("show");

    var elementoSeleccionado = document.getElementById(idElemento);
      if (elementoSeleccionado != null)
        elementoSeleccionado.classList.add("active");

    var elementoSeleccionado = document.getElementById(idElementoModif);
      if (elementoSeleccionado != null){
        elementoSeleccionado.classList.add("active");
        elementoSeleccionado.classList.add("show");
      }

    if (this.vistaSeleccionada == 'op-tablero-tab' && !this.esSupervisor) {
      if (this.esEmbarqueLiquido) {
        this.setCargarPeriodoDeCarga();
      } else {
        this.setCargarInfoUmap();
      }
    }

    if (this.vistaSeleccionada === 'recibidores-tab' && !this.esEmbarqueLiquido) {
      this.calidadSharedService.setManosDeEmbarque(this.moduloDeCargaManosDeEmbarque);
      this.calidadSharedService.Manos.emit(this.moduloDeCargaManosDeEmbarque);
    }

  }
}
