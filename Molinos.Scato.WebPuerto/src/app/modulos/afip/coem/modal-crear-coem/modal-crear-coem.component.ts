import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Caratula } from '@ScatoModels/afip/caratula';
import { COEM } from '@ScatoModels/afip/coem';
import { Embalajes } from '@ScatoModels/afip/embalajes';
import { NuevasMercaderiasSueltasCoem } from '@ScatoModels/afip/nuevasMercaderiasSueltasCoem';
import { NuevoCoem } from '@ScatoModels/afip/nuevoCoem';
import { ATAPuertoCuit } from '@ScatoModels/ata-puerto';
import { CoemAfipService } from '@ScatoServicios/afip/coem-afip.service';
import { TablasAfipService } from '@ScatoServicios/afip/tablas-afip.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { ProgramaEmbarqueService } from '@ScatoServicios/programa-embarque.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, forkJoin, of } from 'rxjs';

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

  public cargando: boolean;
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
  cantidadBultos: number = 0;
  peso: number = 0;
  identificadorDeclaracion: string = '';

  private codigoEmbalajeGranel: string;

  public mensajeCarga = 'Cargando datos';
  public ata$: Observable<ATAPuertoCuit[]>[] = [];
  public atas: ATAPuertoCuit[] = [];

  constructor(
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private formBuilder: FormBuilder,
    private coemAfipService: CoemAfipService,
    private tablasAfipService: TablasAfipService,
    private programaEmbarqueService: ProgramaEmbarqueService
  ) {
    this.initFormCrearEditarCode();
  }

  ngOnInit(): void {
    this.operacionNuevo = !this.id;
    this.titleCoem = this.title;
    this.cargarDatos();
  }

  private cargarDatos() {
    const obtenerCoem: Observable<COEM> = this.operacionNuevo ? of(null) : this.coemAfipService.obtenerCoemId(this.id);
    this.mensajeCarga = 'Cargando datos';
    this.cargando = true;
    forkJoin([
      this.coemAfipService.comboCaratulas(),
      this.tablasAfipService.listarNaturalezasEmbalaje(),
      this.programaEmbarqueService.listarComboATA(),
      obtenerCoem
    ]).subscribe(([caratulas, embalajes, atas, coem]) => {
      this.caratulas = caratulas;
      this.atas = atas.filter(a => a.cuit);

      this.idCaratula = caratulas.find(c => c.id == this.caratulaId)?.identificadorCaratula;
      if (this.idCaratula) {
        const control = this.crearEditarCoemForm.get('identificadorCaratula');
        control.setValue(this.idCaratula);
        control.disable();
      }

      this.codigoEmbalajeGranel = embalajes.find(e => e.descripcion == 'A GRANEL').codigo;

      if (coem) {
        this.setValoresFormEditar(coem);
      } else {
        this.agregarNuevoCoem();
      }
      this.cargando = false;
    }, (error) => {
      console.error(error);
      this.cargando = false;
      this.confirmationDialogService.confirm('¡Error!', 'Ocurrió un error al cargar los datos', 'Cerrar', '', null, null, Tipoalerta.Error);
    });
  }

  get mercaderiasSueltasFormArray(): FormArray {
    return this.crearEditarCoemForm.get('mercaderiasSueltas') as FormArray;
  }

  private initFormCrearEditarCode() {
    this.crearEditarCoemForm = null;
    this.crearEditarCoemForm = this.formBuilder.group({
      id: [''],
      identificadorCaratula: ['', Validators.required],
      mercaderiasSueltas: this.formBuilder.array([]),
    });
  }

  public inicializarFormMercaderias(mercaderia: NuevasMercaderiasSueltasCoem = null): FormGroup {
    const regex = /^(\d{5}[a-zA-Z]{2}[\da-zA-Z]{2}\d{6}[a-zA-Z])$/;
    const form = this.formBuilder.group({
      cuitATA: ['', [Validators.required, this.ValidadorEsObjeto]],
      codigoEmbalaje: [''],
      cantidadBultos: [''],
      peso: ['', Validators.required],
      identificadorDeclaracion: ['', Validators.pattern(regex)],
    });
    const control = form.get('cuitATA');
    const observable = this.tablasAfipService.crearObservableAutocompletar(control, this.atas, ['nombre', 'cuit']);
    this.ata$.push(observable);
    if (mercaderia != null) {
      const ata = this.atas.find(a => a.cuit == mercaderia.cuitATA);
      form.get('cuitATA').setValue(ata);
      form.get('codigoEmbalaje').setValue(mercaderia.embalajes[0].codigoEmbalaje);
      form.get('cantidadBultos').setValue(mercaderia.embalajes[0].peso);
      form.get('peso').setValue(mercaderia.embalajes[0].peso);
      form.get('identificadorDeclaracion').setValue(mercaderia.identificadorDeclaracion);
    }
    return form;
  }

  public getNombre(ata: ATAPuertoCuit) {
    return ata ? `${ata.nombre} - ${ata.cuit}` : '';
  }

  private ValidadorEsObjeto(control: AbstractControl) {
    if (typeof control.value !== 'object') {
      return { invalid: true };
    }
    return null;
  }

  closeModalEditarCrearCoem() {
    this.modalService.dismissAll();
  }

  public async onCrearCoem() {
    this.crearEditarCoemForm.markAllAsTouched();
    if (this.crearEditarCoemForm.invalid) {
      this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning);
      return;
    }
    const confirmed = await this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de ${this.operacionNuevo ? 'crear un nuevo' : 'editar el'} Coem?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning);
    if (!confirmed) {
      return;
    }
    this.crearEditarCoem(this.setValoresNuevoOEditarCoem());
  }

  private crearEditarCoem(coem: COEM) {
    const request = this.operacionNuevo ? this.coemAfipService.registrarCoem(coem) : this.coemAfipService.editarCoem(coem);
    this.mensajeCarga = 'Enviando datos';
    this.cargando = true;
    request.subscribe(() => {
      this.cargando = false;
      this.modalService.dismissAll();
      this.editOCrearFinish.emit();
      this.confirmationDialogService.confirm('¡Felicitaciones!', `Ha ${this.operacionNuevo ? 'creado una nueva' : 'editado la'} COEM con éxito`, 'Cerrar', '', null, null, Tipoalerta.Success);
    }, (err) => {
      this.mostrarError(err);
    });
  }

  mostrarError = (err?: any) => {
    this.cargando = false;
    console.error(err);
    let msj: string;
    if (typeof err.error == 'string') {
      msj = err.error;
    } else {
      msj = err.error?.message || err.error?.error || `Ha ocurrido un error al No se ha podido ${this.operacionNuevo ? 'crear una nueva' : 'editar la'} COEM`;
    }
    this.confirmationDialogService.error(msj);
  }

  agregarNuevoCoem() {
    this.mercaderiasSueltasFormArray.push(this.inicializarFormMercaderias());
  }

  eliminarNuevoCoem(i: number) {
    this.mercaderiasSueltasFormArray.removeAt(i);
    this.ata$.splice(i, 1);
  }

  public getListaHistorialCoem() {
    return this.listaNuevoCoem;
  }

  setValoresNuevoOEditarCoem() {
    let coem = new COEM();
    let i = 0;
    coem.id = this.operacionNuevo ? undefined : this.id;
    coem.identificadorCaratula = this.crearEditarCoemForm.controls['identificadorCaratula'].value;
    coem.mercaderiasSueltas = new Array<NuevasMercaderiasSueltasCoem>();

    for (let mercaderia of this.mercaderiasSueltasFormArray.value) {
      coem.mercaderiasSueltas.push(new NuevasMercaderiasSueltasCoem());
      coem.mercaderiasSueltas[i].cuitATA = mercaderia.cuitATA.cuit;
      coem.mercaderiasSueltas[i].identificadorDeclaracion = mercaderia.identificadorDeclaracion;
      coem.mercaderiasSueltas[i].embalajes = new Array<Embalajes>();
      coem.mercaderiasSueltas[i].embalajes.push(new Embalajes());
      coem.mercaderiasSueltas[i].embalajes[0].cantidadBultos = mercaderia.peso;
      coem.mercaderiasSueltas[i].embalajes[0].codigoEmbalaje = this.codigoEmbalajeGranel;
      coem.mercaderiasSueltas[i].embalajes[0].peso = mercaderia.peso;
      i++;
    }
    return coem;
  }

  setValoresFormEditar(coem: COEM) {
    this.crearEditarCoemForm.controls['id'].setValue(coem.id);
    this.crearEditarCoemForm.controls['identificadorCaratula'].setValue(coem.identificadorCaratula);
    this.idCaratula = this.crearEditarCoemForm.get('identificadorCaratula').value;
    this.crearEditarCoemForm.controls['identificadorCaratula'].disable();

    for (const mercaderia of coem.mercaderiasSueltas) {
      const mercaderiaForm = this.inicializarFormMercaderias(mercaderia);
      this.mercaderiasSueltasFormArray.push(mercaderiaForm);
    }
  }

  onInput(e: Event) {
    const input = e.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
  }
}
