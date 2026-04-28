import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleDeCargaComponent } from './detalle-de-carga.component';

describe('DetalleDeCargaComponent', () => {
  let component: DetalleDeCargaComponent;
  let fixture: ComponentFixture<DetalleDeCargaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetalleDeCargaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleDeCargaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
