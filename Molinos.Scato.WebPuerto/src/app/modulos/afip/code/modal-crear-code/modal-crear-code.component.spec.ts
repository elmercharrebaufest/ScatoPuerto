import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCrearCodeComponent } from './modal-crear-code.component';

describe('ModalCrearCodeComponent', () => {
  let component: ModalCrearCodeComponent;
  let fixture: ComponentFixture<ModalCrearCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalCrearCodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCrearCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
