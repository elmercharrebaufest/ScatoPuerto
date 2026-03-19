import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TarifaDolarComponent } from './tarifa-dolar.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TarifaDolarService } from '@ScatoServicios/tarifa-dolar.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';

describe('TarifaDolarComponent', () => {
  let component: TarifaDolarComponent;
  let fixture: ComponentFixture<TarifaDolarComponent>;
  
  let mockTarifaDolarService: jasmine.SpyObj<TarifaDolarService>;
  let mockConfirmationDialogService: jasmine.SpyObj<ConfirmationDialogService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockTarifaDolarService = jasmine.createSpyObj('TarifaDolarService', [
      'obtenerPeriodosDisponibles',
      'obtenerTarifaDolar',
      'guardarTarifaDolar',
      'convertirPeriodoADate'
    ]);

    mockConfirmationDialogService = jasmine.createSpyObj('ConfirmationDialogService', ['alertar', 'confirm']);
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
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TarifaDolarComponent);
    component = fixture.componentInstance;
    
    mockTarifaDolarService.obtenerPeriodosDisponibles.and.returnValue(of(['2026-01', '2026-02']));
    mockTarifaDolarService.convertirPeriodoADate.and.returnValue(new Date(2026, 1, 1));
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize form with empty values on creation', () => {
      component.ngOnInit();
      expect(component.formulario.get('cotizacion')?.value).toBeFalsy();
    });
  });

  describe('Validation on Guardar', () => {
    it('should alert if value is 0 or less', () => {
      component.formulario.patchValue({ periodo: '2026-02', cotizacion: 0 });
      component.onGuardar();
      expect(mockConfirmationDialogService.alertar).toHaveBeenCalledWith('Debe ingresar un valor en la tarifa', Tipoalerta.Error);
    });

    it('should alert if value is empty', () => {
      component.formulario.patchValue({ periodo: '2026-02', cotizacion: null });
      component.onGuardar();
      expect(mockConfirmationDialogService.alertar).toHaveBeenCalledWith('Debe ingresar un valor en la tarifa', Tipoalerta.Error);
    });
  });

  describe('Guardar Tarifa', () => {
    it('should call confirmation dialog if valid', () => {
      component.formulario.patchValue({ periodo: '2026-02', cotizacion: 1200 });
      mockConfirmationDialogService.confirm.and.returnValue(Promise.resolve(false));

      component.onGuardar();

      expect(mockConfirmationDialogService.confirm).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to acuerdos on cancel', () => {
      component.onCancelar();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/acuerdos']);
    });

    it('should navigate to acuerdos on volver', () => {
      component.onVolver();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/acuerdos']);
    });
  });
});