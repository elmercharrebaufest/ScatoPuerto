import { TestBed } from '@angular/core/testing';

import { MailPlanillaService } from './mail-planilla.service';

describe('MailPlanillaService', () => {
  let service: MailPlanillaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MailPlanillaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
