import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Acuerdo, AcuerdoTipo, AcuerdoDetalle, AcuerdoTipoConfiguracion, AcuerdoTipoConfiguracionConcepto } from '@ScatoModels/acuerdos/acuerdos';
import { Concepto } from '@ScatoModels/administracion/concepto';
import { Exportador } from '@ScatoModels/exportador';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { MuelleDeCarga } from '@ScatoModels/programa-embarque/muelle-de-carga';
import { AcuerdoService } from '@ScatoServicios/acuerdo.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
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

  private destroy$ = new Subject();
  public cargando: boolean = false;
  private archivoExistenteEliminado: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private acuerdoService: AcuerdoService,
    private confirmationDialogService: ConfirmationDialogService
  ) {
    this.acuerdoId = +this.route.snapshot.paramMap.get('id')!;
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
      this.suscribirACambiosDeConfiguracion();

      // Si es edición, cargar el acuerdo
      if (this.acuerdoId > 0) {
        await this.cargarAcuerdo(this.acuerdoId);
      }
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      this.confirmationDialogService.error('Error al cargar los datos iniciales. Por favor, intente nuevamente.');
    }
  }

  private async cargarAcuerdo(id: number): Promise<void> {
    try {
      this.cargando = true;
      const acuerdo = await this.acuerdoService.obtenerAcuerdo(id).pipe(take(1)).toPromise();
      await this.cargarDatosAcuerdo(acuerdo);
    } catch (error) {
      console.error('Error al cargar acuerdo:', error);
      this.confirmationDialogService.error('Error al cargar el acuerdo. Por favor, intente nuevamente.');
    } finally {
      this.cargando = false;
    }
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
    const cantidadFormControl = this.acuerdoDetallesFormArray.at(i).get('cantidad');
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

    if (configuracion) {
      await this.aplicarConfiguracion(configuracion);
    } else {
      console.warn('No se encontró configuración para la combinación seleccionada');
      this.conceptosPorTipo = [];
      this.limpiarDetalles();
    }
  }

  private obtenerConfiguracionActual(tipoId: number, muelleId: number, exportadorId: number): AcuerdoTipoConfiguracion {
    const esSanBenito = muelleId == this.MUELLE_SAN_BENITO_ID;
    const esMOA = exportadorId == this.EXPORTADOR_MOA_ID;

    return this.configuraciones.find(c => c.acuerdoTipo.id == tipoId && c.esSanBenito == esSanBenito && c.esMOA == esMOA);
  }

  private async aplicarConfiguracion(configuracion: AcuerdoTipoConfiguracion): Promise<void> {
    this.conceptosPorTipo = this.agruparConceptosPorTipo(configuracion.acuerdoTipoConfiguracionConceptos);
    this.limpiarDetalles();
    if (this.acuerdoId == 0) {
      this.agregarDetalle();
    }
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
    const confirm = await this.confirmationDialogService.confirmar('Atención!', '¿Está seguro que desea eliminar este producto del acuerdo? Deberá guardar los cambios para que la eliminación sea efectiva.');
    if (confirm) {
      this.acuerdoDetallesFormArray.removeAt(index);
    }
  }

  private inicializarDetalleForm(acuerdoDetalle?: AcuerdoDetalle): FormGroup {
    const tiposConceptosFormArray = this.initTiposConceptosFormArray();

    const detalleFormGroup = this.fb.group({
      id: [0],
      materialPuertoId: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(0.001)]],
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
      const detalleFormGroup = this.inicializarDetalleForm(detalle);
      this.acuerdoDetallesFormArray.push(detalleFormGroup);
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
      cantidad: acuerdoDetalle.cantidad
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
        id: detalleForm.id,
        materialPuerto: this.materialesPuerto.find(m => m.id == detalleForm.materialPuertoId),
        cantidad: detalleForm.cantidad,
        acuerdoDetalleConceptos: conceptosSeleccionados.map(c => ({ id: c.id, concepto: c.concepto }))
      };

      acuerdoDetalles.push(acuerdoDetalle);
    }

    return acuerdoDetalles;
  }

  private obtenerConceptosSeleccionados(detalleForm: any): any[] {
    const conceptosSeleccionados: any[] = [];

    for (const tipo of detalleForm.tipos) {
      const conceptosSel = tipo.conceptos.filter(c => c.seleccionado);
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
      console.error('Formulario inválido');
      this.confirmationDialogService.error('Verifique que todos los campos obligatorios estén completos y correctos.');
      return;
    }

    if (this.acuerdoDetallesFormArray.length == 0) {
      console.error('Debe agregar al menos un producto al acuerdo');
      this.confirmationDialogService.error('Debe agregar al menos un producto al acuerdo antes de guardar.');
      return;
    }

    if (!this.validarConceptos()) {
      this.confirmationDialogService.error('No se han tildado conceptos, verifique.');
      return;
    }

    const acuerdo = this.crearObjetoAcuerdo();
    console.log('Acuerdo a guardar:', acuerdo);

    try {
      const formData = this.preprarFormData(acuerdo);
      await this.acuerdoService.guardarAcuerdo(formData).pipe(take(1)).toPromise();
      await this.confirmationDialogService.exito('Acuerdo guardado correctamente.');
      this.router.navigate(['/acuerdos']);
    } catch (error) {
      console.error('Error al guardar:', error);
      if (error.error == "Ya existe un acuerdo con la misma descripción.") {
        this.confirmationDialogService.error('Ya existe un acuerdo con la misma descripción.');
      } else {
        this.confirmationDialogService.error('Ocurrió un error al guardar el acuerdo. Por favor, intente nuevamente.');
      }
    }
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
    this.cargando = true;
    let url: string = '';
    if (this.fileAcuerdo) {
      url = window.URL.createObjectURL(this.fileAcuerdo);
    } else if (this.fileNameAcuerdo && this.acuerdoId > 0) {
      try {
        const blob = await this.acuerdoService.obtenerArchivoAcuerdo(this.acuerdoId).toPromise();
        url = window.URL.createObjectURL(blob);
        this.cargando = false;
      } catch (error) {
        this.confirmationDialogService.error('Ocurrió un error al descargar el archivo del acuerdo.');
        console.error('Error al descargar el archivo del acuerdo:', error);
        this.cargando = false;
        return;
      }
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = this.fileNameAcuerdo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    this.cargando = false;
  }
  //#endregion
}