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
  private suscripciones: Subscription[] = [];
  public fechaMin: string;
  public fechaMax: string;

  constructor(
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private formBuilder: FormBuilder,
    private caratulaAfipService: CaratulaAfipService,
    private tablasAfipService: TablasAfipService,
    private route: ActivatedRoute
  ) {
    this.setearRangoFechaArribo();
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
    const suscripcion = this.caratulaAfipService.$recargarCaratula.pipe(
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
    this.suscripciones.push(suscripcion)
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach(s => s.unsubscribe());
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
    const controlAduana = this.crearEditarCaratulaForm.get('codigoAduana');
    const controlLugarOperativo = this.crearEditarCaratulaForm.get('codigoLugarOperativo');
    this.aduanas$ = this.tablasAfipService.crearObservableAutocompletar(controlAduana, this.aduanas);
    this.lugaresOperativos$ = this.tablasAfipService.crearObservableAutocompletar(controlLugarOperativo, this.lugaresOperativos);
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
    this.crearEditarCaratulaForm.get('esLiquido').disable();
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

  /**
   * Valida que la fecha de arribo esté entre 5 y 96 horas en el futuro
   */
  private ValidadorFechaArribo(control: AbstractControl) {
    const msFecha = new Date(control.value).getTime();
    if (msFecha) {
      const minimo = new Date().setHours(new Date().getHours() + 5);
      const maximo = new Date().setHours(new Date().getHours() + 96);
      if (msFecha < minimo || msFecha > maximo) {
        return { fechaInvalida: true };
      }
    }
    return null;
  }

  /**
   * Valida que la fecha de zarpada sea posterior a la de arribo
   */
  private ValidadorFechaZarpada(control: AbstractControl) {
    const msFecha = new Date(control.value).getTime();
    if (msFecha) {
      const msFechaArribo = new Date(control.parent.get('fechaArribo').value).getTime();
      if (msFecha < msFechaArribo) {
        return { fechaInvalida: true };
      }
    }
    return null;
  }

  private setearRangoFechaArribo() {
    const convertirFecha = (date: Date) => {
      const dia = ('0' + date.getDate().toString()).slice(-2);
      const mes = ('0' + (date.getMonth() + 1).toString()).slice(-2);
      const anio = date.getFullYear().toString();
      const horas = ('0' + date.getHours().toString()).slice(-2);
      const minutos = ('0' + date.getMinutes().toString()).slice(-2);
      return `${anio}-${mes}-${dia}T${horas}:${minutos}`;
    }
    const minimo = new Date(new Date().setHours(new Date().getHours() + 5));
    const maximo = new Date(new Date().setHours(new Date().getHours() + 96));

    this.fechaMin = convertirFecha(minimo);
    this.fechaMax = convertirFecha(maximo);
  }

  private initFormCrearEditarCaratula() {

    this.crearEditarCaratulaForm = this.formBuilder.group({
      id: [0],
      itinerario: [[]],
      identificadorBuque: ['', Validators.required],
      nombreMedioTransporte: ['', Validators.required],
      puertoDestino: [null],
      codigoAduana: [null, [Validators.required, this.ValidadorEsObjeto]],
      codigoLugarOperativo: [null, [Validators.required, this.ValidadorEsObjeto]],
      via: ['8'],
      numeroViaje: [''],
      fechaArribo: ['', [Validators.required, this.ValidadorFechaArribo]],
      fechaZarpada: ['', [Validators.required, this.ValidadorFechaZarpada]],
      esLiquido: [false]
    });

    const controlFechaZarpada = this.crearEditarCaratulaForm.get('fechaZarpada');
    const suscripcion = this.crearEditarCaratulaForm.get('fechaArribo').valueChanges.subscribe(val => {
      const fechaArribo = new Date(val);
      const fechaZarpada = new Date(controlFechaZarpada.value);
      if (fechaArribo >= fechaZarpada) {
        controlFechaZarpada.setValue('');
      }
    });
    this.suscripciones.push(suscripcion);
  }

  closeModalEditarCrearCaratula() {
    this.modalService.dismissAll()
  }

  public async onCrearEditarCaratula() {
    this.submitted = true;
    const form = this.crearEditarCaratulaForm;
    if (form.invalid) {
      form.markAllAsTouched();
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

    const mostrarError = (err?: any) => {
      this.cargando = false;
      console.error(err);
      let msj: string;
      if (typeof err.error == 'string') {
        msj = err.error;
      } else {
        msj = err.error?.message || err.error?.error || `Ha ocurrido un error al ${nueva ? 'crear una nueva' : 'editar la'} Caratula`;
      }
      this.confirmationDialogService.error(msj);
    };

    const caratula: Caratula = form.getRawValue();
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
      mostrarError(err);
    });
  }

  public async cambiarTipoProducto() {
    const esLiquido = this.crearEditarCaratulaForm.get('esLiquido').value;
    const confirm = await this.confirmationDialogService.confirmar('¡Atención!', `¿Está seguro de cambiar el tipo de producto de ${esLiquido ? 'líquido a sólido' : 'sólido a líquido'}?`);
    if (!confirm) {
      return;
    }
    this.cargando = true;
    this.mensajeCarga = 'Cambiando tipo de producto';
    this.caratulaAfipService.cambiarTipoProducto(this.id).subscribe(async () => {
      this.cargando = false;
      await this.confirmationDialogService.exito('Se ha cambiado el tipo de producto correctamente');
      this.modalService.dismissAll();
    }, err => {
      console.error(err);
      this.cargando = false;
      this.confirmationDialogService.error('Ha ocurrido un error al cambiar el tipo de producto');
    });
  }

  get f() { return this.crearEditarCaratulaForm.controls; }

}
