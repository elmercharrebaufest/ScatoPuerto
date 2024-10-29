import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalComentariosComponent } from './modal-comentarios.component';

describe('ModalComentariosComponent', () => {
  let component: ModalComentariosComponent;
  let fixture: ComponentFixture<ModalComentariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalComentariosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComentariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
