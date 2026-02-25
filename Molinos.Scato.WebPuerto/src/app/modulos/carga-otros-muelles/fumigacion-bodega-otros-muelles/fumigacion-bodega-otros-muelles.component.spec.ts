import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FumigacionBodegaOtrosMuellesComponent } from './fumigacion-bodega-otros-muelles.component';

describe('FumigacionBodegaOtrosMuellesComponent', () => {
  let component: FumigacionBodegaOtrosMuellesComponent;
  let fixture: ComponentFixture<FumigacionBodegaOtrosMuellesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FumigacionBodegaOtrosMuellesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FumigacionBodegaOtrosMuellesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
