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
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Nominacion } from '@ScatoModels/programa-embarque/nominacion';


@Component({
  selector: 'app-listado-programa-embarque',
  templateUrl: './listado-programa-embarque.component.html',
  styleUrls: ['./listado-programa-embarque.component.css']
})
export class ListadoProgramaEmbarqueComponent implements OnInit, OnDestroy {
  //#region Variables
  public orderedByColumn: string;
  public orderDirection: number;
  programa: any[]
  public nominacion: any;
  subscripcionPrograma: Subscription


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
  envioDialogService: any;

  permisosScato: typeof PermisosScato = PermisosScato;
  private user: Usuario;
  public estaEnviando= false;
  //#endregion
  constructor(private progamaService: ProgramaEmbarqueService,
    private modalService: NgbModal,
    private route: Router,
    public config: NgbModalConfig,
    confirmationDialogService: ConfirmationDialogService,
    envioDialogService: EnvioMailDialogService,
    public session: SessionService, private alertService: AlertService,) {
    this.confirmationDialogService = confirmationDialogService;
    this.envioDialogService = envioDialogService;
    this.user = this.session.getUser();

  }

  ngOnInit(): void {
    this.estaCargando = true;
    this.subscripcionPrograma = this.progamaService.observablePrograma.subscribe(
      (data: any) => {
        this.programa = data;
        this.length = this.programa.length > 0 ? this.programa[0].itemsTotales : this.programa.length;
        this.pageSize = this.programa.length > 0 ? this.programa[0].itemPorPagina : 10;
        this.pageIndex = this.programa.length > 0 ? this.programa[0].pagina : 1;
        this.estaCargando = false;
        let idsNominacion: number[] = [];
        
        this.programa.forEach(element => {
          idsNominacion.push(element.id)
        })
        this.tieneAuditoria(idsNominacion);
      }
    )
    this.interval = setInterval(
      () => { this.listarProgramas() },
      60000)
  }
  ngOnDestroy(): void {
    this.subscripcionPrograma.unsubscribe();
    clearInterval(this.interval)
  }

  tieneAuditoria(nominacion_id: number[]){
    this.progamaService.tieneAuditoria(nominacion_id).subscribe((res: any[]) => {
      if (res != null && res != undefined){
        res.forEach(e => {
          let indexNominacion = this.programa.findIndex(x => x.id == e["item1"]);
          //Lo oculto si no tiene notificaciones.
          (document.getElementsByClassName("auditoriaCheck")[indexNominacion] as HTMLElement) .style.visibility = e["item2"] == true ? 'visible' : 'hidden';
        })
      }
    })
  }

