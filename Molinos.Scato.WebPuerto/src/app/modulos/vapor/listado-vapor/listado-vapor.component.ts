import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ProgramaEmbarqueService } from '@ScatoServicios/programa-embarque.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Mail } from '@ScatoModels/mail';
import { Usuario } from '@ScatoInterfaces/usuario';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { SessionService } from '@ScatoServicios/session.service';
import { AlertService } from '@ScatoServicios/alert.service';
import { Alerta } from '@ScatoModels/alerta';
import { EnvioMailDialogService } from '@ScatoServicios/envio-mail-dialog.service';
import { VaporService } from '@ScatoServicios/vapor.service';
import { Buque } from '@ScatoModels/vapor/vapor';
import { BuqueService } from '@ScatoServicios/buque.service';


@Component({
  selector: 'app-listado-vapor',
  templateUrl: './listado-vapor.component.html',
  styleUrls: ['./listado-vapor.component.css']
})
export class ListadoVaporComponent implements OnInit, OnDestroy {
  //#region Variables
  public orderedByColumn: string;
  public orderDirection: number;
  vapor: Buque[]
  subscripcionBuque: Subscription
  paginator: any;
  length = 0;
  pageSize: number;
  pageIndex: number = 0;
  pageSizeOptions = [10, 20, 50, 100];
  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;
  pageEvent: PageEvent;
  filtros: any;
  public estaCargando = false;
  interval: any
  confirmationDialogService: any;
  vaporId: number;
  permisosScato: typeof PermisosScato = PermisosScato;
  private user: Usuario;
  public estaEnviando= false;
  //#endregion
  constructor(private vaporService: VaporService,
    private modalService: NgbModal,
    private route: Router,
    public config: NgbModalConfig,
    confirmationDialogService: EnvioMailDialogService,
    public session: SessionService, private alertService: AlertService, 
    private buqueService: BuqueService) {
    this.confirmationDialogService = confirmationDialogService;
    this.user = this.session.getUser();

  }

  ngOnInit(): void {
    this.estaCargando = true;
    this.subscripcionBuque = this.vaporService.observableVapor.subscribe(
      (data: Buque[]) => {
        this.vapor = data;
        this.length = this.vapor.length > 0 ? this.vapor[0].itemsTotales : this.vapor.length;
        this.pageSize = this.vapor.length > 0 ? this.vapor[0].itemPorPagina : 10;
        this.pageIndex = this.vapor.length > 0 ? this.vapor[0].pagina : 1;
        this.estaCargando = false;
      }
    )
    this.interval = setInterval(
      () => { this.listarVapores() },
      60000)
  }
  ngOnDestroy(): void {
    this.subscripcionBuque.unsubscribe();
    clearInterval(this.interval)
  }

  public getListaVapor() {
    return this.vapor;
  }

  public orderColumnBy(column: string) {
    if (column == this.orderedByColumn) {
      this.orderDirection = -this.orderDirection;
    } else {
      this.orderDirection = 1;
      this.orderedByColumn = column;
    }
    var columArray = column.split('.')
    if (columArray.length == 1) {
      this.vapor.sort((a, b) => {
        if (a[column] > b[column]) {
          return 1
        }
        if (a[column] < b[column]) {
          return -1
        }
        return 0
      })
    }
    else {
      this.vapor.sort((a, b) => {
        if (a[columArray[0]][0][columArray[1]] > b[columArray[0]][0][columArray[1]]) {
          return 1
        }
        if (a[columArray[0]][0][columArray[1]] < b[columArray[0]][0][columArray[1]]) {
          return -1
        }
        return 0
      })
    }

    if (this.orderDirection <= 0) this.vapor = this.vapor.reverse()
  }

  public retornarColor(color) {
    return color;
  }


  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.disabled = false;
    this.listarVapores();

  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.disabled = false;
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }
  

  listarVapores() {
    this.vaporService.ListarVaporInformacion(this.pageIndex, this.pageSize)
  }
 
  tienePermisoModificarBuque() {
    return this.user.permisos.find(p => p === this.permisosScato.Vapor_Editar);
  }

  editarVapor(id, modal, bandera, nombreBuque, imo){ 
    this.vaporId = id;
    this.modalService.open(modal, { size: 'xl', windowClass: 'window-modal-geo', backdropClass: 'modal-geo' }).result
    .then(() => {     
      console.log('_modalService.open');

    })
    .catch((res) => { console.log(res) }); 
  }

  actualizarListaDeVapores(event){
    this.listarVapores();
  }


  public visualizarHistorial(modal, id) {
    this.onOpenModalHistorialVapor(modal,id);
  }

  public onOpenModalHistorialVapor(modal, id) {
    this.modalService.open(modal, { size: 'xl', windowClass: 'window-modal-geo', backdropClass: 'modal-geo' }).result
      .then(() => {
        console.log('_modalService.open');
      })
      .catch((res) => { console.log(res) });
      this.vaporService.DevolverHistoricoVapor(id)
    }

}
