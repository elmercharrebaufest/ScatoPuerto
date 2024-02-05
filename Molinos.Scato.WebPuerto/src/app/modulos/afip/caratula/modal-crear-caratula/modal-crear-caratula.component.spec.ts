import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCrearCaratulaComponent } from './modal-crear-caratula.component';

describe('ModalCrearCaratulaComponent', () => {
  let component: ModalCrearCaratulaComponent;
  let fixture: ComponentFixture<ModalCrearCaratulaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalCrearCaratulaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCrearCaratulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
