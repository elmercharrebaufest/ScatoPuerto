import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { ClienteService } from '@ScatoServicios/cliente.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-crear-cliente',
  templateUrl: './modal-crear-cliente.component.html',
  styleUrls: ['./modal-crear-cliente.component.css']
})
export class ModalCrearClienteComponent implements OnInit {

  @Output() actualizarListaClientes = new EventEmitter();
  @Input() id: number = 0;
  @Output() cerrar = new EventEmitter<void>()

  errorMessage: boolean = false;
  editarCliente: boolean = false;
  crearEditarClienteForm: FormGroup;
  submitted = false;
  nombre: string;
  mostrarSpinner: boolean = false;
  mensajeCliente: string = '';

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,
    private clienteService: ClienteService
  ) {
    this.initFormCrearEditarCliente();
  }

  ngOnInit(): void {
  }

  private initFormCrearEditarCliente() {
    this.crearEditarClienteForm = null;
    this.crearEditarClienteForm = this.formBuilder.group({
      nombre: ['', Validators.required],
    })
  }

  public onInputNombreCliente(e: Event) {
    const input = e.target as HTMLInputElement;
    this.crearEditarClienteForm['controls'].nombre.setValue(input.value);
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

  /*public onEditarCliente() {
    this.submitted = true
    let cliente = this.crearEditarClienteForm.getRawValue();
    if (this.crearEditarClienteForm.controls['nombre'].invalid) {
      this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }
  }*/

  public onCrearCliente() {
    this.mostrarSpinner = true;
    this.mensajeCliente = 'Guardando información de cliente';
    this.submitted = true
    let cliente = this.crearEditarClienteForm.getRawValue();
    if (this.id == 0) {
      cliente.id = 0;
    }
    cliente.habilitado = true;

    if (this.crearEditarClienteForm.controls['nombre'].invalid) {
      this.mostrarSpinner = false;
      this.mensajeCliente = "";
      this.confirmationDialogService.confirm('Advertencia', 'Porfavor complete los campos requeridos.', 'Cerrar', '', null, null, Tipoalerta.Warning)
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
      });
  }
}
