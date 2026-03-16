import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Acuerdo, AcuerdoTipo, AcuerdoDetalle, AcuerdoTipoConfiguracion, AcuerdoTipoConfiguracionConcepto } from '@ScatoModels/acuerdos/acuerdos';
import { Concepto } from '@ScatoModels/administracion/concepto';
import { Exportador } from '@ScatoModels/exportador';
import { Mail } from '@ScatoModels/mail';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { MuelleDeCarga } from '@ScatoModels/programa-embarque/muelle-de-carga';
import { AcuerdoService } from '@ScatoServicios/acuerdo.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { EnvioMailDialogService } from '@ScatoServicios/envio-mail-dialog.service';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

interface ConceptoPorTipo {
  tipo: string;
  conceptos: ConceptoConfiguracion[];
}

interface ConceptoConfiguracion {
  concepto: Concepto;
  obligatorio: boolean;
}

@Component({
  selector: 'app-acuerdo-detalle',
  templateUrl: './acuerdo-detalle.component.html',
  styleUrls: ['./acuerdo-detalle.component.css']
})
export class AcuerdoDetalleComponent implements OnInit, OnDestroy {

  public acuerdoId: number;
  public titulo: string = "Edición de Acuerdo";
  public formAcuerdo: FormGroup;
  public fileAcuerdo: File;
  public fileNameAcuerdo: string;

  // Datos de combos
  public tiposAcuerdo: AcuerdoTipo[] = [];
  public muelles: MuelleDeCarga[] = [];
  public exportadores: Exportador[] = [];
  public materialesPuerto: MaterialPuerto[] = [];
  public configuraciones: AcuerdoTipoConfiguracion[] = [];

  // Conceptos agrupados por tipo según la configuración actual
  public conceptosPorTipo: ConceptoPorTipo[] = [];

  // IDs especiales
  private MUELLE_SAN_BENITO_ID = 1;
  private EXPORTADOR_MOA_ID = 1;

  private valoresOriginales = {
    muelleId: null as number | null,
    exportadorId: null as number | null,
    detalles: new Map<number, number>()
  };

  private destroy$ = new Subject();
  public cargando: boolean = false;
  public mensajeCarga: string = "Cargando datos...";
  private archivoExistenteEliminado: boolean = false;

  public esSoloLectura: boolean = false;
  
