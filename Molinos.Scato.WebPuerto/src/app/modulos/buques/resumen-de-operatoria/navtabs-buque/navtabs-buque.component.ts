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
import { Balanzas78Service } from '@ScatoServicios/balanzas78.service';
import { BalanzaService } from '@ScatoServicios/balanza.service';

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


  constructor(private moduloCargaService: ModuloDeCargaService, 
              private procesoService: DatosEmbarquesProcesoService,
              private balanzas78Service: Balanzas78Service,
              private turnosService: TurnosService,
              private planoDeCargaService: PlanoDeCargaService,
              private embarqueSharingService: EmbarqueSharingService) { }

  ngOnInit(): void {
    this.setCargarEmbarquesWorklow();
  }

  private setCargarEmbarquesWorklow(){   
    console.log('Ini setCargarEmbarquesWorklow..>', this.paramEmbarqueSel, new Date());
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
      console.log('Fin setCargarEmbarquesWorklow..>', this.paramEmbarqueSel, new Date());
      this.setCargarEmbarquesPlanillas();
  }

  private setCargarEmbarquesPlanillas(){
    this.cargandoInformacion = true;
    console.log('Fin setCargarEmbarquesPlanillas..>', this.paramEmbarqueSel, new Date());
    
    this.planoDeCargaService.obtenerPlanoDeCarga(this.paramEmbarqueSel.planoDeCarga_Id).subscribe(res => {
      this.turnosService.setExportadores(res.cargasComerciales);
      this.turnosService.setBodega(res.planoDeCargaBodegas);
      console.log('3 setCargarEmbarquesPlanillas..>', this.paramEmbarqueSel, new Date());
    });
    this.balanzas78Service.setEmbarqueBalanzaCalidad(this.paramEmbarqueSel.moduloDeCarga_Id);
    console.log('4 setCargarEmbarquesPlanillas..>', this.paramEmbarqueSel, new Date());
    
    this.moduloCargaService.obtenerModuloDeCarga(this.paramEmbarqueSel.moduloDeCarga_Id).subscribe( res => {
        this.procesoService.setModuloDeCarga(res);
        console.log('2 setCargarEmbarquesPlanillas..>', this.paramEmbarqueSel, new Date());
        this.cargandoInformacion = false;
    });
    this.balanzas78Service.actualizarBodegas(this.paramEmbarqueSel.moduloDeCarga_Id);
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
      } else {
        this.setCargarInfoUmap();
      }
    }

  }

}
