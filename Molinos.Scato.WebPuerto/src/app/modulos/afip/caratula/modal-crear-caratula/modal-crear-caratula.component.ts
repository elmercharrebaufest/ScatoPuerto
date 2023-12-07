import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { CaratulaAfipService } from '@ScatoServicios/afip/caratula-afip.service';
import { AfipLugarOperativo, AfipPuntoAduanero } from '@ScatoModels/afip/tablas-afip';
import { TablasAfipService } from '@ScatoServicios/afip/tablas-afip.service';
import { of, Observable, forkJoin, Subscription } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';
import { AbstractControl } from '@angular/forms';
import { Caratula } from '@ScatoModels/afip/caratula';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-modal-crear-caratula',
  templateUrl: './modal-crear-caratula.component.html',
  styleUrls: ['./modal-crear-caratula.component.css']
})
export class ModalCrearCaratulaComponent implements OnInit, OnDestroy {

  @Input() id: number = 0;
  @Input() title: string = "Nueva Caratula";
  @Output() editOCrearFinish = new EventEmitter<void>();

  errorMessage: boolean = false;
  submitted = false;
  titleCaratula: string
  crearEditarCaratulaForm: FormGroup;
  public cargando: boolean;
  public mensajeCarga: string;

  private aduanas: AfipPuntoAduanero[] = [];
  private lugaresOperativos: AfipLugarOperativo[] = [];

  public aduanas$: Observable<AfipPuntoAduanero[]>;
  public lugaresOperativos$: Observable<AfipLugarOperativo[]>;

  public ver: boolean;
  public identificadorCaratula: string;
  private suscripcion: Subscription;

