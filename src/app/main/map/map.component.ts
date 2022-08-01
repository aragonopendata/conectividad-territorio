import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Feature, Map, Overlay, View } from 'ol';
import { Extent, getCenter } from 'ol/extent';
import { FeatureSelect } from 'src/app/shared/models/feature-select.model';
import { WFSResponse } from 'src/app/shared/models/wfs-response.model';
import { MapService } from 'src/app/shared/services/map.service';
import { PopupComponent } from '../popup/popup.component';
import { IgearService } from 'src/app/shared/services/igear.service';
import VectorSource from 'ol/source/Vector';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() wfsResponse!: WFSResponse;
  @ViewChild(PopupComponent, { read: ElementRef }) popupRef!: ElementRef;
  isDone: boolean = false;
  isPopupHide: boolean = true;
  target: string = 'map';
  olMap: Map = new Map({});
  overlay!: Overlay;
  featureSelect!: FeatureSelect;

  

  constructor(private mapService: MapService, private igearService: IgearService) { 
    
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateMap();
  }

  initMap(): void {
    this.overlay = new Overlay({
      element: this.popupRef.nativeElement,
      autoPan: false,
      autoPanAnimation: {
          duration: 250,
      },
    });
    this.olMap = this.mapService.initMap(this.target, this.overlay);
    this.olMap.on('click', (evt) => {
      let pixel = this.olMap.getEventPixel(evt.originalEvent);
      let minDistance = Number.MAX_VALUE;
      let selectedFeature : any = undefined;

      this.olMap.forEachFeatureAtPixel(pixel, (feature, resolution) => {
        // Calculamos cuál es la feature con el centro más cercano a donde se ha clickado para enseñar su información en el popup.
        let featureCenter = this.olMap.getPixelFromCoordinate(getCenter(feature.getGeometry()!.getExtent()));
        let distanceX = featureCenter[0] - pixel[0];
        let distanceY = featureCenter[1] - pixel[1];
        let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        if(distance < minDistance)
        {
            minDistance = distance;
            selectedFeature = feature;
        }
      })
      if(selectedFeature !== undefined)
      {
        const featureSelect = {
            evt: evt,
            feature: selectedFeature
          }
          this.updatePopup(featureSelect);
      }
    });
  }

  updateMap(): void {
    if (this.wfsResponse !== undefined) {
      this.mapService.addLayer(this.olMap, '', this.wfsResponse);
      this.isDone = true;
    }
  }

  updateMapLayer(layer: string): void {
    if (this.wfsResponse !== undefined) {
      this.mapService.addLayer(this.olMap, layer, this.wfsResponse);
      this.isDone = true;
    }
  }

  updatePopup(featureSelect: FeatureSelect): void {
    this.featureSelect = featureSelect;
    this.overlay.setPosition(featureSelect.evt.coordinate);
  }
 

 

}
