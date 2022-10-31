import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Usuario } from '@ScatoInterfaces/usuario';
import { SessionService } from '@ScatoServicios/session.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { Embarque } from '@ScatoModels/embarque';
import { finalize } from 'rxjs/operators';
import { BuqueSharingService } from '@ScatoServicios/buque.shared.service';
import { VaporInformacion } from '@ScatoModels/Buques/VaporInformacion';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Pais } from '@ScatoModels/Buques/Pais';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BuqueService } from '@ScatoServicios/buque.service';
import { HistorialBuquesComponent } from '../historial-buques/historial-buques.component';
import { isThisQuarter } from 'date-fns';
import { EmbarqueInformacion } from '@ScatoModels/embarque-Informacion';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { browserRefresh } from '../../../app.component';
import { Bandera } from '@ScatoModels/bandera';

@Component({
  selector: 'app-resumen-de-operatoria',
  templateUrl: './resumen-de-operatoria.component.html',
  styleUrls: ['./resumen-de-operatoria.component.css']
})
export class ResumenDeOperatoriaComponent implements OnInit {

  // #region Variables
  @ViewChild(HistorialBuquesComponent) historialBuquesComponent: HistorialBuquesComponent;
  private user: Usuario;
  private embarqueOp: Embarque;
  private idEmbarqueOp: number;
  private idVaporOp: number;
  private vaporInformacion: VaporInformacion;
  private embarqueInformacion: EmbarqueInformacion;
  private filtroBuquedaForm: FormGroup;
  private embarqueBuqueSel;
  paramEmbarqueSel: any = null;
  banderasBuque: Bandera;
  mostrarInformacion: boolean;
  permisosScato: typeof PermisosScato = PermisosScato;
  otrasOperacionesBuque: boolean = false;
  esEmbarqueLiquido: boolean = false;
  moduloDeCargaId: number = 0;
  buque: any;
  nombreBuque: string = null;
  private browserRefresh: boolean;

  // #endregion

  // #region Observable
  subscription: Subscription;
  // #endregion

  // #region Constructor
  constructor(
    private route: ActivatedRoute,
    private session: SessionService,
    private messageService: MessageService,
    private router: Router,
    private buqueSharingService: BuqueSharingService,
    private embarqueService: EmbarqueService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private buqueService: BuqueService
  ) {
    this.cargarValoresHistorial();
    this.cargarValoresOperatoria();
    this.setValoresEmbarque();
  }
  // #endregion

  // #region Eventos del Componente
  ngOnInit(): void {
    this.initOperatoria();
    this.browserRefresh = browserRefresh;
    console.log('this.browserRefresh---->>')
    console.log(this.browserRefresh)
    if (this.browserRefresh)
      this.cargarValoresHistorial();
  }
  // #endregion

  // #region Metodos
  //con en id de embarque que obtuve, me obtengo el vaporInformacion una vez termine el subscribe con el .pipe(finalize () =>);
  //donde tambien me obtengo el pais filtrandolo por el id que tenog en vaporInformacion
  // utilizo el mostrarInformacion = true. ya que es asncrono y rompe el front
  private setValoresEmbarque(){
    //, JSON.stringify(embarqueBuque)
    if (localStorage.getItem("embarqueBuque") !=null && localStorage.getItem("embarqueBuque")!=undefined){
      this.embarqueBuqueSel = localStorage.getItem("embarqueBuque"); 
      this.embarqueBuqueSel = JSON.parse(this.embarqueBuqueSel)
    }
  }
  private cargarValoresHistorial() {
    this.mostrarInformacion = false;
    this.user = this.session.getUser()

    //como el id de oeracion que se muestra en la url es el id del embarque, lo obtengo directamente de la url
    //asi me obtengo el embarque 
    this.idEmbarqueOp = parseInt(this.route.snapshot.paramMap.get('embarqueid'));
    this.idVaporOp = parseInt(this.route.snapshot.paramMap.get('vaporid'));
    this.embarqueService.obtenerIdsUsuales(this.idEmbarqueOp).subscribe(data => {
      this.paramEmbarqueSel = { 
        embarque_Id: this.idEmbarqueOp, 
        moduloDeCarga_Id: data.moduloDeCargaId, 
        vapor_Id: data.vaporId, 
        planoDeCarga_Id: data.planoDeCargaId,
        esLiquido: data.esLiquido ==1? true : false};
    });
   
    this.buqueSharingService.getFiltroBusques().subscribe(data => {
      if (data !== undefined) {
        if (data !== null) {
          this.filtroBuquedaForm = data;
          this.otrasOperacionesBuque = this.filtroBuquedaForm.controls.mostrarOtrasOperaciones.value;
          this.moduloDeCargaId = this.filtroBuquedaForm.controls.moduloDeCargaId.value;
        }
      }
    });
  }

