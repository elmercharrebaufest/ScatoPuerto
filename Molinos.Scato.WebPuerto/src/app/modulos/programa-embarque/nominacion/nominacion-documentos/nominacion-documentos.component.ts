import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CoordinadorPuerto } from '@ScatoModels/coordinador-puerto';
import { Destino } from '@ScatoModels/destino';
import { ConfiguracionDocumento, Documento, DocumentoTipo } from '@ScatoModels/digitalizacion-documentos/documento';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DocumentoService } from '@ScatoServicios/documento.service';
import { BehaviorSubject, combineLatest, forkJoin, Observable, Subject } from 'rxjs';
import { NominacionProcesoService } from '../nominacion-proceso.service';
import { delay, filter, take, takeUntil } from 'rxjs/operators';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';
import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { Nominacion } from '@ScatoModels/programa-embarque/nominacion';

interface DocumentosPorTipo {
  tipo: DocumentoTipo,
  documentos: Documento[]
}

interface DocumentoForm {
  id: number;
  documento: Documento;
  seleccionado: boolean;
}

interface DocumentoGrupoForm {
  nombre: string;
  documentos: DocumentoForm[];
}

interface ConfiguracionForm {
  id: number;
  cliente: CoordinadorPuerto;
  destino: Destino;
  juegos: number;
  grupos: DocumentoGrupoForm[];
};

interface DocumentoDestinoMini {
  docId: number;
  destinoId: number;
}

interface DocumentoMaterialPuertoMini {
  docId: number;
  materialId: number;
}

@Component({
  selector: 'app-nominacion-documentos',
  templateUrl: './nominacion-documentos.component.html',
  styleUrls: ['./nominacion-documentos.component.scss']
})
export class NominacionDocumentosComponent implements OnInit, OnDestroy {

  public destinos$: Observable<Destino[]>;
  public clientes$: Observable<CoordinadorPuerto[]>;
  public form: FormGroup;
  public multiplesConfPosibles: boolean = false;
  public nominacionId: number;
  public guardando: boolean = false;

  private nominacion: Nominacion;
  private documentosPorTipo: DocumentosPorTipo[] = [];
  private docsDestinos: DocumentoDestinoMini[] = [];
  private docsProductos: DocumentoMaterialPuertoMini[] = [];
  private destroy$ = new Subject();

  private nominacionCargada$ = new BehaviorSubject<boolean>(false);
  private documentosCargados$ = new BehaviorSubject<boolean>(false);
  private destinosCargados$ = new BehaviorSubject<boolean>(false);
  private clientesCargados$ = new BehaviorSubject<boolean>(false);

