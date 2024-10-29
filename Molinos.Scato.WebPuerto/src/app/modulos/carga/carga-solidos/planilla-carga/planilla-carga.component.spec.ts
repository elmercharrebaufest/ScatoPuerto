import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanillaCargaComponent } from './planilla-carga.component';

describe('PlanillaCargaComponent', () => {
  let component: PlanillaCargaComponent;
  let fixture: ComponentFixture<PlanillaCargaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanillaCargaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanillaCargaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
