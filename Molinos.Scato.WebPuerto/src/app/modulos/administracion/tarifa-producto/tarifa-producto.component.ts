import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Concepto } from '@ScatoModels/administracion/concepto';
import { TarifaPorProducto } from '@ScatoModels/administracion/tarifa-por-producto';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { AdministracionService } from '@ScatoServicios/administracion.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tarifa-producto',
  templateUrl: './tarifa-producto.component.html',
  styleUrls: ['./tarifa-producto.component.css']
})
export class TarifaProductoComponent implements OnInit {
  public tarifaForm: FormGroup;
  public filtrosForm: FormGroup;

  public conceptos: Concepto[] = [];
  public materiales: MaterialPuerto[] = [];
  public tarifa: TarifaPorProducto;

  public mensaje: string = '';
  public msjTarifa: string = '';

  public estaCargando: boolean = false;
  public seEjecutaBusqueda: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private servicioAdministracion: AdministracionService,
    private servicioEmbarque: EmbarqueService,
    private confirmationDialogService: ConfirmationDialogService,
  ) {
    this.inicializarForm();
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  private inicializarForm(): void {

    this.filtrosForm = this.formBuilder.group({
      periodo: [this.AnioMesActual()],
      materialPuerto: ['']
    });

    this.tarifaForm = this.formBuilder.group({
      id: [0],
      materialPuerto: [''],
      periodo: [''],
      tarifaPorProductoConcepto: this.formBuilder.array([this.crearConceptoFormGroup()]), // Inicializa con un concepto
      cerrado: [false]
    });
  }

  private crearConceptoFormGroup(): FormGroup {
    const group = this.formBuilder.group({
      id: [0],
      concepto: this.formBuilder.group({
        id: [0],
        descripcion: [''],
        tipoConcepto: this.formBuilder.group({
          id: [0],
          descripcion: ['']
        }),
        moneda: this.formBuilder.group({
          id: [0],
          descripcion: ['']
        }),
        tipoTarifa: this.formBuilder.group({
          id: [0],
          descripcion: ['']
        }),
        presentaAjuste: [false],
        porProducto: [false],
        porEmbarque: [false]
      }),
      valor: [{ value: '', disabled: true }],
      seleccionado: [false]
    });

    //Habilito/Deshabilito controles dependiendo si fueron marcados en tarifa.
    group.get('seleccionado')?.valueChanges.subscribe(() => {
      this.actualizarEstadoFormulario();
    });

    return group;
  }

  get conceptosIngresoFormArray(): FormArray {
    const conceptos = this.tarifaForm.get('tarifaPorProductoConcepto') as FormArray;
    const ingresos = conceptos.controls.filter(control =>
      control.get('concepto.tipoConcepto.descripcion')?.value === 'Ingreso'
    );
    return new FormArray(ingresos);
  }

  get conceptosGastoFormArray(): FormArray {
    const conceptos = this.tarifaForm.get('tarifaPorProductoConcepto') as FormArray;
    const gastos = conceptos.controls.filter(control =>
      control.get('concepto.tipoConcepto.descripcion')?.value === 'Gasto'
    );
    return new FormArray(gastos);
  }

  public AnioMesActual(): string {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  private cargarAllConceptos(): void {
    const conceptosFormArray = this.tarifaForm.get('tarifaPorProductoConcepto') as FormArray;
    conceptosFormArray.clear();
    this.conceptos.forEach(concepto => {
      const conceptoGroup = this.crearConceptoFormGroup();
      conceptoGroup.patchValue({
        id: 0,
        concepto: {
          id: concepto.id,
          descripcion: concepto.descripcion,
          tipoConcepto: concepto.tipoConcepto,
          moneda: concepto.moneda,
          tipoTarifa: concepto.tipoTarifa,
          presentaAjuste: concepto.presentaAjuste,
          porProducto: concepto.porProducto,
          porEmbarque: concepto.porEmbarque
        }
      });
      conceptosFormArray.push(conceptoGroup);
    });
  }

  private cargarDatosIniciales(): void {
    this.estaCargando = true;
    this.mensaje = 'Cargando datos...';
    forkJoin({
      conceptos: this.servicioAdministracion.listarConceptosProducto(),
      materiales: this.servicioEmbarque.obtenerListadoMateriales()
    }).subscribe(
      ({ conceptos, materiales }) => {
        this.conceptos = conceptos;
        this.materiales = materiales;
        this.cargarAllConceptos();
        this.estaCargando = false;
      },
      error => {
        console.error('Error al cargar los datos iniciales:', error);
        this.estaCargando = false;
      }
    );
  }

  public getConfigListaMultiple() {
    return {
      singleSelection: true,
      primaryKey: 'id',
      idField: 'id',
      textField: 'descripcion',
      allowSearchFilter: true,
      itemsShowLimit: 1,
      enableCheckAll: false
    };
  }

  public onBuscarTarifaProducto() {

    if (this.filtrosForm.value.periodo == '' || this.filtrosForm.value.materialPuerto == '') {
      this.confirmationDialogService.alertar("Atención, Debe seleccionar un periodo y un material de puerto para buscar la tarifa.");
      return;
    }

    this.seEjecutaBusqueda = true;
    this.estaCargando = true;
    this.mensaje = `Buscando tarifa para ${this.filtrosForm.value.materialPuerto.descripcion}...`;
    const productoSeleccionado = this.filtrosForm.value.materialPuerto;

    this.filtrosForm.get('tarifaPorProductoConcepto')?.reset();

    this.tarifaForm.reset({
      id: 0,
      materialPuerto: this.filtrosForm.value.materialPuerto,
      periodo: this.filtrosForm.value.periodo,
      tarifaPorProductoConcepto: [],
      cerrado: false
    });

    this.cargarAllConceptos();

    this.servicioAdministracion.obtenerTarifaProducto(productoSeleccionado.id,
      this.filtrosForm?.value?.periodo).subscribe(
        (tarifa: TarifaPorProducto) => {
          if (tarifa !== null) {
            this.marcarConceptosTarifa(tarifa);
            this.actualizarEstadoFormulario();
            if(tarifa?.cerrado){
              this.msjTarifa = `Tarifa cerrada: ${tarifa.materialPuerto.descripcion} - ${this.getNombreMes(tarifa.periodo.toString())}`;
            }else{
            this.msjTarifa = `Modificar Tarifa: ${tarifa.materialPuerto.descripcion} - ${this.getNombreMes(tarifa.periodo.toString())}`;
            }
          } else {
            this.msjTarifa = `Registrar Tarifa: ${productoSeleccionado.descripcion} - ${this.getNombreMes(this.filtrosForm?.value?.periodo)}`;
          }
          this.estaCargando = false;
        },
        (error) => {
          console.error('Error al buscar tarifa por producto:', error);
          let msjError = `Ha ocurrido un error al intentar obtener la tarifa.`;
          this.confirmationDialogService.confirm('Atención', msjError, 'Cerrar', '', null, null, Tipoalerta.Warning);
          this.estaCargando = false;
        })
  }

  private marcarConceptosTarifa(tarifa: TarifaPorProducto) {
    this.tarifaForm.patchValue({ id: tarifa?.id });
    this.tarifaForm.patchValue({ materialPuerto: tarifa?.materialPuerto });
    this.tarifaForm.patchValue({ periodo: tarifa?.periodo });
    this.tarifaForm.patchValue({ cerrado: tarifa?.cerrado });

    tarifa.tarifaPorProductoConcepto.forEach((conceptoTarifa) => {
      const conceptoFormArray = this.tarifaForm.get('tarifaPorProductoConcepto') as FormArray;
      const conceptoFormGroup = conceptoFormArray.controls.find((control) => {
        return control.get('concepto.id')?.value === conceptoTarifa?.concepto?.id;
      });

      if (conceptoFormGroup) {
        conceptoFormGroup.patchValue({
          id: conceptoTarifa.id,
          valor: conceptoTarifa.valor,
          seleccionado: true
        });
      }
    });
  }

  public numberWithTwoDecimals(event: KeyboardEvent, inputValue: string): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;

    if (charCode === 8 || charCode === 9 || charCode === 37 || charCode === 39) {
      return true;
    }

    if (charCode >= 48 && charCode <= 57) {
      const newValue = inputValue + String.fromCharCode(charCode);
      if (newValue.includes('.')) {
        const decimalPart = newValue.split('.')[1];
        if (decimalPart && decimalPart.length > 2) {
          return false;
        }
      }
      return true;
    }

    if (charCode === 46 && !inputValue.includes('.')) {
      return true;
    }

    return false;
  }

  public onReabrirTarifas(): void {
    this.confirmationDialogService.confirm(
      'Reabrir Cierre de Tarifas',
      '¿Está seguro que desea reabrir las tarifas para este período?',
      'Confirmar',
      'Cancelar',
      null,
      null,
      Tipoalerta.Warning
    ).then((confirmado) => {
      if (confirmado) {
        this.tarifaForm.patchValue({ cerrado: false });
        this.onGuardarTarifaProducto(false, true); 
        const conceptosFormArray = this.tarifaForm.get('tarifaPorProductoConcepto') as FormArray;
        conceptosFormArray.controls.forEach(control => {
            control.enable({ emitEvent: false });
        });
      }
    });
  }

  public onGuardarTarifaProducto(cerrar: boolean, omitirConfirmacion: boolean = false): void {
    if (this.tarifaForm.invalid) {
      this.confirmationDialogService.alertar('Por favor, complete todos los campos requeridos.', Tipoalerta.Warning);
      return;
    }

    if (omitirConfirmacion) {
        this.ejecutarGuardadoBackend();
    } else {
        const mensaje = cerrar ? '¿Está seguro que desea cerrar las tarifas?' : '¿Está seguro que desea guardar las tarifas?';
        
        this.confirmationDialogService.confirm(
          'Confirmación',
          mensaje,
          'Confirmar',
          'Cancelar',
          null,
          null,
          Tipoalerta.Warning
        ).then((confirmado) => {
          if (confirmado) {
            if (cerrar) {
              this.tarifaForm.patchValue({ cerrado: true });
            }
            this.ejecutarGuardadoBackend();
          }
        });
    }
  }

  private ejecutarGuardadoBackend(): void {
    this.estaCargando = true;
    const tarifaAGuardar = this.tarifaForm.getRawValue();

    if (tarifaAGuardar.tarifaPorProductoConcepto) {
        tarifaAGuardar.tarifaPorProductoConcepto = tarifaAGuardar.tarifaPorProductoConcepto.filter(c => c.seleccionado);
    }

    this.servicioAdministracion.guardarTarifaPorProducto(tarifaAGuardar).subscribe(
      (respuesta: any) => {
        this.estaCargando = false;
        this.confirmationDialogService.exito("Tarifa guardada correctamente.");
        this.actualizarEstadoFormulario(); 
      },
      (error: any) => {
        this.estaCargando = false;
        console.error('Error al guardar tarifa:', error);
        const mensaje = error.error?.message || error.error || 'Error al guardar la tarifa.';
        this.confirmationDialogService.alertar(mensaje, Tipoalerta.Error);
      }
    );
  }

  public onVolver(): void {
  }

  getNombreMes(periodo: string): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    if (!periodo || periodo.length < 7) return '';
    const mes = parseInt(periodo.split('-')[1], 10);
    return meses[mes - 1] || '';
  }

  private actualizarEstadoFormulario(): void {
    const cerrado = this.tarifaForm.get('cerrado')?.value === true || this.tarifaForm.get('cerrado')?.value === 'true';
    const conceptosFormArray = this.tarifaForm.get('tarifaPorProductoConcepto') as FormArray;
    conceptosFormArray.controls.forEach(control => {
      if (cerrado) {
        control.get('seleccionado')?.disable({ emitEvent: false });
        control.get('valor')?.disable({ emitEvent: false });
      } else {
        control.get('seleccionado')?.enable({ emitEvent: false });
        if (control.get('seleccionado')?.value) {
          control.get('valor')?.enable({ emitEvent: false });
        } else {
          control.get('valor')?.disable({ emitEvent: false });
        }
      }
    });
  }
}
