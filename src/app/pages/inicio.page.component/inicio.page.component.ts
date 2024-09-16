import { Component, OnInit,Input, Query, NgZone, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import {Title} from "@angular/platform-browser";
import { TOCService } from '../../services/toc.service';
import { MapService } from '../../services/map.service';
import { ModalService } from '../../services/modal.service';
import { BaseLayerService } from '../../services/baseLayers.service';
import VectorSource from 'ol/source/Vector';
import {transformExtent} from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import { Collection } from 'ol/Collection.js';
import { InfoService } from '../../services/info.service';
import ImageWMS from 'ol/source/ImageWMS.js';



@Component({
  selector: 'inicio',
  templateUrl: './inicio.page.component.html',
  styleUrls: ['./inicio.page.component.css']
})
export class InicioPage implements OnInit {

  municipio: string = '';

  grupo: string = "Red fija";
  
  bodyText = 'This text can be updated in modal 1';

  items = [
    {
    value: "Huesca",
    text: "Huesca"
  },
  {
    value: "Zaragoza",
    text: "Zaragoza"
  },
  {
    value: "Teruel",
    text: "Teruel"
  },
  {
    value: "Jaca",
    text: "Jaca"
  },
]

datos_municipio = [];




items_capas_mapa: any[] = [];


items_queryableLayer: any[] = [];

municipios = new Array();


currentCapa;
currentAnyo;

public wrapper = {
  classes: "overflow-x-auto"
}

public visible_rows: any[] = [];
public rows: any[] = [];
public labels: any[] = [];
public titulo = "";
public page = 1;
public totalItems;
public showAnyo = false;
public showMunicipio = false;
aragon = true;

public showDataNetwork = true;
public showLandLine = true;
public grupos;

public accesible = false;

value = 'selected';
public init = true;
gruposClean: any[] = [];
visibleGrupo;
tipoRedGrupo;

  capasWMSreciprocas: any;

constructor(public tocService: TOCService, public mapService: MapService, public modalService:ModalService, 
  public baseLayerService: BaseLayerService, public infoService: InfoService,public _sanitizer:DomSanitizer,){

}

  ngOnInit() {

    if(window.location.href.includes('accesible')){
      this.accesible = true;
    //  this.mapService.initMapAccesible();
    //  this.infoService.initQueryableLayers();
      this.tocService.initTOC(true);
    }else{
      this.mapService.initMap();
      this.infoService.initQueryableLayers();
      this.tocService.initTOC(false);

    }

 /*   this.tocService.gruposClean.forEach(element => {
      if(element){
        this.gruposClean.push(element)
      }
      });

      this.capasWMSreciprocas = this.gruposClean.find(item => item.pk == '16').capasWMS;
*/
  //  this.changeTipoRed(this.gruposClean.find(item => item.pk == '15').pk);
    this.getMunicipios();

    //Se preparan las opciones de los select
   // this.items_capas = this.parseCapas();
 /*   this.items_capas_mapa = this.parseCapas();
    this.items_capas_mapa.unshift({
      value: "NADA",
      text: "-- NINGUNA --",
      selected: true
     })*/
     if (!this.accesible){
    this.updateAnyos(16);
    }
	this.addInfoLayer();
    //Se prepara la tabla junto con las opciones por defecto del select
    this.currentCapa = "1053";
    if (this.accesible){
    this.changeCapa();
    }
    else{
    this.changeMunicipio();
    


    //Se preparan los queriableLayers
    this.mapService.addEvents(this.tocService)
  /*  this.tocService.capas_visibles.forEach(c =>{
      this.tocService.changeInfoLayer(c,this.tocService.items_anyo_defecto[c]);
    })*/


  
    //Se abre el toc en pantallas grandes
    setTimeout(() => {
      if(screen.width<1024){
        $("#toc_expanded").css( {"display":"none"} )
        $("#toc").css( {"background-color":"hsla(0,0%,100%,.4)"} )
      }

   }, 300);

}
console.log(this.tocService.items_anyos);
console.log(this.currentCapa);
  this.init = false;
  }

  changeTipoRed(grupo){
  var el: HTMLInputElement = document.getElementById("red_"+grupo) as HTMLInputElement;
var grupoAnyos;
    if (el.checked){
    	this.tocService.addRed(grupo);
    	grupoAnyos=16;
    }
    else{
    	
    	var grupoContrario=15;
    	if (grupo==grupoContrario){
    		grupoContrario=14;
    	}
    	  var elOtro: HTMLInputElement = document.getElementById("red_"+grupoContrario) as HTMLInputElement;
    	  if (elOtro.checked){
    		this.tocService.hideRed(grupo);
    		grupoAnyos=grupoContrario;  
    	  }
    	  else{
    	  	elOtro.checked=true;
    	  	this.tocService.changeRed(grupoContrario);
    	  	grupoAnyos=grupoContrario;
    	  }
    
    }
    console.log(this.tocService.capas_anadidas);
    console.log(this.tocService.capasWMSSeleccionadas);
    this.updateAnyos(grupoAnyos);
	console.log(this.tocService.items_anyos);
    //console.log(this.items_anyo_defecto);
  /*  this.capasWMSSeleccionadas = []
    if(grupo == '16'){
      this.gruposClean.forEach(element => {
      this.capasWMSSeleccionadas = this.capasWMSSeleccionadas.concat(element.capasWMS);  
      });
    }else{

      this.visibleGrupo = this.gruposClean.find(item => item.pk == grupo);
      this.tocService.setStyles('fija')
      this.tocService.initTOC
      this.capasWMSSeleccionadas = this.visibleGrupo.capasWMS;
      this.capasWMSSeleccionadas = this.capasWMSSeleccionadas.concat(this.capasWMSreciprocas);

    }*/
/*
    var layers:ImageWMS[] = this.mapService.map;

    console.log(layers)
    
    layers.forEach(f => {
      console.log(f)
    });
    ImageWMS.getParams
 */
   // console.log(this.capasWMSSeleccionadas)
  }



updateAnyos(grupo){
this.tocService.items_anyos=[];
 this.tocService.capasWMSSeleccionadas.forEach(capa => {
     	var pks = capa.pk.split(",");
     	var anyos = this.tocService.capas[pks[0]].anyos;

     	if (this.tocService.capas[pks[0]].grupo==16){
     		var anyos_fija = this.tocService.capas[pks[0]].anyos_fija;
     		var anyos_movil = this.tocService.capas[pks[0]].anyos_movil;
     		if (this.tocService.capas[pks[0]].grupo==grupo){
     			
     			if (anyos_fija && anyos_movil){
     				anyos = this.tocService.mergeAnyos(anyos_fija,anyos_movil);
     			}
     		}
     		else{
     			if (grupo==14){
     				anyos = anyos_fija; 
     			}
     			else{
     				anyos = anyos_movil;
     			}
     		}
     	}
     	else if (anyos){
     		if (pks.length>1){
     			var anyos2 = this.tocService.capas[pks[1]].anyos;
     			if(anyos2){
     				anyos = this.tocService.mergeAnyos(anyos, anyos2)
     			}
     		}
     	}
     	if (anyos){
     		if(anyos.indexOf(parseInt(capa.anyo))<0){
     			capa.anyo = this.tocService.capas[pks[0]].anyo_defecto;
     			this.changeLayerTime(capa.pk,capa.anyo, capa.visible);
     		}
     		this.tocService.items_anyos[capa.pk] =this.tocService.parseAnyos(anyos);
     	}
     	    })
    }
    
addInfoLayer(){

 this.tocService.capasWMSSeleccionadas.forEach(capa => {
	if (capa.visible){
		this.tocService.changeInfoLayer(capa.pk,capa.anyo);
	}
    });
    }
  get_items_capas_visibles(){
    return this.tocService.items_capas.filter(item => {
      var vis = false;
      for(var i = 0; i<this.tocService.capas_visibles.length;i++){
        if(this.tocService.capas_visibles[i]==item.value){
          return true;
        }
      }
      return false;
    })
  }


  getMunicipios(){
    
    var server = "https://opendata.aragon.es/sparql?default-graph-uri=&query=select+distinct+%3Fnombre+%3Fwfs+%3Fine++where+%7B%0D%0A%3Fx+a+%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Forg%23Organization%3E%3B%0D%0A%3Chttp%3A%2F%2Fwww.opengis.net%2Font%2Fgeosparql%23hasGeometry%3E+%3Fwfs%3B%0D%0A%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2Fidentifier%3E+%3Fine%3B%0D%0A++++++dc%3Atitle+%3Fnombre.%0D%0Afilter%28datatype%28%3Fine%29+%3Dxsd%3Aint%29.%0D%0Afilter%28ucase%28%3Fnombre%29%21%3D%3Fnombre%29.%0D%0Afilter%28regex%28%3Fx+%2C+%22http%3A%2F%2Fopendata.aragon.es%2Frecurso%2Fsector-publico%2Forganizacion%2Fmunicipio%2F%22%29%29%0D%0A%7D%0D%0Aorder+by+%3Fnombre&format=application%2Fsparql-results%2Bjson&timeout=0&signal_void=on"
    $.ajax({
      url:    server,
      type: 'GET',
      async: false, 
      success: (data: any) => {
        for(var i = 0; i<data.results.bindings.length;i++){
          this.municipios.push({
            value: data.results.bindings[i].nombre.value+"",
            text: data.results.bindings[i].nombre.value+"",
            wfs: data.results.bindings[i].wfs.value+"",
            ine: data.results.bindings[i].ine.value+"",
           })
        }
        this.municipios.unshift({
          value: "ARAGON",
          text: "ARAGÓN",
          wfs: "ARAGON",
          ine: "ARAGON",
         });
        this.municipio = this.municipios[0].value+"";
      },

      error: 		function(data, textStatus, errorThrown) {
        return false;
      }
    });
  }

  changeMunicipio(){
  
    for(var i = 0;i<this.municipios.length;i++){
      if(this.municipios[i].value==this.municipio){
        var ine = this.municipios[i].ine;
		if (!this.accesible){
        if(ine=="ARAGON"){
          this.tocService.removeFeature();
          var bbox_aragon = [571580, 4400803, 812351,
            4840039];
            this.mapService.map.getView().fit(bbox_aragon);
            
            setTimeout(() =>{
              this.mapService.map.getView().setMinZoom(this.mapService.map.getView().getZoom());
             
          },1000);
        }else{
          $.ajax({
            url:    this.municipios[i].wfs+"&outputFormat=application%2Fjson&srsname=EPSG:25830",
            type: 'GET',
            async: false, 
            success: (data: any) => {
                this.tocService.removeFeature();
                this.tocService.addFeature(data);
              
            },
      
            error: 		function(data, textStatus, errorThrown) {
              return false;
            }
          });
        }
         this.getData(ine);
}
else{

       
        if(this.accesible && !this.init){
          this.getTableData(this.tocService.capas[this.currentCapa].layers,ine,this.currentAnyo)
        }
        }
      }
    } 
    this.aragon = false;
  }






  getData(ine?:any){

    var server = environment.url+"/ws-cobertura/data";
    if(ine && ine!="ARAGON"){
      server+="?municipio="+ine;
    }
    $.ajax({
      url:    server,
      type: 'GET',
      async: false, 
      success: (data: any) => {
        this.datos_municipio = data;
        
      },

      error: 		function(data, textStatus, errorThrown) {
        return false;
      }
    });
    
  }


  getTableData(capa,ine?,anyo?){

    
    var server = environment.url+"/ws-cobertura/api/getData/"+capa;
    if(anyo){
      server+="?anyo="+anyo;
    }
    if(ine && ine!="ARAGON"){
      if(anyo){
        server+="&municipio="+ine;
      }else{
        server+="?municipio="+ine;
      }
    }

    $.ajax({
      url:    server,
      type: 'GET',
      async: false, 
      success: (data: any) => {
        this.labels =[];
        this.rows = [];
        for(var i = 0;i<data.length;i++){
          var row:any[] = [];
          this.totalItems = data.length;
          Object.keys(data[i]).forEach((key,index) => {
            row.push({text: data[i][key]})
            if(i == 0){
              this.labels.push({text: key})
            }
        });
        this.rows.push(row);
        row=[];
        }
        this.page = 1;
      },

      error: 		function(data, textStatus, errorThrown) {
      console.log("Error recuperando los datos "+errorThrown)
        return false;
      }
    });
  }





  parseCapas(){
    let res :any= [];

    this.tocService.capas_anadidas.forEach(ind => {
      res.push({
        value:this.tocService.capas[ind].pk+"",
        grupo:this.tocService.capas[ind].grupo+"",
        text: this.tocService.capas[ind].titulo+"",
       }) 
      
    })

    
    return res;
  }

  selectNetworkType(networkIdx: any){   
  
    if(networkIdx == "1050"){
      this.showDataNetwork = !this.showDataNetwork; 
      console.log("DN")
      console.log(this.showDataNetwork)
    }else if(networkIdx == "1051"){
      this.showLandLine = !this.showLandLine;
      console.log("LL")
      console.log(this.showLandLine)
    }

  }

  parseQueryable(){
    let res :any= [];
    this.tocService.queryable.forEach(c => {
      res.push({
        value: c.pk+"",
        text: c.titulo+"",
      }) 
    })
    
    return res;
  }

  changeCapa(){
    this.showMunicipio = this.tocService.capas[this.currentCapa].filtro_muni;
    
      this.showAnyo = this.tocService.items_anyos[this.currentCapa] && this.tocService.items_anyos[this.currentCapa].length>0;
    
    this.currentAnyo = this.tocService.items_anyo_defecto[this.currentCapa];
    this.changeAnyo();
  }

  changeAnyo(){
    var capa = this.tocService.capas[this.currentCapa]

    var ine = null;
    var anyo = null;
    if(this.tocService.capas[this.currentCapa].filtro_muni && !this.aragon){
      for(var i = 0;i<this.municipios.length;i++){
        if(this.municipios[i].value==this.municipio){
          ine = this.municipios[i].ine;
          
        }
      }
    }
    if( this.tocService.items_anyos[this.currentCapa] && this.tocService.items_anyos[this.currentCapa].length>0){
      anyo=this.currentAnyo
    }

    if(this.accesible){
      this.getTableData(capa.layers,ine,anyo)
    }
    
  }

  setVisibleLayer(layerIdx, event) {
	var olLayer = this.tocService.getOLLayer("pk", layerIdx)
    if(event.currentTarget.checked){
    
      this.tocService.changeInfoLayer(layerIdx,olLayer.get("anyo"));
    }else{
    	var pks = layerIdx.split(",");
    	for (var i=0; i<pks.length; i++){
     	 	this.tocService.removeInteractiveLayer(this.tocService.capas[pks[i]].layers);
      	}
    }
    this.selectNetworkType(layerIdx);
    this.tocService.setVisibleLayer(olLayer,event.currentTarget.checked)
  }


  setLayerTime(layerIdx, event) {

    var el: HTMLInputElement = document.getElementById("input_"+layerIdx) as HTMLInputElement;
    el.checked = true;
    this.tocService.setVisibleLayer(this.tocService.getOLLayer("pk", layerIdx),true)
    this.changeLayerTime(layerIdx,event.target.value, true);
  
  }

changeLayerTime(layerIdx,time, visible){
if (visible){
    var pks = layerIdx.split(",");
    for (var i=0; i<pks.length; i++){
      	this.tocService.removeInteractiveLayer(this.tocService.capas[pks[i]].layers);
    }
    
    this.tocService.changeInfoLayer(layerIdx,time);
    }
    var olLayer = this.tocService.getOLLayer("pk", layerIdx)
    this.tocService.setLayerTime(olLayer,time);
 
}
  

}
