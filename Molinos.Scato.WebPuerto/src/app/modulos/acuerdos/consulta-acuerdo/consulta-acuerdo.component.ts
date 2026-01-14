import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';

export interface Acuerdo {
  id: number;
  descripcion: string;
  producto: string;
  cantidadTotal: number;
  muelle: string;
  exportadores: string;
  estadoAsociacion: 'LINKED_CURRENT' | 'LINKED_OTHER' | 'UNLINKED';
  cantidadDisponible: number;
  embarquesAsociados: string[];
  productoRelacionadoTotalmente: boolean;
}

@Component({
  selector: 'app-consulta-acuerdo',
  templateUrl: './consulta-acuerdo.component.html',
  styleUrls: ['./consulta-acuerdo.component.css']
})
export class ConsultaAcuerdosComponent implements OnInit, OnChanges { // 1. Implement OnChanges

  @Input() periodoDefault: string;
  @Input() muelleDefault: string;
  @Input() productoDefault: string;
  @Input() exportadorDefault: string;
  @Input() embarqueId: number;

  @Output() cerrar = new EventEmitter<void>();
  @Output() asociacionGuardada = new EventEmitter<void>();

  public filtrosForm: FormGroup;
  public asociarForm: FormGroup;
  public acuerdos: Acuerdo[] = [];
  public acuerdoSeleccionado: Acuerdo | null = null;
  public estaCargando: boolean = false;
  public hayAsociacionesPendientes: boolean = false;

  public listaMuelles: any[] = [];
  public listaProductos: string[] = ['Aceite', 'Trigo', 'Maíz', 'Soja'];
  public listaExportadores: string[] = ['YPF', 'MOA', 'CARGILL', 'BUNGE'];

  constructor(
    private formBuilder: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService
  ) { }

  ngOnInit(): void {
    // 1. Load lists first
    this.cargarCombos();
    
    // 2. Initialize form
    this.inicializarFiltros();
    this.inicializarFormAsociacion();

    // 3. Search if data is already present
    if (this.periodoDefault || this.muelleDefault) {
      this.onBuscar();
    }
  }

  // 2. Add this method to listen for changes in Inputs
  ngOnChanges(changes: SimpleChanges): void {
    if (this.filtrosForm) {
      // If the inputs change after the form is created, update the form values
      if (changes.periodoDefault || changes.muelleDefault || changes.productoDefault || changes.exportadorDefault) {
        
        this.filtrosForm.patchValue({
          periodo: this.periodoDefault,
          muelle: this.muelleDefault || '',
          producto: this.productoDefault || '',
          exportador: this.exportadorDefault || ''
        }, { emitEvent: false }); // Prevent triggering valueChanges if you have any listeners
      
        // Optional: Trigger search automatically if needed when defaults change
        // this.onBuscar(); 
      }
    }
  }

  private inicializarFiltros(): void {
    this.filtrosForm = this.formBuilder.group({
      periodo: [{ value: this.periodoDefault, disabled: true }],
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
    this.listaMuelles = [
      { id: 1, descripcion: 'San Benito' },
      { id: 2, descripcion: 'Vicentin' },
      { id: 3, descripcion: 'Otro' }
    ];
  }

  public onBuscar(): void {
    this.estaCargando = true;
    this.acuerdoSeleccionado = null;
    this.asociarForm.reset();

    const filtros = this.filtrosForm.getRawValue();
    console.log('Buscando acuerdos con filtros:', filtros);

    // TODO: Reemplazar con llamada real al servicio
    // this.administracionService.buscarAcuerdos(this.embarqueId, filtros).subscribe(...)

    setTimeout(() => {
      // Mock data
      this.acuerdos = [
        {
          id: 1,
          descripcion: 'Fason YPF 08-25',
          producto: 'Aceite',
          cantidadTotal: 10000,
          muelle: 'San Benito',
          exportadores: 'YPF',
          estadoAsociacion: 'LINKED_CURRENT',
          cantidadDisponible: 3000,
          embarquesAsociados: ['Jack Sparrow'],
          productoRelacionadoTotalmente: false
        },
        {
          id: 2,
          descripcion: 'P/D YPF 08-25',
          producto: 'Aceite',
          cantidadTotal: 10000,
          muelle: 'Vicentin',
          exportadores: 'MOA',
          estadoAsociacion: 'LINKED_OTHER',
          cantidadDisponible: 0,
          embarquesAsociados: ['Embarque 1', 'Embarque 2'],
          productoRelacionadoTotalmente: true
        },
        {
          id: 3,
          descripcion: 'Elevación CARGIL 08-25',
          producto: 'Aceite',
          cantidadTotal: 10000,
          muelle: 'Otro',
          exportadores: 'MOA',
          estadoAsociacion: 'UNLINKED',
          cantidadDisponible: 10000,
          embarquesAsociados: [],
          productoRelacionadoTotalmente: false
        }
      ];
      this.estaCargando = false;
    }, 500);
  }

  public onLimpiar(): void {
    // Reset to defaults or empty strings
    this.filtrosForm.patchValue({
      muelle: this.muelleDefault || '',
      producto: this.productoDefault || '',
      exportador: this.exportadorDefault || ''
    });
    this.acuerdos = [];
    this.acuerdoSeleccionado = null;
    this.asociarForm.reset();
  }

  public onSeleccionarAcuerdo(acuerdo: Acuerdo): void {
    if (acuerdo.productoRelacionadoTotalmente || acuerdo.estadoAsociacion === 'LINKED_CURRENT') {
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

  public onDesasociar(acuerdo: Acuerdo): void {
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
      case 'LINKED_CURRENT': return 'Ya asociada al embarque';
      case 'LINKED_OTHER': return 'Asociada a otro embarque';
      case 'UNLINKED': return 'Sin Asociar';
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
          this.cerrar.emit();
        }
      });
    } else {
      this.cerrar.emit();
    }
  }
}