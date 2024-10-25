import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarEstadoDocumentosComponent } from './actualizar-estado-documentos.component';

describe('ActualizarEstadoDocumentosComponent', () => {
  let component: ActualizarEstadoDocumentosComponent;
  let fixture: ComponentFixture<ActualizarEstadoDocumentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActualizarEstadoDocumentosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActualizarEstadoDocumentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
