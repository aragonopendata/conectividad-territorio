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
import { InfoService } from '../../services/info.service';



@Component({
  selector: 'inicio',
  templateUrl: './inicio.page.component.html',
  styleUrls: ['./inicio.page.component.css']
})
export class InicioPage implements OnInit {

  municipio: string = '';
  
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

items_anyos: any[] =[];

items_capas_mapa: any[] = [];
items_capas: any[] = [];

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

constructor(public tocService: TOCService, public mapService: MapService, public modalService:ModalService, 
  public baseLayerService: BaseLayerService, public infoService: InfoService){

}

  ngOnInit() {

    this.mapService.initMap();
    this.infoService.initQueryableLayers();
    this.tocService.initTOC();
    
    this.getMunicipios();

    this.items_capas = this.parseCapas();
    this.items_capas_mapa = this.parseCapas();
    this.items_capas_mapa.unshift({
      value: "NADA",
      text: "-- NINGUNA --",
      selected: true
     })
    this.currentCapa = this.items_capas.find(el => el).value;
    this.getTableData(this.tocService.capas[this.currentCapa].layers)

    this.tocService.capas_anadidas.forEach(capa => {
      this.items_anyos[capa]=this.parseAnyos(this.tocService.capas[capa].anyos)
    })
    //this.parseQueryable();
    this.changeMunicipio();
    this.changeCapa();
    this.mapService.addEvents(this.tocService)


    setTimeout(() => {
      if(screen.width<1024){
        $("#toc_expanded").css( {"display":"none"} )
        $("#toc").css( {"background-color":"hsla(0,0%,100%,.4)"} )
      }
   }, 300);

  }


  get_items_capas_visibles(){
    return this.items_capas.filter(item => {
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

        if(ine=="ARAGON"){
          this.tocService.removeFeature();
          var bbox_aragon = [571580, 4400803, 812351,
            4840039];
            this.mapService.map.getView().fit(bbox_aragon);
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
        this.getTableData(this.tocService.capas[this.currentCapa].layers,ine,this.currentAnyo)
        //this.tocService.changeInfoLayer(this.currentCapa)
      }
    } 
    this.aragon = false;
  }

  changeQueryable(){
    if(this.mapService.queryableLayer=="NADA"){
      this.tocService.removeInteractiveLayer();
    }else{
      if(!(this.mapService.queryableLayer in this.tocService.capas_visibles)){
        this.tocService.setVisibleLayer(this.tocService.getOLLayer("idx", this.mapService.queryableLayer),true)


        for(var i = 0; i< this.items_capas.length;i++){
          if(this.items_capas[i].value == this.mapService.queryableLayer){
              var el: HTMLInputElement = document.getElementById("input_"+this.mapService.queryableLayer) as HTMLInputElement;

              el.checked = true;
          }
        }
      }
      this.tocService.changeInfoLayer(this.mapService.queryableLayer,this.tocService.capas[this.mapService.queryableLayer].anyo_defecto);
    }
    
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
        data = data.sort((a,b) => {
          return a.orden<b.orden
        })
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
        return false;
      }
    });
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

  parseCapas(){
    let res :any= [];

    this.tocService.capas_anadidas.forEach(ind => {
      res.push({
        value:this.tocService.capas[ind].pk+"",
        text: this.tocService.capas[ind].titulo+"",
       }) 
      
    })

    
    return res;
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
    if(this.tocService.capas[this.currentCapa].anyos){
      this.showAnyo = true;
    }else{
      this.showAnyo = false;
    }
    this.currentAnyo = this.tocService.capas[this.currentCapa].anyo_defecto
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
    if(this.tocService.capas[this.currentCapa].anyos){
      anyo=this.currentAnyo
    }

    this.getTableData(capa.layers,ine,anyo)
  }

  setVisibleLayer(layerIdx, event) {
    this.tocService.setVisibleLayer(this.tocService.getOLLayer("idx", layerIdx),event.currentTarget.checked)
  }


  setLayerTime(layerIdx, event) {
    if(this.mapService.queryableLayer==layerIdx){
      this.tocService.removeInteractiveLayer();
      this.tocService.changeInfoLayer(this.mapService.queryableLayer,this.tocService.capas[this.mapService.queryableLayer].anyo_defecto);
    }
    this.tocService.setLayerTime(this.tocService.getOLLayer("idx", layerIdx),this.tocService.capas[layerIdx].anyo_defecto)
  }

 

  

}
