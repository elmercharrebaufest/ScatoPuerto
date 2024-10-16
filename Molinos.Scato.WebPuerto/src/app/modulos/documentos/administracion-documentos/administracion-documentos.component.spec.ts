import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministracionDocumentosComponent } from './administracion-documentos.component';

describe('AdministracionDocumentosComponent', () => {
  let component: AdministracionDocumentosComponent;
  let fixture: ComponentFixture<AdministracionDocumentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministracionDocumentosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministracionDocumentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
