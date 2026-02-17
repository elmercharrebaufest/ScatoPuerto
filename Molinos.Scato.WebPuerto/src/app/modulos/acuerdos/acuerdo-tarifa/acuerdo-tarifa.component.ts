import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Acuerdo, AcuerdoDetalle, AcuerdoDetalleConceptoPeriodoTarifa, AcuerdoPeriodoDetalle, GuardarTarifasDetallePeriodoRequest, TarifaConcepto } from '@ScatoModels/acuerdos/acuerdos';
import { Concepto } from '@ScatoModels/administracion/concepto';
import { AcuerdoService } from '@ScatoServicios/acuerdo.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

interface ConceptoPorTipo {
  tipo: string;
  conceptos: ConceptoConTarifa[];
}

interface ConceptoConTarifa {
  acuerdoDetalleConceptoId: number;
  concepto: Concepto;
  tarifaId: number;
  valorTarifa: number;
}

interface PeriodoDisponible {
  fecha: Date;
  descripcion: string;
  valor: string; // formato YYYY-MM para el select
}

@Component({
  selector: 'app-acuerdo-tarifa',
  templateUrl: './acuerdo-tarifa.component.html',
  styleUrls: ['./acuerdo-tarifa.component.css']
})
export class AcuerdoTarifaComponent implements OnInit, OnDestroy {

  public acuerdoId: number;
  public acuerdo: Acuerdo;
  public formTarifas: FormGroup;

  public periodosDisponibles: PeriodoDisponible[] = [];
  private periodosCargados: AcuerdoPeriodoDetalle[] = [];

  private destroy$ = new Subject();
  public cargando: boolean = false;
  public mensajeCarga: string = "Cargando datos...";

