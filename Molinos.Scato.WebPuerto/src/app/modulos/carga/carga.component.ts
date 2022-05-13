import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { PlanoContentComponent } from '../lineup/plano-de-carga/plano-content/plano-content.component';


@Component({
  selector: 'app-carga',
  templateUrl: './carga.component.html',
  styleUrls: ['./carga.component.css']
})
export class CargaComponent implements OnInit, OnDestroy {
  mostrarSpinner: boolean = true;
  mostrarTabs: boolean = false;
  mostrarPlano: boolean = false;
  mostrarCargas: boolean = false;
  embarquesEnLineUp: EmbarqueNav[];
  embarqueSelected: EmbarqueNav;
  unsubscribe: Subject<any>;
  embarqueSelectedEnLocalStorage: EmbarqueNav;
  
  @ViewChild(PlanoContentComponent, { static: false }) planoContent: PlanoContentComponent;

  constructor(
    private workflowService: WorkflowService,
    private _procesoService: DatosEmbarquesProcesoService
  ) {
    this.unsubscribe = new Subject();
  }

  ngOnInit(): void {
    this.subscribeEmbarques();
  }

  subscribeEmbarques() {
    this._procesoService.disposeData();
    try {
      this.workflowService.listarEmbarquesEnLineUp()
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {
          this.embarquesEnLineUp = res;
          this._procesoService.setEmbarquesList(this.embarquesEnLineUp);
          this.mostrarTabs = true;

          let embarqueDelStorage = this.obtenerEmbarqueSelectedEnLocalStorage();
          if (embarqueDelStorage) {
            let vaporEncontrado = this.embarquesEnLineUp.find(x => x.id == embarqueDelStorage.id);
            if (!vaporEncontrado)
              localStorage.removeItem('embarqueSelected');
            
          }

        });
    } catch (e) {
      console.log(e);
      console.log("Error en listarEmbarquesEnLineUp");
    }
  }

  showPlano(event: boolean) {
    this.embarqueSelected = this._procesoService.getEmbarqueSelected();
    setTimeout(() => {
      this.mostrarPlano = event;
    }, 50);
  }

  showCargas(event) {
    this.mostrarCargas = event;
  }

  hideSpinner(event) {
    setTimeout(() => {
      this.mostrarSpinner = event;
    }, 50);
  }

  changeEmbarque() {
    this.mostrarCargas = false;
    this.mostrarSpinner = true;
    this.embarqueSelected = this._procesoService.getEmbarqueSelected();

    this.grabarEmbarqueSelectedEnLocalStorage( this.embarqueSelected );
  }

  grabarEmbarqueSelectedEnLocalStorage( embarqueSelected: EmbarqueNav ){
    localStorage.setItem("embarqueSelected", JSON.stringify(embarqueSelected));
  }

  obtenerEmbarqueSelectedEnLocalStorage(): EmbarqueNav {
    let embarqueSelected = JSON.parse( localStorage.getItem("embarqueSelected") );
    return embarqueSelected;
  }

  ngOnDestroy() {
    this.unsubscribe.complete();
    localStorage.removeItem('embarqueSelected');
  }
}
