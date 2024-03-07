import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { Usuario } from '@ScatoInterfaces/usuario';
import { Cliente } from '@ScatoModels/cliente/cliente';
import { AlertService } from '@ScatoServicios/alert.service';
import { ClienteService } from '@ScatoServicios/cliente.service';
import { EnvioMailDialogService } from '@ScatoServicios/envio-mail-dialog.service';
import { SessionService } from '@ScatoServicios/session.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-listado-clientes',
  templateUrl: './listado-clientes.component.html',
  styleUrls: ['./listado-clientes.component.css']
})
export class ListadoClientesComponent implements OnInit, OnDestroy {

  public orderedByColumn: string;
  public orderDirection: number;
  clientes: Cliente[]
  subscripcionCliente: Subscription
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
  interval: any
  confirmationDialogService: any;
  clienteId: number;
  permisosScato: typeof PermisosScato = PermisosScato;
  private user: Usuario;
  public estaEnviando = false;
  public estaCargando = false;

  constructor(private clienteService: ClienteService,
    private modalService: NgbModal,
    public config: NgbModalConfig,
    confirmationDialogService: EnvioMailDialogService,
    public session: SessionService, private alertService: AlertService) {
    this.confirmationDialogService = confirmationDialogService;
    this.user = this.session.getUser();
  }

  ngOnInit(): void {
    /*this.estaCargando = true;
    this.subscripcionCliente = this.clienteService.observableCliente.subscribe(
      (data: Cliente[]) => {
        this.clientes = data;
        this.length = this.clientes.length > 0 ? this.clientes[0].itemsTotales : this.clientes.length;
        this.pageSize = this.clientes.length > 0 ? this.clientes[0].itemPorPagina : 10;
        this.pageIndex = this.clientes.length > 0 ? this.clientes[0].pagina : 1;
        this.estaCargando = false;
      }
    )
    this.interval = setInterval(
      () => { this.listarClientes() },
      60000)*/
  }
  ngOnDestroy(): void {
    this.subscripcionCliente.unsubscribe();
    clearInterval(this.interval)
  }

  public getListaClientes() {
    return this.clientes;
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
      this.clientes.sort((a, b) => {
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
      this.clientes.sort((a, b) => {
        if (a[columArray[0]][0][columArray[1]] > b[columArray[0]][0][columArray[1]]) {
          return 1
        }
        if (a[columArray[0]][0][columArray[1]] < b[columArray[0]][0][columArray[1]]) {
          return -1
        }
        return 0
      })
    }

    if (this.orderDirection <= 0) this.clientes = this.clientes.reverse()
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
    this.listarClientes();
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.disabled = false;
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }

  listarClientes() {
    this.clienteService.ListarClientes(this.pageIndex, this.pageSize)
  }

  tienePermisoModificarCliente() {
    return this.user.permisos.find(p => p === this.permisosScato.Vapor_Editar); //Cliente_Editar
  }
  /*
    editarVapor(id, modal, bandera, nombreBuque, imo){ 
      this.clienteId = id;
      this.modalService.open(modal, { size: 'xl', windowClass: 'window-modal-vapor', backdropClass: 'modal-vapor' }).result
      .then(() => {     
        console.log('_modalService.open');
  
      })
      .catch((res) => { console.log(res) }); 
    }*/

  actualizarListaDeClientes(event) {
    this.listarClientes();
  }
}
