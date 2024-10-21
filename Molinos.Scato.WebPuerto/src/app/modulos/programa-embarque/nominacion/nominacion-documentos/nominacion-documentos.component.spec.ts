import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NominacionDocumentosComponent } from './nominacion-documentos.component';

describe('NominacionDocumentosComponent', () => {
  let component: NominacionDocumentosComponent;
  let fixture: ComponentFixture<NominacionDocumentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NominacionDocumentosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NominacionDocumentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
