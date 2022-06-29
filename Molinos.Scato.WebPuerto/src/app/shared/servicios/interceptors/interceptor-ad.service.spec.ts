import { TestBed } from '@angular/core/testing';

import { InterceptorADService } from './interceptor-ad.service';

describe('InterceptorADService', () => {
  let service: InterceptorADService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InterceptorADService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
