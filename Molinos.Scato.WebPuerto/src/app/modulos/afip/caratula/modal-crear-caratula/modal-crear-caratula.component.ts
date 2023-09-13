import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { CaratulaAfipService } from '@ScatoServicios/afip/caratula-afip.service';
import { AfipLugarOperativo, AfipPuerto, AfipPuntoAduanero } from '@ScatoModels/afip/tablas-afip';
import { TablasAfipService } from '@ScatoServicios/afip/tablas-afip.service';
import { of, Observable, forkJoin } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { AbstractControl } from '@angular/forms';
import { Caratula } from '@ScatoModels/afip/caratula';

@Component({
  selector: 'app-modal-crear-caratula',
  templateUrl: './modal-crear-caratula.component.html',
  styleUrls: ['./modal-crear-caratula.component.css']
})
export class ModalCrearCaratulaComponent implements OnInit {

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
  private puertos: AfipPuerto[] = [];

  public aduanas$: Observable<AfipPuntoAduanero[]>;
  public lugaresOperativos$: Observable<AfipLugarOperativo[]>;
  public puertos$: Observable<AfipPuerto[]>;

  constructor(
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private formBuilder: FormBuilder,
    private caratulaAfipService: CaratulaAfipService,
    private tablasAfipService: TablasAfipService
  ) {
    this.initFormCrearEditarCaratula();
  }

  ngOnInit(): void {

    this.titleCaratula = this.title;
    const obtenerCaratula = this.title.includes('Nueva') ? of(null) : this.caratulaAfipService.obtenerCaratulaId(this.id);
    this.cargando = true;
    this.mensajeCarga = 'Cargando datos';
    forkJoin([
      this.tablasAfipService.listarPuntosAduaneros(),
      this.tablasAfipService.listarLugaresOperativos(),
      this.tablasAfipService.listarPuertos(),
      obtenerCaratula
    ]).subscribe(([aduanas, lugaresOperativos, puertos, caratula]) => {
      this.aduanas = aduanas.sort((a, b) => a.descripcion > b.descripcion ? 1 : -1); // Ordenado alfabeticamente
      this.lugaresOperativos = lugaresOperativos.sort((a, b) => a.descripcion > b.descripcion ? 1 : -1); // Ordenado alfabeticamente
      this.puertos = puertos.sort((a, b) => a.descripcion > b.descripcion ? 1 : -1); // Ordenado alfabeticamente
      if (!caratula) {
        return;
      }
      for (let [prop, val] of Object.entries(caratula)) {
        switch (prop) {
          case 'codigoAduana':
            val = aduanas.find(aduana => aduana.codigo == val);
            break;
          case 'codigoLugarOperativo':
            val = lugaresOperativos.find(lugarOp => lugarOp.codigo == val);
            break;
          case 'puertoDestino':
            val = puertos.find(puerto => puerto.codigo == val);
        }
        this.crearEditarCaratulaForm.get(prop)?.setValue(val);
      }
    }, (error) => {
      console.error(error);
      this.confirmationDialogService.confirm('¡Error!', 'Ocurrió un error al cargar los datos', 'Cerrar', '', null, null, Tipoalerta.Error);
    }, () => {
      this.cargando = false;
    });
  }

  public getNombre(option: AfipPuntoAduanero | AfipLugarOperativo | AfipPuerto) {
    return option ? `(${option.codigo}) ${option.descripcion}` : '';
  }

  private ValidadorEsObjeto(control: AbstractControl) {
    if (typeof control.value !== 'object') {
      return { invalid: true };
    }
    return null;
  }

  private initFormCrearEditarCaratula() {
    this.crearEditarCaratulaForm = null;
    this.crearEditarCaratulaForm = this.formBuilder.group({
      id: [''],
      itinerario: [[]],
      identificadorBuque: ['', Validators.required],
      nombreMedioTransporte: ['', Validators.required],
      puertoDestino: [null, [Validators.required, this.ValidadorEsObjeto]],
      codigoAduana: [null, [Validators.required, this.ValidadorEsObjeto]],
      codigoLugarOperativo: [null, [Validators.required, this.ValidadorEsObjeto]],
      via: ['8'],
      fechaArribo: ['', Validators.required],
      fechaZarpada: ['', Validators.required]
    })

    // Funciones para autocompletado
    this.puertos$ = this.crearEditarCaratulaForm.get('puertoDestino').valueChanges.pipe(
      debounceTime(500), // Tiempo de espera en ms antes de filtrar
      startWith(''),
      map(val => this._filtrar(this.puertos, val))
    );
    this.aduanas$ = this.crearEditarCaratulaForm.get('codigoAduana').valueChanges.pipe(
      debounceTime(500),
      startWith(''),
      map(val => this._filtrar(this.aduanas, val))
    );
    this.lugaresOperativos$ = this.crearEditarCaratulaForm.get('codigoLugarOperativo').valueChanges.pipe(
      debounceTime(500),
      startWith(''),
      map(val => this._filtrar(this.lugaresOperativos, val))
    );
    // this.crearEditarCaratulaForm.get('puertoDestino').disable();
  }

  // Función que permite filtrar los arrays para los desplegables
  private _filtrar<T>(arr: T[], val: string): T[] {
    console.log(val);
    if (typeof (val) != 'string') { // Cuando se selecciona una opción, el
      return;
    }
    const lowerVal = val.toLocaleLowerCase().trim();
    const res = arr.filter(item => item['descripcion'].toLocaleLowerCase().indexOf(lowerVal) > -1);
    return res.slice(0, 10);
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

    form.get('puertoDestino').enable();
    const mostrarError = () => this.confirmationDialogService.confirm('¡Error!', `No se ha podido ${nueva ? 'crear una nueva' : 'editar la'} Caratula, comunicarse con soporte técnico`, 'Cerrar', '', null, null, Tipoalerta.Error);

    const caratula: Caratula = form.value;
    caratula.codigoAduana = form.get('codigoAduana').value.codigo;
    caratula.codigoLugarOperativo = form.get('codigoLugarOperativo').value.codigo;
    caratula.puertoDestino = form.get('puertoDestino').value.codigo;

    const observable = nueva ? this.caratulaAfipService.registrarCaratula(caratula) : this.caratulaAfipService.rectificarCaratula(caratula);
    this.cargando = true;
    this.mensajeCarga = 'Guardando caratula';
    observable.subscribe(async (data) => {
      if (!data) {
        mostrarError();
        return;
      }
      this.editOCrearFinish.emit();
      await this.confirmationDialogService.confirm('¡Felicitaciones!', `Ha ${nueva ? 'creado una nueva' : 'editado la'} Caratula con éxito`, 'Cerrar', '', null, null, Tipoalerta.Success);
      this.modalService.dismissAll();
    }, error => {
      console.error(error);
      mostrarError();
    }, () => {
      this.cargando = false
    });
  }

  get f() { return this.crearEditarCaratulaForm.controls; }



}
