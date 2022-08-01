import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { WFSResponse } from 'src/app/shared/models/wfs-response.model';
import { MapService } from 'src/app/shared/services/map.service';
import { PopUpService } from 'src/app/shared/services/popup.service';
import { FormControl } from '@angular/forms';
import { ObjectId } from 'src/app/shared/models/object-id.model';
import { Feature } from 'ol';
import { ReturnStatement } from '@angular/compiler';
import Geometry from 'ol/geom/Geometry';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  template: '<app-popup [layerSelection]="layerSelection"></app-popup>'
})
export class HeaderComponent implements OnInit {
  @Output() searchEvent = new EventEmitter<WFSResponse>();
  @Output() layerEvent = new EventEmitter<string>();
  isSearching: boolean = true;
  isDone: boolean = false;
  isError: boolean = false;
  searchText!: string;
  errorStatus!: string;
  popUpDescription!:string;

   //listOptions: string[];
   listNucleos: string[];
   listCentrosEducativos: string[];
   listInstalacionesSanitarias: string[ ];
   listPoligonosIndustriales:string[];
   unidadesInmobiliarias: string;
   isdt: string;
   search = false;
   //selected: string = '0';
   //viewSelection: string = '';

   layerSelection: string[] = [];
  
  constructor(
      private mapService: MapService,
      private popUpService: PopUpService
    ) 
    { 
        //this.listOptions = ['Núcleos Urbanos','Unidades inmobiliarias','Centros Educativos','Instalaciones Sanitarias','Polígonos industriales','Índide Sintético de Desarrollo Territorial (ISDT)']
        this.listNucleos =['Núcleos urbanos (2021)','Núcleos urbanos (2022)']
        this.listCentrosEducativos=['Centros educativos (2021)','Centros educativos (2022)']
        this.listInstalacionesSanitarias=['Instalaciones sanitarias (2021)','Instalaciones sanitarias (2022)']
        this.listPoligonosIndustriales=['Polígonos industriales (2021)','Polígonos industriales (2022)']
        this.unidadesInmobiliarias = 'Unidades inmobiliarias (2022)';
        this.isdt = 'Índice Sintético de Desarrollo Territorial (ISDT) (2020)'
    }

  ngOnInit(): void {
  }

  async onSearch(searchString: string) {
    this.popUpService.closePopUp();
    this.searchText = `Localizando ${searchString}...`;
    this.isError = false;
    this.isDone = false;
    this.isSearching = false;

    let self = this;
    await self.mapService.getObjectId(searchString).subscribe(async objectId => 
    {
        if (objectId.objectId !== undefined) 
        {
            let results : WFSResponse[] = [];
            self.searchText = 'Cargando datos...';
            for(let layer of self.layerSelection)
            {
                console.log(layer);
                let result = await self.mapService.getWFSFeatures(objectId.objectId!, objectId.typename, layer, 1000).toPromise();
                results.push(result);
            }

            let features : any[] = [];
            for(let item of results)
            {
                Array.prototype.push.apply(features, item.features);
            }
            results[0].features = features;
            results[0].fotalFeatures = results[0].features.length;
            self.searchText = searchString;
            self.isDone = true;
            console.log(results[0]);
            self.searchEvent.emit(results[0]);
        }
    });  
    
  }

    // Añadir aquí cualquier capa nueva y su correspondiente cadena
    public layerRelations = 
    [
        { optGroup:'Núcleos urbanos', options:
        [
            { label: 'Núcleos urbanos (2021)', value: 'nucleos_zbg_2021', isEnabled: true}, 
            { label: 'Núcleos urbanos (2022)', value: 'nucleos_zbg_2022', isEnabled: true}
        ]},
        { optGroup:'Centros educativos', options: 
        [
            {label: 'Centros educativos (2021)', value: 'centros_educativos_zbg_2021', isEnabled: true}, 
            { label: 'Centros educativos (2022)', value: 'centros_educativos_zbg_2022', isEnabled: true}
        ]},
        { optGroup:'Instalaciones Sanitarias', options: 
        [
            {label: 'Instalaciones sanitarias (2021)', value: 'instalaciones_sanitarias_zbg_2021', isEnabled: true},
            {label: 'Instalaciones sanitarias (2022)', value: 'instalaciones_sanitarias_zbg_2022', isEnabled: true}
        ]},
        { optGroup:'Polígonos Industriales', options:
        [
            {label: 'Polígonos industriales (2021)', value: 'poligonos_zbg_2021', isEnabled: true}, 
            {label: 'Polígonos industriales (2022)', value: 'poligonos_zbg_2022', isEnabled: true}
        ]},
        { optGroup:'Unidades inmobiliarias', options:
        [ 
            {label: 'Unidades inmobiliarias (2022)', value: 'ui_zbg_2022_x_muni', isEnabled: true}
        ]},
        /*{ optGroup:"Índice Sintético de Desarrollo Territorial", options: 
        [
            {label: 'ISDT (2020)', value: 'isdt_municipio'}
        ]},*/
        
    ];

