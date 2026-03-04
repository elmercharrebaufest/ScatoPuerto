import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { DetalleEmbarqueAFacturar } from '@ScatoModels/administracion/detalle-embarque-a-facturar';
import { AdministracionService } from '@ScatoServicios/administracion.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CombosConsultaEmbarques } from '../consulta-embarques/consulta-embarques.component';
import { AcuerdoPorEmbarcacion, EmbarqueAsociado } from '@ScatoModels/administracion/acuerdo-por-embarcacion';

export interface FiltrosAcuerdoPorEmbarcacion {
  pagina: number;
  itemsPorPagina: number;
  periodo: Date | string;
  muelle: string;
  exportador: string;
  material: string;
}

@Component({
  selector: 'app-acuerdos-por-embarcacion',
  templateUrl: './acuerdos-por-embarcacion.component.html',
  styleUrls: ['./acuerdos-por-embarcacion.component.css']
})
export class AcuerdosPorEmbarcacionComponent implements OnInit, OnChanges {

  @Input() periodoDefault: string;
  @Input() muelleDefault: string;
  @Input() productoDefault: string;
  @Input() exportadorDefault: string;
  @Input() idEmb: number;

  @Output() cerrar = new EventEmitter<void>();

  public filtrosForm: FormGroup;
  public asociarForm: FormGroup;
  public acuerdos: AcuerdoPorEmbarcacion[] = []; 
  public acuerdoSeleccionado: AcuerdoPorEmbarcacion | null = null; 
  public estaCargando: boolean = false;
  public mensaje: string = '';
  
  public modoEdicion: boolean = false;
  public idAcuerdoEmbarqueAEditar: number | null = null;
  
