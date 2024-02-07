import { COEM, SolicitudNoABordo } from '@ScatoModels/afip/coem';
import { CoemAfipService } from '@ScatoServicios/afip/coem-afip.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-listado-no-abordo',
  templateUrl: './listado-no-abordo.component.html',
  styleUrls: ['./listado-no-abordo.component.css']
})
export class ListadoNoAbordoComponent implements OnInit, OnChanges {

  @Input() coem: COEM;
  public cargando: boolean;
  public solicitudes: SolicitudNoABordo[] = [];


  constructor(
    private modalService: NgbModal,
    private coemService: CoemAfipService,
    private confirmationDialogService: ConfirmationDialogService
  ) { }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.coem) {
      this.initInfo(changes.coem.currentValue);
    }
  }

  private initInfo(coem: COEM) {
    this.solicitudes = coem.afipSolicitudesNoABordo;
  }

  public cerrarModal() {
    this.modalService.dismissAll();
  }

  public mostrarDeclaraciones(event: Event, trDeclaraciones: HTMLTableRowElement) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      trDeclaraciones.classList.remove('d-none');
      checkbox.nextElementSibling.className = 'fa fa-chevron-up';
    } else {
      trDeclaraciones.classList.add('d-none');
      checkbox.nextElementSibling.className = 'fa fa-chevron-down';
    }
  }

  public async efectuarCambio(id: number) {
    const confirm = await this.confirmationDialogService.confirmar('Advertencia', '¿Desea marcar como aceptada la solicitud de "no a bordo"?')
    if (!confirm) {
      return;
    }
    this.cargando = true;
    this.coemService.efectuarSolicitudNoABordo(id).subscribe(async () => {
      this.cargando = false;
      await this.confirmationDialogService.exito('Se ha efectuado la solicitud de "no a bordo"');
      this.modalService.dismissAll();
      this.coemService.$recargarCoems.next();
    }, err => {
      console.error(err);
      this.cargando = false;
      this.confirmationDialogService.error('No se ha podido efectuar el cambio');
    });
  }

  public async rechazarCambio(id: number) {
    const confirm = await this.confirmationDialogService.confirmar('Advertencia', '¿Desea marcar como rechazada la solicitud de "no a bordo"?')
    if (!confirm) {
      return;
    }
    this.cargando = true;
    this.coemService.rechazarSolicitudNoABordo(id).subscribe(async () => {
      this.cargando = false;
      this.modalService.dismissAll();
      await this.confirmationDialogService.exito('Se ha rechazado la solicitud de "no a bordo"');
      this.coemService.$recargarCoems.next();
    }, err => {
      console.error(err);
      this.cargando = false;
      this.confirmationDialogService.error('No se ha podido efectuar el cambio');
    });
  }

  public getDeclaraciones(solicitud: SolicitudNoABordo) {
    return this.coem.mercaderiasSueltas.filter(m => solicitud.declaraciones.includes(m.identificadorDeclaracion));
  }

}
