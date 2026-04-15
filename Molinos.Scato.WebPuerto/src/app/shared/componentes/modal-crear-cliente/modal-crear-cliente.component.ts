import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Cliente } from '@ScatoModels/cliente/cliente';
import { CoordinadorPuerto } from '@ScatoModels/coordinador-puerto';
import { ClienteService } from '@ScatoServicios/cliente.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-crear-cliente',
  templateUrl: './modal-crear-cliente.component.html',
  styleUrls: ['./modal-crear-cliente.component.css']
})
export class ModalCrearClienteComponent implements OnInit {

  @Output() actualizarListaClientes = new EventEmitter();
  @Input() id: number = 0;
  @Output() cerrar = new EventEmitter<void>()
  @Output() altaEnPrelineUp = new EventEmitter();
  @Input() esAltaPrelineUp: boolean = false;

  errorMessage: boolean = false;
  editarCliente: boolean = false;
  crearEditarClienteForm: FormGroup;
  submitted = false;
  nombre: string;
  mostrarSpinner: boolean = false;
  mensajeCliente: string = '';
  tituloModal: string = '';

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,
    private clienteService: ClienteService
  ) {
    this.initFormCrearEditarCliente();
  }

  ngOnInit(): void {
    if (this.id > 0) {
      this.tituloModal = "Edicion de cliente";
      this.obtenerCliente();
    }else{
      if(this.esAltaPrelineUp){
        this.tituloModal = "Alta de Coordinador de Puerto";
      }else{
        this.tituloModal = "Alta de cliente";
      }
    }
  }

  private initFormCrearEditarCliente() {
    this.crearEditarClienteForm = null;
    this.crearEditarClienteForm = this.formBuilder.group({
      nombre: ['', [Validators.required, this.nombreInvalidoValidator()]],
      habilitado: true,
    })
  }

  public onInputNombreCliente(e: Event) {
    const input = e.target as HTMLInputElement;
    this.crearEditarClienteForm['controls'].nombre.setValue(input.value);
  }

  public onInputCodSapCliente(e: Event) {
    /*const input = e.target as HTMLInputElement;
    this.crearEditarClienteForm['controls'].nombre.setValue(input.value);*/    
  }

  public openModalEditarCrearCliente(modal: any) {
    this.errorMessage = false;
    this.initFormCrearEditarCliente();
    this.modalService.open(modal, { size: 'xl', centered: true, backdrop: 'static', keyboard: false });
  }

  get f() { return this.crearEditarClienteForm.controls; }

  public onResetForm() {
    this.submitted = false;
    this.crearEditarClienteForm.reset();
    this.editarCliente = false;
    this.cerrar.emit();
  }

  public onCrearCliente() {
    this.mostrarSpinner = true;
    this.mensajeCliente = 'Guardando información de cliente';
    this.submitted = true
    let cliente = this.crearEditarClienteForm.getRawValue();

    cliente.id = this.id;
    cliente.habilitado = true;

    if (this.crearEditarClienteForm.controls['nombre'].invalid) {
      this.mostrarSpinner = false;
      this.mensajeCliente = "";
      this.confirmationDialogService.confirm('Advertencia', 'Por favor complete los campos requeridos.', 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }

    this.clienteService.guardarCliente(cliente).subscribe(
      (res) => { }
      , error => {
        console.error(error);
        this.mostrarSpinner = false;
        this.mensajeCliente = '';
        this.onResetForm();
        this.confirmationDialogService.confirm('Atención', error.error.Message, 'Cerrar', '', null, null, Tipoalerta.Warning)
      }
      , () => {
        this.mostrarSpinner = false;
        this.mensajeCliente = '';
        this.actualizarListaClientes.emit(true);
        this.onResetForm();
        this.modalService.dismissAll();
        if(this.esAltaPrelineUp){
          this.altaEnPrelineUp.emit(cliente);
        }
      });
  }

  obtenerCliente() {
    this.clienteService.obtenerCliente(this.id).subscribe((res: Cliente) => {
      if (res != null) {
        console.log(res);
        this.crearEditarClienteForm.controls.nombre.setValue(res.nombre);
      }
    }, error => { 
      console.log(error);
    }
      , () => {
        this.mostrarSpinner = false;
        this.mensajeCliente = '';
      })
  }

  nombreInvalidoValidator() {
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
}
