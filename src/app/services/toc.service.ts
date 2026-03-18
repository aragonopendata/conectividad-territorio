import { Injectable } from '@angular/core';
import LayerGroup from 'ol/layer/Group';
import Tile from 'ol/layer/Tile';
import Vector from 'ol/layer/Vector';
import Image from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import TileWMS from 'ol/source/TileWMS';
import WMTS from 'ol/source/WMTS';
import {optionsFromCapabilities} from 'ol/source/WMTS';
import {bbox} from 'ol/loadingstrategy';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import { MapService } from './map.service';
import Layer from 'ol/layer/Layer';
import Projection from 'ol/proj/Projection';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';

import Fill from 'ol/style/Fill';
import Circle from 'ol/style/Circle';
import Stroke from 'ol/style/Stroke';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import { ModalService } from './modal.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TOCService {
	stylesLayer: any;

  constructor(private mapService:MapService,  public modalService: ModalService,) {
  }

	layer="t_cobertura_weplan";
	ollayer;
	items_fechas;
	fecha;
  toc_group;
  wmts_capabilities : any[] = [];
  serviciosWMTS : any[]= [];
    tocDialogCreated=false;

  queryable: any[] = [];

  featureLayer;
interactiveLayers;
campos={/*"municipio": "Municipio","tipo_cobertura": "Tipo de red",*/"categoria": "Intensidad de la señal", "cobertura_media": "Intensidad media", "cobertura_mediciones": "Nº de medidas" };

  parseAnyos(anyos): any[]{
    let res :any= [];
    if(anyos!=null){
      for(var i = 0; i<anyos.length;i++){
      	var texto=anyos[i]+"";
      	if (texto.length==6){
      		texto=texto.substr(0,4)+"-"+texto.substr(4,6);
      	}
          res.push({
            value:texto,
            text: texto
           }) 
       }
    }

    return res;
  }



parseTime(fecha){
var texto=fecha+"";
     		texto=texto.substr(0,4)+"-"+texto.substr(4,6);
     		return texto;
}
 initTOC(accesible) {

	this.toc_group = new LayerGroup({ });
	if (!accesible){
		this.mapService.map.addLayer(this.toc_group);
	}
	$.ajax({
		
		url:    environment.url +"/ws-cobertura/config/toc",
		type: 'GET',
		async: false, //para asegurar que se inicializa la gui de la lista de capas
		success: (data) => {
			var capa=data.grupos[0].capasWMS[0];
			this.items_fechas=this.parseAnyos(capa.anyos);
			this.fecha=this.parseTime(capa.anyo_defecto);
			if (!accesible){
			this.addWMSLayer(capa.url,capa.layers,this.fecha,true);
			this.interactiveLayers=new Object();
			this.interactiveLayers[capa.layers+"_2g"]=this.addInteractiveLayer(capa.url,capa.layers+"_2g",this.campos,this.fecha,'fecha',"Intensidad de la señal 2G")
			this.interactiveLayers[capa.layers+"_3g"]=this.addInteractiveLayer(capa.url,capa.layers+"_3g",this.campos,this.fecha,'fecha',"Intensidad de la señal 3G")
			this.interactiveLayers[capa.layers+"_4g"]=this.addInteractiveLayer(capa.url,capa.layers+"_4g",this.campos,this.fecha,'fecha',"Intensidad de la señal 4G")
			this.interactiveLayers[capa.layers+"_5g"]=this.addInteractiveLayer(capa.url,capa.layers+"_5g",this.campos,this.fecha,'fecha',"Intensidad de la señal 5G")
			}
			
		},

		error: 		function(data, textStatus, errorThrown) {
			console.log('Error obteniendo fechas disponibles. State: ' + data.readyState + ", Status:" + data.status);
			return false;
		}
	});


}



addWMSLayer(url,layers,time, visible) {
	 this.ollayer = new Image({
			source: new ImageWMS({
				params: {'LAYERS': layers,'TIME':time},
				url: url,
				projection: this.mapService.map_projection
			})
		});
	

	this.ollayer.setVisible(visible);
	
	var layers2 = this.toc_group.getLayers();
	layers2.push(this.ollayer);
	this.toc_group.setLayers(layers2);
	
}



