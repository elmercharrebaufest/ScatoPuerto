import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvGastosEmbarqueComponent } from './prov-gastos-embarque.component';

describe('ProvGastosEmbarqueComponent', () => {
  let component: ProvGastosEmbarqueComponent;
  let fixture: ComponentFixture<ProvGastosEmbarqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProvGastosEmbarqueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvGastosEmbarqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
