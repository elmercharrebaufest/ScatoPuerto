import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Mail } from '@ScatoModels/mail';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-inline';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';

@Component({
  selector: 'app-envio-mail-dialog',
  templateUrl: './envio-mail-dialog.component.html',
  styleUrls: ['./envio-mail-dialog.component.css']
})
export class EnvioMailDialogComponent implements OnInit {

  @Input() title: string;
  @Input() message: string;
  @Input() asunto: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() mail: Mail;
  @Input() tipo: Tipoalerta;
  @Input() inputPara: string;
  @Input() inputCopia: string;
  @Input() validarDestinatarios: boolean = false;
  public Editor = ClassicEditor;
  public estaCargando = false;
  public validators = [this.must_be_email.bind(this)];

  private must_be_email(control: FormControl) {

    if (!this.validateEmail(control.value)) {
      return { "must_be_email": true };
    }
    return null;
  }

  public onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }

  constructor(
    private activeModal: NgbActiveModal,
    private confirmationDialogService: ConfirmationDialogService
  ) { }

  ngOnInit() {
  }

  public decline() {
    this.activeModal.close(false);
  }

  public accept() {
    if (this.validarDestinatarios && this.mail.destinatarios.length == 0) {
      this.confirmationDialogService.alertar('Debe ingresar al menos un destinatario para enviar el correo.', 'Atención');
      return;
    }
    this.activeModal.close(this.mail ? this.mail : true);
  }

  public dismiss() {
    this.activeModal.dismiss();
  }

  public btnCancelVisible() {
    return this.btnCancelText != '';
  }

  public inputTextVisible() {
    return this.inputCopia;
  }

  public esTipoError() {
    return this.tipo == Tipoalerta.Error;
  }

  public esTipoWarning() {
    return this.tipo == Tipoalerta.Warning;
  }

  private validateEmail(text: string) {
    var EMAIL_REGEXP = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/i;
    return (text && EMAIL_REGEXP.test(text));
  }
}
