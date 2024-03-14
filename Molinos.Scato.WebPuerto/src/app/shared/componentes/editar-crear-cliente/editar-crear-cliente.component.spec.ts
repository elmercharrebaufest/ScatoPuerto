import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarCrearClienteComponent } from './editar-crear-cliente.component';

describe('EditarCrearClienteComponent', () => {
  let component: EditarCrearClienteComponent;
  let fixture: ComponentFixture<EditarCrearClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarCrearClienteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarCrearClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
