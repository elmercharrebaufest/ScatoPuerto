import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Caratula } from '@ScatoModels/afip/caratula';
import { COEM } from '@ScatoModels/afip/coem';
import { Embalajes } from '@ScatoModels/afip/embalajes';
import { NuevasMercaderiasSueltasCoem } from '@ScatoModels/afip/nuevasMercaderiasSueltasCoem';
import { NuevoCoem } from '@ScatoModels/afip/nuevoCoem';
import { CoemAfipService } from '@ScatoServicios/afip/coem-afip.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-crear-coem',
  templateUrl: './modal-crear-coem.component.html',
  styleUrls: ['./modal-crear-coem.component.css'],
})
export class ModalCrearCoemComponent implements OnInit {
  @Input() id: number = null;
  @Input() title: string = 'Nueva Comunicación de Embarque Previa';
  @Input() caratulaId: number = 0;
  @Output() editOCrearFinish = new EventEmitter<void>();

  errorMessage: boolean = false;
  submitted = false;
  titleCoem: string;
  load: boolean = true;
  listaNuevoCoem: NuevoCoem[] = [];
  nuevoCoem: NuevoCoem = new NuevoCoem();
  crearEditarCoemForm: FormGroup;
  caratulas: Caratula[] = [];
  idCaratula: string;
  operacionNuevo: boolean = true;

  cuitATA: string = '';
  codigoEmbalaje: string = '';
  cantidadBultos: number = 0;
  peso: number = 0;
  identificadorDeclaracion: string = '';

  constructor(
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private formBuilder: FormBuilder,
    private coemAfipService: CoemAfipService
  ) {
    this.initFormCrearEditarCode();
  }

  ngOnInit(): void {
    this.id == null ? this.operacionNuevo : (this.operacionNuevo = false);
    this.titleCoem = this.title;
    this.agregarNuevoCoem();
    this.loadIdsCaratula();
    this.setValoresFormEditar();
  }

  get mercaderiasSueltasFormArray(): FormArray {
    return this.crearEditarCoemForm.get('mercaderiasSueltas') as FormArray;
  }
  get embalajeForm(): FormGroup {
    return this.mercaderiasSueltasFormArray.controls[0] as FormGroup;
  }

  private initFormCrearEditarCode() {
    this.crearEditarCoemForm = null;
    this.crearEditarCoemForm = this.formBuilder.group({
      id: [''],
      identificadorCaratula: ['', Validators.required],
      mercaderiasSueltas: this.formBuilder.array([]),
    });
  }
  public inicializarFormMercaderias(mercaderias: any = null): FormGroup {
    if (mercaderias != null) {
      return this.formBuilder.group({
        cuitATA: mercaderias.cuitATA,
        codigoEmbalaje: mercaderias.codigoEmbalaje,
        cantidadBultos: mercaderias.cantidadBultos,
        peso: mercaderias.peso,
        identificadorDeclaracion: mercaderias.identificadorDeclaracion,
      });
    } else {
      return this.formBuilder.group({
        cuitATA: ['', Validators.required],
        codigoEmbalaje: ['', Validators.required],
        cantidadBultos: ['', Validators.required],
        peso: ['', Validators.required],
        identificadorDeclaracion: [''],
      });
    }
  }

  closeModalEditarCrearCoem() {
    this.modalService.dismissAll();
  }

