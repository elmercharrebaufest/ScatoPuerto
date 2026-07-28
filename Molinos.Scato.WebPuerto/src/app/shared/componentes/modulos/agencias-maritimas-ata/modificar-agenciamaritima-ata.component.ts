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
  @Output() altaEnPrelineUp = new EventEmitter();
  @Input() esAltaPrelineUp: boolean = false;

  public IsLoading: boolean;
  load: boolean = true;
  nuevoCoem: NuevoCoem = new NuevoCoem();
  frmCrearEditar: FormGroup;
  consultandoSap: boolean = false;
  codigoSapDesdeConsulta: boolean = false;

  isAgenciaMaritima: boolean = true;
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
    if (!this.id) {
      this.isEditar = false;
    } else {
      this.isEditar = true;
      this.setValoresFrmEditar();
    }
  }

  initFormCrearEditarCode = () => {
    this.frmCrearEditar = null;
    this.frmCrearEditar = this.formBuilder.group({
      id: [''],
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      cuit: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      codigoSap: ['', [Validators.required, Validators.pattern(/^\d{1,10}$/)]],
      tipo: [1],
    });
  }

  setValoresFrmEditar = () => {
    this.agenciaMaritimaAtaService.obtenerAgenciaMaritima(this.id).subscribe((res) => {
      this.frmCrearEditar.controls['nombre'].setValue(res.nombre);
      this.frmCrearEditar.controls['cuit'].setValue(res.cuit);
      this.frmCrearEditar.controls['codigoSap'].setValue(res.codigoSap);
    });
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
      codigoSap:  this.frmCrearEditar.controls['codigoSap'].value,
      tipo:  this.frmCrearEditar.controls['tipo'].value,
    }

    const request = this.isEditar ? this.agenciaMaritimaAtaService.modificar(agenciaAta) : 
      this.agenciaMaritimaAtaService.crear(agenciaAta);

    this.IsLoading = true;
    request.subscribe(() => {
      this.IsLoading = false;
      this.modalService.dismissAll();
      this.finishEditOrCreate.emit();
      if(this.esAltaPrelineUp){
        this.altaEnPrelineUp.emit(agenciaAta);
      }
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
    let destination = "Agencia Marítima";
    return destination;
  }

  public onInputCuit(e: Event) {
    const input = e.target as HTMLInputElement;
    const valor = input.value.replace(/\D/g, '');
    this.frmCrearEditar.controls['cuit'].setValue(valor);

    if (this.codigoSapDesdeConsulta && valor !== input.value) {
      this.codigoSapDesdeConsulta = false;
      this.frmCrearEditar.controls['codigoSap'].setValue('');
      this.frmCrearEditar.controls['nombre'].setValue('');
    }
  }

  public onInputNombre(e: Event) {
    const input = e.target as HTMLInputElement;
    this.frmCrearEditar.controls['nombre'].setValue(input.value);
  }

  public onInputCodigoSap(e: Event) {
    const input = e.target as HTMLInputElement;
    const valor = input.value.replace(/\D/g, '');
    this.frmCrearEditar.controls['codigoSap'].setValue(valor);
  }

  public onConsultarPorCuit() {
    if (this.frmCrearEditar.controls['cuit'].invalid) {
      this.confirmationDialogService.confirm(
        'Advertencia',
        'Por favor ingrese un CUIT válido de 11 dígitos antes de consultar.',
        'Cerrar',
        '',
        null,
        null,
        Tipoalerta.Warning
      );
      return;
    }

    this.consultandoSap = true;
    const cuit = this.frmCrearEditar.controls['cuit'].value;

    this.agenciaMaritimaAtaService.ConsultarAgenciaMaritimaPorCuitEnSap(cuit).subscribe(
      (agencia: any) => {
        this.consultandoSap = false;
        if (agencia && agencia.codigoSap && agencia.nombre) {
          this.frmCrearEditar.controls['nombre'].setValue(agencia.nombre);
          this.frmCrearEditar.controls['codigoSap'].setValue(agencia.codigoSap);
          this.codigoSapDesdeConsulta = true;
        } else {
          this.codigoSapDesdeConsulta = false;
          this.confirmationDialogService.confirm(
            'Sin Resultados',
            'No se encontró la agencia marítima con el CUIT especificado en SAP. Por favor, ingrese los datos manualmente.',
            'Cerrar',
            '',
            null,
            null,
            Tipoalerta.Warning
          );
        }
      },
      (error) => {
        this.consultandoSap = false;
        this.codigoSapDesdeConsulta = false;
        console.error('Error al consultar en SAP:', error);

        let mensaje = 'No se pudo consultar en SAP. Por favor, ingrese los datos manualmente.';
        if (error.status === 404) {
          mensaje = 'No se encontró la agencia marítima con el CUIT especificado en SAP. Por favor, ingrese los datos manualmente.';
        } else if (error.error) {
          mensaje = `Error: ${error.error}`;
        }

        this.confirmationDialogService.confirm(
          'Error en Consulta',
          mensaje,
          'Cerrar',
          '',
          null,
          null,
          Tipoalerta.Error
        );
      }
    );
  }
}
