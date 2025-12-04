import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolidosvnComponent } from './solidosvn.component';

describe('SolidosvnComponent', () => {
  let component: SolidosvnComponent;
  let fixture: ComponentFixture<SolidosvnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolidosvnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SolidosvnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
