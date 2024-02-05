import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoemComponent } from './coem.component';

describe('CoemComponent', () => {
  let component: CoemComponent;
  let fixture: ComponentFixture<CoemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
