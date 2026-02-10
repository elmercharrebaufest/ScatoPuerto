import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TarifaDolarComponent } from './tarifa-dolar.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// Service Mocks
import { TarifaDolarService } from '@ScatoServicios/tarifa-dolar.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';

describe('TarifaDolarComponent', () => {
  let component: TarifaDolarComponent;
  let fixture: ComponentFixture<TarifaDolarComponent>;
  
  // Mocks
  let mockTarifaDolarService: jasmine.SpyObj<TarifaDolarService>;
  let mockConfirmationDialogService: jasmine.SpyObj<ConfirmationDialogService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create spies for dependencies
    mockTarifaDolarService = jasmine.createSpyObj('TarifaDolarService', [
      'obtenerPeriodosDisponibles',
      'obtenerTarifaDolar',
      'guardarTarifaDolar',
      'convertirPeriodoADate'
    ]);

    mockConfirmationDialogService = jasmine.createSpyObj('ConfirmationDialogService', [
      'alertar',
      'confirm'
    ]);

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ TarifaDolarComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        FormBuilder,
        { provide: TarifaDolarService, useValue: mockTarifaDolarService },
        { provide: ConfirmationDialogService, useValue: mockConfirmationDialogService },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ] // Ignores custom elements like ship-spinner
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TarifaDolarComponent);
    component = fixture.componentInstance;

    // Default mock behaviors
    mockTarifaDolarService.obtenerPeriodosDisponibles.and.returnValue(of(['2025-01', '2025-02']));
    
    // Mock date conversion logic used in the component
    mockTarifaDolarService.convertirPeriodoADate.and.callFake((periodo: string) => {
      const [year, month] = periodo.split('-').map(Number);
      return new Date(year, month - 1, 1);
    });

    fixture.detectChanges(); // Triggers ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization (ngOnInit)', () => {
    it('should initialize the form', () => {
      expect(component.formulario).toBeDefined();
      expect(component.formulario.get('periodo')).toBeDefined();
      expect(component.formulario.get('cotizacion')).toBeDefined();
    });

    it('should load available periods', () => {
      expect(mockTarifaDolarService.obtenerPeriodosDisponibles).toHaveBeenCalled();
      expect(component.periodos).toEqual(['2025-01', '2025-02']);
    });

    it('should preselect current period on init', () => {
      const hoy = new Date();
      const año = hoy.getFullYear();
      const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
      const expectedPeriod = `${año}-${mes}`;
      
      expect(component.formulario.get('periodo')?.value).toBe(expectedPeriod);
    });
  });

  describe('Period Selection (onSeleccionarPeriodo)', () => {
    it('should fetch rate when a period is selected', () => {
      const mockRate = { Id: 1, Periodo: new Date(), ValorDolar: 1500, FechaActualizacion: new Date() };
      mockTarifaDolarService.obtenerTarifaDolar.and.returnValue(of(mockRate));

      component.formulario.patchValue({ periodo: '2026-02' });
      component.onSeleccionarPeriodo();

      expect(mockTarifaDolarService.obtenerTarifaDolar).toHaveBeenCalledWith('2026-02');
      expect(component.tarifaDolar).toBeDefined();
      expect(component.formulario.get('cotizacion')?.value).toBe(1500);
    });

    it('should handle 404 error (new period) correctly', () => {
      mockTarifaDolarService.obtenerTarifaDolar.and.returnValue(throwError({ status: 404 }));

      component.formulario.patchValue({ periodo: '2026-03' });
      component.onSeleccionarPeriodo();

      expect(component.tarifaDolar).toBeNull();
      expect(component.formulario.get('cotizacion')?.value).toBeNull();
      expect(component.estaCargando).toBeFalse();
    });

    it('should handle generic error', () => {
      mockTarifaDolarService.obtenerTarifaDolar.and.returnValue(throwError({ status: 500 }));

      component.formulario.patchValue({ periodo: '2026-02' });
      component.onSeleccionarPeriodo();

      expect(mockConfirmationDialogService.alertar).toHaveBeenCalledWith('Error al cargar la tarifa.', Tipoalerta.Error);
      expect(component.estaCargando).toBeFalse();
    });
  });

  describe('Edit Validation Logic', () => {
    it('should enable editing if period is current or future', () => {
      const hoy = new Date();
      const futurePeriod = `${hoy.getFullYear() + 1}-01`;
      
      // We simulate a fetch (even if 404) to trigger the update logic
      mockTarifaDolarService.obtenerTarifaDolar.and.returnValue(throwError({ status: 404 }));
      
      component.formulario.patchValue({ periodo: futurePeriod });
      component.onSeleccionarPeriodo();

      expect(component.puedeEditar).toBeTrue();
      expect(component.formulario.get('cotizacion')?.enabled).toBeTrue();
    });

    it('should disable editing if period is older than last month', () => {
      // Create a date 3 months ago
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 3);
      const pastPeriod = `${pastDate.getFullYear()}-${(pastDate.getMonth() + 1).toString().padStart(2, '0')}`;

      mockTarifaDolarService.obtenerTarifaDolar.and.returnValue(throwError({ status: 404 }));

      component.formulario.patchValue({ periodo: pastPeriod });
      component.onSeleccionarPeriodo();

      expect(component.puedeEditar).toBeFalse();
      expect(component.formulario.get('cotizacion')?.disabled).toBeTrue();
    });
  });

  describe('Saving (onGuardar)', () => {
    it('should not save if form is invalid', () => {
      component.formulario.patchValue({ cotizacion: null });
      component.onGuardar();
      expect(mockConfirmationDialogService.confirm).not.toHaveBeenCalled();
    });

    it('should not save if cotizacion is zero or negative', () => {
      component.formulario.patchValue({ cotizacion: 0 });
      component.onGuardar();
      expect(mockConfirmationDialogService.alertar).toHaveBeenCalledWith(jasmine.stringMatching(/Debe ingresar un valor/), Tipoalerta.Error);
    });

    it('should call service when confirmed', fakeAsync(() => {
      // Setup valid form
      component.formulario.patchValue({ periodo: '2026-02', cotizacion: 1200 });
      
      // Mock confirm dialog returning true (Promise)
      mockConfirmationDialogService.confirm.and.returnValue(Promise.resolve(true));
      
      // Mock save service
      mockTarifaDolarService.guardarTarifaDolar.and.returnValue(of({}));
      
      // Mock fetch service (called after save)
      mockTarifaDolarService.obtenerTarifaDolar.and.returnValue(of({ ValorDolar: 1200 }));

      component.onGuardar();
      tick(); // Resolve promise

      expect(mockTarifaDolarService.guardarTarifaDolar).toHaveBeenCalledWith('2026-02', 1200);
      expect(mockConfirmationDialogService.alertar).toHaveBeenCalledWith('Tarifa registrada correctamente.', Tipoalerta.Success);
      expect(mockTarifaDolarService.obtenerTarifaDolar).toHaveBeenCalled(); // Should reload
    }));

    it('should handle error on save', fakeAsync(() => {
      component.formulario.patchValue({ periodo: '2026-02', cotizacion: 1200 });
      mockConfirmationDialogService.confirm.and.returnValue(Promise.resolve(true));
      mockTarifaDolarService.guardarTarifaDolar.and.returnValue(throwError({ error: { message: 'Database error' } }));

      component.onGuardar();
      tick();

      expect(mockTarifaDolarService.guardarTarifaDolar).toHaveBeenCalled();
      expect(mockConfirmationDialogService.alertar).toHaveBeenCalledWith('Database error', Tipoalerta.Error);
    }));
  });

  describe('Navigation', () => {
    it('should navigate to lineup on cancel', () => {
      component.onCancelar();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/lineup']);
    });

    it('should navigate to lineup on back', () => {
      component.onVolver();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/lineup']);
    });
  });
});