  constructor(
    private documentoService: DocumentoService,
    private nominacionProcesoService: NominacionProcesoService,
    private fb: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,
    private chRef: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      configuraciones: this.fb.array([], this.validacionDestinoCliente())
    });
  }

  ngOnInit(): void {
    this.cargarDatosNominacion();
    this.cargarDocumentos();
    this.inicializarSuscripciones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  // #region Getters
  public get configuracionesForm() {
    return this.form.get('configuraciones') as FormArray;
  }

  /**
   * Obtiene todos los documentos de la configuracion sin agrupar
   * @param configForm FormControl de la configuracion
   * @param filtro Filtro a aplicar a los documentos
   */
  private getDocsCtrlsConfiguracion(configForm: AbstractControl, filtro?: (doc: DocumentoForm) => boolean) {
    const docForms: FormGroup[] = [];
    for (const grupo of (configForm.get('grupos') as FormArray).controls) {
      for (const docForm of (grupo.get('documentos') as FormArray).controls) {
        const docFormVal = docForm.value as DocumentoForm;
        if (!filtro || filtro(docFormVal)) {
          docForms.push(docForm as FormGroup);
        }
      }
    }
    return docForms;
  }
  // #endregion Getters

  // #region Acciones destino/producto
  private async inicializarSuscripciones() {
    // Espero a que ya hayan cargado la nominación y los documentos
    await combineLatest([this.nominacionCargada$, this.documentosCargados$]).pipe(
      filter(([nomCargada, docsCargados]) => nomCargada && docsCargados), take(1)
    ).toPromise();

    this.initDestinos();
    this.initClientes();
    this.initProducto();

    this.cargarConfiguraciones();
  }

  private async initDestinos() {
    this.destinos$ = this.nominacionProcesoService.destinosSeleccionados$;

    // Suscripción a los cambios del listado de destinos en Dato Tecnico
    this.destinos$.pipe(takeUntil(this.destroy$)).subscribe(destinos => {
      if (this.nominacion && destinos.length) {
        this.destinosCargados$.next(true);
      }
      const destinoCtrls = this.configuracionesForm.controls.map(c => c.get('destino'));
      for (const ctrl of destinoCtrls) {
        if (destinos.length == 1 && !this.nominacion) {
          ctrl.setValue(destinos[0]);
          ctrl.disable();
        } else {
          ctrl.enable();
          // Se debe actualizar la referencia al objeto de destino ya que el array de origen es completamente reemplazado
          const destinoRef = destinos.find(d => d.id == ctrl.value?.id);
          ctrl.setValue(destinoRef);
        }
      }
      this.actualizarMultiplesConfPosibles();
      this.chRef.detectChanges();
    });
  }

  private initClientes() {
    this.clientes$ = this.nominacionProcesoService.clientesSeleccionados$;

    // Suscripción a los cambios del listado de clientes en Dato Tecnico
    this.clientes$.pipe(takeUntil(this.destroy$)).subscribe(clientes => {
      if (this.nominacion && clientes.length) {
        this.clientesCargados$.next(true);
      }
      const clienteCtrls = this.configuracionesForm.controls.map(c => c.get('cliente'));
      for (const ctrl of clienteCtrls) {
        if (clientes.length == 1 && !this.nominacion) {
          ctrl.setValue(clientes[0]);
          ctrl.disable();
        } else {
          ctrl.enable();
          // Se debe actualizar la referencia al objeto de cliente ya que el array de origen es completamente reemplazado
          const clienteRef = clientes.find(c => c.id == ctrl.value?.id);
          ctrl.setValue(clienteRef);
        }
      }

      this.actualizarMultiplesConfPosibles();
      this.chRef.detectChanges();
    });
  }

  private initProducto() {
    // Suscripción a los cambios de producto en DatoTecnico
    this.nominacionProcesoService.materialPuertoSeleccionado$
      .pipe(takeUntil(this.destroy$), filter(material => Boolean(material)))
      .subscribe(material => {
        this.filtrarSolidoLiquido(material.esLiquido);
        this.setAllDocsDefaultProducto(material);
      });
  }

  /**
   * Cuando el producto cambia, se chequean en todas las configuraciones
   * todos los documentos que contengan ese producto como default
   */
  private setAllDocsDefaultProducto(producto: MaterialPuerto) {
    for (const configForm of this.configuracionesForm.controls) {
      this.setDocsDefaultProducto(configForm, producto);
    }
  }

  /**
   * Chequea en una configuracion todos los documentos
   * que contengan el producto como default
   */
  private setDocsDefaultProducto(configForm: AbstractControl, producto: MaterialPuerto) {
    if (!producto || configForm.get('id').value) {
      return;
    }
    const docsIds = this.docsProductos.filter(dp => dp.materialId == producto.id).map(dp => dp.docId);
    const docsForms = this.getDocsCtrlsConfiguracion(configForm, df => docsIds.includes(df.documento.id));
    for (const docForm of docsForms) {
      docForm.get('seleccionado').setValue(true);
    }
  }

  /**
   * Cuando se cambia el destino, chequea todos los
   * documentos que contengan el desitno como default
   */
  private setDocsDefaultDestino(destino: Destino, configForm: AbstractControl) {
    if (!destino?.id || configForm.get('destino').value.id == destino.id) {
      return;
    }
    const docsIds = this.docsDestinos.filter(dd => dd.destinoId == destino.id).map(dp => dp.docId);
    const docsForms = this.getDocsCtrlsConfiguracion(configForm, df => docsIds.includes(df.documento.id));
    for (const docForm of docsForms) {
      docForm.get('seleccionado').setValue(true);
    }
  }

  /**
   * Filtra los documentos según si el documento es líquido o sólido
   */
  private filtrarSolidoLiquido(esLiquido: boolean) {
    for (const configForm of this.configuracionesForm.controls) {
      for (const grupo of (configForm.get('grupos') as FormArray).controls) {
        const docGrupo = this.documentosPorTipo.find(g => g.tipo.nombre === grupo.get('nombre').value);
        const docsFormArray = grupo.get('documentos') as FormArray;
        // Se itera de manera inversa para evitar problemas de indice al eliminar
        for (let i = docsFormArray.length - 1; i >= 0; i--) {
          const docForm = docsFormArray.at(i);
          const docFormVal = docForm.value as DocumentoForm;
          if ((esLiquido && !docFormVal.documento.liquido) || (!esLiquido && !docFormVal.documento.solido)) {
            docsFormArray.removeAt(i);
          }
        }

        // Verificar los documentos faltantes y agregarlos
        const documentosFaltantes = docGrupo.documentos
          .filter(doc => (esLiquido && doc.liquido) || (!esLiquido && doc.solido))
          .filter(doc => !(docsFormArray.value as DocumentoForm[]).some(d => d.documento.id === doc.id));

        for (const doc of documentosFaltantes) {
          docsFormArray.push(this.initDocFormGroup(doc));
        }
        this.ordernarDocumentosFormArray(docsFormArray);
      }
    }
  }

  private actualizarMultiplesConfPosibles() {
    const { destinosActuales, clientesActuales } = this.nominacionProcesoService;
    this.multiplesConfPosibles = destinosActuales.length > 1 || clientesActuales.length > 1;
  }
  // #endregion Acciones destino/producto

  // #region Datos
  private cargarDocumentos() {
    forkJoin([
      this.documentoService.listarDocumentos(),
      this.documentoService.listarDocumentosDestino(),
      this.documentoService.ListarDocumentosProducto()
    ]).subscribe(([listaDocs, docsDestinos, docsProductos]) => {
      this.docsDestinos = docsDestinos.map(dd => ({ docId: dd.documento.id, destinoId: dd.destino.id }));
      this.docsProductos = docsProductos.map(dp => ({ docId: dp.documento.id, materialId: dp.materialPuerto.id }));
      this.agruparDocumentos(listaDocs.items);
      this.documentosCargados$.next(true);
    }, err => {
      console.error(err);
      this.confirmationDialogService.error('Ocurrió un error al cargar los documentos');
    });
  }

  private agruparDocumentos(docs: Documento[]) {
    this.documentosPorTipo = [];

    for (const documento of docs) {
      let grupo = this.documentosPorTipo.find(g => g.tipo.id == documento.documentoTipo.id);
      if (!grupo) {
        grupo = { tipo: documento.documentoTipo, documentos: [] };
        this.documentosPorTipo.push(grupo);
      }
      grupo.documentos.push(documento);
    }

    this.documentosPorTipo = this.documentosPorTipo.sort((a, b) => a.tipo.id - b.tipo.id);
  }
  // #endregion Datos

  // #region EDITAR
  private async cargarDatosNominacion() {
    const nominacion = await this.nominacionProcesoService.nominacionActual$.pipe(take(1)).toPromise();
    this.nominacionCargada$.next(true);
    if (nominacion) {
      this.nominacion = nominacion;
      this.nominacionId = nominacion.id;
    }
  }

  private async cargarConfiguraciones() {
    let configuraciones: ConfiguracionDocumento[] = [undefined];

    if (this.nominacion) {
      configuraciones = this.nominacion.configuracionDocumentos;
      // Espero a que ya hayan cargado los listados de destinos y clientes
      await combineLatest([this.destinosCargados$, this.clientesCargados$]).pipe(
        filter(([destinosCargados, clientesCargados]) => destinosCargados && clientesCargados), take(1)
      ).toPromise();
    }

    for (const config of configuraciones) {
      const configuracionform = this.initConfiguracionForm(config);
      this.configuracionesForm.push(configuracionform);
    }
  }

  /**
   * Setea los datos del form de una configuración con los datos obtenidos
   */
  private cargarDatosConfiguracion(configuracion: ConfiguracionDocumento, configForm: FormGroup) {
    const { id, cantidadDeJuegos: juegos } = configuracion;
    const cliente = this.nominacionProcesoService.clientesActuales.find(c => c.id == configuracion.coordinadorPuerto.id);
    const destino = this.nominacionProcesoService.destinosActuales.find(c => c.id == configuracion.destino.id);
    configForm.patchValue({ id, cliente, destino, juegos });

    const docsForms = this.getDocsCtrlsConfiguracion(configForm);
    const gruposFormArray = configForm.get('grupos') as FormArray;

    for (const nomDoc of configuracion.nominacionDocumentos) {
      let docForm = docsForms.find(df => (df.get('documento').value as Documento).id == nomDoc.documento.id);
      // Si el documento no existe entre los que se muestran en la nominación (inactivo), se agrega al final del grupo
      if (!docForm) {
        docForm = this.initDocFormGroup(nomDoc.documento);
        const grupoForm = gruposFormArray.controls.find(g => g.get('nombre').value == nomDoc.documento.documentoTipo.nombre);
        const grupoDocs = grupoForm.get('documentos') as FormArray;
        grupoDocs.push(docForm);
      }

      docForm.get('id').setValue(nomDoc.id);
      docForm.get('seleccionado').setValue(true);

      // Si ya tiene archivos asociados, no se permite deschequear
      if (nomDoc.archivos.length) {
        docForm.disable();
      }
    }
  }
  // #endregion EDITAR

  // #region Construccion Form
  private initConfiguracionForm(configuracion?: ConfiguracionDocumento) {
    const gruposFormArray = this.initGruposFormArray();

    const configForm = this.fb.group({
      id: 0,
      destino: this.fb.control('', Validators.required),
      cliente: this.fb.control('', Validators.required),
      juegos: [0, [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]*$/)]],
      grupos: gruposFormArray
    });

    if (this.nominacionProcesoService.clientesActuales.length == 1 && !this.nominacion) {
      configForm.get('cliente').disable();
    }
    if (this.nominacionProcesoService.destinosActuales.length == 1 && !this.nominacion) {
      configForm.get('destino').disable();
    }

    // Edición
    if (configuracion) {
      console.log('cargo configuracion');
      this.cargarDatosConfiguracion(configuracion, configForm);
    } else {
      this.setDocsDefaultProducto(configForm, this.nominacionProcesoService.materialPuertoActual);
    }

    configForm.get('destino').valueChanges
      .pipe(takeUntil(this.destroy$), filter((d: Destino) => Boolean(d)))
      .subscribe(d => this.setDocsDefaultDestino(d, configForm));

    return configForm;
  }

  private initDocFormGroup(documento: Documento) {
    return this.fb.group({
      id: 0,
      documento,
      seleccionado: false
    });
  }

  private initGruposFormArray() {
    const gruposFormArray = this.fb.array([]);
    const producto = this.nominacionProcesoService.materialPuertoActual

    for (const grupo of this.documentosPorTipo) {
      // Filtro aquellos documentos que no son de solido/liquido según el producto seleccionado.
      // En caso de no haber producto selecciono todos.
      const docsFormGroups = grupo.documentos
        .filter(d => !producto || (producto.esLiquido && d.liquido) || (!producto.esLiquido && d.solido))
        .map(d => this.initDocFormGroup(d));
      const grupoForm = this.fb.group({
        nombre: grupo.tipo.nombre,
        documentos: this.fb.array(docsFormGroups),
      });
      gruposFormArray.push(grupoForm);
    }

    return gruposFormArray;
  }

  private ordernarDocumentosFormArray(docsFormArray: FormArray) {
    const ordenados = (docsFormArray.getRawValue() as DocumentoForm[]).sort((a, b) => a.documento.id - b.documento.id);
    docsFormArray.patchValue(ordenados);

  }

  private validacionDestinoCliente(): ValidatorFn {
    return (formArray: AbstractControl): ValidationErrors | null => {
      if (!(formArray instanceof FormArray)) {
        return null;
      }

      const combinaciones = formArray.controls.map(fg => {
        const destino = fg.get('destino').value as Destino;
        const cliente = fg.get('cliente').value as CoordinadorPuerto;
        return `${destino?.id}-${cliente?.id}`;
      });

      const hayDuplicados = combinaciones.some((item, i) => combinaciones.indexOf(item) != i);

      return hayDuplicados ? { combinacionesDuplicadas: true } : null;
    };
  }
  // #endregion Construccion Form

  public agregarConfiguracion() {
    const configuracionForm = this.initConfiguracionForm();

    const { clientesActuales, destinosActuales } = this.nominacionProcesoService;
    if (clientesActuales.length == 1) {
      const clienteCtrl = configuracionForm.get('cliente');
      clienteCtrl.setValue(clientesActuales[0]);
      clienteCtrl.disable();
    }
    if (destinosActuales.length == 1) {
      const desitnoCtrl = configuracionForm.get('destino');
      desitnoCtrl.setValue(destinosActuales[0]);
      desitnoCtrl.disable();
    }

    this.configuracionesForm.push(configuracionForm);
  }

  public puedeEliminarConfig(i: number) {
    const configForm = this.configuracionesForm.at(i);
    const docs = this.getDocsCtrlsConfiguracion(configForm);
    return !docs.some(d => d.disabled);
  }

  public eliminarConfiguracion(i: number) {
    this.configuracionesForm.removeAt(i);
  }

  public crearObjetoConfiguraciones() {
    const formData = this.configuracionesForm.getRawValue() as ConfiguracionForm[];
    const configuraciones: ConfiguracionDocumento[] = [];

    for (const configForm of formData) {
      const documentosForm: DocumentoForm[] = []; // Array que contenerá todos los documentos seleccionados sin importar a qué grupo pertenecen
      for (const grupo of configForm.grupos) {
        const docs = grupo.documentos.filter(d => d.seleccionado);
        documentosForm.push(...docs);
      }

      const configuracion: ConfiguracionDocumento = {
        id: configForm.id,
        coordinadorPuerto: configForm.cliente,
        destino: configForm.destino,
        cantidadDeJuegos: +configForm.juegos,
        nominacionDocumentos: documentosForm.map(df => ({ id: df.id, documento: df.documento }))
      };

      configuraciones.push(configuracion);
    }

    return configuraciones;
  }

  // TODO: validaciones
  public validarConfiguraciones() {
    if (this.configuracionesForm.hasError('combinacionesDuplicadas')) {
      this.confirmationDialogService.error('Existe una combinación duplicada de Destino y Cliente');
    } else if (!this.form.valid) {
      this.confirmationDialogService.error('Por favor valide los datos de Documentación')
    }
    this.form.markAllAsTouched();
    return this.form.valid;
  }

  public cancelar() {
    this.configuracionesForm.clear();
    for (const config of this.nominacion.configuracionDocumentos) {
      const configuracionform = this.initConfiguracionForm(config);
      this.configuracionesForm.push(configuracionform);
    }
  }

  public guardar() {
    if (!this.validarConfiguraciones()) {
      return;
    }
    const configuraciones = this.crearObjetoConfiguraciones();
    this.guardando = true;
    this.documentoService.guardarConfiguraciones(configuraciones, this.nominacionId).subscribe(() => {
      this.guardando = false;
      this.confirmationDialogService.exito('Configuraciones de documentos guardadas correctamente.', 'Registro Nominación - Configuración de documentos');
    }, err => {
      this.guardando = false;
      console.error(err);
      let msj: string;
      if (typeof err.error == 'string') {
        msj = err.error;
      } else {
        msj = err.error?.message || err.error?.error || 'Ha ocurrido un error al guardar las configuraciones de documento';
      }
      this.confirmationDialogService.error(msj);
    });
  }
}