  public fileNameAcuerdo: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private acuerdoService: AcuerdoService,
    private confirmationDialogService: ConfirmationDialogService
  ) {
    this.acuerdoId = +this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  //#region Carga de Datos
  private async cargarDatos(): Promise<void> {
    try {
      this.mensajeCarga = "Cargando acuerdo...";
      this.cargando = true;

      this.acuerdo = await this.acuerdoService.obtenerAcuerdo(this.acuerdoId).pipe(take(1)).toPromise();
      if (this.acuerdo.nombreArchivo) {
        this.fileNameAcuerdo = this.acuerdo.nombreArchivo;
      }

      this.calcularPeriodosDisponibles();
      this.inicializarFormulario();
      await this.cargarTarifasExistentes();

    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.confirmationDialogService.error('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      this.cargando = false;
    }
  }

  private calcularPeriodosDisponibles(): void {
    const fechaInicio = new Date(this.acuerdo.fechaInicio);
    const fechaFin = new Date(this.acuerdo.fechaFin);

    const periodos: PeriodoDisponible[] = [];

    // Empezar desde el mes de inicio
    let fechaActual = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);
    const fechaLimite = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), 1);

    while (fechaActual <= fechaLimite) {
      const year = fechaActual.getFullYear();
      const month = fechaActual.getMonth() + 1;

      periodos.push({
        fecha: new Date(fechaActual),
        descripcion: this.formatearPeriodo(fechaActual),
        valor: `${year}-${month.toString().padStart(2, '0')}`
      });

      // Avanzar al siguiente mes
      fechaActual.setMonth(fechaActual.getMonth() + 1);
    }

    this.periodosDisponibles = periodos;
  }

  private formatearPeriodo(fecha: Date): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  }

  private async cargarTarifasExistentes(): Promise<void> {
    try {
      this.periodosCargados = await this.acuerdoService.obtenerPeriodosPorAcuerdo(this.acuerdoId).pipe(take(1)).toPromise() || [];

      if (this.periodosCargados.length > 0) {
        this.cargarDatosTarifas(this.periodosCargados);
      }
    } catch (error) {
      console.error('Error al cargar tarifas existentes:', error);
    }
  }

  private cargarDatosTarifas(periodos: AcuerdoPeriodoDetalle[]): void {
    // Agrupar períodos por detalle
    const periodosPorDetalle = new Map<number, AcuerdoPeriodoDetalle[]>();

    for (const periodo of periodos) {
      if (!periodosPorDetalle.has(periodo.acuerdoDetalleId)) {
        periodosPorDetalle.set(periodo.acuerdoDetalleId, []);
      }
      periodosPorDetalle.get(periodo.acuerdoDetalleId)!.push(periodo);
    }
  }

  private cargarTarifasEnConceptos(detalleIndex: number, tarifas: AcuerdoDetalleConceptoPeriodoTarifa[]): void {
    const detalleControl = this.detallesFormArray.at(detalleIndex);
    const tiposArray = detalleControl.get('tipos') as FormArray;

    for (const tipoControl of tiposArray.controls) {
      const conceptosArray = tipoControl.get('conceptos') as FormArray;

      for (const conceptoControl of conceptosArray.controls) {
        const acuerdoDetalleConceptoId = conceptoControl.get('acuerdoDetalleConceptoId').value;

        // Buscar si hay tarifa para este concepto
        const tarifa = tarifas.find(t => t.acuerdoDetalleConceptoId === acuerdoDetalleConceptoId);

        if (tarifa) {
          conceptoControl.patchValue({ tarifaId: tarifa.id, valorTarifa: tarifa.valorTarifa });
        }
      }
    }
  }

  private cargarTarifasDelPeriodo(detalleId: number, detalleGroup: FormGroup): Promise<void> {
    try {
      const periodoSeleccionado = detalleGroup.get('periodoSeleccionado').value;

      if (!periodoSeleccionado) {
        return;
      }

      const [year, month] = periodoSeleccionado.split('-');
      const fechaPeriodo = new Date(parseInt(year), parseInt(month) - 1, 1);

      const periodoEncontrado = this.periodosCargados.find(p => {
        const fechaPeriodoDb = new Date(p.periodo);
        return p.acuerdoDetalleId === detalleId &&
          fechaPeriodoDb.getFullYear() === fechaPeriodo.getFullYear() &&
          fechaPeriodoDb.getMonth() === fechaPeriodo.getMonth();
      });

      if (periodoEncontrado) {
        detalleGroup.patchValue({
          periodoCerrado: periodoEncontrado.cerrado,
          fechaUltimaActualizacion: periodoEncontrado.fechaActualizacion,
        });

        const tiposArray = detalleGroup.get('tipos') as FormArray;
        if (periodoEncontrado.cerrado) {
          tiposArray.disable();
        } else {
          tiposArray.enable();
        }

        if (periodoEncontrado.acuerdoDetalleConceptoPeriodoTarifas) {
          const detalleIndex = this.detallesFormArray.controls.findIndex(ctrl => ctrl.get('id').value === detalleId);
          if (detalleIndex !== -1) {
            this.cargarTarifasEnConceptos(detalleIndex, periodoEncontrado.acuerdoDetalleConceptoPeriodoTarifas);
          }
        }
      } else {
        detalleGroup.patchValue({
          periodoCerrado: false,
          fechaUltimaActualizacion: null,
        });

        const tiposArray = detalleGroup.get('tipos') as FormArray;
        tiposArray.enable();
      }
    } catch (error) {
      console.error('Error al cargar tarifas del período:', error);
    }
  }
  //#endregion

  //#region Inicialización del Formulario
  private inicializarFormulario(): void {
    this.formTarifas = this.fb.group({ detalles: this.fb.array([]) });

    for (const detalle of this.acuerdo.acuerdoDetalles) {
      this.agregarDetalleFormGroup(detalle);
    }
  }

  private agregarDetalleFormGroup(detalle: AcuerdoDetalle): void {
    const detalleGroup = this.fb.group({
      id: [detalle.id],
      materialPuerto: [detalle.materialPuerto.descripcion],
      cantidadTotal: [detalle.cantidadTotal],
      periodoSeleccionado: [''],
      periodoId: [0],
      periodoCerrado: [false],
      fechaUltimaActualizacion: [null],
      tipos: this.fb.array([])
    });

    // Suscribirse a cambios en el período seleccionado
    detalleGroup.get('periodoSeleccionado').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(periodo => {
      if (periodo) {
        this.onPeriodoChange(detalle, detalleGroup);
      }
    });

    this.detallesFormArray.push(detalleGroup);
  }

  public get detallesFormArray(): FormArray {
    return this.formTarifas.get('detalles') as FormArray;
  }

  public getTiposFormArray(detalleForm: any): FormArray {
    return detalleForm.get('tipos') as FormArray;
  }

  public getConceptosFormArray(tipoForm: any): FormArray {
    return tipoForm.get('conceptos') as FormArray;
  }
  //#endregion

  //#region Gestión de Períodos y Conceptos
  private onPeriodoChange(detalle: AcuerdoDetalle, detalleGroup: FormGroup): void {
    // Limpiar conceptos anteriores
    const tiposArray = detalleGroup.get('tipos') as FormArray;
    while (tiposArray.length) {
      tiposArray.removeAt(0);
    }

    // Agrupar conceptos por tipo
    const conceptosPorTipo = this.agruparConceptosPorTipo(detalle);

    // Crear FormGroups para cada tipo
    for (const grupo of conceptosPorTipo) {
      const conceptosFormGroups = grupo.conceptos.map(c => this.crearConceptoFormGroup(c));

      const tipoGroup = this.fb.group({
        tipo: [grupo.tipo],
        conceptos: this.fb.array(conceptosFormGroups)
      });

      tiposArray.push(tipoGroup);
    }

    this.cargarTarifasDelPeriodo(detalle.id, detalleGroup);
  }

  private agruparConceptosPorTipo(detalle: AcuerdoDetalle): ConceptoPorTipo[] {
    const grupos: ConceptoPorTipo[] = [];

    for (const detalleConcepto of detalle.acuerdoDetalleConceptos) {
      const concepto = detalleConcepto.concepto;
      const tipoDescripcion = concepto.tipoConcepto.descripcion;

      let grupo = grupos.find(g => g.tipo === tipoDescripcion);

      if (!grupo) {
        grupo = { tipo: tipoDescripcion, conceptos: [] };
        grupos.push(grupo);
      }

      grupo.conceptos.push({
        acuerdoDetalleConceptoId: detalleConcepto.id,
        concepto: concepto,
        tarifaId: 0,
        valorTarifa: 0
      });
    }

    return grupos;
  }

  private crearConceptoFormGroup(conceptoConTarifa: ConceptoConTarifa): FormGroup {
    return this.fb.group({
      acuerdoDetalleConceptoId: [conceptoConTarifa.acuerdoDetalleConceptoId],
      concepto: [conceptoConTarifa.concepto],
      tarifaId: [conceptoConTarifa.tarifaId],
      valorTarifa: [conceptoConTarifa.valorTarifa, [Validators.required, Validators.min(0.01)]]
    });
  }

  //#endregion

  //#region Formateo de Tarifas
  public formatearTarifa(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/[^\d,]/g, '');

    const valorNumerico = parseFloat(valor.replace(',', '.'));

    if (isNaN(valorNumerico)) {
      return;
    }

    const partes = valor.split(',');
    const entero = partes[0];
    const decimal = partes[1] || '';

    const enteroFormateado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    let valorFormateado = enteroFormateado;
    if (decimal) {
      valorFormateado += ',' + decimal.substring(0, 2);
    }

    input.value = valorFormateado;
  }

  public actualizarTarifa(event: Event, detalleIndex: number, tipoIndex: number, conceptoIndex: number): void {
    const input = event.target as HTMLInputElement;
    const valorTexto = input.value;

    const valorLimpio = valorTexto.replace(/\./g, '').replace(',', '.');
    const valorNumerico = parseFloat(valorLimpio);

    if (!isNaN(valorNumerico)) {
      const detalleControl = this.detallesFormArray.at(detalleIndex);
      const tiposArray = detalleControl.get('tipos') as FormArray;
      const tipoControl = tiposArray.at(tipoIndex);
      const conceptosArray = tipoControl.get('conceptos') as FormArray;
      const conceptoControl = conceptosArray.at(conceptoIndex);

      conceptoControl.get('valorTarifa')?.setValue(valorNumerico, { emitEvent: false });
    }
  }

  public onCantidadChange(event: any, detalleIndex: number, tipoIndex: number, conceptoIndex: number) {
    const valorInput = parseFloat(event.target.value) || 0;
    const detalleControl = this.detallesFormArray.at(detalleIndex);
    const tiposArray = detalleControl.get('tipos') as FormArray;
    const tipoControl = tiposArray.at(tipoIndex);
    const conceptosArray = tipoControl.get('conceptos') as FormArray;
    const conceptoControl = conceptosArray.at(conceptoIndex);
    conceptoControl.get('valorTarifa').setValue(valorInput.toFixed(2));

  }
  //#endregion

  //#region Preparación de Datos para Guardar
  private crearObjetoTarifasDetalle(detalleIndex: number): GuardarTarifasDetallePeriodoRequest {
    const detalleControl = this.detallesFormArray.at(detalleIndex);
    const detalleValue = (detalleControl as FormGroup).getRawValue();

    if (!detalleValue.periodoSeleccionado) {
      return null;
    }

    // Convertir el valor del período (YYYY-MM) a fecha (primer día del mes)
    const [year, month] = detalleValue.periodoSeleccionado.split('-');
    const fechaPeriodo = new Date(parseInt(year), parseInt(month) - 1, 1);

    const tarifasDetalle: TarifaConcepto[] = [];

    // Obtener conceptos con tarifa
    for (const tipo of detalleValue.tipos) {
      for (const concepto of tipo.conceptos) {
        const valorTarifa = +concepto.valorTarifa;
        if (valorTarifa > 0) {
          tarifasDetalle.push({
            id: concepto.tarifaId || 0,
            acuerdoDetalleConceptoId: concepto.acuerdoDetalleConceptoId,
            valorTarifa: valorTarifa
          });
        }
      }
    }

    if (tarifasDetalle.length === 0) {
      return null;
    }

    return {
      acuerdoDetalleId: detalleValue.id,
      periodo: fechaPeriodo,
      tarifas: tarifasDetalle,
      cerrar: false
    };
  }
  //#endregion

  //#region Acciones
  public async guardarDetalle(detalleIndex: number, cerrar: boolean = false): Promise<void> {
    const detalleControl = this.detallesFormArray.at(detalleIndex);

    if (!detalleControl.get('periodoSeleccionado').value) {
      this.confirmationDialogService.alertar('Debe seleccionar un período');
      return;
    }

    if (detalleControl.get('periodoCerrado').value) {
      this.confirmationDialogService.alertar('No se puede guardar un período que está cerrado');
      return;
    }

    // Validar que los conceptos seleccionados tengan tarifa
    const tiposArray = detalleControl.get('tipos') as FormArray;
    for (const tipoControl of tiposArray.controls) {
      const conceptosArray = tipoControl.get('conceptos') as FormArray;
      for (const conceptoControl of conceptosArray.controls) {
        const conceptoValue = (conceptoControl as FormGroup).getRawValue();
        if (!conceptoValue.valorTarifa || +conceptoValue.valorTarifa <= 0) {
          const nombreConcepto = conceptoValue.concepto.descripcion;
          this.confirmationDialogService.alertar(`El concepto "${nombreConcepto}" requiere una tarifa mayor a 0`);
          return;
        }
      }
    }

    const request = this.crearObjetoTarifasDetalle(detalleIndex);
    request.cerrar = cerrar;

    if (!request) {
      this.confirmationDialogService.error('Debe configurar al menos una tarifa.');
      return;
    }

    try {
      this.mensajeCarga = cerrar ? "Cerrando tarifas del periodo" : "Guardando tarifas...";
      this.cargando = true;

      await this.acuerdoService.guardarTarifasDetallePeriodo(request).pipe(take(1)).toPromise();

      await this.cargarTarifasExistentes();

      // Obtener el detalle y volver a cargar sus tarifas
      const detalleId = detalleControl.get('id').value;
      const detalle = this.acuerdo.acuerdoDetalles.find(d => d.id === detalleId);
      if (detalle) {
        this.cargarTarifasDelPeriodo(detalleId, detalleControl as FormGroup);
      }

      this.cargando = false;
      detalleControl.markAsPristine();

      const msj = cerrar ? 'Cierre de tarifas realizado correctamente.' : 'Tarifas del período guardadas correctamente.';
      this.confirmationDialogService.exito(msj);
    } catch (error) {
      this.cargando = false;
      console.error('Error al guardar:', error);
      this.confirmationDialogService.error('Ocurrió un error al guardar las tarifas. Por favor, intente nuevamente.');
    }
  }

  public async reabrirTarifas(detalleIndex: number) {
    const detalleControl = this.detallesFormArray.at(detalleIndex);

    if (!detalleControl.get('periodoSeleccionado').value) {
      this.confirmationDialogService.alertar('Debe seleccionar un período');
      return;
    }

    if (!detalleControl.get('periodoCerrado').value) {
      this.confirmationDialogService.alertar('No se puede reabrir un período que no está cerrado');
      return;
    }

    // Obtener el ID del período desde los datos cargados
    const detalleId = detalleControl.get('id').value;
    const periodoSeleccionado = detalleControl.get('periodoSeleccionado').value;
    const [year, month] = periodoSeleccionado.split('-');
    const fechaPeriodo = new Date(parseInt(year), parseInt(month) - 1, 1);

    const periodoEncontrado = this.periodosCargados.find(p => {
      const fechaPeriodoDb = new Date(p.periodo);
      return p.acuerdoDetalleId === detalleId &&
        fechaPeriodoDb.getFullYear() === fechaPeriodo.getFullYear() &&
        fechaPeriodoDb.getMonth() === fechaPeriodo.getMonth();
    });

    if (!periodoEncontrado?.id) {
      this.confirmationDialogService.alertar('No se encontró el período a reabrir')
    }

    try {
      this.mensajeCarga = 'Reabriendo tarifas del periodo';
      this.cargando = true;

      await this.acuerdoService.reabrirTarifasAcuerdo(periodoEncontrado.id).pipe(take(1)).toPromise();

      await this.cargarTarifasExistentes();
      
      // Obtener el detalle y volver a cargar sus tarifas
      const detalleId = detalleControl.get('id').value;
      const detalle = this.acuerdo.acuerdoDetalles.find(d => d.id === detalleId);
      if (detalle) {
        this.cargarTarifasDelPeriodo(detalleId, detalleControl as FormGroup);
      }

      this.cargando = false;
      this.confirmationDialogService.exito('Reapertura de tarifas realizado correctamente.');
    } catch (error) {

    }
  }

  public async cancelar(): Promise<void> {
    let hayCambios = false;
    for (let i = 0; i < this.detallesFormArray.length; i++) {
      const detalleControl = this.detallesFormArray.at(i);
      if (detalleControl.dirty) {
        hayCambios = true;
        break;
      }
    }

    if (hayCambios) {
      const confirm = await this.confirmationDialogService.confirmar('Atención!', 'Hay cambios sin guardar en uno o más detalles. ¿Está seguro que desea salir?');
      if (!confirm) {
        return;
      }
    }
    this.router.navigate(['/acuerdos']);
  }

  public async descargarArchivo() {
    this.mensajeCarga = 'Descargando archivo...';
    this.cargando = true;
    if (this.fileNameAcuerdo && this.acuerdoId > 0) {
      try {
        const blob = await this.acuerdoService.obtenerArchivoAcuerdo(this.acuerdoId).toPromise();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.fileNameAcuerdo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.cargando = false;
      } catch (error) {
        this.confirmationDialogService.error('Ocurrió un error al descargar el archivo del acuerdo.');
        console.error('Error al descargar el archivo del acuerdo:', error);
        this.cargando = false;
        return;
      }
    }
  }
  //#endregion
}