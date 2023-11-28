import { TestBed } from '@angular/core/testing';

import { CodeAfipService } from './code-afip.service';

describe('CodeAfipService', () => {
  let service: CodeAfipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodeAfipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
