import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from "rxjs/operators";
import { environment } from 'src/environments/environment';
import { SpatialSearchResults } from '../models/spatial-search-results.model';
import { WFSResponse } from '../models/wfs-response.model';

@Injectable({
  providedIn: 'root'
})
export class IgearService {

  constructor(private http: HttpClient) { }

  /**
   * 
   * @ngdoc method
   * @name IgearService.typedSearchService
   * @description Llama al servicio typed search service del IGEAR
   * @param texto {string=}
   * @param type {string=}
   * @param muni {string=}
   * @returns {Observable<XMLDocument>=}
   */
   typedSearchService(texto: string, type: string, muni?: string): Observable<XMLDocument> {

    let params = new HttpParams()
      .set('texto', texto)
      .set('type', type)
      .set('app', 'CT');
    if (muni !== undefined) {
      params = params.set('muni', muni);
    }
    const options: Object = {
      params: params,
      responseType: 'text'
    };

    return this.http.get<string>(environment.urlTypedSearchService, options)
      .pipe(map(xml => 
        {
        return new DOMParser().parseFromString(xml, 'text/xml')
      }));
  }



  /**
   * 
   * @ngdoc method
   * @name IgearService.spatialSearchService
   * @description Llama al servicio spatial search service del IGEAR
   * @param objectId {string=}
   * @param typename {string=}
   * @returns {Observable<SpatialSearchResults>=}
   */
  spatialSearchService(objectId: string, typename: string): Observable<SpatialSearchResults> {
    console.log("spatialsearch");
    const body = new HttpParams()
      .set('SERVICE', 'CT')
      .set('TYPENAME', typename)
      .set('CQL_FILTER', `OBJECTID=${objectId}`)
      .set('PROPERTYNAME', 'OBJECTID')
      .set('TYPENAME_CONN', 'DV');
    return this.http.post<SpatialSearchResults>(environment.urlSpatialSearchService, body)
  }

  /**
   * 
   * @ngdoc method
   * @name IgearService.sitaWMSGetFeature
   * @description Llama al servicio SITA WMS del IGEAR
   * @param typename {string=}
   * @param cqlFilter {string=}
   * @returns {Observable<any>=}
   */
  sitaWMSGetFeature(typename: string, cqlFilter: string): Observable<WFSResponse> {
    console.log("sitaWMSGetFeature")
    console.log(typename);
    const body = new HttpParams()
      .set('service', 'WFS')
      .set('version', '1.0.0')
      .set('request', 'GetFeature')
      .set('typename', typename)
      .set('outputFormat', 'application/json')
      .set('srsname', environment.epsgCode)
      .set('CQL_FILTER', cqlFilter);
    return this.http.post<any>(environment.urlSitaWMS, body);
  }

  sitaWMSGetFeatureAll(typename: string, cqlFilter: string): Observable<WFSResponse> {
    console.log("sitaWMSGetFeature")
    console.log(typename);
    const body = new HttpParams()
      .set('service', 'WFS')
      .set('version', '1.0.0')
      .set('request', 'GetFeature')
      .set('typename', typename)
      .set('outputFormat', 'application/json')
      .set('srsname', environment.epsgCode);
    return this.http.post<any>(environment.urlSitaWMS, body);
  }

  /**
   * 
   * @ngdoc method
   * @name IgearService.visor2Dservice
   * @description Llama al servicio visor2D del IGEAR
   * @param typename {string=}
   * @param cqlFilter {string=}
   * @returns {Observable<any>=}
   */
  visor2Dservice(typename: string, cqlFilter: string): Observable<WFSResponse> {
    const body = new HttpParams()
      .set('service', 'WFS')
      .set('version', '1.0.0')
      .set('request', 'GetFeature')
      .set('typename', typename)
      .set('outputFormat', 'application/json')
      .set('srsname', environment.epsgCode)
      .set('CQL_FILTER', cqlFilter);
    return this.http.post<any>(environment.urlVisor2D, body);
  }

}
