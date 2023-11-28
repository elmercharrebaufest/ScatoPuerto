import { TestBed } from '@angular/core/testing';

import { CaratulaAfipService } from './caratula-afip.service';

describe('CaratulaAfipService', () => {
  let service: CaratulaAfipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaratulaAfipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
