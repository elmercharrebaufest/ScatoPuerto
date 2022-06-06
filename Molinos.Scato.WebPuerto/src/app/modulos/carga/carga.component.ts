import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { PlanoContentComponent } from '../lineup/plano-de-carga/plano-content/plano-content.component';
import { ParametrosService } from '@ScatoServicios/parametros.service';


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
  LogCount: number = 0;
  @ViewChild(PlanoContentComponent, { static: false }) planoContent: PlanoContentComponent;

  constructor(
    private workflowService: WorkflowService,
    private _procesoService: DatosEmbarquesProcesoService,
    private parametrosService: ParametrosService,
  ) {
    this.unsubscribe = new Subject();
    this.parametrosService.obtenerParametros().subscribe( res => this.parametrosService.setParametros(res) );
  }

  ngOnInit(): void {
    let actualDate = new Date();
    let function_name = 'SECCIÓN OPERACIONES (CARGA)';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" +actualDate.getUTCMinutes()  + ":" + actualDate.getUTCSeconds()  + "." + actualDate.getUTCMilliseconds())
     
    this.subscribeEmbarques();
    function_name = 'SECCIÓN OPERACIONES (CARGA) - FIN';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" +actualDate.getUTCMinutes()  + ":" + actualDate.getUTCSeconds()  + "." + actualDate.getUTCMilliseconds())
     
  }

  subscribeEmbarques() {
    let actualDate = new Date();
    let function_name = 'subscribeEmbarques';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" +actualDate.getUTCMinutes()  + ":" + actualDate.getUTCSeconds()  + "." + actualDate.getUTCMilliseconds())
     
    this._procesoService.disposeData();
    try {
      this.workflowService.listarEmbarquesEnLineUp()
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(res => {
          this.embarquesEnLineUp = res;
          this._procesoService.setEmbarquesList(this.embarquesEnLineUp);
          this.mostrarTabs = true;
        });
    } catch (e) {
      console.log(e);
      console.log("Error en listarEmbarquesEnLineUp");
    }
    function_name = 'subscribeEmbarques - FIN';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" +actualDate.getUTCMinutes()  + ":" + actualDate.getUTCSeconds()  + "." + actualDate.getUTCMilliseconds())
     
  }

  showPlano(event: boolean) {
    let actualDate = new Date();
    let function_name = 'showPlano';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" +actualDate.getUTCMinutes()  + ":" + actualDate.getUTCSeconds()  + "." + actualDate.getUTCMilliseconds())
     
    this.embarqueSelected = this._procesoService.getEmbarqueSelected();
    setTimeout(() => {
      this.mostrarPlano = event;
    }, 50);
    function_name = 'showPlano - FIN';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" +actualDate.getUTCMinutes()  + ":" + actualDate.getUTCSeconds()  + "." + actualDate.getUTCMilliseconds())
     
  }

  showCargas(event) {
    let actualDate = new Date();
    let function_name = 'showCargas';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" +actualDate.getUTCMinutes()  + ":" + actualDate.getUTCSeconds()  + "." + actualDate.getUTCMilliseconds())
     
    this.mostrarCargas = event;
    function_name = 'showCargas - FIN';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" +actualDate.getUTCMinutes()  + ":" + actualDate.getUTCSeconds()  + "." + actualDate.getUTCMilliseconds())
     
  }

  hideSpinner(event) {
    let actualDate = new Date();
    let function_name = 'hideSpinner';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" +actualDate.getUTCMinutes()  + ":" + actualDate.getUTCSeconds()  + "." + actualDate.getUTCMilliseconds())
     
    setTimeout(() => {
      this.mostrarSpinner = event;
    }, 50);
    function_name = 'hideSpinner - FIN';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" +actualDate.getUTCMinutes()  + ":" + actualDate.getUTCSeconds()  + "." + actualDate.getUTCMilliseconds())
     
  }

  changeEmbarque() {
    let actualDate = new Date();
    let function_name = 'changeEmbarque';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" +actualDate.getUTCMinutes()  + ":" + actualDate.getUTCSeconds()  + "." + actualDate.getUTCMilliseconds())
     
    this.mostrarCargas = false;
    this.mostrarSpinner = true;
    this.embarqueSelected = this._procesoService.getEmbarqueSelected();

    this.grabarEmbarqueSelectedEnLocalStorage( this.embarqueSelected );
    function_name = 'changeEmbarque - FIN';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" +actualDate.getUTCMinutes()  + ":" + actualDate.getUTCSeconds()  + "." + actualDate.getUTCMilliseconds())
     
  }

  grabarEmbarqueSelectedEnLocalStorage( embarqueSelected: EmbarqueNav ){
    let actualDate = new Date();
    let function_name = 'grabarEmbarqueSelectedEnLocalStorage';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" +actualDate.getUTCMinutes()  + ":" + actualDate.getUTCSeconds()  + "." + actualDate.getUTCMilliseconds())
     
    localStorage.setItem("embarqueSelected", JSON.stringify(embarqueSelected));
    function_name = 'grabarEmbarqueSelectedEnLocalStorage - FIN';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" +actualDate.getUTCMinutes()  + ":" + actualDate.getUTCSeconds()  + "." + actualDate.getUTCMilliseconds())
     
  }

  obtenerEmbarqueSelectedEnLocalStorage(): EmbarqueNav {
    let actualDate = new Date();
    let function_name = 'obtenerEmbarqueSelectedEnLocalStorage';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" +actualDate.getUTCMinutes()  + ":" + actualDate.getUTCSeconds()  + "." + actualDate.getUTCMilliseconds())
     
    let embarqueSelected = JSON.parse( localStorage.getItem("embarqueSelected") );
    function_name = 'obtenerEmbarqueSelectedEnLocalStorage - FIN';
    console.log("(" + ++this.LogCount + ")" + function_name + ":" + actualDate.getUTCHours() + ":" +actualDate.getUTCMinutes()  + ":" + actualDate.getUTCSeconds()  + "." + actualDate.getUTCMilliseconds())
     
    return embarqueSelected;
  }

  ngOnDestroy() {
    this.unsubscribe.complete();
    localStorage.removeItem('embarqueSelected');
  }
}