  public getListaProgramaEmbarque() {
    return this.programa;
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
      this.programa.sort((a, b) => {
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
      this.programa.sort((a, b) => {
        if (a[columArray[0]][0][columArray[1]] > b[columArray[0]][0][columArray[1]]) {
          return 1
        }
        if (a[columArray[0]][0][columArray[1]] < b[columArray[0]][0][columArray[1]]) {
          return -1
        }
        return 0
      })
    }

    if (this.orderDirection <= 0) this.programa = this.programa.reverse()
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
    this.listarProgramas()

  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.disabled = false;
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }

  public devolverColorEstado(estado) {
    //1 = enviado a line, 2 = la nominacion se creó y aun no pasaron las 24hs,
    //3 = la nominacion paso las 24hs desde que se creó, 4 = esta eliminada
    return estado == 1 ? "#53b229" : estado == 2 ? "#1c7cd5" : estado == 3 ? "#dddddd" : "#d9534f"
  }
  public devolverMensajeDeEstados(estado) {
    //1 = enviado a line, 2 = la nominacion se creó y aun no pasaron las 24hs,
    //3 = la nominacion paso las 24hs desde que se creó, 4 = esta eliminada
    return estado == 1 ? "Enviado a Line up" : estado == 2 ?
      "Creado dentro de las 24hs" : estado == 3 ? "Pasaron las 24hs de creación" : "Eliminado"
  }

  public seleccionarNominacion(id: number, modal) {
    this.nominacion = this.progamaService.obtenerNominacion(id);
    this.onOpenModalProgramaEmbarque(modal);
  }

  public retornarColorEnvioMail(mailEnviado: any) {
    return mailEnviado ? "#4D60A8" : "#999999"
  }

  public onOpenModalProgramaEmbarque(modal) {
    this.modalService.open(modal, { size: 'xl', windowClass: 'window-modal-geo', backdropClass: 'modal-geo' }).result
      .then(() => {
        console.log('_modalService.open');
      })
      .catch((res) => { console.log(res) });
  }

  listarProgramas() {
    this.progamaService.ListarProgramaEmbarque(this.pageIndex, this.pageSize)
  }

  public onEditarNominacion(nominacionId: number) {
    this.route.navigate([`programa/nominacion/${nominacionId}`]);
  }

  tienePermisoEliminarNominacion() {
    return this.user.permisos.find(p => p === this.permisosScato.Comex_Nominacion_Eliminar);
  }

  tienePermisoModificarNominacion() {
    return this.user.permisos.find(p => p === this.permisosScato.Comex_Nominacion_Modificar);
  }

  tienePermisoParaNominar() {
    return this.user.permisos.find(p => p === this.permisosScato.Comex_Nominacion_Nominar);
  }




  public eliminarNominacion(nominacionId: number) {

    this.confirmationDialogService.confirm('¡Atención!', 'Se eliminara este producto del programa de embarque', 'Aceptar', 'Cancelar', null, null, Tipoalerta.Success)
    .then((confirmed) => {
      if (confirmed) {
        this.progamaService.EliminarNominacion(nominacionId).subscribe((res: any) => {
          //this.guardando = false
          this.confirmationDialogService.confirm('¡Alerta!', "Se elimino el producto", 'Cerrar', '', null, null, Tipoalerta.Success);
          this.listarProgramas();
        });

        }
        else
          return;
      }).catch();

  }

  enviarMail(nominacionId: number, nombreBuque, material, datos, tipoDeMail) {
    var titulo = tipoDeMail;
    var asunto = nombreBuque + " " + material + " - Nominación " + (datos != null || datos != undefined ? datos : "");
    var text = "Cuerpo del mail:";
    var inputPara = "Para:";
    var inputTitleCopia = "CC:";
    var mail = new Mail();
    this.progamaService.ObtenerDatosMailProgramaEmbarque(nominacionId, tipoDeMail).subscribe(
      (data: any) => {
        mail.body = data.body;
        mail.destinatarios = data.destinatarios;
        mail.copia = data.copia;
        mail.titulo = asunto;
      }
    )   
    mail.tipoDeMail = tipoDeMail;
    mail.id = nominacionId;
    var button1 = 'Enviar';
    var button2 = 'Cancelar';   
    this.envioDialogService.confirm(titulo, text, asunto, button1, button2, 'xl', mail, null, inputPara, inputTitleCopia, true)
        .then((confirmed) => {
        if (confirmed) {
          this.estaEnviando = true;
            this.progamaService.EnviarMailProgramaEmbarque(mail).subscribe(data => {
                this.envioDialogService.confirm('¡Felicitaciones!', 'Ha enviado con éxito el mail con la información de la nominación', '', 'Aceptar', '',null, null, Tipoalerta.Success, null, null, true)
                    .then((confirmed) => {
                    if (confirmed) {
                      this.estaEnviando = false;
                        return;
                    }
                }).catch(() => this.listarProgramas());
            }, error => {
                this.alertService.mostrar(new Alerta(error.error, Tipoalerta.Error));
                this.estaEnviando = false;
            });
        }
        else 
        this.estaEnviando = false;
    })
        .catch(() => {
        console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)');
        this.estaEnviando = false;
    });
}

}
