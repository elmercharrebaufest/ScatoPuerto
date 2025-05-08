import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarifaEmbarqueComponent } from './tarifa-embarque.component';

describe('TarifaEmbarqueComponent', () => {
  let component: TarifaEmbarqueComponent;
  let fixture: ComponentFixture<TarifaEmbarqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TarifaEmbarqueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TarifaEmbarqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
