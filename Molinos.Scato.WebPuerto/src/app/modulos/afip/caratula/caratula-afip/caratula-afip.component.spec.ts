import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaratulaAfipComponent } from './caratula-afip.component';

describe('CaratulaAfipComponent', () => {
  let component: CaratulaAfipComponent;
  let fixture: ComponentFixture<CaratulaAfipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaratulaAfipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaratulaAfipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
