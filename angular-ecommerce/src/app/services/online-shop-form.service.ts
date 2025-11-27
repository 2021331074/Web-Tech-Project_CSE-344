import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { District } from '../common/district';
import { map } from 'rxjs/operators';
import { Upazila } from '../common/upazila';

@Injectable({
  providedIn: 'root'
})
export class OnlineShopFormService {

  private districtsUrl = 'http://localhost:8080/api/districts/all';
  private upazilasUrl = 'http://localhost:8080/api/upazilas';

  constructor(private httpClient: HttpClient) { }

  /*
  getDistricts(): Observable<District[]> {
    
    return this.httpClient.get<GetResponseDistricts>(this.districtsUrl).pipe(
      map(response => response._embedded.districts)
    );
  }
  */

  getDistricts(): Observable<District[]> {
    return this.httpClient.get<District[]>(this.districtsUrl);
  }


  getUpazilas(theDistrictCode: string): Observable<Upazila[]> {

    // search url
    const searchUpazilaUrl = `${this.upazilasUrl}/search/findByDistrictCode?code=${theDistrictCode}`;

    return this.httpClient.get<GetResponseUpazilas>(searchUpazilaUrl).pipe(
      map(response => response._embedded.upazilas)
    );
  }


}

/*
interface GetResponseDistricts {
  _embedded: {
    districts: District[];
  }
}
*/

interface GetResponseUpazilas {
  _embedded: {
    upazilas: Upazila[];
  }
}