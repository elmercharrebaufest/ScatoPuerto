import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoDeCargaComponent } from './ingreso-de-carga.component';

describe('IngresoDeCargaComponent', () => {
  let component: IngresoDeCargaComponent;
  let fixture: ComponentFixture<IngresoDeCargaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IngresoDeCargaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IngresoDeCargaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
