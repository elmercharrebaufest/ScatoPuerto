import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnosRecibidoresComponent } from './turnos-recibidores.component';

describe('TurnosRecibidoresComponent', () => {
  let component: TurnosRecibidoresComponent;
  let fixture: ComponentFixture<TurnosRecibidoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TurnosRecibidoresComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnosRecibidoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
