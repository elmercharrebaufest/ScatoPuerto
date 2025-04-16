import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleEmbarqueComponent } from './detalle-embarque.component';

describe('DetalleEmbarqueComponent', () => {
  let component: DetalleEmbarqueComponent;
  let fixture: ComponentFixture<DetalleEmbarqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetalleEmbarqueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleEmbarqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
