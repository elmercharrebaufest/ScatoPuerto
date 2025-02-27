import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmarreNuevoComponent } from './amarre-nuevo.component';

describe('AmarreNuevoComponent', () => {
  let component: AmarreNuevoComponent;
  let fixture: ComponentFixture<AmarreNuevoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmarreNuevoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmarreNuevoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
