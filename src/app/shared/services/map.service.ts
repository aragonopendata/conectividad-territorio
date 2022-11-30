import { Injectable } from '@angular/core';
import { Feature, Overlay, View } from 'ol';
import Map from 'ol/Map.js';
import MouseWheelZoom from 'ol/interaction/MouseWheelZoom';
//const MouseWheelZoom = (<any>require('ol/interaction/MouseWheelZoom')).default;
import {fromLonLat} from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import { boundingExtent, coordinateRelationship, extendCoordinate } from 'ol/extent';
import { GeoJSON } from 'ol/format';
import Point from 'ol/geom/Point';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Projection from 'ol/proj/Projection';
import { TileWMS } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import ImageStyle from 'ol/style/Image';
import { Observable, of } from 'rxjs';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ObjectId } from '../models/object-id.model';
import { TipoBusqueda } from '../models/tipo-busqueda.enum';
import { TypeZone2021, TypeZone2022, WFSResponse } from '../models/wfs-response.model';
import { IgearService } from './igear.service';
import { ExpectedConditions } from 'protractor';
import { Interaction } from 'chart.js';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(private igearService: IgearService) { }

  /**
   * 
   * @ngdoc method
   * @name MapService.initMap
   * @description Inicia el mapa de Aragón
   * @param {string=} target 
   * @returns {Map=}
   */
  initMap(target: string, overlay: Overlay): Map {
    const extent = boundingExtent(environment.aragonBoundingBox);
    const projection = new Projection({
      code: environment.epsgCode,
      units: 'm'
    });
    const options = {
      projection: projection,
    };
    const layer = new TileLayer({
      source: new TileWMS({
        url: environment.urlWMSServer,
        params: {
          LAYERS: environment.wmsLayers,
          VERSION: environment.wmsVersion,
          
         
        },
        projection: projection
      })
    });

    const olMap = new Map({
      target: target,
      controls: [],
     view: new View(options),
     
      overlays: [overlay],
    });

//    olMap.getInteractions().forEach(function(interaction) {
//  if (interaction instanceof ol.interaction.MouseWheelZoom) {
//    interaction.setActive(false);
//  }
//}, this);
    //zoom map

    olMap.addLayer(layer);
    
    olMap.getView().fit(extent);
//    olMap.getView().setZoom(15);
   // olMap.getView().setMaxZoom(18);
 //   olMap.getView().setMinZoom(15);
    //
    
   
    return olMap;
  }

   buildCircleStyle({ fillColor, strokeColor, strokeWidth = 1.25, circleRadius= 6 }: FeatureColorStyle): Style{
    const fillFeature = new Fill({
      color: fillColor,
    });
    const strokeFeature = new Stroke({
      color: strokeColor,
      width: strokeWidth,
    });
     return this.buildStyle(fillFeature, strokeFeature, new Circle({
      fill: fillFeature,
      stroke: strokeFeature,
      radius: circleRadius,
    }) );
  }
   
   buildStyle(fill: Fill, stroke: Stroke, image: ImageStyle): Style{
    const result = new Style({
      image,
      fill: fill,
      stroke: stroke,
    });
    return result;
   }
                       
   conformFeatureByLayer(feature, layer): any {
    let featureProcessed = [...feature];
    switch(layer){
      case 'nucleos_zbg_2022':
        featureProcessed = this.conformFeatureByNucleo2022(feature);
      break;
      default:
        break;
     }
    return featureProcessed;
  }

  conformFeatureByNucleo2022(feature): any {
    //Exclude Geometry points
    return feature.filter(feature => feature.values_.geometry.constructor.name !== 'Point')
    .map(feature => {
      if(feature.values_.geometry.constructor.name == 'GeometryCollection'){
        //Exclude GeometryElement points on GeometryCollection
        const geometriesProcessed = feature.values_.geometry.geometries_.filter((geometryElement) => geometryElement.constructor.name !== 'Point');
        feature.values_.geometry.geometries_ = geometriesProcessed;
      }
      return feature;
    });
  }

   getFeatureStyledByLayer(feature, layer): Style | null {
     let result: Style | null = null;
     switch(layer){
      case 'nucleos_zbg_2021':
        result = this.buildCircleStyle(this.getNucleoStyle((feature as any).values_.tipo_zona, (feature as any).values_.por_afec_nuc_x_zona, 2021))
      break;
      case 'nucleos_zbg_2022':
        result = this.buildCircleStyle(this.getNucleoStyle((feature as any).values_.tipo_zona, (feature as any).values_.por_afec_nuc_x_zona))
      break;
      case 'centros_educativos_zbg_2021':
        result = this.buildCircleStyle(this.getEducativeCenterStyle((feature as any).values_.tipo_zona, 2021))
      break;
      case 'centros_educativos_zbg_2022':
        result = this.buildCircleStyle(this.getEducativeCenterStyle((feature as any).values_.tipo_zona))
      break;
      case 'instalaciones_sanitarias_zbg_2021':
        result = this.buildCircleStyle(this.getSanitaryInstallationStyle((feature as any).values_.tipo_zona, 2021))
      break;
      case 'instalaciones_sanitarias_zbg_2022':
        result = this.buildCircleStyle(this.getSanitaryInstallationStyle((feature as any).values_.tipo_zona))
      break;
      case 'poligonos_zbg_2021':
        result = this.buildCircleStyle(this.getIndustrialParkStyle((feature as any).values_.tipo_zona, 2021))
      break;
      case 'poligonos_zbg_2022':
        result = this.buildCircleStyle(this.getIndustrialParkStyle((feature as any).values_.tipo_zona))
      break;
      case 'ui_zbg_2022_x_muni':
        result = this.buildCircleStyle(this.getBuildingUnitStyle((feature as any).values_.tipo_zona))
      break;
      case 'viviendas_zn_2022_x_muni':
        result = this.buildCircleStyle(this.getHousingBlackPlacesStyle((feature as any).values_.tipo_zona))
      break;
      default:
        break;
     }
     return result;
   }

   getNucleoStyle(zoneType, affectedValue, year: number = 2022): FeatureColorStyle {

    const typeZoneEnum = year === 2022 ? TypeZone2022: TypeZone2021;
    

    let result: FeatureColorStyle = {fillColor: "blue", strokeColor: "#FFFFFF"};

    if(zoneType === typeZoneEnum.A){
      if(affectedValue <= 20){
        result =  {fillColor: "#EF8480", strokeColor: "#FFFFFF"};
      }else if (affectedValue > 20 && affectedValue <= 40){
        result =  {fillColor: "#E94F49", strokeColor: "#FFFFFF"};
      }else if (affectedValue > 40 && affectedValue <= 60){
        result =  {fillColor: "#DA211B", strokeColor: "#FFFFFF"};
      }else if (affectedValue > 60 && affectedValue <= 80){
        result =  {fillColor: "#A3191A", strokeColor: "#FFFFFF"};
      }else if (affectedValue > 80 && affectedValue <= 100){
        result =  {fillColor: "#6D110D", strokeColor: "#FFFFFF"};
      }
    }else if(zoneType === typeZoneEnum.B){
      if(affectedValue <= 20){
        result =  {fillColor: "#B8D6E9", strokeColor: "#FFFFFF"};
      }else if (affectedValue > 20 && affectedValue <= 40){
        result =  {fillColor: "#9BC5D4", strokeColor: "#FFFFFF"};
      }else if (affectedValue > 40 && affectedValue <= 60){
        result =  {fillColor: "#7EB4C8", strokeColor: "#FFFFFF"};
      }else if (affectedValue > 60 && affectedValue <= 80){
        result =  {fillColor: "#569DB7", strokeColor: "#FFFFFF"};
      }else if (affectedValue > 80 && affectedValue <= 100){
        result =  {fillColor: "#4991AB", strokeColor: "#FFFFFF"};
      }
    }

    return result;
   }

   getEducativeCenterStyle(zoneType, year: number = 2022): FeatureColorStyle {

    const typeZoneEnum = year === 2022 ? TypeZone2022: TypeZone2021;

    let result: FeatureColorStyle = {fillColor: "blue", strokeColor: "#5DC4E3", circleRadius: 8};

    if(zoneType === typeZoneEnum.A){
      result =  {fillColor: "#E4312A", strokeColor: "#5DC4E3"};
    }else if(zoneType === typeZoneEnum.B){
      result =  {fillColor: "#569DB7", strokeColor: "#5DC4E3"};
    }else if(zoneType === typeZoneEnum.NONE){
      result =  {fillColor: "#5BCA2B", strokeColor: "#5DC4E3"};
    }

    return result;
   }

   getSanitaryInstallationStyle(zoneType, year: number = 2022): FeatureColorStyle {

    const typeZoneEnum = year === 2022 ? TypeZone2022: TypeZone2021;

    let result: FeatureColorStyle = {fillColor: "blue", strokeColor: "#F9A8BB"};

    if(zoneType === typeZoneEnum.A){
      result =  {fillColor: "#E4312A", strokeColor: "#F9A8BB"};
    }else if(zoneType === typeZoneEnum.B){
      result =  {fillColor: "#569DB7", strokeColor: "#F9A8BB"};
    }else if(zoneType === typeZoneEnum.NONE){
      result =  {fillColor: "#5BCA2B", strokeColor: "#F9A8BB"};
    }

    return result;
   }

   getIndustrialParkStyle(zoneType, year: number = 2022): FeatureColorStyle {

    const typeZoneEnum = year === 2022 ? TypeZone2022: TypeZone2021;

    let result: FeatureColorStyle = {fillColor: "blue", strokeColor: "#7D5A3C"};

    if(zoneType === typeZoneEnum.A){
      result =  {fillColor: "#E4312A", strokeColor: "#7D5A3C"};
    }else if(zoneType === typeZoneEnum.B){
      result =  {fillColor: "#569DB7", strokeColor: "#7D5A3C"};
    }else if(zoneType === typeZoneEnum.NONE){
      result =  {fillColor: "#5BCA2B", strokeColor: "#7D5A3C"};
    }

    return result;
   }

   getBuildingUnitStyle(zoneType, year: number = 2022): FeatureColorStyle {

    const typeZoneEnum = year === 2022 ? TypeZone2022: TypeZone2021;

    let result: FeatureColorStyle = {fillColor: "blue", strokeColor: "#FFFFFF"};

    if(zoneType === typeZoneEnum.A){
      result =  {fillColor: "#E4312A", strokeColor: "#FFFFFF"};
    }else if(zoneType === typeZoneEnum.B){
      result =  {fillColor: "#569DB7", strokeColor: "#FFFFFF"};
    }

    return result;
   }

   getHousingBlackPlacesStyle(affectedValue): FeatureColorStyle {    

    let result: FeatureColorStyle = {fillColor: "green", strokeColor: "#FFFFFF"};
  

  /**
   * 
   * @ngdoc method
   * @name MapService.addLayer
   * @description Agrega una nueva capa al mapa a partir de la respuesta del servicio WFS
   * @param {Map=} olMap 
   * @param {string=} capa 
   * @param {WFSResponse=} wfsResponse 
   */
  addLayer(olMap: Map, capa: string, wfsResponse: WFSResponse) {
    const className = `${capa}-layer`;
    console.log(wfsResponse);
    const extent = boundingExtent(this.getBBox(wfsResponse.features));
    const geojsonFormat = new GeoJSON();
    const features = geojsonFormat.readFeatures(JSON.stringify(wfsResponse));

    const layer: string = (features[0] as any).id_.split('.')[0];

    const fill = new Fill({
      color: 'blue',
    });
    const stroke = new Stroke({
      color: '#3399CC',
      width: 1.25,
    });
    
    const featuresStyled = this.conformFeatureByLayer(features,layer).map(feature => {
        const layer: string = (feature as any).id_.split('.')[0];
        const featureStyle = this.getFeatureStyledByLayer(feature, layer);
        featureStyle && feature.setStyle(featureStyle);
        return feature;
    });

    let featuresNucleosUrbanos = featuresStyled.filter(item => item.id_.includes('nucleos_zbg_') && item.values_.geometry.flatCoordinates !== undefined);
    let featuresUnidadesInmobiliares = featuresStyled.filter(item => item.id_.includes('ui_zbg_') && item.values_.geometry.flatCoordinates !== undefined);
    let featuresIsdt = featuresStyled.filter(item => item.id_.includes('isdt_municipio') && item.values_.geometry.flatCoordinates !== undefined); 

    let otherFeatures = featuresStyled.filter(item => !item.id_.includes('ui_zbg_') 
        && !item.id_.includes('nucleos_zbg_') && !item.id_.includes('isdt_municipio'));

    let vectorLayer = new VectorLayer({
      source: new VectorSource({
        format: geojsonFormat,
        features: otherFeatures,
      }),
      style: new Style({
        image: new Circle({
          fill: fill,
          stroke: stroke,
          radius: 5,
        }),
        fill: fill,
        stroke: stroke,
      }),
      className: className,
    });


    //zoom map 
    
    olMap.getLayers().getArray().filter(layer => layer.getClassName() === className)
      .forEach(layer => olMap.removeLayer(layer));


    if(featuresNucleosUrbanos !== undefined && featuresNucleosUrbanos.length > 0)
    {
        let coordinatesAndStyles = featuresNucleosUrbanos.map(function(item){
            return {coordinates: item.values_.geometry.flatCoordinates.slice(0, 2), style: item.style_}
        });

        let newFeatures : Feature[] = [];
        for(let newFeature of coordinatesAndStyles)
        {
            let _f = new Feature({
                geometry: new Point(newFeature.coordinates)
            });

            _f.setStyle(newFeature.style)
            newFeatures.push(_f);
        }

        let vectorLayerNucleosUrbanosLejos = new VectorLayer({
            source: new VectorSource({
            format: geojsonFormat,
            features: newFeatures,
            }),
            style: new Style({
            image: new Circle({
                fill: fill,
                stroke: stroke,
                radius: 5,
            }),
            fill: fill,
            stroke: stroke,
            }),
            className: className,
            minResolution: 30
        });

        let vectorLayerNucleosUrbanosCerca = new VectorLayer({
            source: new VectorSource({
              format: geojsonFormat,
              features: featuresNucleosUrbanos,
            }),
            style: new Style({
              image: new Circle({
                fill: fill,
                stroke: stroke,
                radius: 5,
              }),
              fill: fill,
              stroke: stroke,
            }),
            className: className,
            maxResolution: 40
          });

        olMap.addLayer(vectorLayerNucleosUrbanosCerca)
        olMap.addLayer(vectorLayerNucleosUrbanosLejos);
        if (vectorLayerNucleosUrbanosCerca != null){

          olMap.getView().fit(vectorLayerNucleosUrbanosCerca.getSource().getExtent());

        }
    }


    if(featuresUnidadesInmobiliares != undefined && featuresUnidadesInmobiliares.length > 0)
    {
        let coordinatesAndStyles = featuresUnidadesInmobiliares.map(function(item){
            return {coordinates: item.values_.geometry.flatCoordinates.slice(0, 2), style: item.style_}
        });

        let newFeatures : Feature[] = [];
        for(let newFeature of coordinatesAndStyles)
        {
            let _f = new Feature({
                geometry: new Point(newFeature.coordinates)
            });

            _f.setStyle(newFeature.style)
            newFeatures.push(_f);
        }

        let vectorLayerUnidadesInmobiliariasLejos = new VectorLayer({
            source: new VectorSource({
            format: geojsonFormat,
            features: newFeatures,
            }),
            style: new Style({
            image: new Circle({
                fill: fill,
                stroke: stroke,
                radius: 5,
            }),
            fill: fill,
            stroke: stroke,
            }),
            className: className,
            minResolution: 30
        });

        let vectorLayerUnidadesInmobiliariasCerca = new VectorLayer({
            source: new VectorSource({
              format: geojsonFormat,
              features: featuresUnidadesInmobiliares,
            }),
            style: new Style({
              image: new Circle({
                fill: fill,
                stroke: stroke,
                radius: 5,
              }),
              fill: fill,
              stroke: stroke,
            }),
            className: className,
            maxResolution: 40
          });

        olMap.addLayer(vectorLayerUnidadesInmobiliariasCerca)
        olMap.addLayer(vectorLayerUnidadesInmobiliariasLejos);
        if (vectorLayerUnidadesInmobiliariasCerca != null){

          olMap.getView().fit(vectorLayerUnidadesInmobiliariasCerca.getSource().getExtent());

        }
    }

    if(featuresIsdt !== undefined && featuresIsdt.length > 0)
    {
        let vectorLayerIsdt = new VectorLayer({
            source: new VectorSource({
            format: geojsonFormat,
            features: featuresIsdt,
            }),
            style: new Style({
            image: new Circle({
                fill: fill,
                stroke: stroke,
                radius: 5,
            }),
            fill: fill,
            stroke: stroke,
            }),
            className: className
        });
        vectorLayerIsdt.setZIndex(-5);
        olMap.addLayer(vectorLayerIsdt);
    }

    if(otherFeatures !== undefined && otherFeatures.length > 0)
    {
        olMap.addLayer(vectorLayer);
        if (vectorLayer != null){

          olMap.getView().fit(vectorLayer.getSource().getExtent());

        }

        
    }
    
   // olMap.getView().fit(extent);
    olMap.getView().setZoom(14.5);
//    olMap.getView().setMaxZoom(18);
    olMap.getView().setMinZoom(14.5);


 
  }

  /**
   * 
   * @ngdoc method
   * @name MapService.getObjectId
   * @description Obtiene el ObjectId a partir del texto de busqueda
   * @param {string=} searchString 
   * @returns {Observable<ObjectId>=}
   */
  getObjectId(searchString: string): Observable<ObjectId> {
    const fields: string[] = searchString.toLowerCase().split(',');
    const tipoBusqueda = this.getTipoBusqueda(searchString);
    const texto: string = fields[0];
    const muni: string = fields[1];
    let service: Observable<ObjectId> = of({
      objectId: undefined,
      typename: ''
    } as ObjectId);
    if (tipoBusqueda === TipoBusqueda.CP) {
      service = this.getObjectIdByCP(texto, environment.typedSearchCP);
    // } else if (tipoBusqueda === TipoBusqueda.CALLE) {
    //   service = this.getObjectIdByDireccion(texto, environment.typedSearchDIRECCION, muni);
    } else if (tipoBusqueda === TipoBusqueda.LOCALIDAD) {
      service = this.getObjectIdByLocalidad(texto, environment.typedSearchLOCALIDAD);
    }

    


    return service;
  }

  /**
   * 
   * @ngdoc method
   * @name MapService.getObjectIdByCP
   * @description Obtiene el ObjectId para un CP
   * @param {string=} texto 
   * @param {string=} type 
   * @returns {Observable<ObjectId>=}
   */
  getObjectIdByCP(texto: string, type: string): Observable<ObjectId> {
    return this.igearService.typedSearchService(texto, type)
      .pipe(map((res: XMLDocument) => {
        const objectId: ObjectId = {
          objectId: res.getElementsByTagName('List')[0].textContent?.split('#')[3],
          typename: environment.typenameCP
        }
        return objectId;
      }));
  }

  /**
   * 
   * @ngdoc method
   * @name MapService.getObjectIdByDireccion
   * @description Obtiene el ObjectId para una dirección
   * @param {string=} texto 
   * @param {string=} type 
   * @param {string=} muni 
   * @returns 
   */
  getObjectIdByDireccion(texto: string, type: string, muni: string): Observable<ObjectId> {
    return this.igearService.typedSearchService(texto, type, muni)
      .pipe(mergeMap((res: XMLDocument) => {
        const c_mun_via = res.getElementsByTagName('List')[0].textContent?.split('#')[3];
        const cqlFilter = `c_mun_via='${c_mun_via}'`;
        return this.igearService.visor2Dservice(type, cqlFilter)
      }),
        map((res: any) => {
          let objectId = {
            objectId: undefined,
            typename: environment.typenameDIRECCION
          };
          if (res.totalFeatures > 0) {
            objectId.objectId = res.features[0].properties.objectid;
          }
          return objectId;
        }));
  }

  /**
   * 
   * @ngdoc method
   * @name MapService.getObjectIdByLocalidad
   * @description Obtiene el ObjectId para una localidad
   * @param {string=} texto 
   * @param {string=} type 
   * @param {string=} muni 
   * @returns {Observable<ObjectId>=}
   */
  getObjectIdByLocalidad(texto: string, type: string): Observable<ObjectId> {
    return this.igearService.typedSearchService(texto, type)
    .pipe(map((res: XMLDocument) => {
      let results: string[]=  res.getElementsByTagName('List')[0].textContent?.split('\n');
       for (let i=0;  i<results.length;i++){
         if (results[i]!="" && results[i].split('#')[1].toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") == texto.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")){
          const objectId: ObjectId = {
            objectId: results[i].split('#')[3],
            typename: environment.typenameLOCALIDAD
          }
          return objectId;
         }
       }
      return null;
    }));

  }

  /**
   * 
   * @ngdoc method
   * @name MapService.getTipoBusqueda
   * @description Obtiene el tipo de búsqueda a partir del texto de busqueda
   * @param {string=} searchString 
   * @returns {TipoBusqueda=}
   */
  getTipoBusqueda(searchString: string): TipoBusqueda {
    let tipoBusqueda: TipoBusqueda = TipoBusqueda.SIN_DEFINIR;
    if (/^(?:0?[1-9]|[1-4]\d|5[0-2])\d{3}$/.test(searchString)) {
      tipoBusqueda = TipoBusqueda.CP;
    } else if (/^[\w\s]+,[^\d]+?$/.test(searchString)) {
      const fields = searchString.split(',')
      if (fields.length == 2 && fields[1].trim().length > 0) {
        tipoBusqueda = TipoBusqueda.CALLE;
      }
    } else if (/^[^\d,]+$/.test(searchString)) {
      if (searchString.trim().length > 0) {
        tipoBusqueda = TipoBusqueda.LOCALIDAD;
      }
    }
    return tipoBusqueda;
  }

  /**
   * 
   * @ngdoc method
   * @name MapService.getWFSFeatures
   * @description Obtiene la respuesta WFS a partir del ObjectId
   * @param {string=} ObjectId
   * @param {string=} typename
   * @param {string=} capa
   * @param {number=} distancia 
   * @returns {Observable<WFSResponse>=}
   */
  getWFSFeatures(ObjectId: string, typename: string, capa: string, distancia: number): Observable<WFSResponse> {
    return this.igearService.spatialSearchService(ObjectId, typename)
      .pipe(switchMap(response => {
        let cqlFilter = typename === environment.typenameCP ? `objectid=${ObjectId}` : '';
        for (let resultado of response.resultados) {
          if (resultado.capa.includes(capa) ) {
            for (let feature of resultado.featureCollection.features) {
              const oid = feature.properties.objectid;
              cqlFilter += cqlFilter !== '' ? ` OR objectid=${oid}` : `objectid=${oid}`;
            }
            console.log(cqlFilter);
            break;
          }
        }
        return this.igearService.sitaWMSGetFeature(capa, cqlFilter);  
      }));
  }

  getWFSFeaturesByCP(ObjectId: string, typename: string, capa: string, distancia: number): Observable<WFSResponse> {
    return this.igearService.spatialSearchServiceByCP(ObjectId, typename)
      .pipe(switchMap(response => {
        let cqlFilter = typename === environment.typenameCP ? `objectid=${ObjectId}` : '';
        for (let resultado of response.resultados) {
          if (resultado.capa.includes(capa) ) {
            for (let feature of resultado.featureCollection.features) {
              const oid = feature.properties.objectid;
              cqlFilter += cqlFilter !== '' ? ` OR objectid=${oid}` : `objectid=${oid}`;
            }
            console.log(cqlFilter);
            break;
          }
        }
        return this.igearService.sitaWMSGetFeature(capa, cqlFilter);  
      }));
  }
  getWFSFeaturesAll(ObjectId: string, typename: string, capa: string, distancia: number): Observable<WFSResponse> {
    return this.igearService.sitaWMSGetFeatureAll(capa, "0");
  }
  /**
   * 
   * @ngdoc method
   * @name MapService.getBBox
   * @description Obtiene el boundingbox a partir de la geometría de la búsqueda
   * @param {any=} features 
   * @returns {Coordinate=}
   */
  getBBox(features: any): Coordinate[] {
    let bbox = [[571580, 4400803], [812351, 4840039]];
    for (let feature of features) {
      if (feature.geometry.type == 'LineString' || feature.geometry.type == 'Point' || feature.geometry.type == 'Polygon') {
        for (let coordinate of feature.geometry.coordinates) {
          bbox[0][0] = coordinate[0] < bbox[0][0] ? coordinate[0] | 0 : bbox[0][0];
          bbox[1][0] = coordinate[0] > bbox[1][0] ? coordinate[0] | 0 : bbox[1][0];
          bbox[0][1] = coordinate[1] < bbox[0][1] ? coordinate[1] | 0 : bbox[0][1];
          bbox[1][1] = coordinate[1] > bbox[1][1] ? coordinate[1] | 0 : bbox[1][1];
          
        }
      }
    }
    return bbox;
  }

}

interface FeatureColorStyle {
  fillColor: string;
  strokeColor: string;
  strokeWidth?: number;
  circleRadius?: number;
}
