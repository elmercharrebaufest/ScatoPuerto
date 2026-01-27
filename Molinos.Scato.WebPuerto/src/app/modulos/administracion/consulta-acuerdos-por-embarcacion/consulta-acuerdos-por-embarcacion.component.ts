import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { DetalleEmbarqueAFacturar } from '@ScatoModels/administracion/detalle-embarque-a-facturar';
import { AdministracionService } from '@ScatoServicios/administracion.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AcuerdoPorEmbarcacion } from '@ScatoModels/administracion/acuerdo-por-embarcacion'; 
import { CombosConsultaEmbarques } from '../consulta-embarques/consulta-embarques.component';

export interface FiltrosAcuerdosPorEmbarcacion {
  pagina: number;
  itemsPorPagina: number;
  periodo: Date | string;
  muelle: string;
  exportador: string;
  material: string;
}

@Component({
  selector: 'app-consulta-acuerdos-por-embarcacion',
  templateUrl: './consulta-acuerdos-por-embarcacion.component.html',
  styleUrls: ['./consulta-acuerdos-por-embarcacion.component.css']
})
export class ConsultaAcuerdosPorEmbarcacionComponent implements OnInit, OnChanges {

  @Input() periodoDefault: string;
  @Input() muelleDefault: string;
  @Input() productoDefault: string;
  @Input() exportadorDefault: string;
  @Input() idEmb: number;

  @Output() cerrar = new EventEmitter<void>();
  @Output() asociacionGuardada = new EventEmitter<void>();

  public filtrosForm: FormGroup;
  public asociarForm: FormGroup;
  public acuerdos: AcuerdoPorEmbarcacion[] = []; 
  public acuerdoSeleccionado: AcuerdoPorEmbarcacion | null = null; 
  public estaCargando: boolean = false;
  public hayAsociacionesPendientes: boolean = false;
  public detalle: DetalleEmbarqueAFacturar;

  public listaMuelles: any[] = [];
  public listaProductos: string[] = [];
  public listaExportadores: string[] = [];

