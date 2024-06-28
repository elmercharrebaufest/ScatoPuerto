import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarCrearCargadorComponent } from './editar-crear-cargador.component';

describe('EditarCrearCargadorComponent', () => {
  let component: EditarCrearCargadorComponent;
  let fixture: ComponentFixture<EditarCrearCargadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarCrearCargadorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarCrearCargadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
