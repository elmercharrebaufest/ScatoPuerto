import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Exportador } from '@ScatoModels/exportador';
import { CargadoresService } from '@ScatoServicios/cargadores.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-editar-crear-cargador',
  templateUrl: './editar-crear-cargador.component.html',
  styleUrls: ['./editar-crear-cargador.component.css'],
})

export class EditarCrearCargadorComponent implements OnInit {
  @Output() refrescarListado = new EventEmitter();
  @Input() id: number = 0;
  @Output() cerrar = new EventEmitter();

  tituloModal: string = 'Alta de exportador';
  exportadorForm: FormGroup;
  mostrarSpinner: boolean = false;
  invalido: boolean = false;
  consultandoSap: boolean = false;
  codigoSapDesdeConsulta: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private cargadorService: CargadoresService,
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    if (this.id > 0) {
      this.tituloModal = 'Edicion de exportador';
      this.obtenerExportadorEdicion();
    }   
  }

  private initForm() {
    this.exportadorForm = this.formBuilder.group({
      id: 0,
      cuit: ['', [Validators.required, this.cuitValidator()]],
      nombre: ['', [Validators.required, this.nombreValidator()]],
      codigoSap: ['', [Validators.required, this.codigoSapValidator()]],
      habilitado: [true],
    });
  }

  cuitValidator() {
    return (control) => {
      if (!control.value)
        return { cuitRequerido: true };

      const cuitPattern = /^\d{11}$/;
      if (!cuitPattern.test(control.value)) {
        return { cuitInvalido: true };
      }

      return null;
    };
  }

  nombreValidator() {
    return (control) => {
      if(!control.value)
        return { nombreRequerido: true };

      if (control.value.trim().length === 0) {
        return { nombreInvalido: true };
      }

      if (control.value.trim().length < 3) {
        return { nombreInvalido: true };
      }

      if (control.value.trim().length > 40) {
        return { nombreInvalido: true };
      }

      const soloCaracteresEspeciales = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
      if (soloCaracteresEspeciales.test(control.value)) {
        return { nombreInvalido: true };
      }

      return null;
    };
  }

  codigoSapValidator() {
    return (control) => {
      if (!control.value)
        return { codigoSapRequerido: true };

      if (control.value.trim().length === 0) {
        return { codigoSapInvalido: true };
      }

      if (control.value.trim().length > 10) {
        return { codigoSapInvalido: true };
      }

      const codigoPattern = /^\d+$/;
      if (!codigoPattern.test(control.value)) {
        return { codigoSapInvalido: true };
      }

      return null;
    };
  }

  public onInputCuit(e: Event) {
    this.invalido = false;
    const input = e.target as HTMLInputElement;
    const valor = input.value.replace(/\D/g, '');
    this.exportadorForm['controls'].cuit.setValue(valor);

    if (this.codigoSapDesdeConsulta && valor !== input.value) {
      this.codigoSapDesdeConsulta = false;
      this.exportadorForm['controls'].codigoSap.setValue('');
      this.exportadorForm['controls'].nombre.setValue('');
    }
  }

  public onInputNombre(e: Event) {
    this.invalido = false;
    const input = e.target as HTMLInputElement;
    this.exportadorForm['controls'].nombre.setValue(input.value);
  }

  public onInputCodigoSap(e: Event) {
    this.invalido = false;
    const input = e.target as HTMLInputElement;
    const valor = input.value.replace(/\D/g, '');
    this.exportadorForm['controls'].codigoSap.setValue(valor);
  }

  public onConsultarPorCuit() {
    // Esta función se implementará cuando esté lista la integración con SAP
    // Por ahora mostramos un mensaje informativo
    this.confirmationDialogService.confirm(
      'Información',
      'La consulta a SAP por CUIT estará disponible próximamente. Por favor, ingrese los datos manualmente.',
      'Cerrar',
      '',
      null,
      null,
      Tipoalerta.Warning
    );
  }

  public onResetForm(){
    this.exportadorForm.reset();
    this.invalido = false;
    this.codigoSapDesdeConsulta = false;
    this.cerrar.emit();
  }

  public onGuardarExportador(){
    if(this.exportadorForm.invalid){
      this.confirmationDialogService.confirm(
        'Advertencia', 
        'Por favor complete todos los campos obligatorios correctamente:\n- CUIT: 11 dígitos numéricos\n- Nombre: entre 3 y 40 caracteres\n- Código SAP: hasta 10 caracteres numéricos', 
        'Cerrar', 
        '', 
        null, 
        null, 
        Tipoalerta.Warning
      );
      this.invalido = true;
      return;
    }
    if(this.id == 0)
      this.grabarAlta();
    else 
      this.grabarEdicion();
  }

  public grabarAlta(){
    this.cargadorService.AgregarCargador(this.exportadorForm.value).subscribe(() => {
      this.modalService.dismissAll();
      this.refrescarListado.emit(true);
      this.confirmationDialogService.confirm('¡Felicitaciones!', `Ha agregado el cargador con éxito`, 'Cerrar', '', null, null, Tipoalerta.Success);
    }, (err) => {
      console.log(err);
      let msjError = err.error || `Ha ocurrido un error al intentar agregar cargador.`;
      this.confirmationDialogService.confirm('Atención', msjError, 'Cerrar', '', null, null, Tipoalerta.Warning);
    });
  }

  public grabarEdicion(){
    this.cargadorService.EditarCargador(this.exportadorForm.value).subscribe(() => {
      this.modalService.dismissAll();
      this.refrescarListado.emit(true);
      this.confirmationDialogService.confirm('¡Felicitaciones!', `Ha editado el cargador con éxito`, 'Cerrar', '', null, null, Tipoalerta.Success);
    }, (err) => {
      console.log(err);
      let msjError = err.error || `Ha ocurrido un error al intentar editar cargador.`;
      this.confirmationDialogService.confirm('Atención', msjError, 'Cerrar', '', null, null, Tipoalerta.Warning);
    });
  }

  public obtenerExportadorEdicion(){
    this.cargadorService.ObtenerExportador(this.id).subscribe((exportador : Exportador) => {
      this.exportadorForm.controls.id.setValue(exportador.id);
      this.exportadorForm.controls.cuit.setValue(exportador.cuit);
      this.exportadorForm.controls.nombre.setValue(exportador.nombre);
      this.exportadorForm.controls.codigoSap.setValue(exportador.codigoSap);
      this.exportadorForm.controls.habilitado.setValue(exportador.habilitado);
    }, (err: Error) => {
      console.log(err);
      this.mostrarError();
    });
  }

  mostrarError(){
    this.confirmationDialogService.error('Ha ocurrido un error al intentar guardar los cambios.');
  }

  get campoCuit() {
    return this.exportadorForm.get('cuit');
  }

  get campoNombre() {
    return this.exportadorForm.get('nombre');
  }

  get campoCodigoSap() {
    return this.exportadorForm.get('codigoSap');
  }

}
