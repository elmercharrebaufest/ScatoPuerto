import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarifaProductoComponent } from './tarifa-producto.component';

describe('TarifaProductoComponent', () => {
  let component: TarifaProductoComponent;
  let fixture: ComponentFixture<TarifaProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TarifaProductoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TarifaProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
