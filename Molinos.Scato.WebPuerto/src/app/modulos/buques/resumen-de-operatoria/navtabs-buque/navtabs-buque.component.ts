import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmbarqueSharingService } from '@ScatoServicios/embarque.shared.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { BalanzasComponent } from '../../../carga/carga-solidos/tableristas/balanzas/balanzas.component';
import { UmapComponent } from '../../../carga/carga-solidos/tableristas/umap/umap.component';
import { PeriodoCargaComponent } from 'app/shared/componentes/modulos/carga/periodo-carga/periodo-carga.component';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { TurnosService } from '@ScatoServicios/turnos.service';
import { PlanoDeCargaService } from '@ScatoServicios/plano-de-carga.service';

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


  constructor(private moduloCargaService: ModuloDeCargaService, 
              private procesoService: DatosEmbarquesProcesoService,
              private embarqueService: EmbarqueService,
              private workflowService: WorkflowService,
              private turnosService: TurnosService,
              private planoDeCargaService: PlanoDeCargaService,
              private embarqueSharingService: EmbarqueSharingService) { }

  ngOnInit(): void {
    this.setCargarEmbarquesWorklow();
  }

  private setCargarEmbarquesWorklow(){
    this.workflowService.listarEmbarquesEnLineUp()
      .subscribe(res => {
        this.procesoService.setEmbarquesList(res);
        this.setCargarEmbarquesPlanillas()
      });
  }

  private setCargarEmbarquesPlanillas(){
      this.procesoService.setEmbarque(this.paramEmbarqueSel.embarque_Id);
      this.procesoService.setPlanoDeCarga(this.paramEmbarqueSel.planoDecarga_Id);
      this.procesoService.setModulodDeCarga(this.paramEmbarqueSel.moduloDeCarga_Id);

      this.moduloCargaService.obtenerModuloDeCarga(this.procesoService.getModuloDeCargaId()).subscribe( res => {
        this.procesoService.setModuloDeCarga(res);
      });

      this.planoDeCargaService.obtenerPlanoDeCarga(this.procesoService.getPlanoDeCargaId()).subscribe(res => {
        this.turnosService.setExportadores(res.cargasComerciales);
        this.turnosService.setBodega(res.planoDeCargaBodegas);
      });

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
          console.log('res--->>>')
          console.log(this.umapComponent)
          if (res.moduloDeCargaUmap.length > 0)
            this.umapComponent.updateUMAP(res.moduloDeCargaUmap);
          
          if (res.moduloDeCargaPeriodoDeCarga.length > 0)
            this.umapComponent.updateAmarre(res.moduloDeCargaPeriodoDeCarga[0]);
          
        }
      });
  }

  private cargarDatosEmbarqueSolido(){
    this.embarqueService.obtenerEmbarque(this.paramEmbarqueSel.embarque_Id).subscribe(data => {
      const embarqueNavSel: EmbarqueNav = {
        cargado: true,
        esLiquido: data.esLiquido,
        id : this.paramEmbarqueSel.embarque_Id,
        moduloDeCargaId : this.paramEmbarqueSel.moduloDeCarga_Id,
        nombreBuque :data.nombreBuque,
        nombreUbicacion : '',
        planoDeCargaId : this.paramEmbarqueSel.planoDecarga_Id,
      };
      let embarqueNavList: EmbarqueNav[] = [];
      embarqueNavList.push(embarqueNavSel);
      this.procesoService.setEmbarquesList(embarqueNavList);
      this.procesoService.setEmbarque(this.paramEmbarqueSel.embarque_Id);
      console.log('enviandoooooo');
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
    elementoSeleccionado.classList.add("active");
    var elementoSeleccionado = document.getElementById(idElementoModif);
    elementoSeleccionado.classList.add("active");
    var elementoSeleccionado = document.getElementById(idElementoModif);
    elementoSeleccionado.classList.add("show");
    console.log('this.paramEmbarqueSel-->>');
    console.log(this.paramEmbarqueSel);
    if (this.vistaSeleccionada == 'op-tablero-tab') {
      if (this.esEmbarqueLiquido) {
        this.setCargarPeriodoDeCarga();
        this.cargarDatosEmbarqueSolido();
      } else {
        this.setCargarInfoUmap();
        this.cargarDatosEmbarqueSolido();
      }
    }

  }

}
