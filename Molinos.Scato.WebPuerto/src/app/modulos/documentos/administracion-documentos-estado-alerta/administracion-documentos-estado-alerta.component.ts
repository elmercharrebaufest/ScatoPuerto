import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Mail } from '@ScatoModels/mail';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-inline';

@Component({
  selector: 'app-administracion-documentos-estado-alerta',
  templateUrl: './administracion-documentos-estado-alerta.component.html',
  styleUrls: ['./administracion-documentos-estado-alerta.component.css']
})
export class AdministracionDocumentosEstadoAlertaComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>()
  @Input() title: string;
  @Input() message: string;
  @Input() asunto: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() mail: Mail = new Mail();
  @Input() tipo: Tipoalerta;
  public Editor = ClassicEditor;
  public estaCargando = false;
  public validators = [ this.must_be_email.bind(this) ];

  constructor() { }

  ngOnInit(): void {
  }

  onCerraModal() {
    this.cerrar.emit();
  }

  public onReady( editor ) {
    editor.ui.getEditableElement().parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
    );
  }

  private must_be_email(control: FormControl) {        

    if (!this.validateEmail(control.value)) {
        return { "must_be_email": true };
    }
    return null;
  }
  private validateEmail(text: string) {
    var EMAIL_REGEXP = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/i;
    return (text && EMAIL_REGEXP.test(text));
  }
}
