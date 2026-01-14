import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ConsultaAcuerdosComponent } from './consulta-acuerdo.component';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';

describe('ConsultaAcuerdosComponent', () => {
  let component: ConsultaAcuerdosComponent;
  let fixture: ComponentFixture<ConsultaAcuerdosComponent>;
  
  const confirmationDialogServiceSpy = jasmine.createSpyObj('ConfirmationDialogService', ['confirm', 'alertar']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultaAcuerdosComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        FormBuilder,
        { provide: ConfirmationDialogService, useValue: confirmationDialogServiceSpy }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaAcuerdosComponent);
    component = fixture.componentInstance;
    
    component.periodoDefault = '2024-03';
    component.muelleDefault = 'San Benito';
    component.productoDefault = 'Aceite';
    component.exportadorDefault = 'YPF';
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize filters with default input values', () => {
    expect(component.filtrosForm).toBeDefined();
    expect(component.filtrosForm.get('periodo').value).toBe('2024-03');
    expect(component.filtrosForm.get('muelle').value).toBe('San Benito');
    expect(component.filtrosForm.get('producto').value).toBe('Aceite');
    expect(component.filtrosForm.get('exportador').value).toBe('YPF');
  });

  it('should initialize association form disabled', () => {
    expect(component.asociarForm).toBeDefined();
    expect(component.asociarForm.get('producto').disabled).toBeTrue();
  });

  it('should search and populate agreements list', fakeAsync(() => {
    component.onBuscar();
    expect(component.estaCargando).toBeTrue();
    
    tick(500);
    fixture.detectChanges();

    expect(component.estaCargando).toBeFalse();
    expect(component.acuerdos.length).toBeGreaterThan(0);
  }));

  it('should select an agreement correctly', fakeAsync(() => {
    component.onBuscar();
    tick(500);
    
    const acuerdoToSelect = component.acuerdos.find(a => a.estadoAsociacion === 'UNLINKED'); // Find a valid one
    component.onSeleccionarAcuerdo(acuerdoToSelect);

    expect(component.acuerdoSeleccionado).toEqual(acuerdoToSelect);
    expect(component.asociarForm.get('producto').value).toBe(acuerdoToSelect.producto);
  }));

  it('should validation prevent association if quantity is missing', () => {
    component.asociarForm.controls['cantidad'].setValue(null);
    component.onAsociar();
    expect(component.asociarForm.valid).toBeFalse();
  });

  it('should alert if quantity exceeds available amount', fakeAsync(() => {
    component.onBuscar();
    tick(500);
    
    const acuerdo = component.acuerdos.find(a => a.id === 3); 
    component.onSeleccionarAcuerdo(acuerdo);

    component.asociarForm.controls['cantidad'].setValue(20000);
    
    component.onAsociar();

    expect(confirmationDialogServiceSpy.alertar).toHaveBeenCalledWith('La cantidad a asociar no puede superar la disponible.');
  }));

  it('should emit asociacionGuardada event on successful association', fakeAsync(() => {
    confirmationDialogServiceSpy.confirm.and.returnValue(Promise.resolve(true));
    spyOn(component.asociacionGuardada, 'emit');

    component.onBuscar();
    tick(500);
    const acuerdo = component.acuerdos.find(a => a.id === 3);
    component.onSeleccionarAcuerdo(acuerdo);

    component.asociarForm.controls['cantidad'].setValue(500);

    component.onAsociar();
    
    tick();

    expect(component.asociacionGuardada.emit).toHaveBeenCalled();
  }));

  it('should reset forms on clean', () => {
    component.filtrosForm.controls['muelle'].setValue('Otro');
    
    component.onLimpiar();

    expect(component.filtrosForm.get('muelle').value).toBe('San Benito'); // default input value
    expect(component.acuerdos.length).toBe(0);
    expect(component.acuerdoSeleccionado).toBeNull();
  });
});