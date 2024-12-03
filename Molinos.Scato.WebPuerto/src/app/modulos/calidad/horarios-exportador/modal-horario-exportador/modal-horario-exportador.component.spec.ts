import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalHorarioExportadorComponent } from './modal-horario-exportador.component';

describe('ModalHorarioExportadorComponent', () => {
  let component: ModalHorarioExportadorComponent;
  let fixture: ComponentFixture<ModalHorarioExportadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalHorarioExportadorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalHorarioExportadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
