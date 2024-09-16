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
	stylesLayer: any;

  constructor(private mapService:MapService, private infoService: InfoService, public modalService: ModalService,) {
  }

  capas_anadidas: any[] = [];
  capas_visibles: any[] = [];

  //server = "https://idearagondes.aragon.es";
  toc_group;
  orden_capas : any[]= [];
  capas : any[]= [];
  grupos : any[]=[];
  gruposClean : any[]=[];
  wmts_capabilities : any[] = [];
  serviciosWMTS : any[]= [];
  capasWMSSeleccionadas : any[]=[];
  toc_nuevo = true;
  default_layers : any[]= [];
	items_capas: any[] = [];
	items_anyos: any[] =[];
	items_anyo_defecto: any[] =[];
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
  parseAnyos(anyos): any[]{
    let res :any= [];
    if(anyos!=null){
      for(var i = 0; i<anyos.length;i++){
          res.push({
            value: anyos[i]+"",
            text: anyos[i]+""
           }) 
       }
    }

    return res;
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
		var capaOL = this.getOLLayer("caption", listaCapas[i].titulo);
		var pk_current_capa = listaCapas[i].pk;
		var current_class_css = (class_css != '' ? class_css : 'toc_other');

		this.capas[pk_current_capa] = listaCapas[i];
		this.capas[pk_current_capa].type = type;
		this.capas[pk_current_capa].class_css = current_class_css;
		this.capas[pk_current_capa].temas = txt;
		this.capas[pk_current_capa].oneVisLayerGroup = oneVisLayerGroup;
		
		if (capaOL){
			var params = capaOL.getSource().getParams();
			params.STYLES+=","+(listaCapas[i].styles ?listaCapas[i].styles:"");
			params.LAYERS+=","+(listaCapas[i].layers ?listaCapas[i].layers:"");
			capaOL.getSource().updateParams(params); 
			capaOL.set("pk",capaOL.get("pk")+","+pk_current_capa);
			capaOL.set("dobleGrupo",true);
			this.capas_anadidas.splice(listaCapas[i].orden, 0, pk_current_capa);
			
		}
		else{
			var ollayer = this.addLayer(pk_current_capa, listaCapas[i].visible=="t");
			ollayer.setZIndex(listaCapas.length-i+1);
		 
		}
	}
}
mergeAnyos(anyos1, anyos2){
	var anyos=anyos1;
	for (var i=0; i<anyos2.length; i++){
     				if (anyos.indexOf(anyos2[i])<0) {
     					anyos.push(anyos2[i]);
     				}
     }
     anyos.sort();
     return anyos;
}
 parseTOC(data?, txt?, class_css?, oneVisLayerGroup?, current_theme?, accesible?) {
	
	
	if ('capasWMS' in data) {
		if (accesible){
	     data.capasWMS.forEach(capa => {
	     this.capas[capa.pk]=capa;
	     if (capa.anyos){
	     	this.items_anyos[capa.pk+""]=this.parseAnyos(capa.anyos);
	     	this.items_anyo_defecto[capa.pk+""]=capa.anyo_defecto;
	     }else if ((capa.grupo==16)&& capa.anyos_fija &&  capa.anyos_fija){
		     this.items_anyos[capa.pk+""]=this.parseAnyos(this.mergeAnyos( capa.anyos_fija,  capa.anyos_fija));
		     this.items_anyo_defecto[capa.pk+""]=capa.anyo_defecto;

	     }
	        		this.items_capas.splice(capa.orden,0,{
        		value:capa.pk+"",
        		grupo:capa.grupo+"",
        		text: capa.titulo+(capa.grupo==16 ? "":" ("+data.titulo+")")
       		})     
    	})
		}
		else{
			this.includeListaCapas(data.capasWMS, txt, class_css, 'wms', oneVisLayerGroup, current_theme);
		}
	
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
		this.parseTOC(data.grupos[i], txt + ((txt != '')? " > " : '') + data.grupos[i].titulo, current_class_css, grupo_excluyente, current_theme,accesible);
	}

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
			console.log(data)
		//	this.gruposClean = data.grupos
			this.parseTOC(data, '', '',null,null, accesible);
			if (!accesible){
			var layers = this.toc_group.getLayers();
	for (var i = 0; i < layers.getLength(); i++) {
		var ollayer = layers.item(i);
		this.capasWMSSeleccionadas = this.capasWMSSeleccionadas.concat(ollayer.getProperties());
	}
 			}
		},

		error: 		function(data, textStatus, errorThrown) {
			console.log('Error obteniendo el listado de capas. State: ' + data.readyState + ", Status:" + data.status);
			return false;
		}
	});


}

