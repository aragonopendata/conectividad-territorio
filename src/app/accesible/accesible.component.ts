import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MapService } from '../shared/services/map.service';
import { WFSResponse } from 'src/app/shared/models/wfs-response.model';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {AfterViewInit, ViewChild} from '@angular/core';
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
@Component({
  selector: 'app-accesible',
  templateUrl: './accesible.component.html',
  styleUrls: ['./accesible.component.scss']
})
export class AccesibleComponent implements OnInit {
  allFeatures:PeriodicElement[]=[];
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<PeriodicElement>(this.allFeatures);
  dataSourceCentros = new MatTableDataSource<CentroEducativoElement>();
  dataSourcePoligonos = new MatTableDataSource<PoligonosElement>();
  dataSourceInmobiliarias = new MatTableDataSource<InmobiliariasElement>();

  totalLength = 0;
  selectedLayer;

// Añadir aquí cualquier capa nueva y su correspondiente cadena
public layerRelations: Layer[] = 
[
        {label: 'Núcleos urbanos (2021)', value: 'nucleos_zbg_2021'}, 
        {label: 'Núcleos urbanos (2022)', value: 'nucleos_zbg_2022'},
        {label: 'Centros educativos (2021)', value: 'centros_educativos_zbg_2021'}, 
        {label: 'Centros educativos (2022)', value: 'centros_educativos_zbg_2022'},
        {label: 'Instalaciones sanitarias (2021)', value: 'instalaciones_sanitarias_zbg_2021'},
        {label: 'Instalaciones sanitarias (2022)', value: 'instalaciones_sanitarias_zbg_2022'},
        {label: 'Polígonos industriales (2021)', value: 'poligonos_zbg_2021' }, 
        {label: 'Polígonos industriales (2022)', value: 'poligonos_zbg_2022' },
        {label: 'Unidades inmobiliarias (2022)', value: 'ui_zbg_2022_x_muni'}
    /*{ optGroup:"Índice Sintético de Desarrollo Territorial", options: 
    [
        {label: 'ISDT (2020)', value: 'isdt_municipio'}
    ]},*/
    
];



  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
  }

  constructor(private mapService: MapService, private changeDetectorRefs: ChangeDetectorRef) {

  }

  ngOnInit(): void {
   //  this.onSearch("");
  }
  async onSearch(searchString: string) {
    let results : WFSResponse[] = [];
    let result = await this.mapService.getWFSFeaturesAll("", "", this.selectedLayer, 1000).toPromise();
    switch(this.selectedLayer) { 
      case "nucleos_zbg_2021": case "nucleos_zbg_2022": { 
        var  jsonObj: PeriodicElement[] = [];

         //statements; 
         result.features.forEach(function (value) {
          var item: PeriodicElement = 
            {"municipio" : value.properties["d_muni_ine"],
            "nucleo": value.properties["d_nucleo_i"],
            "codigo_zona": value.properties["codigo_zon"],
            "f_escenario_patrimonio": value.properties["f_escenario_patrimonio"],
            "f_movilidad": value.properties["f_movilidad"],
            "f_equipamiento_servicio": value.properties["f_equpiamiento_servicio"],
            "f_alojamiento": value.properties["f_alojamiento"],
            "f_economico": value.properties["f_economico"],
            "isdt_100": value.properties["isdt_100"],
            "por_afec_nucleo_x_zona": value.properties["por_afec_nuc_x_zona"],
            "tipo_zona": value.properties["tipo_zona"],
            "anio": value.properties["anio"],
            };
          jsonObj.push(item);
          });
          this.allFeatures =jsonObj;
          this.dataSource = new MatTableDataSource(this.allFeatures);
          this.paginator._intl.itemsPerPageLabel = 'items por página';
          this.dataSource.paginator = this.paginator;
          this.displayedColumns = all_layers_columns[this.selectedLayer];


          this.totalLength = this.allFeatures.length;
         break; 
      } 
      case "centros_educativos_zbg_2021": case "centros_educativos_zbg_2022": case "instalaciones_sanitarias_zbg_2021": case "instalaciones_sanitarias_zbg_2022": { 
        //statements; 
        var  jsonObjEducativo: CentroEducativoElement[] = [];

        result.features.forEach(function (value) {
         var item: CentroEducativoElement = 
           {"centro": value.properties["centro"],
           "codigo_zona": value.properties["codigo_zona"],
           "localidad": value.properties["localidad"],
           "tipo_zona": value.properties["tipo_zona"],
           "anio": value.properties["anio"],
           };
           jsonObjEducativo.push(item);
         });
         //this.allFeatures =jsonObjEducativo;
          this.dataSourceCentros = new MatTableDataSource(jsonObjEducativo);
          this.dataSourceCentros.paginator = this.paginator;
          this.displayedColumns = all_layers_columns[this.selectedLayer];


          this.totalLength = this.allFeatures.length
        break; 
      }

      case "poligonos_zbg_2021": case "poligonos_zbg_2022": { 
        //statements; 
        var  jsonObjPoligono: PoligonosElement[] = [];

        result.features.forEach(function (value) {
         var item: PoligonosElement = 
           {"nombre_poligono": value.properties["nombre_poligono"],
           "codigo_zona": value.properties["codigo_zona"],
           "localidad": value.properties["localidad"],
           "tipo_zona": value.properties["tipo_zona"],
           "anio": value.properties["anio"],
           };
           jsonObjPoligono.push(item);
         });
         //this.allFeatures =jsonObjEducativo;
          this.dataSourcePoligonos = new MatTableDataSource(jsonObjPoligono);
          this.dataSourcePoligonos.paginator = this.paginator;
          this.displayedColumns = all_layers_columns[this.selectedLayer];


          this.totalLength = this.allFeatures.length
        break; 
      }

      case "ui_zbg_2022_x_muni":  { 
        //statements; 
        var  jsonObjInmobiliaria: InmobiliariasElement[] = [];

        result.features.forEach(function (value) {
         var item: InmobiliariasElement = 
         {"municipio": value.properties["municipio"],
         "tipo_zona": value.properties["tipo_zona"],
         "codigo_zona": value.properties["codigo_zona"],
         "ui_total": value.properties["ui_total"],
         "uis_a": value.properties["uis_a"],
         "uis_b": value.properties["uis_b"],
         "uis_c": value.properties["uis_c"],
         "uis_e": value.properties["uis_e"],
         "uis_g": value.properties["uis_g"],
         "uis_i": value.properties["uis_i"],
         "uis_k": value.properties["uis_k"],
         "uis_m": value.properties["uis_m"],
         "uis_o": value.properties["uis_o"],
         "uis_p": value.properties["uis_p"],
         "uis_r": value.properties["uis_r"],
         "uis_t": value.properties["uis_t"],
         "uis_v": value.properties["uis_v"],
         "uis_y": value.properties["uis_y"],
         "uis_j": value.properties["uis_j"],
         "uis_z": value.properties["uis_z"],
         "isdt_100": value.properties["isdt_100"],
         "f_economico": value.properties["f_economico"],
         "f_alojamiento": value.properties["f_alojamiento"],
         "f_equpiamiento_servicio": value.properties["f_equpiamiento_servicio"],
         "f_movilidad": value.properties["f_movilidad"],
         "f_escenario_patrimonio": value.properties["f_escenario_patrimonio"]
        };
        jsonObjInmobiliaria.push(item);
         });
         //this.allFeatures =jsonObjEducativo;
          this.dataSourceInmobiliarias = new MatTableDataSource(jsonObjInmobiliaria);
          this.dataSourceInmobiliarias.paginator = this.paginator;
          this.displayedColumns = all_layers_columns[this.selectedLayer];


          this.totalLength = this.allFeatures.length
        break; 
      }
      default: { 
         //statements; 
         break; 
      } 
   } 
   
    
  }
}
export interface PeriodicElement {
  nucleo: string;
  codigo_zona: string;
  f_escenario_patrimonio: number;
  f_movilidad: number;
  f_equipamiento_servicio: number;
  f_alojamiento: number;
  f_economico: number;
  isdt_100: number;
  por_afec_nucleo_x_zona: number;
  tipo_zona: string;
  municipio: string;
  anio: number;
}

