import { Injectable } from '@angular/core';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Rotate from 'ol/control/Rotate';
import Attribution from 'ol/control/Attribution';
import ScaleLine from 'ol/control/ScaleLine';
import Image from 'ol/layer/Image'
import ImageWMS from 'ol/source/ImageWMS'
import proj4 from 'proj4';


import {get} from 'ol/proj';
import {register} from 'ol/proj/proj4';
import * as extent from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import Control from 'ol/control/Control';
import Select from 'ol/interaction/Select';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import Overlay from 'ol/Overlay';
import { TOCService } from './toc.service';

var WMS_BBOX_X_MIN=-1034440;
var WMS_BBOX_Y_MIN=3560031;
var WMS_BBOX_X_MAX=2259829;
var WMS_BBOX_Y_MAX=5822607;
//[493707.6026845637, 4413376, 886332.3973154363, 4755088]


var SATELITE_WMS_URL=["https://wmspro-idearagon.aragon.es/erdas-iws/ogc/wms/AragonFoto"];
var SATELITE_WMS_LAYERS=["modis,spot,landsat,orto_reciente"];
var overlay, selectControl;
var featurePopup;
var pointerOnPopup=false;


@Injectable({
  providedIn: 'root',
})
export class MapService {
  map: Map;
  map_projection;
  baseLayer;
  attributionControl;
  
  queryableLayer = "NADA"

  wmtsBaseLayer;
  bottomBaseLayer;
  interactiveLayers=new Array();
  DOTS_PER_M=3571.4285;
  constructor() {
  }


