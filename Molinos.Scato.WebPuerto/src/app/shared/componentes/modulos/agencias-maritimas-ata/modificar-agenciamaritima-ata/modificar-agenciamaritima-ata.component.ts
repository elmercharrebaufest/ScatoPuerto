import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { NuevoCoem } from '@ScatoModels/afip/nuevoCoem';
import { AgenciaMaritimaATA } from '@ScatoModels/programa-embarque/agencia-maritima-ata';
import { AgenciaMaritimaAtaService } from '@ScatoServicios/agencia-maritima-ata.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modificar-agenciamaritima-ata',
  templateUrl: './modificar-agenciamaritima-ata.component.html',
  styleUrls: ['./modificar-agenciamaritima-ata.component.css'],
})
export class ModalModificarAgenciasMaritimasAtaComponent implements OnInit {
  @Input() id: number = null;
  @Input() tittle: string = null;
  @Input() tipo: number = null;
  @Output() finishEditOrCreate = new EventEmitter<void>();

  public IsLoading: boolean;
  load: boolean = true;
  nuevoCoem: NuevoCoem = new NuevoCoem();
  frmCrearEditar: FormGroup;

  isAgenciaMaritima: boolean;
  isEditar: boolean;

  constructor(
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private formBuilder: FormBuilder,
    private agenciaMaritimaAtaService: AgenciaMaritimaAtaService 
  ) {
    this.initFormCrearEditarCode();
  }

  ngOnInit(): void {
    console.log('ModalModificarAgenciasMaritimasAtaComponent.ngOnInit()');
    console.log(this.id);
    console.log(this.tittle);
    console.log(this.tipo);
    if (this.tipo == 1) {
      this.isAgenciaMaritima = true;
    } else {
      this.isAgenciaMaritima = false;
    }

    if (!this.id) {
      this.isEditar = false;
      if (this.tipo == 1 || this.tipo == 2) {
        this.frmCrearEditar.controls['tipo'].disable();
        this.frmCrearEditar.controls['tipo'].setValue(this.tipo);
      }
    } else {
      this.isEditar = true;
      this.frmCrearEditar.controls['tipo'].disable();
      this.setValoresFrmEditar();
    }
  }

  initFormCrearEditarCode = () => {
    this.frmCrearEditar = null;
    this.frmCrearEditar = this.formBuilder.group({
      id: [''],
      nombre: ['', Validators.required],
      cuit: ['', Validators.required],
      tipo: ['0', Validators.required],
    });
  }

  setValoresFrmEditar = () => {
    this.frmCrearEditar.controls['tipo'].setValue(this.tipo);
    if (this.isAgenciaMaritima) {
      this.agenciaMaritimaAtaService.obtenerAgenciaMaritima(this.id).subscribe((res) => {
        this.frmCrearEditar.controls['nombre'].setValue(res.nombre);
        this.frmCrearEditar.controls['cuit'].setValue(res.cuit);
      });
    } else {
      this.agenciaMaritimaAtaService.obtenerAta(this.id).subscribe((res) => {
        this.frmCrearEditar.controls['nombre'].setValue(res.nombre);
        this.frmCrearEditar.controls['cuit'].setValue(res.cuit);
      });
    }
  }


  closeModalEditarCrearCoem = () => {
    this.modalService.dismissAll();
  }

  grabar = async () => {
    this.frmCrearEditar.markAllAsTouched();
    if (this.frmCrearEditar.invalid) {
      this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning);
      return;
    }

    const confirmed = await this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de ${this.getOperationString()} ${this.getDestinationString()}?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning);
    if (!confirmed) {
      return;
    }
    this.crearEditarCoem();
  }

  crearEditarCoem = () => {
    let agenciaAta: AgenciaMaritimaATA = 
    {
      id: this.id, 
      nombre:  this.frmCrearEditar.controls['nombre'].value,
      cuit:  this.frmCrearEditar.controls['cuit'].value,
      tipo:  this.frmCrearEditar.controls['tipo'].value,
    }

    const request = this.isEditar ? this.agenciaMaritimaAtaService.modificar(agenciaAta) : 
      this.agenciaMaritimaAtaService.crear(agenciaAta);

    this.IsLoading = true;
    request.subscribe(() => {
      this.IsLoading = false;
      this.modalService.dismissAll();
      this.finishEditOrCreate.emit();
      this.confirmationDialogService.confirm('¡Felicitaciones!', `Ha ${this.getOperationString()} ${this.getDestinationString()} con éxito`, 'Cerrar', '', null, null, Tipoalerta.Success);
    }, (err) => {
      this.mostrarError(err);
    });
  }

  mostrarError = (err?: any) => {
    this.IsLoading = false;
    let msj: string;
    if (typeof err.error == 'string') {
      msj = err.error;
    } else {
      msj = err.error?.message || err.error?.error || `Ha ocurrido un error: No se ha podido ${this.getOperationString()} ${this.getDestinationString()}`;
    }
    this.confirmationDialogService.error(msj);
  }

  getOperationString = (): string => {
    let operation = "";
    if (this.isEditar) {
      operation += "editado la ";
    } else {
      operation += "creado una nueva ";
    }
    return operation;
  }

  getDestinationString = ():string => {
    let destination = "";
    if (this.isAgenciaMaritima) {
      destination += "Agencia Marítima";
    } else {
      destination += "ATA";
    }
    return destination;
  }
}
