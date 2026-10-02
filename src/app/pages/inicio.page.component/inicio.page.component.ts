import { Component, OnInit, Input, Query, NgZone, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Title } from "@angular/platform-browser";
import { TOCService } from '../../services/toc.service';
import { MapService } from '../../services/map.service';
import { ModalService } from '../../services/modal.service';

import VectorSource from 'ol/source/Vector';
import { transformExtent } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import { Collection } from 'ol/Collection.js';
import ImageWMS from 'ol/source/ImageWMS.js';
import Image from 'ol/layer/Image';


@Component({
  selector: 'inicio',
  templateUrl: './inicio.page.component.html',
  styleUrls: ['./inicio.page.component.css']
})
export class InicioPage implements OnInit {

  municipio;
mostrarMunis:boolean=false;

  bodyText = 'This text can be updated in modal 1';



  datos_municipio = [];

  fondo = 's';

  items_capas_mapa: any[] = [];


  items_queryableLayer: any[] = [];

  municipios = new Array();
  municipiosCandidatos = new Array();

  currentCapa = "t_cobertura_weplan";
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

  constructor(public tocService: TOCService, public mapService: MapService, public modalService: ModalService,
    public _sanitizer: DomSanitizer,) {

  }

  ngOnInit() {

    if (window.location.href.includes('accesible')) {
      this.accesible = true;
      //  this.mapService.initMapAccesible();
      //  this.infoService.initQueryableLayers();
      this.tocService.initTOC(true);
     this.changeCapa();

    } else {
      this.mapService.initMap();
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


    //this.addInfoLayer();
    //Se prepara la tabla junto con las opciones por defecto del select


    if (!this.accesible) {
      this.clearMunicipio();



      //Se preparan los queriableLayers
      this.mapService.addEvents(this.tocService)



      //Se abre el toc en pantallas grandes
      setTimeout(() => {
        if (screen.width < 1024) {
          $("#toc_expanded").css({ "display": "none" })
          $("#toc").css({ "background-color": "hsla(0,0%,100%,.4)" })
        }

      }, 300);

    }

    console.log(this.currentCapa);
    this.init = false;
  }

  onInputSearch(event: any) {
    if (event.data === undefined) { // borrar
      this.clearMunicipio();
    }
    else{
       this.mostrarMunis=true;
    if (!this.municipio || this.municipio.trim().length==0){
      this.municipiosCandidatos = [...this.municipios];
    }
    else{
      this.municipiosCandidatos = this.municipios.filter(valor => valor.text.toLowerCase().startsWith(this.municipio.toLowerCase()));
    }
    }
  }
  changeBackground() {
    this.mapService.changeBackground(this.fondo);
  }

  showMuniList(){
    this.mostrarMunis=true;
  }
  getMunicipios() {

    var server = "https://opendata.aragon.es/sparql?default-graph-uri=&query=select+distinct+%3Fnombre+%3Fwfs+%3Fine++where+%7B%0D%0A%3Fx+a+%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Forg%23Organization%3E%3B%0D%0A%3Chttp%3A%2F%2Fwww.opengis.net%2Font%2Fgeosparql%23hasGeometry%3E+%3Fwfs%3B%0D%0A%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2Fidentifier%3E+%3Fine%3B%0D%0A++++++dc%3Atitle+%3Fnombre.%0D%0Afilter%28datatype%28%3Fine%29+%3Dxsd%3Aint%29.%0D%0Afilter%28ucase%28%3Fnombre%29%21%3D%3Fnombre%29.%0D%0Afilter%28regex%28%3Fx+%2C+%22http%3A%2F%2Fopendata.aragon.es%2Frecurso%2Fsector-publico%2Forganizacion%2Fmunicipio%2F%22%29%29%0D%0A%7D%0D%0Aorder+by+%3Fnombre&format=application%2Fsparql-results%2Bjson&timeout=0&signal_void=on"
    $.ajax({
      url: server,
      type: 'GET',
      async: false,
      success: (data: any) => {
        for (var i = 0; i < data.results.bindings.length; i++) {
          this.municipios.push({
            value: data.results.bindings[i].ine.value + "",
            text: data.results.bindings[i].nombre.value + "",
            wfs: data.results.bindings[i].wfs.value + "",
            ine: data.results.bindings[i].ine.value + "",
          })
        }
        this.municipiosCandidatos = [...this.municipios];
      /*  this.municipios.unshift({
          value: "ARAGON",
          text: "ARAGÓN",
          wfs: "ARAGON",
          ine: "ARAGON",
        });
        this.municipio = this.municipios[0].value + "";*/
      },

      error: function (data, textStatus, errorThrown) {
        return false;
      }
    });
  }

  clearMunicipio() {
     this.mostrarMunis=false;
      this.municipiosCandidatos = [...this.municipios];
    if (!this.accesible) {
      this.tocService.removeFeature();
      var bbox_aragon = [571580, 4400803, 812351,
        4840039];
      this.mapService.map.getView().fit(bbox_aragon);

      setTimeout(() => {
        this.mapService.map.getView().setMinZoom(this.mapService.map.getView().getZoom());

      }, 1000);
    }
    else {
      if (!this.init) {
        this.changeCapa();
      }
    }
  }
  changeMunicipio(ine:number) {
    this.mostrarMunis=false;
    for (var i = 0; i < this.municipios.length; i++) {
      if (this.municipios[i].value == ine) {
       this.municipio=this.municipios[i].text;
        if (!this.accesible) {
            $.ajax({
              url: this.municipios[i].wfs + "&outputFormat=application%2Fjson&srsname=EPSG:25830",
              type: 'GET',
              async: false,
              success: (data: any) => {
                this.tocService.removeFeature();
                this.tocService.addFeature(data);

              },

              error: function (data, textStatus, errorThrown) {
                return false;
              }
            });
          

        }
        else {


          if (this.accesible && !this.init) {
            this.changeCapa(ine);
          }
        }
      }
    }
    this.aragon = false;
  }








  getData(ine?: any) {

    var server = environment.url + "/ws-visor-cobertura/data";
    if (ine && ine != "ARAGON") {
      server += "?municipio=" + ine;
    }
    $.ajax({
      url: server,
      type: 'GET',
      async: false,
      success: (data: any) => {
        this.datos_municipio = data;

      },

      error: function (data, textStatus, errorThrown) {
        return false;
      }
    });

  }


  getTableData(capa, ine?, anyo?) {


    var server = environment.url + "/ws-visor-cobertura/api/getData/" + capa;
    if (anyo) {
      server += "?anyo=" + anyo.replaceAll('-', '');
    }
    if (ine && ine != "ARAGON") {
      if (anyo) {
        server += "&municipio=" + ine;
      } else {
        server += "?municipio=" + ine;
      }
    }

    $.ajax({
      url: server,
      type: 'GET',
      async: false,
      success: (data: any) => {
        this.labels = [];
        this.rows = [];
        for (var i = 0; i < data.length; i++) {
          var row: any[] = [];
          this.totalItems = data.length;
          Object.keys(data[i]).forEach((key, index) => {
            row.push({ text: data[i][key] })
            if (i == 0) {
              this.labels.push({ text: key })
            }
          });
          this.rows.push(row);
          row = [];
        }
        this.page = 1;
      },

      error: function (data, textStatus, errorThrown) {
        console.log("Error recuperando los datos " + errorThrown)
        return false;
      }
    });
  }








  parseQueryable() {
    let res: any = [];
    this.tocService.queryable.forEach(c => {
      res.push({
        value: c.pk + "",
        text: c.titulo + "",
      })
    })

    return res;
  }



  setLayerTime(event) {
    var source = this.tocService.ollayer.getSource();
    var params = source.getParams();
    params.TIME = this.tocService.fecha;
    source.updateParams(params);
    Object.keys(this.tocService.interactiveLayers).forEach(key => {
      var layer = this.tocService.interactiveLayers[key];
      /*var url = layer.getSource().getUrl();
    layer.getSource().url_=url.replaceAll("fecha='"+layer.get("fecha")+"'","fecha='"+params.TIME+"'");
    layer.getSource().changed();*/

      layer.getSource().refresh();

      layer.set("fecha", params.TIME);

    });

  }


  setWeplanNetwork(event) {
    var source = this.tocService.ollayer.getSource();
    var params = source.getParams();
    params.LAYERS = this.tocService.layer;
    source.updateParams(params);
    Object.keys(this.tocService.interactiveLayers).forEach(key => {
      var layer = this.tocService.interactiveLayers[key];
      layer.setVisible(params.LAYERS == 't_cobertura_weplan' || params.LAYERS == key);

    });

  }

  changeCapa(ine?:number) {
    this.getTableData(this.currentCapa, ine, this.tocService.fecha);
  }
}