  public async onCrearCoem() {
    this.submitted = true;
    if (this.crearEditarCoemForm.controls['identificadorCaratula'].invalid || this.mercaderiasSueltasFormArray.invalid) {
      this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning);
      return;
    }
    const confirmed = await this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de ${this.operacionNuevo ? 'crear un nuevo' : 'editar el'} Coem?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning);
    if (!confirmed) {
      return;
    }
    this.crearEditarCoem(this.setValoresNuevoOEditarCoem());
    this.modalService.dismissAll();
  }

  private crearEditarCoem(coem) {
    const request = this.operacionNuevo ? this.coemAfipService.registrarCoem(coem) : this.coemAfipService.editarCoem(coem);
    request.subscribe(() => {
      this.editOCrearFinish.emit();
      this.confirmationDialogService.confirm('¡Felicitaciones!', `Ha ${this.operacionNuevo ? 'creado una nueva' : 'editado la'} Coem con éxito`, 'Cerrar', '', null, null, Tipoalerta.Success);
    }, (err) => {
      console.error(err);
      this.mostrarError(err.error);
    });
  }

  mostrarError = (err?: string) => {
    const msj = err || `No se ha podido ${this.operacionNuevo ? 'crear un nuevo' : 'editar el'} Coem, comunicarse con soporte técnico`;
    this.confirmationDialogService.confirm('¡Error!', msj, 'Cerrar', '', null, null, Tipoalerta.Error);
  }

  agregarNuevoCoem() {
    this.mercaderiasSueltasFormArray.push(this.inicializarFormMercaderias());
  }

  eliminarNuevoCoem(i) {
    this.mercaderiasSueltasFormArray.removeAt(i);
  }

  public getListaHistorialCoem() {
    return this.listaNuevoCoem;
  }

  loadIdsCaratula() {
    this.coemAfipService.comboCaratulas().subscribe((datos) => {
      this.caratulas = datos;
      this.idCaratula = datos.find(c => c.id == this.caratulaId)?.identificadorCaratula;
      if (this.idCaratula) {
        const control = this.crearEditarCoemForm.get('identificadorCaratula');
        control.setValue(this.idCaratula);
        control.disable();
        console.log('valor', this.crearEditarCoemForm.controls['identificadorCaratula'].value)
      }
    });
  }

  setValoresNuevoOEditarCoem() {
    let coem = new COEM();
    let i = 0;
    !this.operacionNuevo ? coem.id = this.id : null;
    coem.identificadorCaratula = this.crearEditarCoemForm.controls['identificadorCaratula'].value;
    coem.mercaderiasSueltas = new Array<NuevasMercaderiasSueltasCoem>();

    for (let mercaderia of this.mercaderiasSueltasFormArray.value) {
      coem.mercaderiasSueltas.push(new NuevasMercaderiasSueltasCoem());
      coem.mercaderiasSueltas[i].cuitATA = mercaderia.cuitATA;
      coem.mercaderiasSueltas[i].identificadorDeclaracion = mercaderia.identificadorDeclaracion;
      coem.mercaderiasSueltas[i].embalajes = new Array<Embalajes>();
      coem.mercaderiasSueltas[i].embalajes.push(new Embalajes());
      coem.mercaderiasSueltas[i].embalajes[0].cantidadBultos = mercaderia.cantidadBultos;
      coem.mercaderiasSueltas[i].embalajes[0].codigoEmbalaje = mercaderia.codigoEmbalaje;
      coem.mercaderiasSueltas[i].embalajes[0].peso = mercaderia.peso;
      i++;
    }
    return coem;
  }

  setValoresFormEditar() {
    if (!this.operacionNuevo) {
      this.coemAfipService.obtenerCoemId(this.id).subscribe((datos) => {
        this.crearEditarCoemForm.controls['id'].setValue(datos.id);
        this.crearEditarCoemForm.controls['identificadorCaratula'].setValue(datos.identificadorCaratula);
        this.idCaratula = this.crearEditarCoemForm.get('identificadorCaratula').value;
        this.crearEditarCoemForm.controls['identificadorCaratula'].disable();
        this.embalajeForm.get('cuitATA').setValue(datos.mercaderiasSueltas[0].cuitATA);
        this.embalajeForm.get('codigoEmbalaje').setValue(datos.mercaderiasSueltas[0].embalajes[0].codigoEmbalaje);
        this.embalajeForm.get('cantidadBultos').setValue(datos.mercaderiasSueltas[0].embalajes[0].cantidadBultos);
        this.embalajeForm.get('peso').setValue(datos.mercaderiasSueltas[0].embalajes[0].peso);
        this.embalajeForm.get('identificadorDeclaracion').setValue(datos.mercaderiasSueltas[0].identificadorDeclaracion);
      });
    }
  }
}
