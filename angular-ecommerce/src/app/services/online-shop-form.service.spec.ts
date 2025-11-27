import { TestBed } from '@angular/core/testing';

import { OnlineShopFormService } from './online-shop-form.service';

describe('OnlineShopFormService', () => {
  let service: OnlineShopFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnlineShopFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
