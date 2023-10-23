import { Injectable } from '@angular/core';
import { MapService } from './map.service';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import {optionsFromCapabilities} from 'ol/source/WMTS';
import WMTS from 'ol/source/WMTS';
import XYZ from 'ol/source/XYZ';
import { TOCService } from './toc.service';
import TileWMS from 'ol/source/TileWMS';
import ImageWMS from 'ol/source/ImageWMS';
import { environment } from 'src/environments/environment';
@Injectable({ providedIn: 'root' })
export class BaseLayerService {


    fondos_wms;
    colores_rejilla = new Array();

	constructor(private mapService:MapService, private tocService:TOCService){
		
	}


    initBaseLayers(){
        $.ajax({
		
            url:    environment.url +"/ws-cobertura/config/baseLayers",
            type: 'GET',
            async: false, //para asegurar que se inicializa la gui de la lista de capas
            success:	data => {
                console.log(data)

                this.fondos_wms=data.fondosWMS;
                var visible_pk;
                for (var i=0; i<data.grupos.length;i++){
                    if(data.grupos[i].visible && data.grupos[i].visible=="t"){
                        visible_pk=data.grupos[i].pk;
                    }
    /*
                    $("#fondos").append('<li><a class="btnFondo" id="fondo_'+data.grupos[i].pk+'" href="javascript:setBaseLayer(\''+data.grupos[i].pk+'\')"'+
                            ' data-role="button" data-icon="icon_fondo_'+data.grupos[i].pk+'" data-iconpos="top">'+data.grupos[i].titulo+'</a>'+
                            '<div id="fondo_opts_'+data.grupos[i].pk+'" class="fondo_opts"  style="visibility:hidden;"><select onchange="setBaseLayer(\''+data.grupos[i].pk+'\')" data-mini="true"></select>'+
                    '</li>');
    
                    $("#fondo_"+data.grupos[i].pk).css("background-image",'url("'+img_path+'/'+data.grupos[i].icono+'")');

                    */
                    this.colores_rejilla[data.grupos[i].pk]=data.grupos[i].color_rejilla;
                    /*	$('#fondo_'+data.grupos[i].pk).button();
    
                    $("#fondo_opts_"+data.fondosWMS[i].grupo+" select").selectmenu();*/
                }
				/*
                for (var i=0; i<data.fondosWMS.length;i++){
					$("#fondo_opts_"+data.fondosWMS[i].grupo+" select").append('<option '+(data.fondosWMS[i].visible=="1" ?'selected':'')+' value="'+i+'">'+data.fondosWMS[i].titulo+"</option>");
                    if ($("#fondo_opts_"+data.fondosWMS[i].grupo+" option").length>1){
                        $("#fondo_opts_"+data.fondosWMS[i].grupo).css("visibility","visible");
                    }
                }*/
    
    
                this.setBaseLayer(visible_pk);
                this.mapService.map.updateSize();
                var cmdString = document.location.toString();
				/*
                var fondo =  getInitialParam(cmdString, "FONDO=");
                if (fondo){
                    for (var i=0; i<fondos_wms.length;i++){
                        if (fondos_wms[i].fondo_param==fondo){
                            setBaseLayer(fondos_wms[i].grupo,i);		
                            break;
                        }
                    }
                    
                }*/




                
            },


            error: 		function(data, textStatus, errorThrown) {
                console.log('Error obteniendo el listado de capas. State: ' + data.readyState + ", Status:" + data.status);
                return false;
            }
        });
    
    }



getFondoWMS(pk){
	for (var i=0; i<this.fondos_wms.length;i++){
		if (this.fondos_wms[i].pk==pk){
			return i;
		}
	}
	return 0;
}

updateGraticuleColor(fondo){
	var color = this.colores_rejilla[this.fondos_wms[fondo].grupo];
	/*
	if (this.graticule.strokeStyle_.getColor()!=color){
		graticule.strokeStyle_.setColor(color);
		if (graticule.getMap()){
			// invocamos 2 veces para refrescar (quitarla y ponerla)
			showGraticule();
			showGraticule();
		}
	}*/

}
 setBaseLayer(fondo,opcion?){
	var index = opcion;
	if (!index){
		index = $("#fondo_opts_"+fondo+" select").val();
	}
	else{
		$("#fondo_opts_"+fondo+" select").val(index);
	}
	this.setOneBaseLayer(index,this.mapService.baseLayer);
	$('.btnFondo').removeClass("fondoSelected");
	$('#fondo_'+fondo).addClass("fondoSelected");
	if (this.fondos_wms[index].fondo_base ){
		this.setOneBaseLayer(this.getFondoWMS(this.fondos_wms[index].fondo_base),this.mapService.bottomBaseLayer);
		this.mapService.bottomBaseLayer.setVisible(true);
	}
	else{
		this.mapService.bottomBaseLayer.setVisible(false);
	}
	this.updateGraticuleColor(index);
}
setOneBaseLayer(index,baseLayer){
	var url=this.fondos_wms[index].url;
	var layers= this.fondos_wms[index].layers;
	var styles=(this.fondos_wms[index].styles?this.fondos_wms[index].styles:"");
	var version= this.fondos_wms[index].version;
	var format=this.fondos_wms[index].format;
	var tiled=(this.fondos_wms[index].teselada=="1")||this.fondos_wms[index].teselada==1;
	var opacity=this.fondos_wms[index].opacidad;

	this.mapService.attributionControl.setCollapsible(true);
	if (this.fondos_wms[index].wmts){
		var capa = this.fondos_wms[index];

		if (!this.tocService.wmts_capabilities[capa.wmts]){
			this.tocService.loadWMTSCapabilities(this.tocService.serviciosWMTS,capa.wmts);
		}

		var capabilities = this.tocService.wmts_capabilities[capa.wmts];
		if (capabilities) {
			var layer;
			var parser = new WMTSCapabilities();
			var result = parser.read(capabilities);
			var options = optionsFromCapabilities(result,
					{layer: capa.layers, matrixSet: capa.gridset, format: capa.format});

			this.mapService.wmtsBaseLayer.setSource(new WMTS(options!));
			baseLayer.setVisible(false);
			this.mapService.wmtsBaseLayer.setVisible(true);
			this.mapService.wmtsBaseLayer.set('wmts_pk',capa.wmts);
		} else {
			console.log("Error incluyendo capabilities de WMTS");
		}
		this.mapService.wmtsBaseLayer.setOpacity(opacity);
		if (this.fondos_wms[index].etiqueta){
			this.mapService.wmtsBaseLayer.getSource().setAttributions("Fondo seleccionado: "+this.fondos_wms[index].etiqueta);
		}
	}
	else if (layers=="OSM"){
		this.mapService.wmtsBaseLayer.setSource( new XYZ({
				url:url 
		}));
		baseLayer.setVisible(false);
		this.mapService.wmtsBaseLayer.setVisible(true);
		this.mapService.wmtsBaseLayer.getSource().setAttributions("Fondo seleccionado: "+this.fondos_wms[index].etiqueta);
		//$(".ol-attribution").removeClass("ol-collapsed");
		this.mapService.attributionControl.setCollapsed(false);
		this.mapService.attributionControl.setCollapsible(false);
	}
	else{

		this.mapService.wmtsBaseLayer.setVisible(false);
		baseLayer.setVisible(true);
		if (tiled){
			baseLayer.setSource(new TileWMS({
				params: {'LAYERS': layers,'VERSION':version,'FORMAT':format,'STYLES':styles},
				url: url,
				projection: this.mapService.map_projection
			})
			);
		}

		else{
			baseLayer.setSource( new ImageWMS({
				params: {'LAYERS': layers,'VERSION':version,'FORMAT':format,'STYLES':styles},
				url: url,
				projection: this.mapService.map_projection
			})
			);
		}
		baseLayer.setOpacity(opacity);
		if (this.fondos_wms[index].etiqueta){
			baseLayer.getSource().setAttributions("Fondo seleccionado: "+this.fondos_wms[index].etiqueta);
		}
	}

}
/*
function decTranspFondoSlider(slider){
	var value =Math.max($("#"+slider).val() - 10,  0);
	$("#"+slider).val( value);
	$("#"+slider).slider("refresh");
	updateFondoTransp();
}

function incTranspFondoSlider(slider){
	var value = Math.min(parseInt($("#"+slider).val())  + 10, 100);
	$("#"+slider).val( value);
	$("#"+slider).slider("refresh");
	updateFondoTransp();


}
function updateFondoTransp(){
	var transp = $("#transpFondoSlider").val();
	baseLayer.setOpacity((100-transp)/100);
	bottomBaseLayer.setOpacity((100-transp)/100);
}
*/


}