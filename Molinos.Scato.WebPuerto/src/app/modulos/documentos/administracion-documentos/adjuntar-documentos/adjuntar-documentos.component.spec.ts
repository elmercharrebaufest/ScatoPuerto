import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjuntarDocumentosComponent } from './adjuntar-documentos.component';

describe('AdjuntarDocumentosComponent', () => {
  let component: AdjuntarDocumentosComponent;
  let fixture: ComponentFixture<AdjuntarDocumentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdjuntarDocumentosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjuntarDocumentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
