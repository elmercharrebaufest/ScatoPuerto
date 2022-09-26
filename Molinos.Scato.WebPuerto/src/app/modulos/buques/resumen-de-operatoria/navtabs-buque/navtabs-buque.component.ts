import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmbarqueSharingService } from '@ScatoServicios/embarque.shared.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { BalanzasComponent } from 'app/shared/componentes/modulos/carga/balanzas/balanzas.component';
import { PeriodoCargaComponent } from 'app/shared/componentes/modulos/carga/periodo-carga/periodo-carga.component';
import { UmapComponent } from 'app/shared/componentes/modulos/carga/umap/umap.component';

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
  vistaSeleccionada: string = 'programa-embarque-tab';


  constructor(private moduloCargaService: ModuloDeCargaService, 
              private embarqueSharingService: EmbarqueSharingService) { }

  ngOnInit(): void {

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
          if (res.moduloDeCargaUmap.length > 0) {
            this.umapComponent.updateUMAP(res.moduloDeCargaUmap);
          }
          if (res.moduloDeCargaPeriodoDeCarga.length > 0) {
            this.umapComponent.updateAmarre(res.moduloDeCargaPeriodoDeCarga[0]);
          }
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

    if (this.vistaSeleccionada == 'op-tablero-tab') {
      if (this.esEmbarqueLiquido) {
        this.setCargarPeriodoDeCarga();
      } else {
        this.setCargarInfoUmap()
      }
    }
    
  }

}