  constructor(
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private formBuilder: FormBuilder,
    private caratulaAfipService: CaratulaAfipService,
    private tablasAfipService: TablasAfipService,
    private route: ActivatedRoute
  ) {
    this.initFormCrearEditarCaratula();
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      this.ver = Boolean(id);
      if (this.ver) {
        this.id = id;
      }
    });
  }

  ngOnInit(): void {
    this.titleCaratula = this.title;
    this.cargarDatos();
    this.suscripcion = this.caratulaAfipService.$recargarCaratula.pipe(
      tap(() => {
        this.cargando = true;
        this.mensajeCarga = 'Cargando datos';
      }),
      concatMap(() => this.caratulaAfipService.obtenerCaratulaId(this.id))
    ).subscribe(caratula => {
      this.asignarValoresCaratula(caratula);
      this.cargando = false;
    }, err => {
      console.error(err);
      this.cargando = false;
      this.confirmationDialogService.confirm('¡Error!', 'Ocurrió un error al cargar los datos', 'Cerrar', '', null, null, Tipoalerta.Error);
    });
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  private cargarDatos() {
    const obtenerCaratula: Observable<Caratula> = !this.id ? of(null) : this.caratulaAfipService.obtenerCaratulaId(this.id);
    this.cargando = true;
    this.mensajeCarga = 'Cargando datos';
    forkJoin([
      this.tablasAfipService.listarPuntosAduaneros(),
      this.tablasAfipService.listarLugaresOperativos(),
      obtenerCaratula
    ]).subscribe(([aduanas, lugaresOperativos, caratula]) => {
      this.aduanas = aduanas.sort((a, b) => a.descripcion > b.descripcion ? 1 : -1); // Ordenado alfabeticamente
      this.lugaresOperativos = lugaresOperativos.sort((a, b) => a.descripcion > b.descripcion ? 1 : -1); // Ordenado alfabeticamente
      this.asignarFuncionesAutocompletado();

      if (caratula) {
        this.asignarValoresCaratula(caratula);
      }

      if (this.ver) {
        this.crearEditarCaratulaForm.disable()
      }
    }, (error) => {
      console.error(error);
      this.confirmationDialogService.confirm('¡Error!', 'Ocurrió un error al cargar los datos', 'Cerrar', '', null, null, Tipoalerta.Error);
    }, () => {
      this.cargando = false;
    });
  }

  private asignarFuncionesAutocompletado() {
    this.aduanas$ = this.tablasAfipService.crearObservableAutocompletar(this.crearEditarCaratulaForm, 'codigoAduana', this.aduanas);
    this.lugaresOperativos$ = this.tablasAfipService.crearObservableAutocompletar(this.crearEditarCaratulaForm, 'codigoLugarOperativo', this.lugaresOperativos);
  }

  private asignarValoresCaratula(caratula: Caratula) {
    this.caratulaAfipService.$caratula.next(caratula);
    // Las propiedades de Caratula tienen el mismo nombre que los controles del form
    for (let [prop, val] of Object.entries(caratula)) {
      this.crearEditarCaratulaForm.get(prop)?.setValue(val);
    }
    this.crearEditarCaratulaForm.get('codigoAduana').setValue(this.aduanas.find(aduana => aduana.codigo == caratula.codigoAduana));
    this.crearEditarCaratulaForm.get('codigoLugarOperativo').setValue(this.lugaresOperativos.find(lugarOp => lugarOp.codigo == caratula.codigoLugarOperativo));

    this.identificadorCaratula = caratula.identificadorCaratula;
  }

  public getNombre(option: AfipPuntoAduanero | AfipLugarOperativo) {
    return option ? `(${option.codigo}) ${option.descripcion}` : '';
  }

  private ValidadorEsObjeto(control: AbstractControl) {
    if (typeof control.value !== 'object') {
      return { invalid: true };
    }
    return null;
  }

  private initFormCrearEditarCaratula() {
    this.crearEditarCaratulaForm = this.formBuilder.group({
      id: [''],
      itinerario: [[]],
      identificadorBuque: ['', Validators.required],
      nombreMedioTransporte: ['', Validators.required],
      puertoDestino: [null],
      codigoAduana: [null, [Validators.required, this.ValidadorEsObjeto]],
      codigoLugarOperativo: [null, [Validators.required, this.ValidadorEsObjeto]],
      via: ['8'],
      numeroViaje: [''],
      fechaArribo: ['', Validators.required],
      fechaZarpada: ['', Validators.required] // TODO: Validacion con fecha arribo
    })
  }

  closeModalEditarCrearCaratula() {
    this.modalService.dismissAll()
  }

  public async onCrearEditarCaratula() {
    this.submitted = true;
    const form = this.crearEditarCaratulaForm;
    if (form.invalid) {
      this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }
    const nueva = this.title.includes('Nueva');
    if ((!nueva && !form.get('id').value) || (nueva && form.get('id').value)) {
      this.confirmationDialogService.confirm('¡Error!', `No se ha podido ${nueva ? 'crear una nueva' : 'editar la'} Caratula, comunicarse con soporte técnico`, 'Cerrar', '', null, null, Tipoalerta.Error)
      return;
    }

    const confirmed = await this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de ${nueva ? 'crear una nueva' : 'editar la'} Caratula?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning);
    if (!confirmed) {
      return;
    }

    const mostrarError = (err?: string) => {
      const msj = err || `No se ha podido ${nueva ? 'crear una nueva' : 'editar la'} Caratula, comunicarse con soporte técnico`;
      this.confirmationDialogService.confirm('¡Error!', msj, 'Cerrar', '', null, null, Tipoalerta.Error)
      this.cargando = false;
    };

    const caratula: Caratula = form.value;
    caratula.codigoAduana = form.get('codigoAduana').value.codigo;
    caratula.codigoLugarOperativo = form.get('codigoLugarOperativo').value.codigo;
    caratula.puertoDestino = '';

    this.cargando = true;
    this.mensajeCarga = 'Guardando caratula';
    const observable = nueva ? this.caratulaAfipService.registrarCaratula(caratula) : this.caratulaAfipService.rectificarCaratula(caratula);

    observable.subscribe(async () => {
      this.editOCrearFinish.emit();
      await this.confirmationDialogService.confirm('¡Felicitaciones!', `Ha ${nueva ? 'creado una nueva' : 'editado la'} Caratula con éxito`, 'Cerrar', '', null, null, Tipoalerta.Success);
      this.cargando = false;
      this.modalService.dismissAll();
    }, err => {
      console.error(err);
      mostrarError(err.error);
    });
  }

  get f() { return this.crearEditarCaratulaForm.controls; }

}
