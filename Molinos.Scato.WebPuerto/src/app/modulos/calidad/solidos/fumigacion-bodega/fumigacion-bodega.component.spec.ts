import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FumigacionBodegaComponent } from './fumigacion-bodega.component';

describe('FumigacionBodegaComponent', () => {
  let component: FumigacionBodegaComponent;
  let fixture: ComponentFixture<FumigacionBodegaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FumigacionBodegaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FumigacionBodegaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
