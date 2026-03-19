import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
import { forkJoin } from 'rxjs';

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

  public exportadoresOriginales: Exportador[] = [];
  public embarquesDelPeriodo: EmbarqueATarifar[] = []; 
  public periodoAnterior: string = '';

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

  public onVolver(): void {}

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

  private listarCombos(): void {
    this.estaCargando = true;
    forkJoin({
      combos: this.servicioAdministracion.listarCombosProvisiones(),
      conceptos: this.servicioAdministracion.listarConceptos()
    }).subscribe({
      next: ({ combos, conceptos }) => {
        this.muelles = combos.muelles;
        this.exportadoresOriginales = combos.exportadores;
        this.materiales = combos.productos;
        this.acuerdos = combos.acuerdos;
        this.conceptos = conceptos;

        // Inicialmente vacíos hasta que se seleccione Periodo y Producto
        this.muellesFiltrados = [];
        this.exportadoresFiltrados = [];
        this.acuerdosFiltrados = [];

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

    // Si falta alguno de los dos, no filtramos nada y limpiamos listas
    if (!periodo || !producto) {
      this.muellesFiltrados = [];
      this.exportadoresFiltrados = [];
      this.embarquesFiltrados = [];
      this.buquesDropdown = [];
      this.acuerdosFiltrados = [];
      this.embarquesDelPeriodo = [];
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

  public AnioMesActual(): string {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  public onLimpiar(): void {
    this.filtroForm.patchValue({
      periodo: this.AnioMesActual(), materialPuerto: [], muelle: [], exportador: [], embarque: [], acuerdo: []
    }, { emitEvent: false });

    this.muellesFiltrados = [];
    this.exportadoresFiltrados = [];
    this.acuerdosFiltrados = [];
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

  public onBuscarProvisionGasto(): void {
    const periodo = this.filtroForm.get('periodo').value;
    const producto = this.getDropdownValue('materialPuerto');

    if (!periodo || !producto) {
      this.confirmationDialogService.alertar("Debe seleccionar al menos un producto y período");
      return;
    }

    this.busquedaRealizada = true;
    this.mensaje = "Obteniendo Provisiones";
    this.estaCargando = true;
    
    const muelle = this.getDropdownValue('muelle');
    const exportador = this.getDropdownValue('exportador');
    const embarque = this.getDropdownValue('embarque');
    const acuerdo = this.getDropdownValue('acuerdo');
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
        if (provision !== null && provision.infoFiltrada && provision.infoFiltrada.buques?.length > 0) {
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
          this.confirmationDialogService.alertar("No existen embarques para el producto y período filtrado.");
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