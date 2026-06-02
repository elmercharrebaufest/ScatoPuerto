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

  public confirmar(titulo: string, mensaje: string, btnOkText: string = 'Aceptar', btnCancelText: string = 'Cerrar', tipo: Tipoalerta = Tipoalerta.Warning) {
    return this.confirm(titulo, mensaje, btnOkText, btnCancelText, null, null, tipo);
  }

  public alertar(mensaje: string, titulo: string = 'Atención', tipo: Tipoalerta = Tipoalerta.Warning) {
    return this.confirm(titulo, mensaje, 'Cerrar', '', null, null, tipo);
  }

  public exito(mensaje: string, titulo: string = 'Resultado exitoso') {
    return this.confirm(titulo, mensaje, 'Cerrar', '', null, null, Tipoalerta.Success);
  }

  public error(mensaje: string, titulo: string = '¡Error!') {
    return this.confirm(titulo, mensaje, 'Cerrar', '', null, null, Tipoalerta.Error);
  }

  public elegirOpcion(titulo: string, mensaje: string, btnOp1Text: string, btnOp2Text: string, btnOp3Text: string): Promise<number> {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
      backdrop: 'static',
      centered: false,
      size: 'md',
      animation: true
    });
    modalRef.componentInstance.title = titulo;
    modalRef.componentInstance.message = mensaje;
    modalRef.componentInstance.btnCancelText = btnOp1Text;
    modalRef.componentInstance.btnOkText = btnOp2Text;
    modalRef.componentInstance.btnOpcion3Text = btnOp3Text;
    modalRef.componentInstance.tipo = Tipoalerta.Warning;
    modalRef.componentInstance.inputTitle = null;
    return modalRef.result;
  }
}
