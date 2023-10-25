import { Injectable } from '@angular/core';
import { MapService } from './map.service';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import {optionsFromCapabilities} from 'ol/source/WMTS';
import WMTS from 'ol/source/WMTS';
import XYZ from 'ol/source/XYZ';
import { TOCService } from './toc.service';
import TileWMS from 'ol/source/TileWMS';
import ImageWMS from 'ol/source/ImageWMS';
import GeoJSON from 'ol/format/GeoJSON';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class InfoService {
	constructor(){
		
	}



	queryableLayers = {};
	extraQueryableLayers = {};
	queryableLayersOnlyIfVisible = {};
	queryableLayersInfoGral = {};
    fieldsQueryableLayers : any[]= [];
//    fieldListQueryableLayers = [];
    mainFieldQueryableLayers : any[]= [];
    resultQueryInfo = [];
    infoDrawControl = null;
    infoDialogCreated=false;
    extentInfo;
    infoList;
	prodList;
    infoLayer;
    infoResultLayer = null;
    infoCoords;
    formatGeojson = new GeoJSON();
    capasBufferAmpliado = new Array();
    printInfoActionXSL ="/app/jboss/Mapa/templates/informeRJT.xsl";
    urlGFI_OVC = "/BD_GIS/proxy/ovc.jsp?SRS=EPSG:25830&Query_Layers=Catastro&service=WMS&request=GetFeatureInfo&version=1.1.1&INFO_FORMAT=text/html&EXCEPTIONS=application/vnd.ogc.se_xml&FEATURE_COUNT=5";
    lastDescargas="";
    userInfoTheme='all';



 initQueryableLayers() {
	$.ajax({
		url: environment.url + "/ws-cobertura/config/queryableLayers",
		type: 'GET',
		async: false, //para asegurar que se puede consultar la info
		success: data => {
			this.parseQueryableLayers(data);
		},
		error: function(data, textStatus, errorThrown) {
			console.log('Error obteniendo el listado de campos queryables. State: ' + data.readyState + ", Status:" + data.status);
			return false;
		}
	});
	}

	parseQueryableLayers(data) {
		for (var i = 0; i < data.capas.length; i++) {
			var idCapa = data.capas[i].capa_wfs;
			if (data.capas[i].buffer_ampliado && (data.capas[i].buffer_ampliado=="t")){
				this.capasBufferAmpliado.push(idCapa);	
			}
			
			if (data.capas[i].capa_toc){



				if (this.queryableLayers[data.capas[i].capa_toc]){
					this.queryableLayers[data.capas[i].capa_toc].push(idCapa);
				}
				else{
					this.queryableLayers[data.capas[i].capa_toc] = [idCapa];
				}

				if (data.capas[i].solo_si_visible == 't') {
					this.queryableLayersOnlyIfVisible[data.capas[i].capa_toc] = -1;
				}
				if (data.capas[i].info_general && data.capas[i].info_general=="t"){
					this.queryableLayersInfoGral[data.capas[i].capa_toc]=-1;
				}
			}
			else{
				this.extraQueryableLayers[data.capas[i].pk] = data.capas[i];
			}

			this.fieldsQueryableLayers[idCapa] = [];
			//var isFirst = true;
			//fieldListQueryableLayers[idCapa] = '';



			for (var field in data.capas[i].campos) {
				var fieldName = data.capas[i].campos[field].campo;
				var fieldLabel = data.capas[i].campos[field].etiqueta;
				this.fieldsQueryableLayers[idCapa][fieldName] = fieldLabel;
			}

		}

		
	}
	 
}