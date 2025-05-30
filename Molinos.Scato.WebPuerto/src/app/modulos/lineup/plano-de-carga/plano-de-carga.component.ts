import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadScreen } from '@ScatoInterfaces/load-screen';
import { Usuario } from '@ScatoInterfaces/usuario';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { PlanoContentComponent } from './plano-content/plano-content.component';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { SessionService } from '@ScatoServicios/session.service';
import { SignalRService } from '@ScatoServicios/signal-r.service';

@Component({
  selector: 'app-plano-de-carga',
  templateUrl: './plano-de-carga.component.html',
  styleUrls: ['./plano-de-carga.component.css']
})
export class PlanoDeCargaComponent extends LoadScreen implements OnInit {
  confirmationDialogService: any;
  mostrarSpinner: boolean = true;
  mostrarNavtabs: boolean = false;
  mostrarPlano: boolean = false;
  estaGuardando: boolean;
  embarquesEnLineUp: EmbarqueNav[];
  embarqueId: number;
  estadoAlturaValor: string;
  planoDeCargaId: number;
  @ViewChild(PlanoContentComponent, { static: false }) planoContent: PlanoContentComponent;
  permisosScato: typeof PermisosScato = PermisosScato;
  private user: Usuario;
  estadosBuque = [{id: 1, descripcion: 'PreOperativo'},
                  {id: 2, descripcion: 'Cargando'},
                  {id: 3, descripcion: 'ControlCalidad'},
                  {id: 4, descripcion: 'PostOperativo'}];

  constructor(
    private route: ActivatedRoute,
    private workflowService: WorkflowService,
    private _procesoService: DatosEmbarquesProcesoService,
    private embarqueService: EmbarqueService,
    private signalr: SignalRService,
    private _changeDet: ChangeDetectorRef,
    private session: SessionService,
  ) {
    super();
    this.user = this.session.getUser();
  }

  ngOnInit() {
    this.subscribeEmbarques();
  }

  subscribeEmbarques() {
    console.log('01 subscribeEmbarques', new Date());
    this.workflowService.listarEmbarquesEnLineUp().subscribe(x => {
      this.embarquesEnLineUp = x;
      this._procesoService.setEmbarquesList(this.embarquesEnLineUp);
      let id = this.route.snapshot.params.id;
      if(id){
        this._procesoService.setEmbarque(Number(id));
      }
      this.mostrarNavtabs = true;
      console.log('02 subscribeEmbarques', new Date());
    });
  }

  recibirEstadoAlturaValor(estadoAlturaValor) {
    this.estadoAlturaValor = estadoAlturaValor;
    if(this.planoContent)
      this.planoContent.calcularRecomendacionDefensas(this.estadoAlturaValor);
  }

  showPlano(event){
    setTimeout(() => {
      this.mostrarPlano = event;
    }, 50)
  }

  hideSpinner(event){
    this.mostrarSpinner = !event;
  }

  hideSpinnerAux(event) {
    this.mostrarSpinner = event;
  }

  async guardarPlanoDeCarga(finalizar: boolean) {
    this.estaGuardando = true;
    this._changeDet.detectChanges();

    try {
      this.modificarEstadoBuque('PreOperativo'); // Llama sin esperar si es síncrono
      await this.planoContent.guardarPlanoDeCarga(finalizar); // Espera esta llamada
      const idModuloCarga = this._procesoService.getModuloDeCargaId();
      this.signalr.enviarNotificacion('planoCarga', idModuloCarga);
    } catch (error) {
      console.error("Error al guardar plano de carga:", error);
    } finally {
      this.estaGuardando = false; // Restaurar estado
      this._changeDet.detectChanges(); // Forzar actualización nuevamente
    }
  }

  modificarEstadoBuque(estado: string){
    let estadoBuque = this.estadosBuque.find( e => e.descripcion.includes(estado));
    let idEmbarque = this.route.snapshot.params.id;
    this.embarqueService.actualizarEstadoBuque(idEmbarque, estadoBuque.id).subscribe( res => console.log(res) );
  }

  hasPermisoPDC_Guardar() {
    return this.user.permisos.find(p => p === this.permisosScato.PDC_Guardar);
  }
  hasPermisoPDC_Finalizar() {
    return this.user.permisos.find(p => p === this.permisosScato.PDC_Finalizar);
  }
}
