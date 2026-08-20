import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AcuerdosPorEmbarcacionComponent } from './acuerdos-por-embarcacion.component';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { AdministracionService } from '@ScatoServicios/administracion.service';

describe('AcuerdosPorEmbarcacionComponent', () => {
  let component: AcuerdosPorEmbarcacionComponent;
  let fixture: ComponentFixture<AcuerdosPorEmbarcacionComponent>;
  
  // Spies
  let confirmationDialogServiceSpy: jasmine.SpyObj<ConfirmationDialogService>;
  let adminServiceSpy: jasmine.SpyObj<AdministracionService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    confirmationDialogServiceSpy = jasmine.createSpyObj('ConfirmationDialogService', ['confirm', 'alertar']);
    adminServiceSpy = jasmine.createSpyObj('AdministracionService', [
      'obtenerDetalleEmbarque', 
      'listarCombos', 
      'listarAcuerdosDisponiblesParaEmbarcacion',
      'asociarEmbarcacionConAcuerdo',
      'editarAsociacionEmbarcacionConAcuerdo',
      'desasociarEmbarcacionConAcuerdo'
    ]);
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);

    // --- FIX IS HERE: Added 'as any' to bypass missing properties error ---
    adminServiceSpy.listarCombos.and.returnValue(of({
      buques: [],
      muelles: [{ descripcion: 'San Benito', id: 1 }, { descripcion: 'Otro', id: 2 }],
      exportadores: [{ nombre: 'YPF', id: 1 }],
      productos: [{ descripcion: 'Aceite', id: 1 }],
      agencias: []
    } as any));

    // --- FIX IS HERE: Added 'as any' ---
    adminServiceSpy.obtenerDetalleEmbarque.and.returnValue(of({
      cargas: [],
      exportadores: [],
      muelle: 'San Benito'
    } as any));

    adminServiceSpy.listarAcuerdosDisponiblesParaEmbarcacion.and.returnValue(of({
      items: [
        {
          idAcuerdo: 3,
          descripcion: 'Acuerdo Test',
          productos: ['Aceite'],
          cantidadTotal: 1000,
          muelle: 'San Benito',
          exportador: 'YPF',
          relacionAcuerdo: 'Ok',
          cantidadDisponible: 1000,
          cantidadAsociada: 0,
          embarquesAsociados: [],
          idAcuerdoEmbarqueActual: null, // UNLINKED
          detallesResumen: []
        }
      ],
      itemsTotales: 1
    }));
    
    // Mock Action Responses
    adminServiceSpy.asociarEmbarcacionConAcuerdo.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      declarations: [ AcuerdosPorEmbarcacionComponent ],
      imports: [ 
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        FormBuilder,
        { provide: ConfirmationDialogService, useValue: confirmationDialogServiceSpy },
        { provide: AdministracionService, useValue: adminServiceSpy },
        { provide: NgbModal, useValue: modalServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => '123' // Mock ID
              }
            }
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcuerdosPorEmbarcacionComponent);
    component = fixture.componentInstance;
    
    // Manually set inputs if needed, though ngOnInit handles defaults
    component.periodoDefault = '2024-03';
    component.muelleDefault = 'San Benito';
    component.productoDefault = 'Aceite';
    component.exportadorDefault = 'YPF';
    
    fixture.detectChanges(); // Triggers ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize filters with default input values', () => {
    expect(component.filtrosForm).toBeDefined();
    // Check values match inputs passed or defaults calculated
    expect(component.filtrosForm.get('muelle').value).toBe('San Benito');
  });

  it('should initialize association form disabled', () => {
    expect(component.asociarForm).toBeDefined();
    expect(component.asociarForm.get('producto').disabled).toBeTrue();
  });

  it('should search and populate agreements list', fakeAsync(() => {
    component.onBuscar();
    expect(component.estaCargando).toBeTrue();
    
    tick(); // Resolve Observables
    fixture.detectChanges();

    expect(component.estaCargando).toBeFalse();
    expect(component.acuerdos.length).toBeGreaterThan(0);
  }));

  it('should select an agreement correctly', fakeAsync(() => {
    component.onBuscar();
    tick();
    
    const acuerdoToSelect = component.acuerdos[0]; // Get the mocked item
    component.onSeleccionarAcuerdo(acuerdoToSelect, 'Aceite');

    expect(component.acuerdoSeleccionado).toEqual(acuerdoToSelect);
    expect(component.asociarForm.get('producto').value).toBe('Aceite');
  }));

  it('should validation prevent association if quantity is missing', () => {
    component.acuerdoSeleccionado = component.acuerdos[0]; // Ensure selection
    component.asociarForm.controls['cantidad'].setValue(null);
    
    // Call onConfirmarAccion instead of onAsociar (based on your TS)
    component.onConfirmarAccion(); 
    
    expect(component.asociarForm.valid).toBeFalse();
    expect(confirmationDialogServiceSpy.confirm).not.toHaveBeenCalled();
  });

  it('should alert if quantity exceeds available amount', fakeAsync(() => {
    component.onBuscar();
    tick();
    
    const acuerdo = component.acuerdos[0]; 
    component.onSeleccionarAcuerdo(acuerdo, 'Aceite');

    // Mock confirm dialog to return true
    confirmationDialogServiceSpy.confirm.and.returnValue(Promise.resolve(true));

    component.asociarForm.controls['cantidad'].setValue(20000); // Exceeds 1000
    
    component.onConfirmarAccion();
    tick();

    expect(confirmationDialogServiceSpy.alertar).toHaveBeenCalledWith('La cantidad a asociar no puede superar la cantidad disponible del acuerdo.');
  }));

  it('should call service on successful association', fakeAsync(() => {
    confirmationDialogServiceSpy.confirm.and.returnValue(Promise.resolve(true));

    component.onBuscar();
    tick();
    const acuerdo = component.acuerdos[0];
    component.onSeleccionarAcuerdo(acuerdo, 'Aceite');

    component.asociarForm.controls['cantidad'].setValue(500);

    component.onConfirmarAccion();
    tick();

    expect(adminServiceSpy.asociarEmbarcacionConAcuerdo).toHaveBeenCalled();
    expect(confirmationDialogServiceSpy.alertar).toHaveBeenCalledWith('Asociación realizada correctamente.', jasmine.any(Number));
  }));

  it('should reset forms on clean', () => {
    component.filtrosForm.controls['muelle'].setValue('Otro');
    
    component.onLimpiar();

    // Expect empty string as defined in onLimpiar
    expect(component.filtrosForm.get('muelle').value).toBe(''); 
  });
});
