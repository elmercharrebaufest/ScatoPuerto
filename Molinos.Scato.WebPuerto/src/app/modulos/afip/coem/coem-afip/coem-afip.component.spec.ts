import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoemAfipComponent } from './coem-afip.component';

describe('CoemAfipComponent', () => {
  let component: CoemAfipComponent;
  let fixture: ComponentFixture<CoemAfipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoemAfipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoemAfipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
