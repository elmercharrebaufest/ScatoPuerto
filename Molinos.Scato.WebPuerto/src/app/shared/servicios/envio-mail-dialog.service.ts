import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Mail } from '@ScatoModels/mail';
import { EnvioMailDialogComponent } from '../componentes/envio-mail-dialog/envio-mail-dialog.component';
@Injectable({
  providedIn: 'root'
})
export class EnvioMailDialogService {

  constructor(private modalService: NgbModal) { }

  public confirm(
    title: string,
    message: string,
    asunto: string,
    btnOkText: string = 'OK',
    btnCancelText: string = 'Cancel',
    dialogSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md',
    mail: Mail = null,
    tipo: Tipoalerta = Tipoalerta.Success,
    inputPara: string = null,
    inputCopia: string = null,
    centered: boolean = false): Promise<boolean> {
    const modalRef = this.modalService.open(EnvioMailDialogComponent, {
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
    modalRef.componentInstance.inputPara = inputPara;
    modalRef.componentInstance.inputCopia = inputCopia;
    modalRef.componentInstance.asunto = asunto;
    return modalRef.result;
  }

  public confirmConValidacion(title: string, message: string, mail: Mail) {
    const modalRef = this.modalService.open(EnvioMailDialogComponent, { backdrop: 'static', size: 'xl', animation: true });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.btnOkText = 'Enviar';
    modalRef.componentInstance.btnCancelText = 'Cancelar';
    modalRef.componentInstance.mail = mail;
    modalRef.componentInstance.tipo = Tipoalerta.Success;
    modalRef.componentInstance.inputPara = 'Para:';
    modalRef.componentInstance.inputCopia = 'CC:';
    modalRef.componentInstance.asunto = mail.titulo;
    modalRef.componentInstance.validarDestinatarios = true;
    return modalRef.result;
  }
}
