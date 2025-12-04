import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidovnComponent } from './liquidovn.component';

describe('LiquidovnComponent', () => {
  let component: LiquidovnComponent;
  let fixture: ComponentFixture<LiquidovnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiquidovnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidovnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
