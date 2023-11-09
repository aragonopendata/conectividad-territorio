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
import { InfoService } from './info.service';
import { ModalService } from './modal.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TOCService {

  constructor(private mapService:MapService, private infoService: InfoService, public modalService: ModalService,) {
  }

  capas_anadidas: any[] = [];
  capas_visibles: any[] = [];

  //server = "https://idearagondes.aragon.es";
  toc_group;
  capas : any[]= [];
  grupos : any[]=[];
  wmts_capabilities : any[] = [];
  serviciosWMTS : any[]= [];

  toc_nuevo = true;
  default_layers : any[]= [];

  idx_class_css = 0;
  list_class_css : any[]= [];

  layerList :any= null;
  tocDialogCreated=false;

  visibleClickTimestamp=0;
  croquisClickTimestamp=0;

  queryable: any[] = [];

  featureLayer;

/**
 * Elimina los acentos de una cadena
 * @param entry cadena de texto
 * @returns cadena de texto sin acentos
 */
 asciify(entry) {
	entry = entry.toString().toLowerCase();
	entry = entry.replace(/á/g, 'a');
	entry = entry.replace(/é/g, 'e');
	entry = entry.replace(/í/g, 'i');
	entry = entry.replace(/ó/g, 'o');
	entry = entry.replace(/ú/g, 'u');
	entry = entry.replace(/ñ/g, 'n');
	entry = entry.replace(/ü/g, 'u');
	entry = entry.replace(/ç/g, 'z');
	entry = entry.replace(/\'/g, "");

	return entry;
}

get_class_css(titulo) {
	if (titulo in this.list_class_css) {
		return this.list_class_css[titulo];
	} else {
		var value_css = 'toc_theme_' + this.idx_class_css;
		this.list_class_css[titulo] = value_css;

		this.idx_class_css++;
	}
	return this.list_class_css[titulo];
}

 includeListaCapas(listaCapas, txt, class_css, type, oneVisLayerGroup, current_theme) {

	var hiddenLayers=new Array();
	for (var i = 0; i<listaCapas.length;i++) {
		var pk_current_capa = listaCapas[i].pk;
		var current_class_css = (class_css != '' ? class_css : 'toc_other');

		this.capas[pk_current_capa] = listaCapas[i];
		this.capas[pk_current_capa].type = type;
		this.capas[pk_current_capa].class_css = current_class_css;
		this.capas[pk_current_capa].temas = txt;
		this.capas[pk_current_capa].oneVisLayerGroup = oneVisLayerGroup;
		


		this.addLayer(pk_current_capa, listaCapas[i].visible=="t");
	}
}

 parseTOC(data?, txt?, class_css?, oneVisLayerGroup?, current_theme?) {
	if ('capasWMS' in data) {
		this.includeListaCapas(data.capasWMS, txt, class_css, 'wms', oneVisLayerGroup, current_theme);
	}

	if ('capasWMTS' in data) {
		this.includeListaCapas(data.capasWMTS, txt, class_css, 'wmts', oneVisLayerGroup, current_theme);
	}

	if ('capasEspeciales' in data) {
    	this.includeListaCapas(data.capasEspeciales, txt, class_css, 'special', oneVisLayerGroup, current_theme);
	}

	if ('capasWFS' in data) {
		this.includeListaCapas(data.capasWFS, txt, class_css, 'wfs', oneVisLayerGroup, current_theme);
	}

	for (var i = 0; i<data.grupos.length;i++) {
		var current_class_css = '';

		if (class_css == "") {

			current_class_css = this.get_class_css(data.grupos[i].titulo);
			this.grupos[data.grupos[i].pk]=new Object();
			this.grupos[data.grupos[i].pk].class_css=current_class_css;
			this.grupos[data.grupos[i].pk].titulo=data.grupos[i].titulo;
			current_theme = data.grupos[i].titulo;
		} else {
			current_class_css = class_css;
		}
		var grupo_excluyente = oneVisLayerGroup;
		if ((grupo_excluyente == null) && (data.grupos[i].capas_excluyentes == "t")) {
			grupo_excluyente = data.grupos[i].pk;
		}
		this.parseTOC(data.grupos[i], txt + ((txt != '')? " > " : '') + data.grupos[i].titulo, current_class_css, grupo_excluyente, current_theme);
	}
}



 initTOC() {

	this.toc_group = new LayerGroup({ });
	this.mapService.map.addLayer(this.toc_group);
	
	$.ajax({
		
		url:    environment.url +"/ws-cobertura/config/toc",
		type: 'GET',
		async: false, //para asegurar que se inicializa la gui de la lista de capas
		success: (data) => {
			this.parseTOC(data, '', '')

		},

		error: 		function(data, textStatus, errorThrown) {
			console.log('Error obteniendo el listado de capas. State: ' + data.readyState + ", Status:" + data.status);
			return false;
		}
	});


}




addLayer(index, visible) {
	// volver a marcar el boton activo porque se desmarca al hacer click en otro button
	//$("#tocAddButton").addClass("ui-btn-active");

	var capa = this.capas[index];
	//$("#layer_" + capa.pk).remove();
	var es_visible = (visible != null ? visible : capa.visible);
	var buttonTitle = capa.type == "wfs" ? "Ver filtros" : "Ver leyenda";

	this.capas_anadidas.push(index)
	if(visible){
		this.capas_visibles.push(index);
	}

	// TODO: Ver que pasa con las capas del usuario
	var olLayer;
	if (capa.type == 'wms') {
		olLayer = this.addWMSLayer(index, es_visible);
	}
	else if (capa.type == 'wmts') {
		olLayer = this.addWMTSLayer(index, es_visible);
	}
	else if (capa.type == 'special') {
    	olLayer = this.addSpecialLayer(index, es_visible);
	}
	else if (capa.type == 'wfs') {
		olLayer = this.addWFSLayer(index, es_visible);
		//$("#layer_" + capa.pk).trigger("create");	// needed to show icons
	}


	this.setLayerTime(olLayer, capa.anyo_defecto);
	
	//this.addLegend(olLayer);


	if (this.layerList) {
		this.layerList.remove('oculto', capa.pk);
	}

	return olLayer;

}


addWMSLayer(index, layer_visible) {
	var caption = this.capas[index].titulo;
	var url = this.capas[index].url ;
	var layers = this.capas[index].layers;
	var styles = (this.capas[index].styles?this.capas[index].styles:"");

	var version = this.capas[index].version;
	var format = this.capas[index].format;
	var visible = (layer_visible == null ? this.capas[index].visible : layer_visible);
	var opacity = this.capas[index].opacidad;
	var tiled = this.capas[index].teselada == "t";
	var layer;
	if (tiled) {
		layer = new Tile({
			source: new TileWMS({
				params: {'LAYERS': layers, 'VERSION':version, 'FORMAT':format, 'STYLES':styles},
				url: url,
				projection: this.mapService.map_projection
			})
		});
	} else {
		layer = new Image({
			source: new ImageWMS({
				params: {'LAYERS': layers, 'VERSION':version, 'FORMAT':format, 'STYLES':styles},
				url: url,
				projection: this.mapService.map_projection
			})
		});
	}

	layer.setVisible(visible);
	//layer.setOpacity(opacity);
	layer.set('idx', index);
	layer.set('pk', this.capas[index].pk);
	layer.set('caption', caption);
	layer.set('legend', this.capas[index].leyenda);
	layer.set('glg', this.capas[index].glg);
	layer.set('escala_info', this.capas[index].escala_info);

	this.addQueryableLayer(layer);
	var layers2 = this.toc_group.getLayers();
	layers2.push(layer);
	this.toc_group.setLayers(layers2);
	return layer;
}
addQueryableLayer(layer){
	var index = layer.get("idx");
	var escala_info =layer.get("escala_info");
	if (escala_info && layer.getVisible() && $("#info_layer_opt_"+index).length==0){
			this.queryable.push(layer);
			//$("#info_layer").append("<option id='info_layer_opt_"+index+"' value='"+index+"'>"+layer.get("caption")+"</option>")

	}
}

removeQueryableLayer(layer){
	/** 
	var index = layer.get("idx");
	if ($("#info_layer").val()==index){
		$("#info_layer").val("-1");
		try{
		$("#info_layer").selectmenu("refresh");
		}
		catch(err){
			console.log(err);
		}
		removeInteractiveLayer();
	}
	$("#info_layer_opt_"+index).remove();*/
}

removeInteractiveLayer(layer?){

	for (var i=0; i<this.mapService.interactiveLayers.length ;i++){
		if(layer){
			if(layer==this.mapService.interactiveLayers[i].values_.layer){
				this.mapService.map.removeLayer(this.mapService.interactiveLayers[i]);
			}
		}else{
			this.mapService.map.removeLayer(this.mapService.interactiveLayers[i]);
		}
	}
	if(layer){

		
		this.mapService.interactiveLayers = this.mapService.interactiveLayers.filter(el =>{
			return el.values_.layer!=layer;
		})
	}else{
		this.mapService.interactiveLayers = new Array();
	}
	
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
		time = "&CQL_FILTER="+campo_anyo+"="+anyo+""
	}

	var vectorSource = new VectorSource({
		format: new GeoJSON({dataProjection: projection, featureProjection:projection}) ,
		url: url+'?service=WFS&' +
			'version=1.0.0&request=GetFeature&typename='+layer +time+
			'&outputFormat=application/json&srsname=EPSG:25830'
	});
	
	vectorSource.on('addfeature',function(ev){
		ev.feature!.set("layer", layer+"_interactive");
		ev.feature!.set("atributos",campos);
		if(anyo){
			ev.feature!.set('titulo', titulo+" ("+anyo+")");
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
	wfs_layer.set('layer', layer);
	
	
	this.mapService.map.addLayer(wfs_layer);
	return wfs_layer;
}
changeInfoLayer(index, anyo){
	
	if (index!="-1"){
		this.removeInteractiveLayer(this.capas[index].layers);
		var escala_info = this.capas[index].escala_info;
		var escala = Math.round(this.mapService.map.getView().getResolution()!*this.mapService.DOTS_PER_M);
		if (false){
			//this.modalService.open("aviso_escala")
			this.modalService.open('aviso_escala')
			//creaVentanaAviso("La capa seleccionada no se puede consultar a la escala actual (disponible a partir de 1:"+escala_info+")",false,"tocDialog");
			/**$("#info_layer").val("-1");
			try{
				$("#info_layer").selectmenu("refresh");
				}
				catch(err){
					console.log(err);
				}*/
				console.log("error con la escala")
		}
		else{

			var projection = new Projection({code:"EPSG:25830"});
			var layers = this.infoService.queryableLayers[index];
			for (var i=0; i<layers.length;i++){
				var layerName = layers[i];

				var campos = this.infoService.fieldsQueryableLayers[layerName];
				if (this.capas[index].type && this.capas[index].type=="special"){
					try{
					var layer = this.getOLLayer("idx",index);
					var features = layer.getSource().getFeatures();
					for (var i=0; i<features.length;i++){
						var feature = features[i];
						feature.set("atributos",campos);
					}
					layer.set("keepLayer",true);
					this.mapService.interactiveLayers.push(layer);
					}
					catch(err){
						console.log("No es capa vectorial "+err);
					}
				}
				else{
					this.mapService.interactiveLayers.push(this.addInteractiveLayer(this.capas[index].url,layerName,campos,anyo,this.capas[index].campo_anyo,this.capas[index].titulo));
				}
			}
		}
	}
}

addWMTSLayer(index, visible) {
	var capa = this.capas[index];

	if (!this.wmts_capabilities[capa.wmts]) {
		this.loadWMTSCapabilities(this.serviciosWMTS, capa.wmts);
	}

	var capabilities = this.wmts_capabilities[capa.wmts];
	if (capabilities) {
		var layer;
		var parser = new WMTSCapabilities();
		var result = parser.read(capabilities);
		var options = optionsFromCapabilities(result,
				{layer: capa.layer, matrixSet: capa.gridset, format: capa.format});

		layer = new Tile({
			source: new WMTS(options!)
		});
		layer.setVisible(visible == null ? capa.visible: visible);
		//layer.setOpacity(capa.opacidad);
		layer.set('idx', index);
		layer.set('pk', capa.pk);
		layer.set('caption', capa.titulo);
		layer.set('glg', capa.glg);
		// TODO: Ver de donde se saca esto
		//layer.set('legend', legendURL);
		layer.set('legend', capa.leyenda);
		layer.set('wmts_pk',capa.wmts);
		// TODO: Revisar si esto debe considerarse o no. Creo que no viene nada de esto en getToc.jsp
		//layer.set('minScale', minScale);
		//layer.set('hidden', hidden);

		var layers = this.toc_group.getLayers();
		layers.push(layer);
		this.toc_group.setLayers(layers);
		return layer;
	} else {
		console.log("Error incluyendo capabilities de WMTS");
	}
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


addSpecialLayer(index, layer_visible){

	var caption = this.capas[index].titulo;

	var visible = (layer_visible == null ? this.capas[index].visible : layer_visible);


	var opacity = this.capas[index].opacity;


	var layer = new Vector();

	eval(this.capas[index].loadjs);


	layer.setVisible(visible);
	//layer.setOpacity(opacity);
	layer.set('idx', index);
	layer.set('pk', this.capas[index].pk);
	layer.set('caption', caption);
	layer.set('legend', this.capas[index].leyenda);
	layer.set('glg', false);
	layer.set('escala_info', this.capas[index].escala_info);

	//this.addQueryableLayer(layer);
	var layers2 = this.toc_group.getLayers();
	layers2.push(layer);
	this.toc_group.setLayers(layers2);
	return layer;

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
	  if (layer.get("idx") == layerId) {
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

setVisibleLayer(layer, visible) {
	layer.setVisible(visible);
	if(visible){
		this.capas_visibles.push(layer.get("pk"));
	}else{
		var index = this.capas_visibles.indexOf(layer.get("pk"));
		if (index !== -1) {
			this.capas_visibles = this.capas_visibles.splice(index, 1);
		}

	}
	
}


setLayerTime(layer: any, time) {
	let params = layer.getSource().getParams();
	params.TIME = time

	layer.getSource().updateParams(params);
}

}