  private cargarValoresOperatoria() {
    if (this.filtroBuquedaForm == null || this.filtroBuquedaForm === undefined) {
      this.filtroBuquedaForm = this.formBuilder.group({
        esResumenOperatoria: true,
        esBusqueda: true,
        esDetalle: true,
        esLimpiarBusqueda: false,
        mostrarPorEmbarque: true,
        mostrarOtrasOperaciones: false,
        vaporId: this.idVaporOp,
        embarqueId: this.idEmbarqueOp,
        moduloDeCargaId: 0,
        anio: '',
        mes: '',
        producto: '',
        buque: '',
        destino: '',
        control: '',
        ata: ''
      })
      this.buqueSharingService.setFiltroBusques(this.filtroBuquedaForm);
    }
  }

  private initOperatoria() {
    if (this.embarqueBuqueSel != null && this.embarqueBuqueSel !=undefined) {
      this.nombreBuque = this.embarqueBuqueSel.nombreBuque;
      this.esEmbarqueLiquido = this.embarqueBuqueSel.esLiquido;
    }else{
      this.embarqueService.obtenerEmbarque(this.idEmbarqueOp).subscribe(res => {
          this.nombreBuque = res.patente;
      });
    }
    this.buqueService.obtenerVaporInformacion(this.idVaporOp).subscribe(res => {
      if (this.vaporInformacion != null && this.vaporInformacion != undefined){
        this.embarqueService.obtenerBanderas().subscribe(res => {
          const banderaSel = res.filter(p => p.id == this.vaporInformacion.bandera_Id);
          if (banderaSel.length >0)
          this.banderasBuque =  banderaSel[0];
        })
      }
      this.mostrarInformacion = true;
    });
  
    this.buqueSharingService.setFiltroBusques(this.filtroBuquedaForm);
  }

  private limpiarFiltrosHistorial() {
    if (this.filtroBuquedaForm != null) {
      this.filtroBuquedaForm.controls.esResumenOperatoria.setValue(true);
      this.filtroBuquedaForm.controls.esBusqueda.setValue(false);
      this.filtroBuquedaForm.controls.esDetalle.setValue(false);
      this.filtroBuquedaForm.controls.mostrarPorEmbarque.setValue(false);
      this.filtroBuquedaForm.controls.mostrarOtrasOperaciones.setValue(false);
      this.filtroBuquedaForm.controls.esLimpiarBusqueda.setValue(true);
      this.filtroBuquedaForm.controls.embarqueId.setValue(0);
      this.filtroBuquedaForm.controls.vaporId.setValue(0);
      this.filtroBuquedaForm.controls.moduloDeCargaId.setValue(0);
      this.filtroBuquedaForm.controls.producto.setValue('');
      this.filtroBuquedaForm.controls.buque.setValue('');
      this.filtroBuquedaForm.controls.destino.setValue('');
      this.filtroBuquedaForm.controls.control.setValue('');
      this.filtroBuquedaForm.controls.ata.setValue('');
      this.filtroBuquedaForm.controls.embarqueId.setValue(0);
      this.filtroBuquedaForm.controls.mes.setValue(0);
      this.buqueSharingService.setFiltroBusques(this.filtroBuquedaForm);
    }
  }
  // #endregion

  // #region Eventos Controles
  //boton de volver en la pantalla home de resumen-operatoria
  //llamo a la funcion navigate para que navegue hasta la ruta anterior(pantalla home de buques)
  private limpiarDatosOperatoria(){
    this.limpiarFiltrosHistorial();
    this.historialBuquesComponent.esRegresar = true;
    this.router.navigate(['/buques']);
  }
  public onVolver() {
      this.limpiarDatosOperatoria();
  }
  //click de boton para ocultar nuevamente las otras operaciones del buque desde "volver"
  public onVolverOtrasOperaciones() {
    this.otrasOperacionesBuque = false;
  }
  //modal de ship particular del buque
  // openModalShipParticular(modal: any) {
  //   this.modalService.open(modal, { size: 'sm', centered: true, backdrop: 'static', keyboard: false });
  // }
  public onVerOtrasOperaciones() {
    //this.otrasOperacionesBuque = true;
    this.filtroBuquedaForm.controls.esResumenOperatoria.setValue(true);
    this.filtroBuquedaForm.controls.mostrarOtrasOperaciones.setValue(true);
    this.filtroBuquedaForm.controls.mostrarPorEmbarque.setValue(false);
    this.filtroBuquedaForm.controls.esDetalle.setValue(false);
    this.filtroBuquedaForm.controls.embarqueId.setValue(0);
    this.buqueSharingService.setFiltroBusques(this.filtroBuquedaForm);
  }
  public openModalShipParticular(modal) {
    
    this.modalService.open(modal, { windowClass: 'window-modal-geo', backdropClass: 'modal-geo' }).result
      .then(() => {
        console.log('_modalService.open');
      })
      .catch((res) => { console.log(res) });
  }
  // #endregion

}