  public detalle: DetalleEmbarqueAFacturar;
  public totalCargaEmbarque: number = 0;
  public totalAsociado: number = 0;

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
  }

  private obtenerDetalleEmbarque(): void {
    this.administracionService.obtenerDetalleEmbarque(this.idEmb).subscribe((data: DetalleEmbarqueAFacturar) => {
      this.detalle = data;
      this.totalCargaEmbarque = this.detalle.cargas?.reduce((sum, current) => sum + current.tn, 0) || 0;
      
      if(this.detalle) {
          this.listaExportadores = Array.from(new Set(this.detalle.exportadores.map(e => e.nombre)));
          this.listaProductos = Array.from(new Set(this.detalle.cargas.map(c => c.materialPuerto)));
          
          this.listaMuelles = [{ descripcion: this.detalle.muelle }];

          const exportador = this.listaExportadores.length > 0 ? this.listaExportadores[0] : '';
          const muelle = this.detalle.muelle;
          
          this.filtrosForm.patchValue({
              muelle: muelle,
              exportador: exportador,
              periodo: this.AnioMesActual()
          });
          this.onBuscar();
      }
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
      cantidad: [null, [Validators.required, Validators.min(0.001)]]
    });
  }

  private cargarCombos(): void {
    this.administracionService.listarCombos().subscribe((data: CombosConsultaEmbarques) => {
      this.muellesFull = data.muelles;
      this.productosFull = data.productos;
      this.exportadoresFull = data.exportadores;
      
      if (this.listaMuelles.length === 0) this.listaMuelles = data.muelles; 
      if (this.listaProductos.length === 0) this.listaProductos = data.productos.map(p => p.descripcion);
      if (this.listaExportadores.length === 0) this.listaExportadores = data.exportadores.map(e => e.nombre);
    }, (error: any) => {
      console.error('Error cargando los combos:', error);
    });
  }

  public onBuscar(pageIndex: number = 1, pageSize: number = 10): void {
    this.mensaje = 'Cargando acuerdos...';
    this.estaCargando = true;
    this.acuerdoSeleccionado = null;
    this.idAcuerdoEmbarqueAEditar = null;
    this.asociarForm.reset();
    this.modoEdicion = false;

    const filtroConvertido = this.convertirFiltro(pageIndex, pageSize);

    this.administracionService.listarAcuerdosDisponiblesParaEmbarcacion(this.idEmb, filtroConvertido)
      .subscribe((res: any) => {
        const items = res.items || res.Items || [];
        
        this.acuerdos = items.map((dto: any) => {
          const acuerdo: AcuerdoPorEmbarcacion = {
            idAcuerdo: dto.idAcuerdo,
            descripcion: dto.descripcion,
            productos: dto.productos || [],
            cantidadTotal: dto.cantidadTotal,
            muelle: dto.muelle,
            exportador: dto.exportador,
            
            relacionAcuerdo: dto.relacionAcuerdo,
            cantidadDisponible: dto.cantidadDisponible,
            cantidadAsociada: dto.cantidadAsociada, 

            detallesResumen: dto.detallesResumen || [],

            embarquesAsociados: (dto.embarquesAsociados || []).map((e: any) => ({
              idAcuerdoEmbarque: e.idAcuerdoEmbarque,
              nombreEmbarque: e.nombreEmbarque,
              idEmbarque: e.idEmbarque,
              producto: e.producto,
              cantidad: e.cantidad
            })),

            idAcuerdoEmbarqueActual: dto.idAcuerdoEmbarqueActual
          };
          return acuerdo;
        });

        this.totalAsociado = this.acuerdos
          .filter(a => a.idAcuerdoEmbarqueActual != null)
          .reduce((sum, curr) => sum + (curr.cantidadAsociada || 0), 0);
          
        this.estaCargando = false;
      }, err => {
        this.acuerdos = [];
        console.error('Error cargando acuerdos:', err);
        this.confirmationDialogService.alertar('Error al buscar acuerdos.');
        this.estaCargando = false;
      });
  }

  public convertirFiltro(pagina: number = 1, itemsPorPagina: number = 10): FiltrosAcuerdoPorEmbarcacion {
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
      muelle: '',
      producto: '',
      exportador: '',
      periodo: this.AnioMesActual()
    });
  }

  public asociacionesEnEsteEmbarque(item: AcuerdoPorEmbarcacion, producto: string): EmbarqueAsociado[] {
    return item.embarquesAsociados ? item.embarquesAsociados.filter(e => e.idEmbarque === this.idEmb && e.producto === producto) : [];
  }

  public tieneAsociacionActual(item: AcuerdoPorEmbarcacion, producto: string): boolean {
    return this.asociacionesEnEsteEmbarque(item, producto).length > 0;
  }

  public onSeleccionarAcuerdo(acuerdo: AcuerdoPorEmbarcacion, productoSeleccionado: string): void {
    this.modoEdicion = false;
    this.acuerdoSeleccionado = acuerdo;
    this.idAcuerdoEmbarqueAEditar = null;

    this.asociarForm.patchValue({
      producto: productoSeleccionado,
      cantidad: null
    });
    
    this.asociarForm.get('cantidad').enable();
    this.asociarForm.get('producto').disable();
  }

  public onEditar(acuerdo: AcuerdoPorEmbarcacion, producto: string): void {
    const asociaciones = this.asociacionesEnEsteEmbarque(acuerdo, producto);
    
    if (asociaciones.length > 0) {
      this.ejecutarSetupEdicion(acuerdo, asociaciones[0]);
    }
  }

  private ejecutarSetupEdicion(acuerdo: AcuerdoPorEmbarcacion, asociacion: EmbarqueAsociado): void {
    this.modoEdicion = true;
    this.acuerdoSeleccionado = acuerdo;
    this.idAcuerdoEmbarqueAEditar = asociacion.idAcuerdoEmbarque;
    
    this.asociarForm.patchValue({
        producto: asociacion.producto,
        cantidad: asociacion.cantidad
    });
    
    this.asociarForm.get('cantidad').enable();
    this.asociarForm.get('producto').disable();
  }

  public onConfirmarAccion(): void {
    if (this.asociarForm.invalid || !this.acuerdoSeleccionado) {
      this.asociarForm.markAllAsTouched();
      return;
    }
    
    const cantidad = this.asociarForm.get('cantidad')?.value;
    const actionText = this.modoEdicion ? 'Editar' : 'Asociar';
    const message = this.modoEdicion 
        ? `¿Está seguro que desea editar la cantidad a <b>${cantidad} TN</b>?`
        : `¿Está seguro que desea asociar <b>${cantidad} TN</b> a este embarque?`;

    this.confirmationDialogService.confirm(
        actionText,
        message,
        'Confirmar', 'Cancelar', null, null, Tipoalerta.Warning
    ).then((confirmed) => {
        if (confirmed) {
            if (this.modoEdicion) {
                this.ejecutarEdicion(cantidad);
            } else {
                this.ejecutarAsociacion(cantidad);
            }
        }
    });
  }

  private ejecutarAsociacion(cantidad: number): void {
    const productoSeleccionadoNombre = this.asociarForm.get('producto')?.value;
    const detalleResumen = this.acuerdoSeleccionado.detallesResumen.find(d => d.producto === productoSeleccionadoNombre);

    if (detalleResumen && cantidad > detalleResumen.cantidadDisponible) {
        this.confirmationDialogService.alertar(`La cantidad a asociar no puede superar la cantidad disponible (${detalleResumen.cantidadDisponible} TN) para el producto ${productoSeleccionadoNombre}.`);
        return;
    }

    const materialFound = this.productosFull.find(p => p.descripcion === productoSeleccionadoNombre);
    const idMaterial = materialFound ? materialFound.id : null;

    if (!idMaterial) {
        this.confirmationDialogService.alertar('No se pudo identificar el ID del material. Intente recargar los combos.');
        return;
    }

    this.mensaje = 'Asociando...';
    this.estaCargando = true;

    this.administracionService.asociarEmbarcacionConAcuerdo(
        this.idEmb, 
        this.acuerdoSeleccionado.idAcuerdo, 
        idMaterial, 
        cantidad
    ).subscribe(() => {
        this.estaCargando = false;
        this.confirmationDialogService.alertar('Asociación realizada correctamente.', Tipoalerta.Success);
        this.onBuscar();
    }, err => {
        this.estaCargando = false;
        console.error(err);
        this.confirmationDialogService.alertar('Error al realizar la asociación.', Tipoalerta.Error);
    });
  }

  private ejecutarEdicion(nuevaCantidad: number): void {
    if (!this.idAcuerdoEmbarqueAEditar) {
        this.confirmationDialogService.alertar('No se identificó la asociación a editar.');
        return;
    }

    this.mensaje = 'Actualizando...';
    this.estaCargando = true;

    this.administracionService.editarAsociacionEmbarcacionConAcuerdo(
        this.idAcuerdoEmbarqueAEditar,
        nuevaCantidad
    ).subscribe(() => {
        this.estaCargando = false;
        this.confirmationDialogService.alertar('Acuerdo actualizado correctamente.', Tipoalerta.Success);
        this.onBuscar();
    }, err => {
        this.estaCargando = false;
        console.error(err);
        const errorMsg = err.error?.ExceptionMessage || err.message || 'Error al actualizar el acuerdo.';
        this.confirmationDialogService.alertar(errorMsg, Tipoalerta.Error);
    });
  }

  public onDesasociar(acuerdo: AcuerdoPorEmbarcacion, producto: string): void {
    const asociaciones = this.asociacionesEnEsteEmbarque(acuerdo, producto);
    
    if (asociaciones.length > 0) {
      this.ejecutarDesasociar(asociaciones[0]);
    }
  }

  public ejecutarDesasociar(asociacion: EmbarqueAsociado): void {
    this.confirmationDialogService.confirm(
      'Desasociar',
      `¿Está seguro que desea desasociar el producto "${asociacion.producto}"?`,
      'Sí, desasociar', 'Cancelar', null, null, Tipoalerta.Warning
    ).then((confirmed) => {
      if (confirmed) {
        this.mensaje = 'Desasociando...';
        this.estaCargando = true;

        this.administracionService.desasociarEmbarcacionConAcuerdo(asociacion.idAcuerdoEmbarque)
            .subscribe(() => {
                this.estaCargando = false;
                this.confirmationDialogService.alertar('Desasociado correctamente.', Tipoalerta.Success);
                this.onBuscar();
            }, err => {
                this.estaCargando = false;
                console.error(err);
                this.confirmationDialogService.alertar('Ocurrió un error al desasociar.', Tipoalerta.Error);
            });
      }
    });
  }

  public getEmbarquesAsociadosTexto(item: AcuerdoPorEmbarcacion): string {
    if (!item.embarquesAsociados || item.embarquesAsociados.length === 0) {
      return '-';
    }
    return item.embarquesAsociados.map(e => e.nombreEmbarque).join(', ');
  }

  public getEstadoTexto(estado: string): string {
    return estado;
  }

  public onCerrar(): void {
    this.router.navigate(['/administracion/embarque', this.idEmb]);
  }
}
