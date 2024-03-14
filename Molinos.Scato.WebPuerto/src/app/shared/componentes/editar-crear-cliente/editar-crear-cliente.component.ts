import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-editar-crear-cliente',
  templateUrl: './editar-crear-cliente.component.html',
  styleUrls: ['./editar-crear-cliente.component.css']
})
export class EditarCrearClienteComponent implements OnInit {

  @Output() actualizarListaClientes = new EventEmitter();
  errorMessage: boolean = false;
  editarCliente: boolean = false;
  crearEditarClienteForm: FormGroup;
  submitted = false;
  nombreCliente: string;
  mostrarSpinner: boolean = false;
  mensajeCliente: string = '';

  // #endregion

  // #region Constructor
  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder
  ) {
    this.initFormCrearEditarCliente();
  }
  // #endregion

  // #region Eventos del Componente
  ngOnInit(): void {

  }
  // #endregion

  // #region Metodos
  private initFormCrearEditarCliente() {
    this.crearEditarClienteForm = null;
    this.crearEditarClienteForm = this.formBuilder.group({
      nombreCliente: ['', Validators.required]
    })
  }

  public openModalEditarCrearCliente(modal: any) {
    this.errorMessage = false;
    this.initFormCrearEditarCliente();
    this.modalService.open(modal, { size: 'md', centered: true, backdrop: 'static', keyboard: false });
  }
}