export interface CentroEducativoElement {
  centro: string;
  codigo_zona: string;
  tipo_zona: string;
  localidad: string;
  anio: number;
  
}

export interface InstalacionesSanitariasElement {
  centro: string;
  codigo_zona: string;
  tipo_zona: string;
  localidad: string;
  anio: number;
  
}

export interface PoligonosElement {
  nombre_poligono: string;
  codigo_zona: string;
  tipo_zona: string;
  localidad: string;
  anio: number;
  
}

export interface InmobiliariasElement {
  municipio: string;
  tipo_zona: string;
  codigo_zona: string;
  ui_total: number;
  uis_a: number;
  uis_b: number;
  uis_c: number;
  uis_e: number;
  uis_g: number;
  uis_i: number;
  uis_k: number;
  uis_m: number;
  uis_o: number;
  uis_p: number;
  uis_r: number;
  uis_t: number;
  uis_v: number;
  uis_y: number;
  uis_j: number;
  uis_z: number;
  isdt_100: number;
  f_economico: number;
  f_alojamiento: number;
  f_equpiamiento_servicio: number;
  f_movilidad: number;
  f_escenario_patrimonio: number;
  
  }

interface Layer {
  value: string;
  label: string;
}


let all_layers_columns: {[key: string]: string[]} = {
  "nucleos_zbg_2021": ['nucleo','codigo_zona','f_escenario_patrimonio','f_movilidad','f_equipamiento_servicio','f_alojamiento','f_economico','isdt_100','por_afec_nucleo_x_zona','tipo_zona','municipio', 'anio'],
  "nucleos_zbg_2022": ['nucleo','codigo_zona','f_escenario_patrimonio','f_movilidad','f_equipamiento_servicio','f_alojamiento','f_economico','isdt_100','por_afec_nucleo_x_zona','tipo_zona','municipio', 'anio'],
  "centros_educativos_zbg_2021": ['centro','codigo_zona','tipo_zona','localidad','anio'],
  "centros_educativos_zbg_2022": ['centro','codigo_zona','tipo_zona','localidad','anio'],
  "instalaciones_sanitarias_zbg_2021": ['centro','codigo_zona','tipo_zona','localidad','anio'],
  "instalaciones_sanitarias_zbg_2022": ['centro','codigo_zona','tipo_zona','localidad','anio'],
  "poligonos_zbg_2021": ['nombre_poligono','codigo_zona','tipo_zona','localidad','anio'],
  "poligonos_zbg_2022": ['nombre_poligono','codigo_zona','tipo_zona','localidad','anio'],
 //"ui_zbg_2022_x_muni": ['municipio','tipo_zona','codigo_zona','ui_total','uis_a','uis_b','uis_c','uis_e','uis_g','uis_i','uis_k','uis_m','uis_o','uis_p','uis_r','uis_t','uis_v','uis_y','uis_j','uis_z','isdt_100','f_economico','f_alojamiento','f_equpiamiento_servicio','f_movilidad','f_escenario_patrimonio'],
  "ui_zbg_2022_x_muni": ['municipio','tipo_zona','codigo_zona','ui_total','isdt_100','f_economico','f_alojamiento','f_equpiamiento_servicio','f_movilidad','f_escenario_patrimonio'],

  
}


