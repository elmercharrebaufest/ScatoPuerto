import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Concepto } from '@ScatoModels/administracion/concepto';
import { EmbarqueATarifar } from '@ScatoModels/administracion/embarque-a-tarifar';
import { AltaProvisionGasto, InfoFiltrada } from '@ScatoModels/administracion/provision-gasto';
import { TipoContratoTarifa } from '@ScatoModels/administracion/tipo-contrato-tarifa';
import { Vapor } from '@ScatoModels/embarque';
import { Exportador } from '@ScatoModels/exportador';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { MuelleDeCarga } from '@ScatoModels/programa-embarque/muelle-de-carga';
import { TipoDeContrato } from '@ScatoModels/programa-embarque/tipo-de-contrato';
import { AdministracionService } from '@ScatoServicios/administracion.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { forkJoin, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

export interface CombosConsultaProvisiones {
  embarques: EmbarqueRaw[];
  muelles: MuelleDeCarga[];
  exportadores: Exportador[];
  productos: MaterialPuerto[];
  tiposContrato: TipoDeContrato[];
}

export class EmbarqueRaw {
  id: number;
  vapor: Vapor;
  periodo: Date;
}

@Component({
  selector: 'app-prov-gastos-embarque',
  templateUrl: './prov-gastos-embarque.component.html',
  styleUrls: ['./prov-gastos-embarque.component.css']
})


export class ProvGastosEmbarqueComponent implements OnInit {

  public filtroForm: FormGroup;
  public altaProvisionGastoForm: FormGroup;

  public muelles: MuelleDeCarga[] = [];
  public exportadores: Exportador[] = [];
  public embarques: EmbarqueATarifar[] = [];
  public conceptos: Concepto[] = [];
  public materiales: MaterialPuerto[] = [];
  public tiposContrato: TipoContratoTarifa[] = [];
  public infoFiltrada: InfoFiltrada;
  public buques: Vapor[] = [];

  public provisionEncontrada: boolean = false;
  public estaCargando: boolean = false;

  public mensaje: string = 'Cargando...';

  constructor(
    private fb: FormBuilder,
    private servicioAdministracion: AdministracionService,
    private confirmationDialogService: ConfirmationDialogService,
  ) {
    this.inicializarForm();

  }

  ngOnInit(): void {
    this.listarCombos();
  }

  public onVolver(): void {
  }

