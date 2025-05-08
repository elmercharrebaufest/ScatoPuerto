import { Location } from '@angular/common';
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

  public conceptos: Concepto[] = [];
  public materiales: MaterialPuerto[] = [];
  public tarifa: TarifaPorProducto;

  public mensaje: string = '';
  public msjTarifa: string = '';

  public estaCargando: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private servicioAdministracion: AdministracionService,
    private servicioEmbarque: EmbarqueService,
    private confirmationDialogService: ConfirmationDialogService,
    private location: Location
  ) {
    this.inicializarForm();
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  private inicializarForm(): void {
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
      valor: [{ value: '', disabled: true }], // Initialize as disabled
      seleccionado: [false] // Control for enabling/disabling the input
    });

    //Habilito/Deshabilito controles dependiendo si fueron marcados en tarifa.
    group.get('seleccionado')?.valueChanges.subscribe((isSelected: boolean) => {
      const valorControl = group.get('valor');
      if (isSelected) {
        valorControl?.enable();
      } else {
        valorControl?.reset();
        valorControl?.disable();
      }
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

    if (this.tarifaForm.value.periodo == '' || this.tarifaForm.value.materialPuerto == '') {
      this.confirmationDialogService.alertar("Atención, Debe seleccionar un periodo y un material de puerto para buscar la tarifa.");
      return;
    }

    this.estaCargando = true;
    this.mensaje = `Buscando tarifa para ${this.tarifaForm.value.materialPuerto.descripcion}...`;
    const productoSeleccionado = this.tarifaForm.value.materialPuerto;

    this.tarifaForm.get('tarifaPorProductoConcepto')?.reset();
    this.cargarAllConceptos();

    this.servicioAdministracion.obtenerTarifaProducto(productoSeleccionado.id,
      this.tarifaForm.value.periodo).subscribe(
        (tarifa: TarifaPorProducto) => {
          if (tarifa !== null) {
            this.marcarConceptosTarifa(tarifa);
            this.msjTarifa = `Modificar Tarifa: ${tarifa.materialPuerto.descripcion}`;
          } else {
            this.msjTarifa = `Registrar Tarifa: ${productoSeleccionado.descripcion}`;
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

  public async onGuardarTarifaProducto(cerrado: boolean) {


    if (this.tarifaForm.invalid) {
      return;
    }

    if (this.tarifaForm.value.cerrado == true) {
      this.confirmationDialogService.confirm('Atención', 'No se puede modificar una tarifa cerrada.', 'Cerrar', '', null, null, Tipoalerta.Warning);
      return;
    }

    if (this.tarifaForm.value.id == 0) {
      this.mensaje = "Registrando tarifa...";
    } else {
      this.mensaje = "Actualizando tarifa...";
    }


    let msj = "¿Desea guardar cambios a la tarifa?";
    if (cerrado) {
      msj = `¿Está seguro de confirmar las tarifas del producto ${this.tarifaForm.value.materialPuerto.descripcion} para el período ${this.tarifaForm.value.periodo}"?, Si confirma no podrá realizar futuras modificaciones`;
    }
    const confirm = await this.confirmationDialogService.confirmar('Advertencia', msj, 'Aceptar', 'Cancelar');
    if (!confirm) {
      return;
    }

    this.eliminarConceptosNoSeleccionados();
    this.estaCargando = true;
    const formData = this.tarifaForm.getRawValue();

    this.servicioAdministracion.guardarTarifaPorProducto(formData).subscribe(
      (response) => {
        console.log('Tarifa guardada correctamente:', response);
        this.estaCargando = false;
        this.onBuscarTarifaProducto();
        this.confirmationDialogService.confirm('Atención', 'Se ha guardado la tarifa con exito.', 'Cerrar', '', null, null, Tipoalerta.Success);
      },
      (error) => {
        console.error('Error al guardar la tarifa:', error);
        this.estaCargando = false;
        let msjError = `Ha ocurrido un error al intentar guardar la tarifa.`;
        this.confirmationDialogService.confirm('Atención', msjError, 'Cerrar', '', null, null, Tipoalerta.Warning);
      }
    );
  }

  private eliminarConceptosNoSeleccionados(): void {
    const conceptoFormArray = this.tarifaForm.get('tarifaPorProductoConcepto') as FormArray;

    for (let i = conceptoFormArray.length - 1; i >= 0; i--) {
      const control = conceptoFormArray.at(i) as FormGroup;
      if (!control.get('seleccionado')?.value) {
        conceptoFormArray.removeAt(i);
      }
    }
  }

  public onVolver(): void {
    this.location.back(); // Regresa a la página anterior en el historial
  }
}