addFeature(data){

	var vectorSource = new VectorSource({
		features: new GeoJSON().readFeatures(data)
	  });
	  var extent = vectorSource.getExtent();

	  var fillColor = 'rgba(255, 255, 255,0.01)';
	  var fill = new Fill({
		color: fillColor
	  });
	  var strokeColor = 'rgba(245, 206, 66,1)';
	  var stroke = new Stroke({
		color:strokeColor,
		width: 3
	  });

	  var wfs_layer = new VectorLayer({
		source: vectorSource,
		style: new Style({
		  stroke: stroke,
		  fill: fill
		}),
	  });
	  this.featureLayer = wfs_layer;

	  this.mapService.map.addLayer(wfs_layer);
	  this.mapService.map.getView().fit(extent);
}

removeFeature(){
	if(this.featureLayer){
		this.mapService.map.removeLayer(this.featureLayer);
	}
	
}

addInteractiveLayer(url,layer,campos,anyo,campo_anyo,titulo){
	var projection = new Projection({code:"EPSG:25830"});


	var time = "";
	if(anyo && campo_anyo){
		
		time = "&CQL_FILTER="+campo_anyo+"='"+anyo+"'";
	}

	var vectorSource = new VectorSource({
		format: new GeoJSON({dataProjection: projection, featureProjection:projection}) ,
		url: /*url+'?service=WFS&' +
			'version=1.0.0&request=GetFeature&typename='+layer +time+
			'&outputFormat=application/json&srsname=EPSG:25830'*/
			 () => {
    return url +
      '?service=WFS&version=1.0.0&request=GetFeature' +
      '&typename=' + layer +
      "&CQL_FILTER=fecha='" + this.fecha + "'" +
      '&outputFormat=application/json' +
      '&srsname=EPSG:25830';
  }
	});
	
	vectorSource.on('addfeature',(ev) => {
		ev.feature!.set("layer", layer+"_interactive");
		ev.feature!.set("atributos",campos);
		if(anyo){
			ev.feature!.set('titulo', titulo+" ("+this.fecha+")");
		}else{
			ev.feature!.set('titulo', titulo);
		}
	});
	var fillColor = 'rgba(255, 255, 255,0)';
	var fill = new Fill({
		color: fillColor
	});
	var stroke = new Stroke({
		color:fillColor,
		width: 5
	});
	var wfs_layer = new VectorLayer({
		source: vectorSource,
		style: new Style({
			image: new Circle({
				fill: fill,
				stroke: stroke,
				radius: 5
			}),
			stroke: stroke,
			fill: fill
		}),

	});
	wfs_layer.set('fecha', anyo);
	wfs_layer.set('layer', layer);
	wfs_layer.set('interactiva', true);
	
	this.mapService.map.addLayer(wfs_layer);
	return wfs_layer;
}




loadWMTSCapabilities(wmts, pk) {
	for(var i = 0; i<wmts.length; i++) {
		if (wmts[i].pk == pk) {
			$.ajax({
				url: wmts[i].url+"?REQUEST=GetCapabilities",
				type: "GET",
				async: false,
				success: function(data) {
					this.wmts_capabilities[pk] = data;
				},
				error: function(jqXHR, textStatus, errorThrown) { console.log("Error al obtener el capabilities de "+wmts.url+" "+textStatus +"\n "+errorThrown);},
				contentType: "text/xml",
				dataType: "text"
			});
			return;
		}
	}
	console.log("No se ha encontrado el wmts con pk=" + pk);
}



addWFSLayer(index, layer_visible) {
	if (this.isLayerAlreadyLoaded(index)) {
		return;
	}
	let layer;

	this.toc_group.getLayers().push(layer);
	return layer;
}


isLayerAlreadyLoaded(layerId) {
	let layers = this.toc_group.getLayers();
	let layer;
	for (let i = 0; i < layers.getLength(); i++) {
	  layer = layers.item(i);
	  if (layer.get("pk") == layerId) {
		return true;
	  }
	}
	return false;
}


getOLLayer(campo, layerIdx) {
	var layers = this.toc_group.getLayers();
	for (var i = 0; i < layers.getLength(); i++) {
		var layer = layers.item(i);
		if (layer.get(campo) == layerIdx) {
			return layer;
		}
	}

}




}