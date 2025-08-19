import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertaAdministracionComponent } from './alerta-administracion.component';

describe('AlertaAdministracionComponent', () => {
  let component: AlertaAdministracionComponent;
  let fixture: ComponentFixture<AlertaAdministracionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlertaAdministracionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertaAdministracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
