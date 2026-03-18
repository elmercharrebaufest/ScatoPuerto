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
import { Acuerdo } from '@ScatoModels/acuerdos/acuerdos';
import { AdministracionService } from '@ScatoServicios/administracion.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { forkJoin, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

export interface CombosConsultaProvisiones {
  embarques: EmbarqueRaw[];
  muelles: MuelleDeCarga[];
  exportadores: Exportador[];
  productos: MaterialPuerto[];
  acuerdos: Acuerdo[];
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

  // Listas originales completas (cargadas en listarCombos)
  public exportadoresOriginales: Exportador[] = [];
  public embarquesDelPeriodo: EmbarqueATarifar[] = []; 
  public periodoAnterior: string = '';

  // Listas filtradas para los combos
  public exportadoresFiltrados: Exportador[] = [];

  public acuerdos: Acuerdo[] = [];
  public muellesFiltrados: MuelleDeCarga[] = [];
  public embarquesFiltrados: EmbarqueATarifar[] = [];
  public acuerdosFiltrados: Acuerdo[] = [];
  public buquesDropdown: any[] = [];
  
  public itemsProvision: any[] = [];
  public busquedaRealizada: boolean = false;
  
  public totalIngresosARS: number = 0;
  public totalIngresosUSD: number = 0;
  public totalEgresosARS: number = 0;
  public totalEgresosUSD: number = 0;

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

  public getConfigListaUnica(textField: string) {
    return {
      singleSelection: true,
      idField: 'id',
      textField: textField,
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
      searchPlaceholderText: 'Buscar...'
    };
  }

  public getDropdownValue(field: string): any {
    const value = this.filtroForm.get(field).value;
    return (value && Array.isArray(value) && value.length > 0) ? value[0] : null;
  }

  public getTotalIngresosARS(): number { return this.totalIngresosARS; }
  public getTotalIngresosUSD(): number { return this.totalIngresosUSD; }
  public getTotalEgresosARS(): number { return this.totalEgresosARS; }
  public getTotalEgresosUSD(): number { return this.totalEgresosUSD; }

  private listarCombos(): void {
    this.estaCargando = true;
    forkJoin({
      combos: this.servicioAdministracion.listarCombosProvisiones(),
      conceptos: this.servicioAdministracion.listarConceptos()
    }).subscribe({
      next: ({ combos, conceptos }) => {
        this.muelles = combos.muelles;
        this.exportadores = combos.exportadores;
        this.materiales = combos.productos;
        this.acuerdos = combos.acuerdos;
        this.conceptos = conceptos;

        this.muellesFiltrados = this.muelles;
        this.acuerdosFiltrados = this.acuerdos;
        this.exportadoresOriginales = combos.exportadores;
        this.exportadoresFiltrados = this.exportadoresOriginales;

        this.inicializarItemsProvision(); 
        this.estaCargando = false;
      },
      error: (error) => {
        console.error(error);
        this.estaCargando = false;
      }
    });
  }

  private formatPeriodo(periodoStr: string): string {
    if (!periodoStr) return null;
    return `${periodoStr}-01`; 
  }

  public onRefreshFiltros(): void {
    const periodo = this.filtroForm.get('periodo').value;
    const producto = this.getDropdownValue('materialPuerto');

    if (this.periodoAnterior && periodo !== this.periodoAnterior) {
      this.filtroForm.patchValue({
        muelle: [], exportador: [], embarque: [], acuerdo: []
      }, { emitEvent: false });
    }

    if (!periodo || !producto) {
      this.muellesFiltrados = this.muelles;
      this.exportadoresFiltrados = this.exportadoresOriginales;
      this.embarquesFiltrados = [];
      this.buquesDropdown = [];
      this.acuerdosFiltrados = this.acuerdos;
      return;
    }

    if (periodo !== this.periodoAnterior) {
      this.estaCargando = true;
      this.periodoAnterior = periodo;
      
      const periodoFormat = this.formatPeriodo(periodo);
      
      this.servicioAdministracion.listarEmbarquesATarifar(periodoFormat as any, 0).subscribe(
        (data: EmbarqueATarifar[]) => {
          this.embarquesDelPeriodo = data;
          this.estaCargando = false;
          this.aplicarFiltrosCascada();
        },
        error => {
          console.error('Error al traer embarques del periodo', error);
          this.estaCargando = false;
        }
      );
    } else {
      this.aplicarFiltrosCascada();
    }
  }

  private aplicarFiltrosCascada(): void {
    const producto = this.getDropdownValue('materialPuerto');
    const muelleSel = this.getDropdownValue('muelle');
    const exportadorSel = this.getDropdownValue('exportador');
    const embarqueSel = this.getDropdownValue('embarque');

    if (!producto) return;

    let embarquesFiltrados = this.embarquesDelPeriodo.filter(e => 
      e.cargas.some(c => c.materialPuerto.id === producto.id)
    );

    const muellesNombres = [...new Set(embarquesFiltrados.map(e => this.obtenerNombreMuelle(e.embarque)))];
    this.muellesFiltrados = this.muelles.filter(m => muellesNombres.includes(m.descripcion));

    if (muelleSel) {
      embarquesFiltrados = embarquesFiltrados.filter(e => this.obtenerNombreMuelle(e.embarque) === muelleSel.descripcion);
    }

    const exportadoresIds = new Set<number>();
    embarquesFiltrados.forEach(e => {
      e.cargas.filter(c => c.materialPuerto.id === producto.id)
              .forEach(c => exportadoresIds.add(c.exportador.id));
    });
    this.exportadoresFiltrados = this.exportadoresOriginales.filter(exp => exportadoresIds.has(exp.id));

    if (exportadorSel) {
      embarquesFiltrados = embarquesFiltrados.filter(e => 
        e.cargas.some(c => c.materialPuerto.id === producto.id && c.exportador.id === exportadorSel.id)
      );
    }

    this.embarquesFiltrados = embarquesFiltrados;
    this.buquesDropdown = this.embarquesFiltrados.map(e => ({
        id: e.embarque.id,
        nombreVapor: e.vapor.nombre
    }));

    if (embarqueSel) {
      embarquesFiltrados = embarquesFiltrados.filter(e => e.embarque.id === embarqueSel.id);
    }

    this.acuerdosFiltrados = this.acuerdos.filter(a => 
      (!muelleSel || a.muelleDeCarga?.id === muelleSel.id) &&
      (!exportadorSel || a.exportador?.id === exportadorSel.id)
    );
  }

