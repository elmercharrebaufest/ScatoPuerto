import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Mail } from '@ScatoModels/mail';
import { ConfirmationDialogComponent } from 'app/shared/componentes/confirmation-dialog/confirmation-dialog.component';
@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {

  constructor(private modalService: NgbModal) { }

  public confirm(
    title: string,
    message: string,
    btnOkText: string = 'OK',
    btnCancelText: string = 'Cancel',
    dialogSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md',
    mail: Mail = null,
    tipo: Tipoalerta = Tipoalerta.Success,
    inputTitle: string = null,
    centered: boolean = false): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
      backdrop: 'static',
      centered: centered,
      size: dialogSize,
      animation: true
    });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.btnOkText = btnOkText;
    modalRef.componentInstance.btnCancelText = btnCancelText;
    modalRef.componentInstance.mail = mail;
    modalRef.componentInstance.tipo = tipo;
    modalRef.componentInstance.inputTitle = inputTitle;
    return modalRef.result;
  }

  public confirmar(titulo: string, mensaje: string, tipo: Tipoalerta = Tipoalerta.Warning) {
    return this.confirm(titulo, mensaje, 'Si', 'Cerrar', null, null, tipo);
  }

  public alertar(mensaje: string, titulo: string = 'Atención', tipo: Tipoalerta = Tipoalerta.Warning) {
    return this.confirm(titulo, mensaje, 'Cerrar', '', null, null, tipo);
  }

  public exito(mensaje: string) {
    return this.confirm('Resultado exitoso', mensaje, 'Cerrar', '', null, null, Tipoalerta.Success);
  }

  public error(mensaje: string, titulo: string = '¡Error!') {
    return this.confirm(titulo, mensaje, 'Cerrar', '', null, null, Tipoalerta.Error);
  }
}