setStyles(styles){
	this.stylesLayer = styles;
}

getStyle(capa, grupo_borrar){
    var style="";
 	if (capa.grupo==16){
 		if (grupo_borrar==14){ // red fija
 			style = capa.styles_movil;
 		}
 		else{
 			style = capa.styles_fija;
 		}
 	}
 	return style;
 }
 
removeLayerWMS(capaOL,pks,indexToKeep, estilo){
var params = capaOL.getSource().getParams();
				params.STYLES=estilo;

				params.LAYERS=params.LAYERS.split(",")[indexToKeep];
				capaOL.getSource().updateParams(params); 
				capaOL.set("pk",pks[indexToKeep]);
				
return capaOL.get("pk");
}
hideRed(grupo){
var nuevas=[];
this.capas_anadidas.forEach(idx => {
 	var capa = this.capas[idx];
 	var capaOL =this.getOLLayer("caption",capa.titulo);

      if (capa.grupo==grupo){
      		this.removeInteractiveLayer(capa.layers);
      		if (capaOL.get("pk")==capa.pk){//exclusiva de este grupo 
      			capaOL.setVisible(false);
      			
      		}
      		else{
      			var pks = capaOL.get("pk").split(",");
      			if (pks.length>1){  // todavía no se había actualizado
      				var idxpk=0;
      				if (pks[0]==capa.pk){
      					idxpk=1;
      				}
      	
       				this.removeLayerWMS(capaOL,pks,idxpk, this.getStyle(capa, grupo));
       				capaOL.set("visible",capaOL.getVisible());
       				nuevas=nuevas.concat(capaOL.getProperties());
      			}
      		}
      	}
      else if (capa.grupo==16){// es de ambas
      		
      		var params = capaOL.getSource().getParams();
			params.STYLES=this.getStyle(capa, grupo);
      		capaOL.getSource().updateParams(params);
      		capaOL.visible=capaOL.getVisible(); 
      		nuevas=nuevas.concat(capaOL.getProperties());
      	}
      	else if (!capaOL.get("dobleGrupo")){  // la capa pertenece en exclusiva al otro grupo
      		capaOL.visible=capaOL.getVisible(); 
      		nuevas=nuevas.concat(capaOL.getProperties());
      	
      	}
      	else{  // es compartida con el otro grupo
      		var pks = capaOL.get("pk").split(",");
      		if (pks.length>1){  // todavía no se había actualizado
      			var idxpk=0;
      			if (pks[0]!=capa.pk){
      				idxpk=1;
      			}
       			this.removeLayerWMS(capaOL,pks,idxpk, this.getStyle(capa, grupo));
       			capaOL.set("visible",capaOL.getVisible());
       			nuevas=nuevas.concat(capaOL.getProperties());
      		}
      		
      }
    
      
    });
     this.capasWMSSeleccionadas=nuevas;
}

