import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { ConsultaEmbarquesComponent } from './consulta-embarques.component';
import { AdministracionService } from '@ScatoServicios/administracion.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { SessionService } from '@ScatoServicios/session.service';

describe('ConsultaEmbarquesComponent', () => {
  let component: ConsultaEmbarquesComponent;
  let fixture: ComponentFixture<ConsultaEmbarquesComponent>;

  // Mocks
  let adminServiceSpy: jasmine.SpyObj<AdministracionService>;
  let sessionServiceSpy: jasmine.SpyObj<SessionService>;
  let confirmationDialogSpy: jasmine.SpyObj<ConfirmationDialogService>;

  beforeEach(async () => {
    // Create spies
    adminServiceSpy = jasmine.createSpyObj('AdministracionService', [
      'listarCombos', 
      'listarEmbarques', 
      'listarAcuerdoPorEmbarcacion', 
      'exportarListado'
    ]);
    sessionServiceSpy = jasmine.createSpyObj('SessionService', ['getUser']);
    confirmationDialogSpy = jasmine.createSpyObj('ConfirmationDialogService', ['error', 'confirm']);

    // Setup return values for spies
    adminServiceSpy.listarCombos.and.returnValue(of({
      buques: [],
      muelles: [],
      exportadores: [],
      productos: [],
      agencias: []
    }));
    
    // Mock listarEmbarques to return an empty list initially so onBuscar doesn't crash
    adminServiceSpy.listarEmbarques.and.returnValue(of({
      items: [],
      itemsTotales: 0
    }));

    // Mock session user
    sessionServiceSpy.getUser.and.returnValue({
      username: 'testUser',
      permisos: []
    } as any);

    await TestBed.configureTestingModule({
      declarations: [ ConsultaEmbarquesComponent ],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        MatPaginatorModule
      ],
      providers: [
        { provide: AdministracionService, useValue: adminServiceSpy },
        { provide: SessionService, useValue: sessionServiceSpy },
        { provide: ConfirmationDialogService, useValue: confirmationDialogSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignores unknown elements like ship-spinner, ng-multiselect-dropdown
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaEmbarquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Triggers ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.filtroBusqueda).toBeDefined();
    expect(component.filtroBusqueda.get('estados')).toBeDefined();
  });

  it('should call onBuscar during initialization', () => {
    expect(adminServiceSpy.listarEmbarques).toHaveBeenCalled();
  });
});