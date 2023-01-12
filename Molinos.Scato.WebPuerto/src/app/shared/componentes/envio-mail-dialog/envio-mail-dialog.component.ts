import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Mail } from '@ScatoModels/mail';

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
  @Input() inputPara : string;
  @Input() inputCopia : string;

  public validators = [ this.must_be_email.bind(this) ];

  private must_be_email(control: FormControl) {        

    if (!this.validateEmail(control.value)) {
        return { "must_be_email": true };
    }
    return null;
}


  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

  public decline() {
    this.activeModal.close(false);
  }

  public accept() {
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
