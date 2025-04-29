import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdministracionEnvioAlerta } from '@ScatoModels/administracion/administracion-envio-alerta';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-inline';
import { Subject } from 'rxjs';
import { AdministracionService } from '@ScatoServicios/administracion.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { ConfirmationDialogComponent } from 'app/shared/componentes/confirmation-dialog/confirmation-dialog.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-alerta-administracion',
  templateUrl: './alerta-administracion.component.html',
  styleUrls: ['./alerta-administracion.component.css']
})
export class AlertaAdministracionComponent implements OnInit {

  @Output() cerrar = new EventEmitter<void>()
  @Input() embarqueId: number;
  public Editor = ClassicEditor;
  public estaCargando = false;
  public validators = [this.must_be_email.bind(this)];
  public administracionAlertaForm: FormGroup;
  public listaMotivoAlerta: { motivo: string }[] = [
    { motivo: 'Información incompleta' },
    { motivo: 'Información errónea' },
    { motivo: 'Corregir nombre de agencia' },
    { motivo: 'Corregir la cantidad de “Net Tonnage”' },
    { motivo: 'Solicitud de cargar/actualizar el TRN al Buque' },
    { motivo: 'Otros' }
  ];
  private destroy$ = new Subject();
  public mostrarSeccionOtros: boolean = false;
  public buque: string;

  constructor(
    private _formBuilder: FormBuilder,
    private _confirmationDialogService: ConfirmationDialogService,
    private _administracionService: AdministracionService,
    private _modalService: NgbModal
  ) {
    this.administracionAlertaForm = this.inicializarForm();
  }

  ngOnInit(): void {
    this.cargarCorreoInformacion();

  }

  onCerraModal() {
    this.cerrar.emit();
  }

  onSeleccionaMotivo() {
    const motivo = this.administracionAlertaForm.controls['motivo'].value;
    if (motivo.motivo == 'Otros') {
      this.administracionAlertaForm.controls['motivoDescripcion'].setValue("");
    } else {
      this.mostrarSeccionOtros = false;
      this.administracionAlertaForm.controls['motivoDescripcion'].setValue(`${this.buque} - ScatoPuerto Facturacion - ${motivo.motivo}`);
    }
    this.onCompletarAsunto();
  }

  onCompletarAsunto() {
    const motivoDescripcion: string = this.administracionAlertaForm.controls['motivoDescripcion'].value;
    const asunto = `${motivoDescripcion}`;
    this.administracionAlertaForm.controls['asunto'].setValue(asunto);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }
  onEnviarNotificacion() {
    let envioAlerta: AdministracionEnvioAlerta = {
      destinatarios: this.administracionAlertaForm.controls["destinatarios"].value,
      copia: this.administracionAlertaForm.controls["copia"].value,
      motivo: this.administracionAlertaForm.controls["motivo"].value.motivo,
      motivoDescripcion: this.administracionAlertaForm.controls["motivoDescripcion"].value,
      asunto: this.administracionAlertaForm.controls["asunto"].value,
      comentario: this.administracionAlertaForm.controls["comentario"].value,
      buque: this.buque
    };

    if (this.administracionAlertaForm.invalid) {
      return;
    }

    this._administracionService.enviarMailAlerta(envioAlerta).subscribe(data => {
      this._confirmationDialogService.confirm('Alerta - Facturación', 'Se envio la alerta de facturacion correctamente .', 'Aceptar', '', null, null, Tipoalerta.Success);
      this.cerrar.emit();
    });
  }

  private cargarCorreoInformacion() {
    this._administracionService.obtenerDatosMailAlerta(this.embarqueId).subscribe((data: AdministracionEnvioAlerta) => {
      if (data != null) {
        this.administracionAlertaForm.controls.destinatarios.setValue(data.destinatarios);
        this.administracionAlertaForm.controls.copia.setValue(data.copia);
        this.administracionAlertaForm.controls.comentario.setValue(data.comentario);
        this.buque = data.buque;
      }
    });
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
  private inicializarForm(): FormGroup {
    return this._formBuilder.group({
      destinatarios: ['', Validators.required],
      copia: [''],
      motivo: [''],
      motivoDescripcion: [''],
      asunto: ['', Validators.required],
      comentario: ['', Validators.required],
    });
  }
}
