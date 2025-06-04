import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Concepto } from '@ScatoModels/administracion/concepto';
import { EmbarqueATarifar } from '@ScatoModels/administracion/embarque-a-tarifar';
import { TarifaPorEmbarque } from '@ScatoModels/administracion/tarifa-por-embarque';
import { TipoContratoTarifa } from '@ScatoModels/administracion/tipo-contrato-tarifa';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { MuelleDeCarga } from '@ScatoModels/programa-embarque/muelle-de-carga';
import { AdministracionService } from '@ScatoServicios/administracion.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tarifa-embarque',
  templateUrl: './tarifa-embarque.component.html',
  styleUrls: ['./tarifa-embarque.component.css']
})
export class TarifaEmbarqueComponent implements OnInit {
  public filtrosForm: FormGroup;
  public tarifaForm: FormGroup;

  public periodo: Date;
  public muelles: MuelleDeCarga[] = [];
  public embarques: EmbarqueATarifar[] = [];
  public conceptos: Concepto[] = [];
  public tipoContratoTarifa: TipoContratoTarifa[] = [];
  public tiposContrato: TipoContratoTarifa[] = [];

  public mensaje: string = '';
  public msjTarifa: string = '';

  public estaCargando: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private servicioAdministracion: AdministracionService,
    private confirmationDialogService: ConfirmationDialogService) {
    this.inicializarForm();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }



  public cargarDatos(): void {
    this.estaCargando = true;
    this.mensaje = 'Cargando datos...';

    forkJoin({
      muelles: this.servicioAdministracion.listarMuelles(),
      conceptos: this.servicioAdministracion.listarConceptos(),
      tipoContratoTarifa: this.servicioAdministracion.listarTipoContratoTarifa()
    }).subscribe(
      ({ muelles, conceptos, tipoContratoTarifa }) => {
        this.muelles = muelles;
        this.conceptos = conceptos;
        this.tipoContratoTarifa = tipoContratoTarifa;
        this.precargarConceptos(conceptos);
        // Buscar y seleccionar el muelle "San Benito"
        const muelleSanBenito = this.muelles.find(m => m.descripcion === 'San Benito');
        if (muelleSanBenito) {
          this.filtrosForm.get('muelle').setValue(muelleSanBenito);
        }
        this.listarEmbarquesATarifar();
        this.estaCargando = false;
      },
      error => {
        console.error('Error al cargar los datos iniciales:', error);
        this.estaCargando = false;
      }
    );
  }

  private precargarConceptos(conceptos: Concepto[]): void {
    const conceptoFormArray = this.tarifaForm?.get('tarifaPorEmbarqueConcepto') as FormArray;
    conceptoFormArray.clear();

    if (!conceptoFormArray || !(conceptoFormArray instanceof FormArray)) {
      console.error('tarifaPorEmbarqueConcepto no es un FormArray');
      return;
    }
    conceptos.forEach((concepto) => {
      const conceptoFormGroup = this.crearConceptoFormGroup();
      conceptoFormGroup.patchValue({
        concepto: concepto,
        id: 0,
        valor: '',
        seleccionado: false
      });
      conceptoFormArray.push(conceptoFormGroup);
    });
  }

  public listarEmbarquesATarifar() {
    this.estaCargando = true;
    this.mensaje = 'Cargando embarques...';
    this.servicioAdministracion.listarEmbarquesATarifar(this.filtrosForm.value.periodo, this.filtrosForm.value.muelle.id).subscribe(
      (embarques: EmbarqueATarifar[]) => {
        this.embarques = embarques;
        this.estaCargando = false;
      },
      error => {
        console.error('Error al cargar los embarques:', error);
        this.estaCargando = false;
      }
    );
  }

  public onVolver() {

  }

  public AnioMesActual(): string {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  private inicializarForm(): void {
    this.filtrosForm = this.formBuilder.group({
      muelle: [0],
      periodo: [this.AnioMesActual()],
      embarque: [''],
      vapor: [''],
      materialPuerto: [''],
      exportador: [''],
    });

    this.tarifaForm = this.formBuilder.group({
      id: [0],
      embarque: [''],
      exportador: [''],
      materialPuerto: [''],
      periodo: [''],
      tarifaPorEmbarqueConcepto: this.formBuilder.array([]),
      tipoContratoTarifa: [''],
      cerrado: [false]
    });
  }

  public onGuardar() { }

  public getMateriales(): MaterialPuerto[] {
    const embarque = this.embarques.find(x => x.embarque.id === this.filtrosForm.value.embarque.id);
    var materiales = this.obtenerMaterialesUnicos(embarque?.cargas);
    return materiales;
  }
  //return [];


  private obtenerMaterialesUnicos(cargas: any[]): MaterialPuerto[] {
    const materialesMap = new Map<number, MaterialPuerto>();
    if (!cargas) return [];
    cargas.forEach(carga => {
      if (!materialesMap.has(carga?.materialPuerto?.id)) {
        materialesMap.set(carga?.materialPuerto?.id, carga?.materialPuerto);
      }
    });
    return Array.from(materialesMap.values());
  }

  public getExportadores() {
    const embarque = this.embarques.find(x => x.embarque.id === this.filtrosForm.value.embarque.id);
    var exportadores = this.obtenerExportadoresUnicos(embarque?.cargas);
    return exportadores;
  }

  private obtenerExportadoresUnicos(cargas: any[]): any[] {
    const exportadoresMap = new Map<number, any>();
    const materialPuertoId = this.filtrosForm.value.materialPuerto.id;
    if (!cargas) return [];

    cargas.filter(c => c.materialPuerto.id == materialPuertoId).forEach(carga => {
      if (!exportadoresMap.has(carga?.exportador.id)) {
        exportadoresMap.set(carga?.exportador?.id, carga?.exportador);
      }
    });
    return Array.from(exportadoresMap.values());
  }

  public onCambiarBuque(event: Event): void {
    var vaporSelected = this.embarques.find(x => x.embarque.id == this.filtrosForm.value.embarque.id).vapor;
    this.filtrosForm.get('vapor').setValue(vaporSelected);

    // Limpiar material y exportador al cambiar de embarque
    this.filtrosForm.get('materialPuerto').setValue('');
    this.filtrosForm.get('exportador').setValue('');
  }

  public onRefreshEmbarques(): void {
    const muelleId = this.filtrosForm.get('muelle').value.id;
    const periodo = this.filtrosForm.get('periodo').value;
    if (!periodo) {
      this.confirmationDialogService.alertar("Atención, debe seleccionar periodo.");
      return;
    }
    if (!muelleId) {
      this.confirmationDialogService.alertar("Atención, debe seleccionar muelle.");
      return;
    }
    this.filtrosForm.controls.embarque.setValue('');
    this.filtrosForm.controls.materialPuerto.setValue('');
    this.filtrosForm.controls.exportador.setValue('');
    this.listarEmbarquesATarifar();
  }

  public onBuscarTarifaEmbarque() {
    if (!this.filtrosForm.value.embarque) {
      this.confirmationDialogService.alertar("Atención, debe seleccionar embarque.");
      return;
    }
    if (!this.filtrosForm.value.materialPuerto) {
      this.confirmationDialogService.alertar("Atención, debe seleccionar material.");
      return;
    }
    if (!this.filtrosForm.value.periodo) {
      this.confirmationDialogService.alertar("Atención, debe seleccionar periodo.");
      return;
    }
    if (!this.filtrosForm.value.exportador) {
      this.confirmationDialogService.alertar("Atención, debe seleccionar exportador.");
      return;
    }
    this.estaCargando = true;
    this.servicioAdministracion.obtenerTarifaEmbarque(this.filtrosForm.value.embarque.id,
      this.filtrosForm.value.materialPuerto.id, this.filtrosForm.value.exportador.id, this.filtrosForm.value.periodo)
      .subscribe(
        (tarifa: TarifaPorEmbarque) => {
          if (tarifa !== null) {
            this.patchTarifa(tarifa);
            this.actualizarEstadoFormulario();
            this.setContratos();
            console.log("tarifa", tarifa);
          }

          let baseMsg = tarifa.id > 0
            ? `Modificar Tarifa: ${tarifa.embarque.patente} - ${tarifa.exportador?.nombre} - ${tarifa.materialPuerto?.descripcion}`
            : `Registrar Tarifa: ${tarifa.embarque.patente} - ${tarifa.exportador?.nombre} - ${tarifa.materialPuerto?.descripcion}`;

          if (tarifa.cerrado) {
            this.msjTarifa = `Tarifa Cerrada: ${tarifa.embarque.patente} - ${tarifa.exportador?.nombre} - ${tarifa.materialPuerto?.descripcion}`;
          } else {
            this.msjTarifa = baseMsg;
          }
          this.estaCargando = false;
        },
        (error) => {
          console.error('Error al buscar tarifa por embarque:', error);
          this.estaCargando = false;
        })
  }

  private patchTarifa(tarifa: TarifaPorEmbarque) {
    this.tarifaForm.patchValue({
      id: tarifa.id,
      embarque: tarifa.embarque,
      exportador: tarifa.exportador,
      materialPuerto: tarifa.materialPuerto,
      periodo: tarifa.periodo,
      tipoContratoTarifa: this.tipoContratoTarifa.find(x => x.id == tarifa?.tipoContratoTarifa?.id),
      cerrado: tarifa.cerrado
    });

    tarifa.tarifaPorEmbarqueConcepto.forEach((conceptoTarifa) => {
      const conceptoFormArray = this.tarifaForm.get('tarifaPorEmbarqueConcepto') as FormArray;
      const conceptoFormGroup = conceptoFormArray.controls.find((control) => {
        return control.get('concepto.id')?.value === conceptoTarifa?.concepto?.id;
      });

      if (conceptoFormGroup) {
        conceptoFormGroup.patchValue({
          id: conceptoTarifa.id,
          valor: conceptoTarifa.valor,
          seleccionado: conceptoTarifa.id > 0 || conceptoTarifa.valor > 0 ? true : false
        });
      }
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
    group.get('seleccionado')?.valueChanges.subscribe(() => {
      this.actualizarEstadoFormulario();
    });

    return group;
  }

  get conceptosIngresoFormArray(): FormArray {
    const conceptos = this.tarifaForm.get('tarifaPorEmbarqueConcepto') as FormArray;
    const ingresos = conceptos.controls.filter(control =>
      control.get('concepto.tipoConcepto.descripcion')?.value === 'Ingreso'
    );
    return new FormArray(ingresos);
  }

  get conceptosGastoFormArray(): FormArray {
    const conceptos = this.tarifaForm.get('tarifaPorEmbarqueConcepto') as FormArray;
    const gastos = conceptos.controls.filter(control =>
      control.get('concepto.tipoConcepto.descripcion')?.value === 'Gasto'
    );
    return new FormArray(gastos);
  }

  public async onGuardarTarifaEmbarque(cerrado: boolean) {

    if (this.tarifaForm.invalid) {
      return;
    }

    if (this.tarifaForm.value.materialPuerto == '' || this.tarifaForm.value.materialPuerto == null ||
      this.tarifaForm.value.embarque == '' || this.tarifaForm.value.embarque == null ||
      this.tarifaForm.value.exportador == '' || this.tarifaForm.value.exportador == null) {
      this.confirmationDialogService.confirm('Atención', 'Debe seleccionar un embarque a facturar.', 'Cerrar', '', null, null, Tipoalerta.Warning);
      return;
    }

    if ((this.tarifaForm.value.tipoContratoTarifa == '' || this.tarifaForm.value.tipoContratoTarifa == null) &&
      ((this.tarifaForm.value.exportador.nombre.toUpperCase() !== 'MOLINOS AGRO SA' && this.filtrosForm.value.muelle.descripcion.toUpperCase() == 'SAN BENITO')
        || (this.tarifaForm.value.exportador.nombre.toUpperCase() == 'MOLINOS AGRO SA' && this.filtrosForm.value.muelle.descripcion.toUpperCase() !== 'SAN BENITO'))) {
      this.confirmationDialogService.confirm('Atención', 'Debe seleccionar un tipo de contrato.', 'Cerrar', '', null, null, Tipoalerta.Warning);
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
      msj = `¿Está seguro de confirmar las tarifas del embarque ${this.tarifaForm.value.embarque.patente} - 
      ${this.tarifaForm.value.exportador.nombre} - ${this.tarifaForm.value.materialPuerto.descripcion} para el período ${this.getNombreMes(this.tarifaForm.value.periodo.toString())}"?, Si confirma no podrá realizar futuras modificaciones`;
      this.tarifaForm.get('cerrado')?.setValue(true);
    }
    const confirm = await this.confirmationDialogService.confirmar('Advertencia', msj, 'Aceptar', 'Cancelar');
    if (!confirm) {
      this.tarifaForm.get('cerrado')?.setValue(false);
      return;
    }

    this.eliminarConceptosNoSeleccionados();
    this.estaCargando = true;
    const formData = this.tarifaForm.getRawValue();

    this.servicioAdministracion.guardarTarifaPorEmbarque(formData).subscribe(
      (response) => {
        console.log('Tarifa guardada correctamente:', response);
        this.estaCargando = false;
        this.precargarConceptos(this.conceptos);
        this.onBuscarTarifaEmbarque();
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
    const conceptoFormArray = this.tarifaForm.get('tarifaPorEmbarqueConcepto') as FormArray;

    for (let i = conceptoFormArray.length - 1; i >= 0; i--) {
      const control = conceptoFormArray.at(i) as FormGroup;
      if (!control.get('seleccionado')?.value) {
        conceptoFormArray.removeAt(i);
      }
    }
  }

  public setContratos() {
    const muelle = this.filtrosForm?.value?.muelle?.descripcion?.toUpperCase();
    const exportador = this.filtrosForm?.value?.exportador?.nombre?.toUpperCase();
    if (!muelle || !exportador) {
      this.tiposContrato = [];
    }
    if (muelle == "SAN BENITO" && exportador !== "MOLINOS AGRO SA") {
      this.tiposContrato = this.tipoContratoTarifa;
    }else
    if (muelle !== "SAN BENITO" && exportador == "MOLINOS AGRO SA") {
      this.tiposContrato = this.tipoContratoTarifa.filter(
        x =>
          x.descripcion.toUpperCase() === "DE TIPO ELEVACIÓN" ||
          x.descripcion.toUpperCase() === "PRÉSTAMO Y DEVOLUCIÓN"
      );
    }else
    if (muelle == "SAN BENITO" && exportador == "MOLINOS AGRO SA") {
      this.tiposContrato = [];
    }else{
      this.tiposContrato = [];
    }
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

  private actualizarEstadoFormulario(): void {
    const cerrado = this.tarifaForm.get('cerrado')?.value === true || this.tarifaForm.get('cerrado')?.value === 'true';
    const conceptosFormArray = this.tarifaForm.get('tarifaPorEmbarqueConcepto') as FormArray;
  
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

    if (cerrado) {
      this.tarifaForm.get('tipoContratoTarifa')?.disable({ emitEvent: false });
    } else {
      this.tarifaForm.get('tipoContratoTarifa')?.enable({ emitEvent: false });
    }
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

  getTotalMaterial(): number{
    let total = 0;
    let form = this.filtrosForm.getRawValue();
    let material = form.materialPuerto;
    let exportador = form.exportador;
    let embarque = this.embarques.find(x => x.embarque.id == this.filtrosForm.value.embarque.id);
    if (embarque && embarque.cargas) {
      embarque.cargas.forEach(carga => {
        if (carga.materialPuerto.id == material.id && carga.exportador.id == exportador.id) {
          total += carga.cantidad;
        }
      });
    }
    return total;
  }

  public onChangeMaterial(event: Event) {
    this.filtrosForm.controls.exportador.setValue('');
  }
}
