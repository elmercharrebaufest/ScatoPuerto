import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaEmbarquesComponent } from './consulta-embarques.component';

describe('ConsultaEmbarquesComponent', () => {
  let component: ConsultaEmbarquesComponent;
  let fixture: ComponentFixture<ConsultaEmbarquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultaEmbarquesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaEmbarquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