  private muellesFull: any[] = [];
  private productosFull: any[] = [];
  private exportadoresFull: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,
    private route: ActivatedRoute,
    private administracionService: AdministracionService,
    private _modalService: NgbModal
  ) { }

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('idEmb');
    if (routeId) {
      this.idEmb = Number(routeId);
      this.obtenerDetalleEmbarque();
    }
    this.cargarCombos();
    this.inicializarFiltros();
    this.inicializarFormAsociacion();

    if (this.idEmb || this.periodoDefault || this.muelleDefault) {
      this.onBuscar();
    }
  }

  private obtenerDetalleEmbarque(): void {
    this.administracionService.obtenerDetalleEmbarque(this.idEmb).subscribe((data: DetalleEmbarqueAFacturar) => {
      this.detalle = data;
    }, (error: any) => {
      console.error(error);
    });
  }

  public onOpenModalAlerta(modal) {
    this._modalService.open(modal, { size: 'xl', windowClass: 'window-modal-geo', backdropClass: 'modal-geo' });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.filtrosForm) {
      if (changes.periodoDefault || changes.muelleDefault || changes.productoDefault || changes.exportadorDefault) {
        this.filtrosForm.patchValue({
          periodo: this.periodoDefault || this.AnioMesActual(),
          muelle: this.muelleDefault || '',
          producto: this.productoDefault || '',
          exportador: this.exportadorDefault || ''
        }, { emitEvent: false });
      }
    }
  }

  public AnioMesActual(): string {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  private inicializarFiltros(): void {
    this.filtrosForm = this.formBuilder.group({
      periodo: [this.periodoDefault || this.AnioMesActual()], 
      muelle: [this.muelleDefault || ''],
      producto: [this.productoDefault || ''],
      exportador: [this.exportadorDefault || '']
    });
  }

  private inicializarFormAsociacion(): void {
    this.asociarForm = this.formBuilder.group({
      producto: [{ value: '', disabled: true }],
      cantidad: [null, [Validators.required, Validators.min(1)]]
    });
  }

  private cargarCombos(): void {
    this.administracionService.listarCombos().subscribe((data: CombosConsultaEmbarques) => {
      this.muellesFull = data.muelles;
      this.productosFull = data.productos;
      this.exportadoresFull = data.exportadores;

      this.listaMuelles = data.muelles; 
      this.listaProductos = data.productos.map(p => p.descripcion);
      this.listaExportadores = data.exportadores.map(e => e.nombre);
    }, (error: any) => {
      console.error('Error loading combos:', error);
    });
  }

  public onBuscar(pageIndex: number = 1, pageSize: number = 10): void {
    this.estaCargando = true;
    this.acuerdoSeleccionado = null;
    this.asociarForm.reset();

    const filtroConvertido = this.convertirFiltro(pageIndex, pageSize);

    this.administracionService.listarAcuerdosPorEmbarcacion(this.idEmb, filtroConvertido)
    .subscribe((res: any) => {
      // FIX: Handle both lowercase 'items' (standard JSON) and uppercase 'Items'
      // Fallback to empty array to prevent 'undefined' errors
      this.acuerdos = res.items || res.Items || []; 
      this.estaCargando = false;
    }, err => {
      console.error('Error fetching agreements', err);
      this.acuerdos = []; // FIX: Reset to empty array on error
      this.confirmationDialogService.alertar('Error al buscar acuerdos.');
      this.estaCargando = false;
    });
  }

  public convertirFiltro(pagina: number = 1, itemsPorPagina: number = 10): any {
    const values = this.filtrosForm.getRawValue();
    return {
      pagina: pagina,
      itemsPorPagina: itemsPorPagina,
      periodo: values.periodo ? new Date(values.periodo + "-01") : null, 
      muelle: this.muellesFull.find(m => m.descripcion === values.muelle) || null,
      exportador: this.exportadoresFull.find(e => e.nombre === values.exportador) || null,
      material: this.productosFull.find(p => p.descripcion === values.producto) || null
    };
  }

  public onLimpiar(): void {
    this.filtrosForm.patchValue({
      muelle: this.muelleDefault || '',
      producto: this.productoDefault || '',
      exportador: this.exportadorDefault || ''
    });
    this.acuerdos = [];
    this.acuerdoSeleccionado = null;
    this.asociarForm.reset();
  }

  public onSeleccionarAcuerdo(acuerdo: AcuerdoPorEmbarcacion): void {
    if (acuerdo.productoRelacionadoTotalmente || acuerdo.estadoAsociacion === 'VINCULADO_ACTUAL') {
      return;
    }
    this.acuerdoSeleccionado = acuerdo;
    this.asociarForm.patchValue({
      producto: acuerdo.producto,
      cantidad: null
    });
  }

  public onAsociar(): void {
    if (this.asociarForm.invalid || !this.acuerdoSeleccionado) {
      this.asociarForm.markAllAsTouched();
      return;
    }
    const cantidad = this.asociarForm.get('cantidad')?.value;
    if (cantidad > this.acuerdoSeleccionado.cantidadDisponible) {
      this.confirmationDialogService.alertar('La cantidad a asociar no puede superar la cantidad disponible del acuerdo.');
      return;
    }
    this.confirmationDialogService.confirm(
      'Confirmación',
      `¿Desea asociar ${cantidad} TN del acuerdo "${this.acuerdoSeleccionado.descripcion}" al embarque?`,
      'Asociar', 'Cancelar', null, null, Tipoalerta.Success
    ).then((confirmed) => {
      if (confirmed) {
        this.hayAsociacionesPendientes = true;
        this.asociacionGuardada.emit();
        this.onBuscar();
        this.confirmationDialogService.alertar('Acuerdo asociado exitosamente.', Tipoalerta.Success);
      }
    });
  }

  public onDesasociar(acuerdo: AcuerdoPorEmbarcacion): void {
    this.confirmationDialogService.confirm(
      'Desasociar',
      `¿Está seguro que desea desasociar el acuerdo "${acuerdo.descripcion}" del embarque?`,
      'Sí, desasociar', 'Cancelar', null, null, Tipoalerta.Warning
    ).then((confirmed) => {
      if (confirmed) {
        this.hayAsociacionesPendientes = true;
        this.asociacionGuardada.emit();
        this.onBuscar();
        this.confirmationDialogService.alertar('Acuerdo desasociado exitosamente.', Tipoalerta.Success);
      }
    });
  }

  public getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'VINCULADO_ACTUAL': return 'Ya asociada al embarque';
      case 'VINCULADO_OTRO': return 'Asociada a otro embarque';
      case 'NO_VINCULADO': return 'Sin Asociar';
      default: return '-';
    }
  }

  public onGuardar(): void {
    this.confirmationDialogService.alertar('Cambios guardados exitosamente.', Tipoalerta.Success);
    this.hayAsociacionesPendientes = false;
    this.onCerrar();
  }

  public onCerrar(): void {
    if (this.hayAsociacionesPendientes) {
      this.confirmationDialogService.confirm(
        'Cambios pendientes',
        'Tiene cambios sin guardar. ¿Desea salir sin guardar?',
        'Salir', 'Cancelar', null, null, Tipoalerta.Warning
      ).then((confirmed) => {
        if (confirmed) {
          this.router.navigate(['/administracion/consulta-acuerdos-por-embarcacion', this.idEmb]);
        }
      });
    } else {
      this.router.navigate(['/administracion/consulta-acuerdos-por-embarcacion', this.idEmb]);
    }
  }
}