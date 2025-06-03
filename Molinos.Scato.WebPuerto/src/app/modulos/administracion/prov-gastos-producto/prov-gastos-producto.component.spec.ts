import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvGastosProductoComponent } from './prov-gastos-producto.component';

describe('ProvGastosProductoComponent', () => {
  let component: ProvGastosProductoComponent;
  let fixture: ComponentFixture<ProvGastosProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProvGastosProductoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvGastosProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