  private detallesConEmbarques: Set<number> = new Set();
  private cantidadMinimaPorDetalle: Map<number, number> = new Map();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private acuerdoService: AcuerdoService,
    private confirmationDialogService: ConfirmationDialogService,
    private envioDialogService: EnvioMailDialogService
  ) {
    this.acuerdoId = +this.route.snapshot.paramMap.get('id')!;
    const pantalla = this.route.snapshot.url[0]?.path;
    if (pantalla === 'ver') {
      this.esSoloLectura = true;
      this.titulo = "Visualización de Acuerdo";
    }
    if (this.acuerdoId == 0) {
      this.titulo = "Alta de Acuerdo";
    }
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  //#region Carga de Datos
  private async cargarDatosIniciales(): Promise<void> {
    try {
      this.mensajeCarga = "Cargando datos...";
      this.cargando = true;
      // Cargar combo con todos los datos iniciales
      const combo = await this.acuerdoService.listarCombos().pipe(take(1)).toPromise();

      this.tiposAcuerdo = combo.tipos;
      this.muelles = combo.muellesDeCarga;
      this.exportadores = combo.exportadores;
      this.materialesPuerto = combo.materialesPuerto;
      this.configuraciones = combo.configuraciones;
      this.MUELLE_SAN_BENITO_ID = combo.idSanBenito;
      this.EXPORTADOR_MOA_ID = combo.idMOA;

      // Inicializar formulario
      this.inicializarForm();

      if (!this.esSoloLectura) {
        this.suscribirACambiosDeConfiguracion();
      }

      // Si es edición, cargar el acuerdo
      if (this.acuerdoId > 0) {
        await this.cargarAcuerdo(this.acuerdoId);
      } else {
        this.cargando = false
      }
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      this.confirmationDialogService.error('Error al cargar los datos iniciales. Por favor, intente nuevamente.');
      this.cargando = false;
    }
  }

  private async cargarAcuerdo(id: number): Promise<void> {
    try {
      this.cargando = true;
      const acuerdo = await this.acuerdoService.obtenerAcuerdo(id).pipe(take(1)).toPromise();

      this.calcularAsociacionesEmbarque(acuerdo);

      await this.cargarDatosAcuerdo(acuerdo);
    } catch (error) {
      console.error('Error al cargar acuerdo:', error);
      this.confirmationDialogService.error('Error al cargar el acuerdo. Por favor, intente nuevamente.');
    } finally {
      this.cargando = false;
    }
  }

  private calcularAsociacionesEmbarque(acuerdo: Acuerdo): void {
    this.detallesConEmbarques.clear();
    this.cantidadMinimaPorDetalle.clear();

    for (const detalle of acuerdo.acuerdoDetalles) {
      if (detalle.acuerdoEmbarques && detalle.acuerdoEmbarques.length > 0) {
        this.detallesConEmbarques.add(detalle.id);

        const cantidadAsociada = detalle.acuerdoEmbarques.reduce((sum, ae) => sum + ae.cantidad, 0);
        this.cantidadMinimaPorDetalle.set(detalle.id, cantidadAsociada);
      }
    }
  }

  public getCantidadMinimaDetalle(formIndex: number): number {
    const detalleId = this.acuerdoDetallesFormArray.at(formIndex)?.get('id')?.value;
    return this.cantidadMinimaPorDetalle.get(detalleId) || 0;
  }
  //#endregion

  //#region Inicialización del Formulario
  private inicializarForm(): void {
    this.formAcuerdo = this.fb.group({
      id: [0],
      acuerdoTipoId: ['', Validators.required],
      descripcion: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      muelleDeCargaId: ['', Validators.required],
      exportadorId: ['', Validators.required],
      acuerdoDetalles: this.fb.array([])
    });

    // Agregar validación para fechas
    this.formAcuerdo.get('fechaFin').setValidators([Validators.required, this.fechaFinMayorQueFechaInicio()]);

    // Revalidar fechaFin cuando cambia fechaInicio
    this.formAcuerdo.get('fechaInicio').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.formAcuerdo.get('fechaFin').updateValueAndValidity({ emitEvent: false });
    });
  }

  public get acuerdoDetallesFormArray(): FormArray {
    return this.formAcuerdo.get('acuerdoDetalles') as FormArray;
  }

  private fechaFinMayorQueFechaInicio(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.formAcuerdo) {
        return null;
      }

      const fechaInicio = this.formAcuerdo.get('fechaInicio')?.value;
      const fechaFin = control.value;

      if (!fechaInicio || !fechaFin) {
        return null;
      }

      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);

      if (fin < inicio) {
        return { fechaFinMenor: true };
      }

      return null;
    }
  }

  public getTiposFormArray(detalleForm: any): FormArray {
    return detalleForm.get('tipos') as FormArray;
  }

  public getConceptosFormArray(tipoForm: any): FormArray {
    return tipoForm.get('conceptos') as FormArray;
  }
  //#endregion

  //#region Lógica de Negocio - Validaciones
  private suscribirACambiosDeConfiguracion(): void {
    // Suscribirse a cambios en tipo, muelle y exportador
    this.formAcuerdo.get('acuerdoTipoId').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (!this.cargando) {
        this.onConfiguracionChange();
      }
    });

    this.formAcuerdo.get('muelleDeCargaId').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (!this.cargando) {
        this.validarExportadorSegunMuelle();
        this.onConfiguracionChange();
      }
    });

    this.formAcuerdo.get('exportadorId').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (!this.cargando) {
        this.validarMuelleSegunExportador();
        this.onConfiguracionChange();
      }
    });
  }

  private validarExportadorSegunMuelle(): void {
    const muelleId = this.formAcuerdo.get('muelleDeCargaId').value;
    const exportadorId = this.formAcuerdo.get('exportadorId').value;

    if (!muelleId) return;

    const esSanBenito = muelleId == this.MUELLE_SAN_BENITO_ID;
    // Si NO es San Benito, DEBE ser MOA
    if (!esSanBenito) {
      this.formAcuerdo.get('exportadorId').setValue(this.EXPORTADOR_MOA_ID);
      return;
    }

    const esMOA = exportadorId == this.EXPORTADOR_MOA_ID;
    // Si es San Benito, NO puede ser MOA
    if (esSanBenito && esMOA) {
      this.formAcuerdo.get('exportadorId').setValue('');
      this.confirmationDialogService.alertar('No puede seleccionar MOA como exportador para el muelle San Benito.');
      console.warn('San Benito no puede trabajar con MOA');
    }

  }

  private validarMuelleSegunExportador(): void {
    const muelleId = this.formAcuerdo.get('muelleDeCargaId').value;
    const exportadorId = this.formAcuerdo.get('exportadorId').value;

    if (!exportadorId) return;

    const esMOA = exportadorId == this.EXPORTADOR_MOA_ID;
    // Si NO es MOA, DEBE ser San Benito
    if (!esMOA) {
      this.formAcuerdo.get('muelleDeCargaId').setValue(this.MUELLE_SAN_BENITO_ID);
      return;
    }

    const esSanBenito = muelleId == this.MUELLE_SAN_BENITO_ID;
    // Si es MOA, NO puede ser San Benito
    if (esMOA && esSanBenito) {
      this.formAcuerdo.get('muelleDeCargaId').setValue('');
      this.confirmationDialogService.alertar('No puede seleccionar MOA como exportador para el muelle San Benito.');
      console.warn('MOA no puede trabajar en San Benito');
    }

  }

  public onCantidadChange(event: any, i: number): void {
    const cantidadFormControl = this.acuerdoDetallesFormArray.at(i).get('cantidadTotal');
    const valorInput = parseFloat(event.target.value) || 0;
    cantidadFormControl.setValue(valorInput.toFixed(3));
  }

  private async onConfiguracionChange(): Promise<void> {
    const tipoId = this.formAcuerdo.get('acuerdoTipoId').value;
    const muelleId = this.formAcuerdo.get('muelleDeCargaId').value;
    const exportadorId = this.formAcuerdo.get('exportadorId').value;

    // Solo proceder si tenemos los tres valores
    if (!tipoId || !muelleId || !exportadorId) {
      return;
    }

    const configuracion = this.obtenerConfiguracionActual(tipoId, muelleId, exportadorId);

    if (!configuracion) {
      console.warn('No se encontró configuración para la combinación seleccionada');
    }
    
    await this.aplicarConfiguracion(configuracion);
  }

  private async aplicarConfiguracion(configuracion: AcuerdoTipoConfiguracion | null): Promise<void> {
    this.conceptosPorTipo = configuracion ? this.agruparConceptosPorTipo(configuracion.acuerdoTipoConfiguracionConceptos) : [];
    
    if (this.acuerdoDetallesFormArray.length === 0) {
      if (this.acuerdoId == 0) {
        this.agregarDetalle();
      }
    } else {
      this.actualizarConceptosEnDetallesExistentes();
    }
  }

  private actualizarConceptosEnDetallesExistentes(): void {
    for (let i = 0; i < this.acuerdoDetallesFormArray.length; i++) {
      const detalleForm = this.acuerdoDetallesFormArray.at(i) as FormGroup;
      const previousTipos = detalleForm.get('tipos') as FormArray;
      
      const seleccionesAnteriores = new Set<number>();
      if (previousTipos) {
        for (const tipo of previousTipos.controls) {
          const conceptos = tipo.get('conceptos') as FormArray;
          if (conceptos) {
            for (const c of conceptos.controls) {
              if (c.get('seleccionado')?.value) {
                seleccionesAnteriores.add(c.get('concepto')?.value.id);
              }
            }
          }
        }
      }

      const nuevosTipos = this.initTiposConceptosFormArray();
      
      for (const tipo of nuevosTipos.controls) {
        const conceptos = tipo.get('conceptos') as FormArray;
        for (const c of conceptos.controls) {
          const conceptoId = c.get('concepto')?.value?.id;
          if (seleccionesAnteriores.has(conceptoId) && !c.get('obligatorio')?.value) {
            c.get('seleccionado')?.setValue(true);
          }
        }
      }

      detalleForm.setControl('tipos', nuevosTipos);
    }
  }

  private obtenerConfiguracionActual(tipoId: number, muelleId: number, exportadorId: number): AcuerdoTipoConfiguracion {
    const esSanBenito = muelleId == this.MUELLE_SAN_BENITO_ID;
    const esMOA = exportadorId == this.EXPORTADOR_MOA_ID;

    return this.configuraciones.find(c => c.acuerdoTipo.id == tipoId && c.esSanBenito == esSanBenito && c.esMOA == esMOA);
  }

  private agruparConceptosPorTipo(conceptosConfig: AcuerdoTipoConfiguracionConcepto[]): ConceptoPorTipo[] {
    const grupos: ConceptoPorTipo[] = [];

    for (const conceptoConfig of conceptosConfig) {
      const tipoDescripcion = conceptoConfig.concepto.tipoConcepto.descripcion;
      let grupo = grupos.find(g => g.tipo == tipoDescripcion);

      if (!grupo) {
        grupo = { tipo: tipoDescripcion, conceptos: [] };
        grupos.push(grupo);
      }

      grupo.conceptos.push({
        concepto: conceptoConfig.concepto,
        obligatorio: conceptoConfig.obligatorio
      });
    }

    return grupos;
  }

  private limpiarDetalles(): void {
    while (this.acuerdoDetallesFormArray.length) {
      this.acuerdoDetallesFormArray.removeAt(0);
    }
  }

  public get exportadoresFiltrados(): Exportador[] {
    const muelleId = this.formAcuerdo.get('muelleDeCargaId').value;

    if (!muelleId) {
      return this.exportadores;
    }

    const esSanBenito = muelleId == this.MUELLE_SAN_BENITO_ID;

    // Si es San Benito, mostrar todos excepto MOA
    if (esSanBenito) {
      return this.exportadores.filter(e => e.id != this.EXPORTADOR_MOA_ID);
    }

    // Si no es San Benito, solo mostrar MOA
    return this.exportadores.filter(e => e.id == this.EXPORTADOR_MOA_ID);
  }

  public get muellesFiltrados(): MuelleDeCarga[] {
    const exportadorId = this.formAcuerdo.get('exportadorId').value;

    if (!exportadorId) {
      return this.muelles;
    }

    const esMOA = exportadorId == this.EXPORTADOR_MOA_ID;

    // Si es MOA, mostrar todos excepto San Benito
    if (esMOA) {
      return this.muelles.filter(m => m.id != this.MUELLE_SAN_BENITO_ID);
    }

    // Si no es MOA, solo mostrar San Benito
    return this.muelles.filter(m => m.id == this.MUELLE_SAN_BENITO_ID);
  }
  //#endregion

  //#region Gestión de Detalles
  public agregarDetalle(): void {
    if (this.conceptosPorTipo.length == 0) {
      console.warn('Primero debe seleccionar Tipo de Acuerdo, Muelle y Exportador');
      this.confirmationDialogService.alertar('Primero debe seleccionar Tipo de Acuerdo, Muelle y Exportador antes de agregar detalles.');
      return;
    }

    const detalleFormGroup = this.inicializarDetalleForm();
    this.acuerdoDetallesFormArray.push(detalleFormGroup);
  }

  public async eliminarDetalle(index: number): Promise<void> {
    const idStr = this.acuerdoDetallesFormArray.at(index).get('id')?.value;
    const detalleId = idStr ? Number(idStr) : 0;
    
    if (detalleId > 0 && this.cantidadMinimaPorDetalle.has(detalleId)) {
      const cantidadAsociada = this.cantidadMinimaPorDetalle.get(detalleId) || 0;
      if (cantidadAsociada > 0) {
        this.confirmationDialogService.error('No puede eliminar el producto ya que se encuentra asociado a embarques, verifique.');
        return; 
      }
    }

    const confirm = await this.confirmationDialogService.confirmar('Atención!', '¿Está seguro que desea eliminar este producto del acuerdo? Deberá guardar los cambios para que la eliminación sea efectiva.');
    
    if (confirm) {
      this.acuerdoDetallesFormArray.removeAt(index);
      this.formAcuerdo.markAsDirty();
    }
  }

  private inicializarDetalleForm(acuerdoDetalle?: AcuerdoDetalle): FormGroup {
    const tiposConceptosFormArray = this.initTiposConceptosFormArray();

    const detalleFormGroup = this.fb.group({
      id: [0],
      materialPuertoId: ['', Validators.required],
      cantidadTotal: [0, [Validators.required, Validators.min(0.001)]],
      tipos: tiposConceptosFormArray
    });

    if (acuerdoDetalle) {
      this.cargarDatosDetalleAcuerdo(acuerdoDetalle, detalleFormGroup);
    }

    return detalleFormGroup;
  }
  //#endregion

  //#region Gestión de Conceptos
  private initTiposConceptosFormArray(): FormArray {
    const tiposConceptosFormArray = this.fb.array([]);

    for (const grupo of this.conceptosPorTipo) {
      const grupoFormGroups = grupo.conceptos.map(c => this.initConceptoFormGroup(c));
      const grupoForm = this.fb.group({
        tipo: [grupo.tipo],
        conceptos: this.fb.array(grupoFormGroups)
      });
      tiposConceptosFormArray.push(grupoForm);
    }

    return tiposConceptosFormArray;
  }

  private initConceptoFormGroup(conceptoConfig: ConceptoConfiguracion): FormGroup {
    return this.fb.group({
      id: [0],
      concepto: [conceptoConfig.concepto],
      obligatorio: [conceptoConfig.obligatorio],
      seleccionado: [{ value: conceptoConfig.obligatorio, disabled: conceptoConfig.obligatorio }]
      // Si es obligatorio, viene marcado por defecto y no se puede cambiar
    });
  }
  //#endregion

  //#region Carga de Datos al Formulario
  private async cargarDatosAcuerdo(acuerdo: Acuerdo): Promise<void> {
    this.valoresOriginales.muelleId = acuerdo.muelleDeCarga.id;
    this.valoresOriginales.exportadorId = acuerdo.exportador.id;

    this.formAcuerdo.patchValue({
      id: acuerdo.id,
      acuerdoTipoId: acuerdo.acuerdoTipo.id,
      descripcion: acuerdo.descripcion,
      fechaInicio: this.formatearFechaParaInput(acuerdo.fechaInicio),
      fechaFin: this.formatearFechaParaInput(acuerdo.fechaFin),
      muelleDeCargaId: acuerdo.muelleDeCarga.id,
      exportadorId: acuerdo.exportador.id
    }, { emitEvent: false });

    // Cargar archivo si existe
    if (acuerdo.nombreArchivo) {
      this.fileNameAcuerdo = acuerdo.nombreArchivo;
    }

    // Aplicar configuración actual
    const configuracion = this.obtenerConfiguracionActual(acuerdo.acuerdoTipo.id, acuerdo.muelleDeCarga.id, acuerdo.exportador.id);
    await this.aplicarConfiguracion(configuracion);

    // Cargar detalles del acuerdo
    for (const detalle of acuerdo.acuerdoDetalles) {
      this.valoresOriginales.detalles.set(detalle.id, detalle.materialPuerto.id);

      const detalleFormGroup = this.inicializarDetalleForm(detalle);
      this.acuerdoDetallesFormArray.push(detalleFormGroup);
    }

    if (this.esSoloLectura) {
      this.formAcuerdo.disable();
    }
  }

  private formatearFechaParaInput(fecha: Date): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toISOString().split('T')[0];
  }

  private cargarDatosDetalleAcuerdo(acuerdoDetalle: AcuerdoDetalle, detalleFormGroup: FormGroup): void {
    detalleFormGroup.patchValue({
      id: acuerdoDetalle.id,
      materialPuertoId: acuerdoDetalle.materialPuerto.id,
      cantidadTotal: acuerdoDetalle.cantidadTotal
    });

    const conceptosForms = this.getConceptosCtrlsDetalle(detalleFormGroup);

    for (const detalleConcepto of acuerdoDetalle.acuerdoDetalleConceptos) {
      const conceptoForm = conceptosForms.find(cg => cg.get('concepto').value.id == detalleConcepto.concepto.id);

      if (conceptoForm) {
        conceptoForm.patchValue({ id: detalleConcepto.id, seleccionado: true });
      }
    }
  }

  private getConceptosCtrlsDetalle(detalleForm: FormGroup): FormGroup[] {
    const conceptosForms: FormGroup[] = [];
    const tiposArray = detalleForm.get('tipos') as FormArray;

    for (const tipo of tiposArray.controls) {
      const conceptosArray = tipo.get('conceptos') as FormArray;
      for (const conceptoForm of conceptosArray.controls) {
        conceptosForms.push(conceptoForm as FormGroup);
      }
    }

    return conceptosForms;
  }
  //#endregion

  //#region Preparación de Datos para Guardar
  private crearObjetoAcuerdo(): Acuerdo {
    const formValue = this.formAcuerdo.getRawValue();

    const acuerdo: Acuerdo = {
      id: formValue.id,
      acuerdoTipo: this.tiposAcuerdo.find(t => t.id == formValue.acuerdoTipoId),
      descripcion: formValue.descripcion,
      muelleDeCarga: this.muelles.find(m => m.id == formValue.muelleDeCargaId),
      exportador: this.exportadores.find(e => e.id == formValue.exportadorId),
      fechaInicio: new Date(formValue.fechaInicio),
      fechaFin: new Date(formValue.fechaFin),
      nombreArchivo: this.fileNameAcuerdo,
      ubicacionArchivo: null,
      acuerdoDetalles: this.crearObjetoDetalles()
    };

    return acuerdo;
  }

  private crearObjetoDetalles(): AcuerdoDetalle[] {
    const detallesFormValue = this.acuerdoDetallesFormArray.getRawValue();
    const acuerdoDetalles: AcuerdoDetalle[] = [];

    for (const detalleForm of detallesFormValue) {
      const conceptosSeleccionados = this.obtenerConceptosSeleccionados(detalleForm);

      const acuerdoDetalle: AcuerdoDetalle = {
        id: detalleForm.id ? Number(detalleForm.id) : 0,
        materialPuerto: this.materialesPuerto.find((m: any) => m.id == detalleForm.materialPuertoId),
        cantidadTotal: +detalleForm.cantidadTotal,
        acuerdoDetalleConceptos: conceptosSeleccionados.map(c => ({ 
            id: c.id ? Number(c.id) : 0, 
            concepto: c.concepto 
        }))
      };

      acuerdoDetalles.push(acuerdoDetalle);
    }

    return acuerdoDetalles;
  }

  private obtenerConceptosSeleccionados(detalleForm: any): any[] {
    const conceptosSeleccionados: any[] = [];

    if (detalleForm.tipos) {
      for (const tipo of detalleForm.tipos) {
        if (tipo.conceptos) {
          const conceptosSel = tipo.conceptos.filter((c: any) => c.seleccionado);
          conceptosSeleccionados.push(...conceptosSel);
        }
      }
    } else if (detalleForm.conceptos) {
      const conceptosSel = detalleForm.conceptos.filter((c: any) => c.seleccionado);
      conceptosSeleccionados.push(...conceptosSel);
    }

    return conceptosSeleccionados;
  }

  // Valida que al menos un concepto obligatorio esté seleccionado en cada detalle
  private validarConceptos(): boolean {
    return this.acuerdoDetallesFormArray.controls.every(detalle => {
      const tipos = detalle.get('tipos') as FormArray;

      return tipos.controls.some(tipo => {
        const conceptos = tipo.get('conceptos') as FormArray;
        return conceptos.controls.some(c => c.get('seleccionado')?.value);
      });
    });
  }

  private preprarFormData(acuerdo: Acuerdo): FormData {
    const formData = new FormData();
    formData.append('acuerdo', JSON.stringify(acuerdo));
    if (this.fileAcuerdo) {
      formData.append('archivo', this.fileAcuerdo, this.fileAcuerdo.name);
    }
    formData.append('eliminarArchivo', this.archivoExistenteEliminado.toString());
    return formData;
  }
  //#endregion

  //#region Acciones
  public async guardar(): Promise<void> {
    if (!this.formAcuerdo.valid) {
      this.formAcuerdo.markAllAsTouched();
      this.confirmationDialogService.error('Verifique que todos los campos obligatorios estén completos y correctos.');
      return;
    }

    if (this.acuerdoDetallesFormArray.length == 0) {
      this.confirmationDialogService.error('Debe agregar al menos un producto al acuerdo antes de guardar.');
      return;
    }

    if (!this.validarConceptos()) {
      this.confirmationDialogService.error('No se han tildado conceptos, verifique.');
      return;
    }

    const acuerdo = this.crearObjetoAcuerdo();

    try {
      this.mensajeCarga = "Guardando acuerdo...";
      this.cargando = true;
      const formData = this.preprarFormData(acuerdo);
      await this.acuerdoService.guardarAcuerdo(formData).pipe(take(1)).toPromise();
      this.cargando = false;
      await this.confirmationDialogService.exito('Acuerdo guardado correctamente.');
      
      const envioMail = await this.enviarMail(acuerdo);
      if (!envioMail) {
        this.confirmationDialogService.alertar('El acuerdo se guardó correctamente, pero no se pudo enviar el mail.');
        this.formAcuerdo.markAsPristine();
        return;
      }
      this.router.navigate(['/acuerdos']);
    } catch (error: any) {
      this.cargando = false;
      let errorMsg = '';
            
      if (typeof error.error === 'string') {
        errorMsg = error.error;
      } else if (error.error && typeof error.error.Message === 'string') {
        errorMsg = error.error.Message;
      } else {
        errorMsg = JSON.stringify(error.error || error.message);
      }
      
      const isBusinessValidationError = 
        errorMsg.includes("Ya existe un acuerdo") ||
        errorMsg.includes("No puede modificar los datos") ||
        errorMsg.includes("No se puede actualizar ya que la cantidad") ||
        errorMsg.includes("No puede eliminar el producto");

      if (isBusinessValidationError) {
        this.confirmationDialogService.error(errorMsg);
        this.marcarCamposModificadosConError(errorMsg);
      } else {
        this.confirmationDialogService.error('Ocurrió un error al guardar el acuerdo. Por favor, intente nuevamente.');
      }
    }
  }

  private marcarCamposModificadosConError(errorMsg: string): void {
    if (errorMsg.includes("Ya existe un acuerdo")) {
      const descCtrl = this.formAcuerdo.get('descripcion');
      if (descCtrl) {
        descCtrl.setErrors({ backendError: true });
        descCtrl.markAsTouched();
        descCtrl.valueChanges.pipe(take(1)).subscribe(() => {
          if (descCtrl.hasError('backendError')) {
            descCtrl.setErrors(null);
          }
        });
      }
    }

    const muelleCtrl = this.formAcuerdo.get('muelleDeCargaId');
    if (muelleCtrl && Number(muelleCtrl.value) !== Number(this.valoresOriginales.muelleId)) {
      muelleCtrl.setErrors({ backendError: true });
      muelleCtrl.markAsTouched();
    }

    const expCtrl = this.formAcuerdo.get('exportadorId');
    if (expCtrl && Number(expCtrl.value) !== Number(this.valoresOriginales.exportadorId)) {
      expCtrl.setErrors({ backendError: true });
      expCtrl.markAsTouched();
    }

    this.acuerdoDetallesFormArray.controls.forEach(detalle => {
      const prodCtrl = detalle.get('materialPuertoId');
      const id = Number(detalle.get('id')?.value || 0);
      const originalProdId = id > 0 ? this.valoresOriginales.detalles.get(id) : null;

      if (prodCtrl && id > 0 && Number(prodCtrl.value) !== Number(originalProdId)) {
        prodCtrl.setErrors({ backendError: true });
        prodCtrl.markAsTouched();
      }
    });
  }

  public async cancelar(): Promise<void> {
    if (this.formAcuerdo.dirty) {
      const confirm = await this.confirmationDialogService.confirmar('Atención!', 'Hay cambios sin guardar. ¿Está seguro que desea salir?');
      if (!confirm) {
        return;
      }
    }
    this.router.navigate(['/acuerdos']);
  }

  private async enviarMail(acuerdo: Acuerdo): Promise<boolean> {
    const mail = this.construirMail(acuerdo);
    const confirm = await this.envioDialogService.confirmConValidacion('Enviar Mail Acuerdo', 'Cuerpo del Mail:', mail);
    if (!confirm) {
      return true;
    }
    try {
      this.mensajeCarga = "Enviando mail...";
      this.cargando = true;
      await this.acuerdoService.enviarMailAcuerdo(mail).pipe(take(1)).toPromise();
      this.cargando = false;
      return true;
    } catch (error) {
      this.cargando = false;
      console.error('Error al enviar mail:', error);
      return false;
    }
  }

  private construirMail(acuerdo: Acuerdo): Mail {
    const fechaInicio = acuerdo.fechaInicio.toISOString().split('T')[0].split('-').reverse().join('/');
    const fechaFin = acuerdo.fechaFin.toISOString().split('T')[0].split('-').reverse().join('/');
    let titulo = `Acuerdo / Contrato - ${acuerdo.descripcion} - ${fechaInicio} a ${fechaFin} - ScatoPuerto`;

    if (this.acuerdoId > 0) {
      titulo = 'MODIFICACION - ' + titulo;
    }

    let cuerpo = `<p>
      Informamos que fue registrado el siguiente acuerdo/contrato en la aplicación de Scatopuerto:
      <br/><br/>
      Tipo de Acuerdo: ${acuerdo.acuerdoTipo.descripcion}<br/>
      Fecha de Inicio: ${fechaInicio}<br/>
      Fecha de Fin: ${fechaFin}<br/>
      Muelle: ${acuerdo.muelleDeCarga.descripcion}<br/>
      Exportador: ${acuerdo.exportador.nombre}<br/>
      <br/>
      Detalle del contrato:<br/>
    `;

    for (const detalle of acuerdo.acuerdoDetalles) {
      cuerpo += `<br/>
        Producto: ${detalle.materialPuerto.descripcion}<br/>
        Cantidad: ${detalle.cantidadTotal.toFixed(3).replace('.', ',')} TN<br/>
        Conceptos Asociados:<br/> 
      `;
      for (const concepto of detalle.acuerdoDetalleConceptos) {
        cuerpo += `&emsp;- ${concepto.concepto.descripcion}<br/>`;
      }
    }

    cuerpo += `</p>`;
    const mail = new Mail(titulo, cuerpo, []);
    return mail;
  }
  //#endregion

  //#region Manejo de Archivos
  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.fileAcuerdo = file;
      this.fileNameAcuerdo = file.name;
      this.formAcuerdo.markAsDirty();
    }
  }

  public async deleteArchivo(): Promise<void> {
    const confirm = await this.confirmationDialogService.confirmar('Atención!', '¿Está seguro que desea eliminar el archivo adjunto del acuerdo? Deberá guardar los cambios para que la eliminación sea efectiva.');
    if (!confirm) {
      return;
    }
    if (this.acuerdoId > 0) {
      this.archivoExistenteEliminado = true;
    }
    this.fileAcuerdo = null;
    this.fileNameAcuerdo = null;
    this.formAcuerdo
  }

  public async descargarArchivo(): Promise<void> {
    this.mensajeCarga = "Procesando archivo...";
    this.cargando = true;
    let url: string = '';
    const isPdf = this.fileNameAcuerdo && this.fileNameAcuerdo.toLowerCase().endsWith('.pdf');

    try {
      let archivoProcesar: Blob | File;

      if (this.fileAcuerdo) {
        archivoProcesar = this.fileAcuerdo;
      } else if (this.fileNameAcuerdo && this.acuerdoId > 0) {
        archivoProcesar = await this.acuerdoService.obtenerArchivoAcuerdo(this.acuerdoId).toPromise();
      } else {
        this.cargando = false;
        return;
      }

      if (isPdf) {
        const archivoPdf = new File([archivoProcesar], this.fileNameAcuerdo, { type: 'application/pdf' });
        url = window.URL.createObjectURL(archivoPdf);
        
        const nuevaPestana = window.open('', '_blank');
        
        if (nuevaPestana) {
          nuevaPestana.document.title = this.fileNameAcuerdo;
          
          nuevaPestana.document.body.style.margin = '0';
          nuevaPestana.document.body.style.padding = '0';
          nuevaPestana.document.body.style.overflow = 'hidden';

          const embedElement = nuevaPestana.document.createElement('embed');
          embedElement.src = url;
          embedElement.type = 'application/pdf';
          embedElement.width = '100%';
          embedElement.height = '100%';

          nuevaPestana.document.body.appendChild(embedElement);          
        } else {
          this.confirmationDialogService.alertar('No se pudo abrir la nueva pestaña. Asegúrese de que el bloqueador de ventanas emergentes no esté habilitado.');
        }
      } else {
        url = window.URL.createObjectURL(archivoProcesar);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.fileNameAcuerdo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      this.confirmationDialogService.error('Ocurrió un error al procesar el archivo del acuerdo.');
      console.error('Error al procesar el archivo del acuerdo:', error);
    } finally {
      this.cargando = false;
    }
  }
  //#endregion
}
