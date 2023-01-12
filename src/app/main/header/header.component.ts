import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { WFSResponse } from 'src/app/shared/models/wfs-response.model';
import { MapService } from 'src/app/shared/services/map.service';
import { PopUpService } from 'src/app/shared/services/popup.service';
import { FormControl } from '@angular/forms';
import { ObjectId } from 'src/app/shared/models/object-id.model';
import { Feature } from 'ol';
import { ReturnStatement } from '@angular/compiler';
import Geometry from 'ol/geom/Geometry';
import { none } from 'ol/centerconstraint';
import { remove } from 'ol/array';

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
    popUpDescription!: string;

    listNucleos: string[];
    listCentrosEducativos: string[];
    listInstalacionesSanitarias: string[];
    listPoligonosIndustriales: string[];
    unidadesInmobiliarias: string;
    isdt: string;
    viviendas: string;
    search = false;

    layerSelection: string[] = [];

    constructor(
        private mapService: MapService,
        private popUpService: PopUpService
    ) {
        //this.listOptions = ['Núcleos Urbanos','Unidades inmobiliarias','Centros Educativos','Instalaciones Sanitarias','Polígonos industriales','Índide Sintético de Desarrollo Territorial (ISDT)']
        this.listNucleos = ['Núcleos urbanos (2021)', 'Núcleos urbanos (2022)']
        this.listCentrosEducativos = ['Centros educativos (2021)', 'Centros educativos (2022)']
        this.listInstalacionesSanitarias = ['Instalaciones sanitarias (2021)', 'Instalaciones sanitarias (2022)']
        this.listPoligonosIndustriales = ['Polígonos industriales (2021)', 'Polígonos industriales (2022)']
        this.unidadesInmobiliarias = 'Unidades inmobiliarias (2022)';
        this.isdt = 'Índice Sintético de Desarrollo Territorial (ISDT) (2020)'
        this.viviendas = 'Viviendas zonas negras (2022)'
    }

    ngOnInit(): void {
    }


    async onSearch(searchString: string) {
        this.popUpService.closePopUp();
        this.searchText = `Búsqueda: "${searchString}"`;
        this.isError = false;
        this.isDone = false;
        this.isSearching = false;

        let self = this;
        await self.mapService.getObjectId(searchString).subscribe(async objectId => {
            if (objectId != null && objectId.objectId !== undefined) {
                let results: WFSResponse[] = [];
                self.searchText = 'Cargando datos...';
                for (let layer of self.layerSelection) {
                    console.log(layer);
                    try {
                        const regex = /^(?:0[1-9]|[1-4]\d|5[0-2])\d{3}$/;
                        var result;
                        if (searchString.match(regex))
                            result = await self.mapService.getWFSFeaturesByCP(objectId.objectId!, objectId.typename, layer, 1000).toPromise();
                        else
                            result = await self.mapService.getWFSFeatures(objectId.objectId!, objectId.typename, layer, 1000).toPromise();

                        if (result["totalFeatures"] > 0)
                            results.push(result);
                        if (layer == "viviendas_zn_2022_x_muni")
                            result.features = result.features.filter(obj => (obj.properties.municipio.toLowerCase() == searchString.toLowerCase()))
                        else if (layer == "nucleos_zbg_2021" || layer == "nucleos_zbg_2022")
                            result.features = result.features.filter(obj => (obj.properties.d_muni_ine.toLowerCase() == searchString.toLowerCase()))
                    }
                    catch {
                        console.log("Datos no encontrados para ese municipio")
                    }

                }
                if (results.length != 0) {
                    let features: any[] = [];
                    for (let item of results) {
                        Array.prototype.push.apply(features, item.features);
                    }
                    results[0].features = features;
                    results[0].fotalFeatures = results[0].features.length;
                    self.searchText = searchString;
                    self.isDone = true;
                    console.log(results[0]);
                    self.searchEvent.emit(results[0]);
                }
                else {
                    this.searchText = "";
                    this.isError = true;
                    this.errorStatus = "No se han encontrado datos en las capas seleccionadas para el municipio " + searchString + ".";
                    this.isDone = true;
                }
            } else {
                let wfsResponse!: WFSResponse;
                this.searchText = "";
                this.isError = true;
                this.errorStatus = "No se ha encontrado el municipio " + searchString + ". Por favor, revise que el nombre del municipio es completo o que el código postal es correcto.";
                this.isDone = true;
            }
        });

    }

    // Añadir aquí cualquier capa nueva y su correspondiente cadena
    public layerRelations =
        [
            {
                optGroup: 'Viviendas zonas negras', options:
                    [
                        { label: 'Viviendas zonas negras (2022)', value: 'viviendas_zn_2022_x_muni', isEnabled: true },
                    ]
            },
            {
                optGroup: 'Núcleos urbanos', options:
                    [
                        { label: 'Núcleos urbanos (2021)', value: 'nucleos_zbg_2021', isEnabled: true },
                        { label: 'Núcleos urbanos (2022)', value: 'nucleos_zbg_2022', isEnabled: true }
                    ]
            },
            {
                optGroup: 'Centros educativos', options:
                    [
                        { label: 'Centros educativos (2021)', value: 'centros_educativos_zbg_2021', isEnabled: true },
                        { label: 'Centros educativos (2022)', value: 'centros_educativos_zbg_2022', isEnabled: true }
                    ]
            },
            {
                optGroup: 'Instalaciones Sanitarias', options:
                    [
                        { label: 'Instalaciones sanitarias (2021)', value: 'instalaciones_sanitarias_zbg_2021', isEnabled: true },
                        { label: 'Instalaciones sanitarias (2022)', value: 'instalaciones_sanitarias_zbg_2022', isEnabled: true }
                    ]
            },
            {
                optGroup: 'Polígonos Industriales', options:
                    [
                        { label: 'Polígonos industriales (2021)', value: 'poligonos_zbg_2021', isEnabled: true },
                        { label: 'Polígonos industriales (2022)', value: 'poligonos_zbg_2022', isEnabled: true }
                    ]
            },
            {
                optGroup: 'Unidades inmobiliarias', options:
                    [
                        { label: 'Unidades inmobiliarias (2022)', value: 'ui_zbg_2022_x_muni', isEnabled: true }
                    ]
            },


        ];

    async capture(selection: any) {
        this.popUpService.closePopUp();

        this.isSearching = true;
        this.searchText = '';
        var group = this.layerRelations.filter(c => c.optGroup === selection.source.group.label)[0];
        if (selection.source.selected === true) {
            this.layerSelection.push(selection.source.value);
            for (let elem of group.options) {
                elem.isEnabled = (elem.value === selection.source.value);
                this.search = true;
            }
        }
        else {
            this.layerSelection.splice(this.layerSelection.indexOf(selection.source.value), 1);
            for (let elem of group.options) {
                elem.isEnabled = true;
            }
        }

        if (this.layerSelection.length == 0) {
            return;
        }

        let self = this;
    }
}