  private obtenerNombreMuelle(embarque: any): string {
    if (embarque.sanBenito) return 'San Benito';
    if (embarque.vicentin) return 'Vicentin';
    if (embarque.noryon) return 'Nouryon';
    return embarque.otroMuelleNombre || 'Otros Muelles';
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
      periodo: [this.AnioMesActual()],
      materialPuerto: [[]],
      muelle: [[]],
      exportador: [[]],
      embarque: [[]],
      acuerdo: [[]],
    });
  }

  private inicializarItemsProvision(): void {
    if (this.conceptos && this.conceptos.length > 0) {
      this.itemsProvision = this.conceptos.map(c => ({
        concepto: c, valor: 0
      }));
    }
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

  public onLimpiar(): void {
    this.filtroForm.patchValue({
      periodo: this.AnioMesActual(), materialPuerto: [], muelle: [], exportador: [], embarque: [], acuerdo: []
    }, { emitEvent: false });

    this.muellesFiltrados = this.muelles;
    this.exportadoresFiltrados = this.exportadoresOriginales;
    this.acuerdosFiltrados = this.acuerdos;
    this.embarquesFiltrados = [];
    this.buquesDropdown = [];
    
    this.periodoAnterior = '';
    this.busquedaRealizada = false;
    this.provisionEncontrada = false;
    this.infoFiltrada = null;
    
    this.inicializarItemsProvision();
    this.totalIngresosARS = 0;
    this.totalIngresosUSD = 0;
    this.totalEgresosARS = 0;
    this.totalEgresosUSD = 0;
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

  public onBuscarProvisionGasto(): void {
    this.busquedaRealizada = true;
    
    const periodo = this.filtroForm.get('periodo').value;
    const producto = this.getDropdownValue('materialPuerto');
    const muelle = this.getDropdownValue('muelle');
    const exportador = this.getDropdownValue('exportador');
    const embarque = this.getDropdownValue('embarque');
    const acuerdo = this.getDropdownValue('acuerdo');

    if (!periodo || !producto) {
      this.confirmationDialogService.alertar("Debe seleccionar al menos un producto y período");
      return;
    }

    this.mensaje = "Obteniendo Provisiones";
    this.estaCargando = true;
    
    const periodoFormat = this.formatPeriodo(periodo);

    this.servicioAdministracion.obtenerProvision(
      muelle?.id ?? null, 
      periodoFormat as any, 
      embarque?.id ?? null,
      producto?.id ?? null, 
      exportador?.id ?? null, 
      acuerdo?.id ?? null
    ).subscribe(
      (provision: AltaProvisionGasto) => {
        if (provision !== null && provision.infoFiltrada && provision.infoFiltrada.buques.length > 0) {
          this.provisionEncontrada = true;
          this.infoFiltrada = provision.infoFiltrada;
          
          this.totalIngresosARS = provision.totalIngresosARS;
          this.totalIngresosUSD = provision.totalIngresosUSD;
          this.totalEgresosARS = provision.totalEgresosARS;
          this.totalEgresosUSD = provision.totalEgresosUSD;

          this.itemsProvision = this.conceptos.map(c => {
            const itemEncontrado = provision.itemsProvision?.find(p => p.concepto.id === c.id);
            return {
              concepto: c,
              valor: itemEncontrado ? itemEncontrado.valor : 0
            };
          });

        } else {
          this.provisionEncontrada = false;
          this.infoFiltrada = null; 
          this.inicializarItemsProvision(); 
          this.totalIngresosARS = 0;
          this.totalIngresosUSD = 0;
          this.totalEgresosARS = 0;
          this.totalEgresosUSD = 0;
        }
        this.estaCargando = false;
      },
      (error) => {
        console.error('Error al buscar provision:', error);
        this.estaCargando = false;
      }
    );
  }
  
  public onExportar() {
    this.mensaje = 'Exportando listado';
    this.estaCargando = true;
    this.filtroForm.disable();
    let idsTarifas = this.altaProvisionGastoForm.getRawValue().idsTarifas;
    this.servicioAdministracion.exportarListadoProvisiones(idsTarifas).subscribe(
      (data: any) => {
        this.estaCargando = false;
        const element = document.createElement('a');
        element.href = URL.createObjectURL(data);
        element.download = "listado_provisiones" + '.xls';
        document.body.appendChild(element);
        element.click();
        this.filtroForm.enable();
      }, (error) => {
        this.estaCargando = false;
        console.error(error);
        this.filtroForm.enable();
      }
    );
  }
}