    async capture(selection : any) 
    {    
        this.popUpService.closePopUp();
        
        this.isSearching = true;
        this.searchText = '';
        var group = this.layerRelations.filter(c => c.optGroup === selection.source.group.label)[0];
        if(selection.source.selected === true)
        {
            this.layerSelection.push(selection.source.value);           
            for(let elem of group.options)
            {
                elem.isEnabled = (elem.value === selection.source.value);
                this.search=true;
            }
        }
        else
        {
            this.layerSelection.splice(this.layerSelection.indexOf(selection.source.value), 1);
            for(let elem of group.options)
            {
                elem.isEnabled = true;
            }
        }

        if(this.layerSelection.length == 0)
        {
            return;
        }

        let self = this;
        await self.mapService.getObjectId("Jaca").subscribe(async objectId => 
        {
            if (objectId.objectId !== undefined) 
            {
                let results : WFSResponse[] = [];
                self.searchText = 'Cargando datos...';
                for(let layer of self.layerSelection)
                {
                    console.log(layer);
                    let result = await self.mapService.getWFSFeaturesAll(objectId.objectId!, objectId.typename, layer, 1000).toPromise();
                    results.push(result);
                }

                let features : any[] = [];
                for(let item of results)
                {
                    Array.prototype.push.apply(features, item.features);
                }
                results[0].features = features;
                results[0].fotalFeatures = results[0].features.length;
                self.searchText = "Jaca";
                self.isDone = true;
                console.log(results[0]);
                self.searchEvent.emit(results[0]);
            }
        });  
        /*self.mapService.getObjectId("Jaca").subscribe(
            objectId => {
              if (objectId.objectId !== undefined) {
                self.searchText = 'Cargando datos...';
                self.mapService.getWFSFeaturesAll(objectId.objectId, objectId.typename, self.layerSelection[0], 1000).subscribe(
                  wfsResponse => {
                    console.log(wfsResponse);
                    console.log("Layer: " + self.layerSelection);
                    self.searchText = "Jaca";
                    self.isDone = true;
                    self.searchEvent.emit(wfsResponse);
                  })
              } else {
                self.errorStatus = 'No se han encontrado resultados. Por favor, revise su consulta';
                self.isError = true;
              }
            },
            error => {
                self.errorStatus = 'Ha habido un fallo en la consulta. Por favor, intentelo de nuevo';
                self.isError = true;
            });*/

    //this.layerSelection = this.layerRelations[this.viewSelection];
    

    /*if (this.viewSelection == 'Núcleos urbanos (2021)'){
      this.layerSelection = 'nucleos_zbg_2021';
      this.mapService.getObjectId("Jaca").subscribe(
        objectId => {
          if (objectId.objectId !== undefined) {
            this.searchText = 'Cargando datos...';
            this.mapService.getWFSFeaturesAll(objectId.objectId, objectId.typename, this.layerSelection, 1000).subscribe(
              wfsResponse => {
                console.log(wfsResponse);
                console.log("Layer: " + this.layerSelection);
                this.searchText = "Jaca";
                this.isDone = true;
                this.searchEvent.emit(wfsResponse);
              })
          } else {
            this.errorStatus = 'No se han encontrado resultados. Por favor, revise su consulta';
            this.isError = true;
          }
        },
        error => {
          this.errorStatus = 'Ha habido un fallo en la consulta. Por favor, intentelo de nuevo';
          this.isError = true;
        });
    }else if (this.viewSelection == 'Núcleos urbanos (2022)'){
      this.layerSelection = 'nucleos_zbg_2022';
      this.mapService.getObjectId("Jaca").subscribe(
        objectId => {
          if (objectId.objectId !== undefined) {
            this.searchText = 'Cargando datos...';
            this.mapService.getWFSFeaturesAll(objectId.objectId, objectId.typename, this.layerSelection, 1000).subscribe(
              wfsResponse => {
                console.log(wfsResponse);
                this.searchText = "Jaca";
                this.isDone = true;
                this.searchEvent.emit(wfsResponse);
              })
          } else {
            this.errorStatus = 'No se han encontrado resultados. Por favor, revise su consulta';
            this.isError = true;
          }
        },
        error => {
          this.errorStatus = 'Ha habido un fallo en la consulta. Por favor, intentelo de nuevo';
          this.isError = true;
        });
    }
    else if (this.viewSelection == 'Unidades inmobiliarias (2022)'){
      this.layerSelection = 'ui_zbg_2022_x_muni';
      this.mapService.getObjectId("Jaca").subscribe(
        objectId => {
          if (objectId.objectId !== undefined) {
            this.searchText = 'Cargando datos...';
            this.mapService.getWFSFeaturesAll(objectId.objectId, objectId.typename, this.layerSelection, 1000).subscribe(
              wfsResponse => {
                console.log(wfsResponse);
                this.searchText = "Jaca";
                this.isDone = true;
                this.searchEvent.emit(wfsResponse);
              })
          } else {
            this.errorStatus = 'No se han encontrado resultados. Por favor, revise su consulta';
            this.isError = true;
          }
        },
        error => {
          this.errorStatus = 'Ha habido un fallo en la consulta. Por favor, intentelo de nuevo';
          this.isError = true;
        });
    }
    else if (this.viewSelection == 'Centros educativos (2021)'){
      this.layerSelection = 'centros_educativos_zbg_2021';
      this.mapService.getObjectId("Jaca").subscribe(
        objectId => {
          if (objectId.objectId !== undefined) {
            this.searchText = 'Cargando datos...';
            this.mapService.getWFSFeaturesAll(objectId.objectId, objectId.typename, this.layerSelection, 1000).subscribe(
              wfsResponse => {
                console.log(wfsResponse);
                this.searchText = "Jaca";
                this.isDone = true;
                this.searchEvent.emit(wfsResponse);
              })
          } else {
            this.errorStatus = 'No se han encontrado resultados. Por favor, revise su consulta';
            this.isError = true;
          }
        },
        error => {
          this.errorStatus = 'Ha habido un fallo en la consulta. Por favor, intentelo de nuevo';
          this.isError = true;
        });
    }
    else if (this.viewSelection == 'Centros educativos (2022)'){
      this.layerSelection = 'centros_educativos_zbg_2022';
      this.mapService.getObjectId("Jaca").subscribe(
        objectId => {
          if (objectId.objectId !== undefined) {
            this.searchText = 'Cargando datos...';
            this.mapService.getWFSFeaturesAll(objectId.objectId, objectId.typename, this.layerSelection, 1000).subscribe(
              wfsResponse => {
                console.log(wfsResponse);
                this.searchText = "Jaca";
                this.isDone = true;
                this.searchEvent.emit(wfsResponse);
              })
          } else {
            this.errorStatus = 'No se han encontrado resultados. Por favor, revise su consulta';
            this.isError = true;
          }
        },
        error => {
          this.errorStatus = 'Ha habido un fallo en la consulta. Por favor, intentelo de nuevo';
          this.isError = true;
        });
    }
    else if (this.viewSelection == 'Instalaciones sanitarias (2021)'){
      this.layerSelection = 'instalaciones_sanitarias_zbg_2021';
      this.mapService.getObjectId("Jaca").subscribe(
        objectId => {
          if (objectId.objectId !== undefined) {
            this.searchText = 'Cargando datos...';
            this.mapService.getWFSFeaturesAll(objectId.objectId, objectId.typename, this.layerSelection, 1000).subscribe(
              wfsResponse => {
                console.log(wfsResponse);
                this.searchText = "Jaca";
                this.isDone = true;
                this.searchEvent.emit(wfsResponse);
              })
          } else {
            this.errorStatus = 'No se han encontrado resultados. Por favor, revise su consulta';
            this.isError = true;
          }
        },
        error => {
          this.errorStatus = 'Ha habido un fallo en la consulta. Por favor, intentelo de nuevo';
          this.isError = true;
        });
    }
    else if (this.viewSelection == 'Instalaciones sanitarias (2022)'){
      this.layerSelection = 'instalaciones_sanitarias_zbg_2022';
      this.mapService.getObjectId("Jaca").subscribe(
        objectId => {
          if (objectId.objectId !== undefined) {
            this.searchText = 'Cargando datos...';
            this.mapService.getWFSFeaturesAll(objectId.objectId, objectId.typename, this.layerSelection, 1000).subscribe(
              wfsResponse => {
                console.log(wfsResponse);
                this.searchText = "Jaca";
                this.isDone = true;
                this.searchEvent.emit(wfsResponse);
              })
          } else {
            this.errorStatus = 'No se han encontrado resultados. Por favor, revise su consulta';
            this.isError = true;
          }
        },
        error => {
          this.errorStatus = 'Ha habido un fallo en la consulta. Por favor, intentelo de nuevo';
          this.isError = true;
        });
    }
    else if (this.viewSelection == 'Polígonos industriales (2021)'){
      this.layerSelection = 'poligonos_zbg_2021';
      this.mapService.getObjectId("Jaca").subscribe(
        objectId => {
          if (objectId.objectId !== undefined) {
            this.searchText = 'Cargando datos...';
            this.mapService.getWFSFeaturesAll(objectId.objectId, objectId.typename, this.layerSelection, 1000).subscribe(
              wfsResponse => {
                console.log(wfsResponse);
                this.searchText = "Jaca";
                this.isDone = true;
                this.searchEvent.emit(wfsResponse);
              })
          } else {
            this.errorStatus = 'No se han encontrado resultados. Por favor, revise su consulta';
            this.isError = true;
          }
        },
        error => {
          this.errorStatus = 'Ha habido un fallo en la consulta. Por favor, intentelo de nuevo';
          this.isError = true;
        });
    }
    else if (this.viewSelection == 'Polígonos industriales (2022)'){
      this.layerSelection = 'poligonos_zbg_2022';
      this.mapService.getObjectId("Jaca").subscribe(
        objectId => {
          if (objectId.objectId !== undefined) {
            this.searchText = 'Cargando datos...';
            this.mapService.getWFSFeaturesAll(objectId.objectId, objectId.typename, this.layerSelection, 1000).subscribe(
              wfsResponse => {
                console.log(wfsResponse);
                this.searchText = "Jaca";
                this.isDone = true;
                this.searchEvent.emit(wfsResponse);
              })
          } else {
            this.errorStatus = 'No se han encontrado resultados. Por favor, revise su consulta';
            this.isError = true;
          }
        },
        error => {
          this.errorStatus = 'Ha habido un fallo en la consulta. Por favor, intentelo de nuevo';
          this.isError = true;
        });
    }
    else if (this.viewSelection == 'Índice Sintético de Desarrollo Territorial (ISDT) (2020)'){
      this.layerSelection = 'isdt_municipio';
      this.mapService.getObjectId("Jaca").subscribe(
        objectId => {
          if (objectId.objectId !== undefined) {
            this.searchText = 'Cargando datos...';
            this.mapService.getWFSFeaturesAll(objectId.objectId, objectId.typename, this.layerSelection, 1000).subscribe(
              wfsResponse => {
                console.log(wfsResponse);
                this.searchText = "Jaca";
                this.isDone = true;
                this.searchEvent.emit(wfsResponse);
              })
          } else {
            this.errorStatus = 'No se han encontrado resultados. Por favor, revise su consulta';
            this.isError = true;
          }
        },
        error => {
          this.errorStatus = 'Ha habido un fallo en la consulta. Por favor, intentelo de nuevo';
          this.isError = true;
        });
    }*/
  }
}