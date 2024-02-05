import { TestBed } from '@angular/core/testing';

import { TablasAfipService } from './tablas-afip.service';

describe('TablasAfipService', () => {
  let service: TablasAfipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TablasAfipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