changeRed(grupo){
var nuevas=[];

this.capas_anadidas.forEach(idx => {
 	var capa = this.capas[idx];
      var capaOL ;
     if (capa.grupo==16){ // ambas
      	capaOL =this.getOLLayer("pk",capa.pk);
      	var params = capaOL.getSource().getParams();
      	if (grupo==14){ // red fija
 			params.STYLES = capa.styles_fija;
 		}
 		else{
 			params.STYLES = capa.styles_movil;
 		}
		
		capaOL.getSource().updateParams(params); 
		capaOL.set("visible",capaOL.getVisible());
		 nuevas=nuevas.concat(capaOL.getProperties());
      	
      }
      
      else{  // es de fija o móvil
      	capaOL =this.getOLLayer("caption",capa.titulo);
      	
      	 if (capa.grupo==grupo){ 
      	 	
      		capaOL =this.getOLLayer("caption",capa.titulo);
      		var anyo=capaOL.get("anyo");
      		if (capaOL.get("pk")!=capa.pk){     			 // es capa que fusiona capa de red fija y capa de red móvil
      			var params = capaOL.getSource().getParams();
				params.STYLES="";
				params.LAYERS=capa.layers;
				capaOL.getSource().updateParams(params); 
				capaOL.set("pk",capa.pk);
				
				
			}
			if (capaOL.getVisible()){ 
      	 		this.changeInfoLayer(capaOL.get("pk"),anyo);
      	 	}
			capaOL.set("visible",capaOL.getVisible());
      		 nuevas=nuevas.concat(capaOL.getProperties());
      	}
      	else{
      		this.removeInteractiveLayer(capa.layers);
      	if (!capaOL.get("dobleGrupo")){  // es exclusiva de la otra red 
      		capaOL.setVisible(false);
      	}
      	}	 
      }
     
     
    });
     this.capasWMSSeleccionadas=nuevas;
}
addRed(grupo){
var nuevas=[];

 this.capas_anadidas.forEach(idx => {
 	var capa = this.capas[idx];
      console.log(capa)
      var capaOL ;
      if (capa.grupo==grupo){
      		capaOL =this.getOLLayer("caption",capa.titulo);
      		
      		if (capaOL.get("pk")!=capa.pk){     			 // es capa que fusiona capa de red fija y capa de red móvil
      			var params = capaOL.getSource().getParams();
				params.STYLES=this.capas[capaOL.get("pk")].styles+","+capa.styles;
				params.LAYERS+=","+capa.layers;
				capaOL.getSource().updateParams(params); 
				capaOL.set("pk",capaOL.get("pk")+","+capa.pk);
				
				
			}
      		if (capaOL.getVisible()){ 
      			this.changeInfoLayer(capaOL.get("pk"),capaOL.get("anyo"));
      		}
      }
      else if (capa.grupo==16){ // ambas
      	capaOL =this.getOLLayer("pk",capa.pk);
      	var params = capaOL.getSource().getParams();
		params.STYLES=capa.styles;
		capaOL.getSource().updateParams(params); 
		
      	
      }
     else{
    
      	capaOL =this.getOLLayer("pk",capa.pk);
      	if (capaOL && capaOL.get("dobleGrupo")){  // no es exclusiva de la otra red
      		capaOL=null; // no la añado pq se añadirá cuando coincidan los grupos
      	}
      	
      }
      if (capaOL){
      capaOL.set("visible",capaOL.getVisible());
      	nuevas=nuevas.concat(capaOL.getProperties());
      }
    });
     this.capasWMSSeleccionadas=nuevas;
}

addLayer(index, visible) {
	// volver a marcar el boton activo porque se desmarca al hacer click en otro button
	//$("#tocAddButton").addClass("ui-btn-active");

	var capa = this.capas[index];
	//$("#layer_" + capa.pk).remove();
	var es_visible = (visible != null ? visible : capa.visible);
	var buttonTitle = capa.type == "wfs" ? "Ver filtros" : "Ver leyenda";

	this.capas_anadidas.splice(capa.orden, 0, index);
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


addWMSLayer(index, layer_visible, style: any = '') {

	var caption = this.capas[index].titulo;
	var url = this.capas[index].url ;
	var layers = this.capas[index].layers;

	var styles = (this.capas[index].styles==null?"":this.capas[index].styles);


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
	layer.set('visible', visible);
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
	var index = layer.get("pk");
	var escala_info =layer.get("escala_info");
	if (escala_info && layer.getVisible() && $("#info_layer_opt_"+index).length==0){
			this.queryable.push(layer);
			//$("#info_layer").append("<option id='info_layer_opt_"+index+"' value='"+index+"'>"+layer.get("caption")+"</option>")

	}
}

removeQueryableLayer(layer){
	/** 
	var index = layer.get("pk");
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
changeInfoLayer(pks, anyo){
	
	if (pks!="-1"){
		var indexes=pks.split(",");
		for (var k=0;k<indexes.length;k++){ 
		var index=indexes[k];
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
					for (var j=0; j<features.length;j++){
						var feature = features[j];
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
					var interactiveLayer = this.addInteractiveLayer(this.capas[index].url,layerName,campos,anyo,this.capas[index].campo_anyo,this.capas[index].titulo);
					interactiveLayer.set("grupo",this.capas[index].grupo);
					this.mapService.interactiveLayers.push(interactiveLayer);
				}
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
		layer.set('visible', layer.getVisible());
		
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

setVisibleLayer(layer, visible) {
	layer.setVisible(visible);
	layer.set("visible",visible);
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
	layer.set("anyo",time);
	layer.getSource().updateParams(params);
}

}