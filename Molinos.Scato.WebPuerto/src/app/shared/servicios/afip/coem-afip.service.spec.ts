import { TestBed } from '@angular/core/testing';

import { CoemAfipService } from './coem-afip.service';

describe('CoemAfipService', () => {
  let service: CoemAfipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoemAfipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
