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
      let id = this.route.snapshot.params.id;
      if(id){
        this.embarquesEnLineUp = this.embarquesEnLineUp.filter(e => e.id == id);
        this._procesoService.setEmbarquesList(this.embarquesEnLineUp);      
        this._procesoService.setEmbarque(Number(id));
      }else{
        this._procesoService.setEmbarquesList(this.embarquesEnLineUp);      
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

  guardarPlanoDeCarga(finalizar: boolean) {
    this._changeDet.detectChanges();
    this.modificarEstadoBuque('PreOperativo');
    this.planoContent.guardarPlanoDeCarga(finalizar);
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