import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeAfipComponent } from './code-afip.component';

describe('CodeAfipComponent', () => {
  let component: CodeAfipComponent;
  let fixture: ComponentFixture<CodeAfipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodeAfipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeAfipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
