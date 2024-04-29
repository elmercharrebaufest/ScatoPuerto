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
      nombre: ['', [Validators.required, this.nombreValidator()]],
      habilitado: [true],
    });
  }

  nombreValidator() {
    return (control) => {
      if(!control.value)
      return;

      if (control.value.trim().length === 0) {
        return { nombreInvalido: true };
      }

      if (control.value.trim().length < 3) {
        return { nombreInvalido: true };
      }

      const soloCaracteresEspeciales = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
      if (soloCaracteresEspeciales.test(control.value)) {
        return { nombreInvalido: true };
      }
      
      return null;
    };
  }

  public onInputNombre(e: Event) {
    this.invalido = false;
    const input = e.target as HTMLInputElement;
    this.exportadorForm['controls'].nombre.setValue(input.value);
  }

  public onResetForm(){
    this.exportadorForm.reset();
    this.invalido = false;
    this.cerrar.emit();
  }

  public onGuardarExportador(){
    if(this.exportadorForm.invalid){
      this.confirmationDialogService.confirm('Advertencia', 'Ud ha ingresado un valor invalido. Recuerde ingresar al menos 3 caracteres y que al menos 1 uno de estos sea alfanumerico.', 'Cerrar', '', null, null, Tipoalerta.Warning);
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
      this.exportadorForm.controls.nombre.setValue(exportador.nombre);
      this.exportadorForm.controls.habilitado.setValue(exportador.habilitado);
    }, (err: Error) => {
      console.log(err);
      this.mostrarError();
    });
  }

  mostrarError(){
    this.confirmationDialogService.error('Ha ocurrido un error al intentar guardar los cambios.');
  }

  get campoNombre() {
    return this.exportadorForm.get('nombre');
  }

}