  initMap(){


    proj4.defs("EPSG:3042","+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
    proj4.defs("EPSG:25830","+proj=utm +zone=30 +ellps=GRS80 +units=m +no_defs");
    proj4.defs("EPSG:25831","+proj=utm +zone=31 +ellps=GRS80 +units=m +no_defs");
    proj4.defs('EPSG:4326', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees');
    register(proj4);



    this.map_projection = get('EPSG:25830');
    this.map_projection.setExtent([WMS_BBOX_X_MIN, WMS_BBOX_Y_MIN, WMS_BBOX_X_MAX, WMS_BBOX_Y_MAX]);
  
    // estas 3 líneas son para la cuadrícula
    this.map_projection.setWorldExtent([-10, 36, 5, 45]);
    this.map_projection.setGlobal(false);
    this.map_projection.setGetPointResolution(function (resolution) { return resolution; });
    var options = {
      projection : this.map_projection,
//			maxExtent : new OpenLayers.Bounds(WMS_BBOX_X_MIN, WMS_BBOX_Y_MIN, WMS_BBOX_X_MAX, WMS_BBOX_Y_MAX),
      center : [675533, 4589000],
      zoom:8

  };

  
    this.wmtsBaseLayer=new TileLayer();
    this.wmtsBaseLayer.setVisible(false);
    this.bottomBaseLayer=new Image();
	  this.bottomBaseLayer.setVisible(false);

    this.baseLayer =new Image({
      source: new ImageWMS({
        params: {'LAYERS': SATELITE_WMS_LAYERS[0],'VERSION':'1.1.1','FORMAT':'image/jpeg'},
        url: SATELITE_WMS_URL[0],
        projection: this.map_projection
      })
    });      
    
    var layers = new Array();
    layers.push(this.baseLayer);
    layers.push(this.wmtsBaseLayer)
    layers.push(this.bottomBaseLayer)

    var aragon =new Image({
      source: new ImageWMS({
        params: {'LAYERS': "LimAragon",'VERSION':'1.1.1','FORMAT':'image/png','TRANSPARENT':'TRUE'},
        url: "https://icearagon.aragon.es/Visor2D?service=WMS&version=1.1.0&request=GetMap",
        projection: this.map_projection
      })
    });


    
    layers.push(aragon)



     
    this.attributionControl = new Attribution({
      tipLabel:"Información capas visibles"
    });
    this.map = new Map({
      layers: layers,
      target: 'map',
      view: new View(options),
    });

    this.map.addControl(new Rotate({"autoHide":false,tipLabel:"Flecha de norte"}));
    this.map.addControl(new ScaleLine());
    this.map.addControl(this.attributionControl);

    var tocButton = new Control({element: document.getElementById("toc")!});
    this.map.addControl(tocButton);
    
    this.baseLayer.getSource()!.setAttributions("Fondo: AragonFoto");

    selectControl =new Select({
      filter: function (feature, layer) {
        return (feature.getGeometry()!.getType()!='Point');
      }});
    this.map.addInteraction(selectControl);


    overlay = new Overlay({
      element: document.getElementById('overlay')!,
      positioning: 'bottom-left'
    });
  
    overlay.setMap(this.map);
    overlay.getElement().style.display =  'none';



   //}

    
  
}

addEvents(tocService){

  

  this.map.on('pointerclick', evt => {
    this.overlay(evt)
  });

  this.map.on('pointermove', evt => {
    this.overlay(evt)
  });

  this.map.on('singleclick', evt => {
    this.overlay(evt)
  });

  this.map.getView().on('change:resolution', () => {
    var escala = Math.round(this.map.getView().getResolution()!*this.DOTS_PER_M);
    var index = this.queryableLayer;
    if (index !="NADA"){
      var escala_info =tocService.capas[index].escala_info;
      if (escala > escala_info){
        tocService.removeInteractiveLayer();
        
      }
    }
  });
}

overlay(evt){

  if (pointerOnPopup) {
    return ;
  }
  document.body.style.cursor =  '';
  let isFirstOne = true;
  var feature = this.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    
  
  if (evt.type === 'singleclick'){
    if (feature.get("editable") ){
      selectControl.getFeatures().clear();
      selectControl.getFeatures().push(feature);
      //showEditionForm(feature);
      return feature;
    }
    else if ( isFirstOne) {
      isFirstOne = false;
      //singleClickAction(feature);
      return null;
    }
  }
    

    if (featurePopup && (featurePopup==feature)) {
      if (feature.getGeometry()!.getType()!='Point') {
        selectControl.getFeatures().clear();
        selectControl.getFeatures().push(feature);
      }
      return feature;
    }

    var mostrarPopup=false;
    var textoHtmlAMostrar = '<a href="#" onclick="closePopup()" id="popup-closer" class="ol-popup-closer">';

      var campos = feature.get("atributos");

      if (campos) {
        mostrarPopup=true;
        var camposVis = Object.keys(campos);
        for (var i=0; i<camposVis.length; i++) {
          if (feature.getProperties()[camposVis[i]]) {
            var _value = feature.getProperties()[camposVis[i]];
            if (_value) {
              if (_value.toString().indexOf('http') == 0) {
                _value = '<a href="' + _value + '" title="Enlace">' + _value + '</a>';
              }
            }
            textoHtmlAMostrar+='<div data-ex-content=".label"><span><b>'+campos[camposVis[i]]+':&nbsp;</b><span>'+ _value +'</span></div></strong>';
          }
        }
      }
  



    if (mostrarPopup) {
      var positioning = ''
      if(evt.pixel[1] > window.screen.height/2){
        positioning = 'bottom-';
      }else{
        positioning = 'top-';
      }

      if(evt.pixel[0] > window.screen.width/2){
        positioning += 'right';
      }else{
        positioning += 'left';
      }
      overlay.setPositioning(positioning);
      overlay.setPosition(evt.coordinate);
      overlay.getElement().innerHTML = textoHtmlAMostrar;
      //overlay.getElement().innerHTML = "<div style='width:60px'>HOLAHOLA</div>";
      selectControl.getFeatures().clear();
      if (feature.getGeometry()!.getType()!='Point') {
        selectControl.getFeatures().push(feature);
      }
      featurePopup=feature;
      return feature;
    }else{
      return null;
    }

    
  });
  if (feature) {
    overlay.getElement().style.display =  '';
  } else /*if(evt.type=='pointerclick')*/{
    selectControl.getFeatures().clear();
    overlay.getElement().style.display =  'none';
  }
  //overlay.getElement().className = feature ? 'summary' : 'none';*/
  document.body.style.cursor = feature ? 'pointer' : '';
}




}
