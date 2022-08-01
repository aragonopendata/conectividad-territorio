import { TestBed } from '@angular/core/testing';

import { IgearService } from './igear.service';

describe('IgearService', () => {
  let service: IgearService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IgearService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
