import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorariosExportadorComponent } from './horarios-exportador.component';

describe('CargasExportadorSolidoComponent', () => {
  let component: HorariosExportadorComponent;
  let fixture: ComponentFixture<HorariosExportadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HorariosExportadorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HorariosExportadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