  private listarCombos(): void {
    forkJoin({
      combos: this.servicioAdministracion.listarCombosProvisiones(),
      conceptos: this.servicioAdministracion.listarConceptos()
    }).subscribe({
      next: ({ combos, conceptos }) => {
        this.muelles = combos.muelles;
        this.exportadores = combos.exportadores;
        this.materiales = combos.productos;
        this.tiposContrato = combos.tiposContrato;
        this.conceptos = conceptos;
        this.precargarConceptos(conceptos);
        const muelleSanBenito = this.muelles.find(m => m.descripcion === 'San Benito');
        if (muelleSanBenito) {
          this.filtroForm.get('muelle').setValue(muelleSanBenito);
        }
        this.onBuscarProvisionGasto(true);

      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  public onRefreshEmbarques(): void {
    const muelleId = this.filtroForm.get('muelle').value.id;
    const periodo = this.filtroForm.get('periodo').value;
    if (!periodo) {
      this.confirmationDialogService.alertar("Atención, debe seleccionar periodo.");
      return;
    }
    if (!muelleId) {
      this.confirmationDialogService.alertar("Atención, para mostrar los buques del periodo debe seleccionar muelle.");
      return;
    }
    this.filtroForm.controls.embarque.setValue('');
    this.filtroForm.controls.materialPuerto.setValue('');
    this.filtroForm.controls.exportador.setValue('');
    this.embarques = [];
    this.listarEmbarquesATarifar();
  }

  public listarEmbarquesATarifar() {
    this.estaCargando = true;
    this.embarques = [];
    this.mensaje = 'Cargando embarques...';
    this.servicioAdministracion.listarEmbarquesATarifar(this.filtroForm.value.periodo, this.filtroForm.value.muelle.id).subscribe(
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

  private inicializarForm(): void {
    this.filtroForm = this.fb.group({
      muelle: [0],
      embarque: [''],
      materialPuerto: [''],
      exportador: [''],
      periodo: [this.AnioMesActual()],
      tipoContratoTarifa: [null],
    });

    this.altaProvisionGastoForm = this.fb.group({
      provisionId: [null],
      confirmado: [false],
      tarifaPorEmbarque: [null],
      itemsProvision: this.fb.array([]),
      idsTarifas: [null],
    });
  }

  public agregarItemProvision(concepto: Concepto = null, valor: number = null) {
    const itemGroup = this.fb.group({
      concepto: [concepto],
      valor: [valor]
    });
    (this.altaProvisionGastoForm.get('itemsProvision') as FormArray).push(itemGroup);
  }

  public AnioMesActual(): string {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  public formatterExportador = (exp: Exportador) => exp.nombre;

  public searchExportador = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => this.exportadores.filter(v => v.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  )

  public formatterMaterial = (m: MaterialPuerto) => m.descripcion;

  public searchMaterial = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => this.materiales.filter(m => m.descripcion.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  )

  getEmbarques() {
    return this.embarques;
  }

  public onCambiarBuque(event: Event): void {
    this.filtroForm.get('materialPuerto').setValue('');
    this.filtroForm.get('exportador').setValue('');
  }

  public onLimpiar(): void {
    this.filtroForm.get('embarque').setValue('');
    this.filtroForm.get('materialPuerto').setValue('');
    this.filtroForm.get('exportador').setValue('');
    this.filtroForm.get('tipoContratoTarifa').setValue('');
    this.filtroForm.get('periodo').setValue(this.AnioMesActual());
    this.filtroForm.get('muelle').setValue('');
    this.embarques = [];
    this.onBuscarProvisionGasto();
  }

  private crearConceptoFormGroup(): FormGroup {
    const group = this.fb.group({
      concepto: this.fb.group({
        id: [0],
        descripcion: [''],
        tipoConcepto: this.fb.group({
          id: [0],
          descripcion: ['']
        }),
        moneda: this.fb.group({
          id: [0],
          descripcion: ['']
        }),
        tipoTarifa: this.fb.group({
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
    const conceptos = this.altaProvisionGastoForm.get('itemsProvision') as FormArray;
    const ingresos = conceptos.controls.filter(control =>
      control.get('concepto.tipoConcepto.descripcion')?.value === 'Ingreso'
    );
    return new FormArray(ingresos);
  }

  get conceptosGastoFormArray(): FormArray {
    const conceptos = this.altaProvisionGastoForm.get('itemsProvision') as FormArray;
    const gastos = conceptos.controls.filter(control =>
      control.get('concepto.tipoConcepto.descripcion')?.value === 'Gasto'
    );
    return new FormArray(gastos);
  }
  private precargarConceptos(conceptos: Concepto[]): void {
    const conceptoFormArray = this.altaProvisionGastoForm?.get('itemsProvision') as FormArray;
    conceptoFormArray.clear();

    if (!conceptoFormArray || !(conceptoFormArray instanceof FormArray)) {
      console.error('itemsProvision no es un FormArray');
      return;
    }
    conceptos.forEach((concepto) => {
      const conceptoFormGroup = this.crearConceptoFormGroup();
      conceptoFormGroup.patchValue({
        concepto: concepto,
        valor: '',
        seleccionado: false
      });
      conceptoFormArray.push(conceptoFormGroup);
    });
  }

  public onBuscarProvisionGasto(executeIni: boolean = false): void {
    let filtro = this.filtroForm.value;

    if (!filtro.periodo) {
      this.confirmationDialogService.alertar("Atención, debe seleccionar periodo.");
      return;
    }

    this.mensaje = "Obteniendo Provisiones";
    this.estaCargando = true;
    this.servicioAdministracion.obtenerProvision(filtro?.muelle?.id ?? null, filtro?.periodo ?? null, filtro?.embarque?.id ?? null,
      filtro?.materialPuerto?.id ?? null, filtro?.exportador?.id ?? null, filtro?.tipoContratoTarifa?.id ?? null)
      .subscribe(
        (provision: AltaProvisionGasto) => {
          if (provision !== null) {
            this.patchProvision(provision);
            if (provision.itemsProvision.some(x => x.valor > 0)) {
              this.provisionEncontrada = true;
            } else {
              this.provisionEncontrada = false;
            }
            console.log('Provision encontrada:', provision);
            this.actualizarEstadoFormulario();
            if (executeIni) {
              this.listarEmbarquesATarifar();
            }
          }
          this.estaCargando = false;
        },
        (error) => {
          console.error('Error al buscar provision por embarque:', error);
          this.estaCargando = false;
        })
  }

  private patchProvision(provision: AltaProvisionGasto): void {
    this.altaProvisionGastoForm.patchValue({
      provisionId: provision.provisionId,
      tarifaPorEmbarque: provision.tarifaPorEmbarque,
      idsTarifas: provision.idsTarifas,
      confirmado: provision.confirmado,
    });

    this.infoFiltrada = provision.infoFiltrada;

    this.precargarConceptos(this.conceptos);

    provision.itemsProvision.forEach((provisionConcepto) => {
      const conceptoFormArray = this.altaProvisionGastoForm.get('itemsProvision') as FormArray;
      const conceptoFormGroup = conceptoFormArray.controls.find((control) => {
        return control.get('concepto.id')?.value === provisionConcepto?.concepto?.id;
      });

      if (conceptoFormGroup) {
        conceptoFormGroup.patchValue({
          valor: provisionConcepto.valor,
          seleccionado: provisionConcepto.valor > 0 ? true : false
        });
      }
    });
  }

  private actualizarEstadoFormulario(): void {
    const puedeEditar = this.altaProvisionGastoForm.get('tarifaPorEmbarque')?.value != null;
    const fueProvisionada = this.altaProvisionGastoForm.get('provisionId')?.value > 0;
    const confirmado = this.altaProvisionGastoForm.get('confirmado')?.value;

    const conceptosFormArray = this.altaProvisionGastoForm.get('itemsProvision') as FormArray;
    conceptosFormArray.controls.forEach(control => {
      if (!puedeEditar || confirmado) {
        control.get('valor')?.disable({ emitEvent: false });
        control.get('seleccionado')?.disable({ emitEvent: false });
      } else {
        if (control.get('seleccionado')?.value) {
          control.get('valor')?.enable({ emitEvent: false });
        } else {
          control.get('valor')?.disable({ emitEvent: false });
        }
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

  public onGuardarProvision(): void {
    const formData = this.altaProvisionGastoForm.getRawValue();
    this.mensaje = "Ajustando Provisión";
    this.servicioAdministracion.guardarProvision(formData).subscribe(
      (response) => {
        console.log('Tarifa guardada correctamente:', response);
        this.estaCargando = false;
        this.actualizarEstadoFormulario();
        this.confirmationDialogService.confirm('Atención', 'Se ha ajustado la provision con exito.', 'Cerrar', '', null, null, Tipoalerta.Success);
      },
      (error) => {
        console.error('Error al guardar la provision:', error);
        this.estaCargando = false;
        let msjError = `Ha ocurrido un error al intentar ajustar la provision.`;
        this.confirmationDialogService.confirm('Atención', msjError, 'Cerrar', '', null, null, Tipoalerta.Warning);
      }
    );
  }

  public onConfirmarProvisiones(): void {
    const idsTarifas = this.altaProvisionGastoForm.getRawValue().idsTarifas;
    this.mensaje = "Confirmando Provisiones...";
    this.confirmationDialogService.confirm(
      '¡Atención!',
      `¿Está seguro de confirmar las provisiones y gastos para la consulta realizada?`,
      'Aceptar',
      'Cerrar',
      null,
      null,
      Tipoalerta.Warning
    ).then((confirmed) => {
      if (confirmed) {
        this.servicioAdministracion.confirmarProvisiones(idsTarifas).subscribe(
          () => {
            this.estaCargando = false;
            this.altaProvisionGastoForm.get('confirmado').setValue(true);
            this.actualizarEstadoFormulario();
            this.confirmationDialogService.confirm('Atención', 'Se han confirmado las provisiones con exito.', 'Cerrar', '', null, null, Tipoalerta.Success);
          },
          (error) => {
            console.error('Error al confirmar provisiones:', error);
            this.estaCargando = false;
            let msjError = `Ha ocurrido un error al intentar confirmar las provisiones.`;
            this.confirmationDialogService.confirm('Atención', msjError, 'Cerrar', '', null, null, Tipoalerta.Warning);
          }
        );
      }
    });
  }

  public getTotalIngresosARS(): number {
    let total = 0;
    const ingresos = this.conceptosIngresoFormArray.controls.filter(control =>
      control.get('concepto.tipoConcepto.descripcion')?.value === 'Ingreso' &&
      control.get('concepto.moneda.descripcion')?.value === 'Pesos'
    );
    ingresos.forEach(control => {
      const valor = control.get('valor')?.value;
      if (valor) {
        total += valor;
      }
    });
    return total;
  }

  public getTotalIngresosUSD(): number {
    let total = 0;
    const ingresos = this.conceptosIngresoFormArray.controls.filter(control =>
      control.get('concepto.tipoConcepto.descripcion')?.value === 'Ingreso' &&
      control.get('concepto.moneda.descripcion')?.value === 'Dolares'
    );
    ingresos.forEach(control => {
      const valor = control.get('valor')?.value;
      if (valor) {
        total += valor;
      }
    });
    return total;
  }

  public getTotalEgresosARS(): number {
    let total = 0;
    const ingresos = this.conceptosGastoFormArray.controls.filter(control =>
      control.get('concepto.tipoConcepto.descripcion')?.value === 'Gasto' &&
      control.get('concepto.moneda.descripcion')?.value === 'Pesos'
    );
    ingresos.forEach(control => {
      const valor = control.get('valor')?.value;
      if (valor) {
        total += valor;
      }
    });
    return total;
  }

  public getTotalEgresosUSD(): number {
    let total = 0;
    const ingresos = this.conceptosGastoFormArray.controls.filter(control =>
      control.get('concepto.tipoConcepto.descripcion')?.value === 'Gasto' &&
      control.get('concepto.moneda.descripcion')?.value === 'Dolares'
    );
    ingresos.forEach(control => {
      const valor = control.get('valor')?.value;
      if (valor) {
        total += valor;
      }
    });
    return total;
  }

  public onExportar() {
    this.mensaje = 'Exportando listado';
    this.estaCargando = true;
    let idsTarifas = this.altaProvisionGastoForm.getRawValue().idsTarifas;
    this.servicioAdministracion.exportarListadoProvisiones(idsTarifas).subscribe(
      (data: any) => {
        this.estaCargando = false;
        const element = document.createElement('a');
        element.href = URL.createObjectURL(data);
        element.download = "listado_provisiones" + '.xls';
        document.body.appendChild(element);
        element.click();
      }, (error) => {
        this.estaCargando = false;
        console.error(error);
      }
    );
  }
}
