import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ignoreElements } from 'rxjs/operators';
import { FeatureSelect } from 'src/app/shared/models/feature-select.model';
import { PopupInfoNucleos } from 'src/app/shared/models/popup-info.model';
import { PopUpService } from 'src/app/shared/services/popup.service';


Chart.register(...registerables);

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
    
})
export class PopupComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() featureSelect!: FeatureSelect;
  @Input() isHide!: boolean;
  @Input() layerSelection!: string;
  @ViewChild('chart', { read: ElementRef }) chartRef!: ElementRef;

  popupInfo: PopupInfoNucleos = {
    codigo_zon: '',
    d_muni_ine: '',
    d_nucleo_i: '',
    por_afec_nuc_x_zona: 0,
    vivienda_media: '',
    tipo_zona: ''
  };

  popupInfoDynamic: Map<string, any> | null = null;

  chart!: Chart;

  TITLE = 'title'

  constructor(private popUpService: PopUpService) { }

  ngOnInit(): void {
    this.popUpService.closePopUpEvent$.subscribe(close => 
    {
        console.log(close);
        if(close) this.onClosePopup()
    });
  }

  getPopupInfoBasedOnLayer(featureSelect: FeatureSelect):  Map<string, any>{
    const layer= featureSelect.feature.id_.split('.')[0]

    const map = new Map();
    switch(layer){
      case 'nucleos_zbg_2021':
        map.set(this.TITLE, {value: "Núcleo: " + this.getFeatureValue(featureSelect, "d_nucleo_i" ) + " (2021)", format: ""});
        map.set('Municipio (INE)', {value: this.getFeatureValue(featureSelect,"d_muni_ine"), format: ""} );

        map.set('Tipo de zona', {value: this.getFeatureValue(featureSelect,"tipo_zona"), format: ""} );

        map.set('Área afectada del nucleo', {value: this.getFeatureValue(featureSelect,"por_afec_nuc_x_zona"), format: "||value|| %"} );

        map.set('ISDT100', {value: this.getFeatureValue(featureSelect,"isdt_100"), format: ""} );

        map.set('Factor económico', {value: this.getFeatureValue(featureSelect,"f_economico"), format: ""} );

        map.set('Factor alojamiento', {value: this.getFeatureValue(featureSelect, "f_alojamiento" ), format: ""} );

        map.set('Factor equipamiento y servicio', {value: this.getFeatureValue(featureSelect, "f_equpiamiento_servicio" ), format: ""} );

        map.set('Factor movilidad', {value: this.getFeatureValue(featureSelect, "f_movilidad" ), format: ""} );    

        map.set('Factor escenario y patrimonio', {value: this.getFeatureValue(featureSelect, "f_escenario_patrimonio" ), format: ""} );

        map.set('Código de la zona', {value: this.getFeatureValue(featureSelect, "codigo_zon" ), format: ""} );
        
      break;
      case 'nucleos_zbg_2022':
        map.set(this.TITLE, {value: "Núcleo: " + this.getFeatureValue(featureSelect, "d_nucleo_i" )+ " (2022)", format: ""});
        map.set('Municipio (INE)', {value: this.getFeatureValue(featureSelect,"d_muni_ine"), format: ""} );

        map.set('Tipo de zona', {value: this.getFeatureValue(featureSelect,"tipo_zona"), format: ""} );

        map.set('Área afectada del nucleo', {value: this.getFeatureValue(featureSelect,"por_afec_nuc_x_zona"), format: "||value|| %"} );

        map.set('ISDT100', {value: this.getFeatureValue(featureSelect,"isdt_100"), format: ""} );

        map.set('Factor económico', {value: this.getFeatureValue(featureSelect,"f_economico"), format: ""} );

        map.set('Factor alojamiento', {value: this.getFeatureValue(featureSelect, "f_alojamiento" ), format: ""} );

        map.set('Factor equipamiento y servicio', {value: this.getFeatureValue(featureSelect, "f_equpiamiento_servicio" ), format: ""} );

        map.set('Factor movilidad', {value: this.getFeatureValue(featureSelect, "f_movilidad" ), format: ""} );    

        map.set('Factor escenario y patrimonio', {value: this.getFeatureValue(featureSelect, "f_escenario_patrimonio" ), format: ""} );

        map.set('Código de la zona', {value: this.getFeatureValue(featureSelect, "codigo_zon" ), format: ""} );
      break;
      case 'centros_educativos_zbg_2021':
        map.set(this.TITLE, {value: "Centro educativo: " + this.getFeatureValue(featureSelect, "centro" )+ " (2021)", format: ""});
        map.set('Localidad', {value: this.getFeatureValue(featureSelect,"localidad"), format: ""} );

        map.set('Tipo de zona', {value: this.getFeatureValue(featureSelect,"tipo_zona"), format: ""} );

        map.set('Código de la zona', {value: this.getFeatureValue(featureSelect, "codigo_zona" ), format: ""} );
      break;
      case 'centros_educativos_zbg_2022':
        map.set(this.TITLE, {value:"Centro educativo: " + this.getFeatureValue(featureSelect, "centro" )+ " (2022)", format: ""});
        map.set('Localidad', {value: this.getFeatureValue(featureSelect,"localidad"), format: ""} );

        map.set('Tipo de zona', {value: this.getFeatureValue(featureSelect,"tipo_zona"), format: ""} );

        map.set('Código de la zona', {value: this.getFeatureValue(featureSelect, "codigo_zona" ), format: ""} );
      break;
      case 'instalaciones_sanitarias_zbg_2021':
        map.set(this.TITLE, {value:"Instalación sanitaria: " + this.getFeatureValue(featureSelect, "centro" )+ " (2021)", format: ""});       
        map.set('Localidad', {value: this.getFeatureValue(featureSelect,"localidad"), format: ""} );

        map.set('Tipo de zona', {value: this.getFeatureValue(featureSelect,"tipo_zona"), format: ""} );

        map.set('Código de la zona', {value: this.getFeatureValue(featureSelect, "codigo_zona" ), format: ""} );
      break;
      case 'instalaciones_sanitarias_zbg_2022':
        map.set(this.TITLE, {value:"Instalación sanitaria: " + this.getFeatureValue(featureSelect, "centro" )+ " (2022)", format: ""});       
        map.set('Localidad', {value: this.getFeatureValue(featureSelect,"localidad"), format: ""} );

        map.set('Tipo de zona', {value: this.getFeatureValue(featureSelect,"tipo_zona"), format: ""} );

        map.set('Código de la zona', {value: this.getFeatureValue(featureSelect, "codigo_zona" ), format: ""} );
      break;
      case 'poligonos_zbg_2021':
        map.set(this.TITLE, {value:"Polígono: " + this.getFeatureValue(featureSelect, "nombre_poligono" )+ " (2021)", format: ""});       
        map.set('Localidad', {value: this.getFeatureValue(featureSelect,"localidad"), format: ""} );

        map.set('Tipo de zona', {value: this.getFeatureValue(featureSelect,"tipo_zona"), format: ""} );

        map.set('Código de la zona', {value: this.getFeatureValue(featureSelect, "codigo_zona" ), format: ""} );
      break;
      case 'poligonos_zbg_2022':
        map.set(this.TITLE, {value:"Polígono: " + this.getFeatureValue(featureSelect, "nombre_poligono" )+ " (2022)", format: ""});       
        map.set('Localidad', {value: this.getFeatureValue(featureSelect,"localidad"), format: ""} );

        map.set('Tipo de zona', {value: this.getFeatureValue(featureSelect,"tipo_zona"), format: ""} );

        map.set('Código de la zona', {value: this.getFeatureValue(featureSelect, "codigo_zona" ), format: ""} );
      break;
      case 'ui_zbg_2022_x_muni':
        map.set(this.TITLE, {value: "Municipio: " + this.getFeatureValue(featureSelect, "municipio" )+ " (2022)", format: ""});       
        map.set('Tipo de zona', {value: this.getFeatureValue(featureSelect,"tipo_zona"), format: ""} );

        map.set('Código de la zona', {value: this.getFeatureValue(featureSelect, "codigo_zona" ), format: ""} );

        map.set('Unidades Inmobiliarias Totales', {value: this.getFeatureValue(featureSelect,"ui_total"), format: ""} );

        this.getFeatureValue(featureSelect,"uis_a") && map.set('Almacén-Estacionamiento ', {value: this.getFeatureValue(featureSelect,"uis_a"), format: ""} );

        this.getFeatureValue(featureSelect, "uis_b" ) && map.set('Almacén agrario', {value: this.getFeatureValue(featureSelect, "uis_b" ), format: ""} );

        this.getFeatureValue(featureSelect, "uis_c" ) && map.set('Comercial', {value: this.getFeatureValue(featureSelect, "uis_c" ), format: ""} );

        this.getFeatureValue(featureSelect,"uis_e") && map.set('Cultural', {value: this.getFeatureValue(featureSelect,"uis_e"), format: ""} );

        this.getFeatureValue(featureSelect,"uis_g") && map.set('Ocio y Hostelería', {value: this.getFeatureValue(featureSelect,"uis_g"), format: ""} );

        this.getFeatureValue(featureSelect, "uis_i" ) && map.set('Industrial', {value: this.getFeatureValue(featureSelect, "uis_i" ), format: ""} );

        this.getFeatureValue(featureSelect, "uis_k" ) && map.set('Deportivo', {value: this.getFeatureValue(featureSelect, "uis_k" ), format: ""} );

        this.getFeatureValue(featureSelect,"uis_m") && map.set('Obras de urbanización y jardinería', {value: this.getFeatureValue(featureSelect,"uis_m"), format: ""} );

        this.getFeatureValue(featureSelect,"uis_o") && map.set('Oficinas', {value: this.getFeatureValue(featureSelect,"uis_o"), format: ""} );

        this.getFeatureValue(featureSelect, "uis_p" ) && map.set('Edificio singular', {value: this.getFeatureValue(featureSelect, "uis_p" ), format: ""} );

        this.getFeatureValue(featureSelect,"uis_r") && map.set('Religioso', {value: this.getFeatureValue(featureSelect,"uis_r"), format: ""} );

        this.getFeatureValue(featureSelect, "uis_t" ) && map.set('Espectáculos', {value: this.getFeatureValue(featureSelect, "uis_t" ), format: ""} );

        this.getFeatureValue(featureSelect, "uis_v" ) && map.set('Residencial (Viviendas)', {value: this.getFeatureValue(featureSelect, "uis_v" ), format: ""} );

        this.getFeatureValue(featureSelect,"uis_y") && map.set('Sanidad y Beneficiencia', {value: this.getFeatureValue(featureSelect,"uis_y"), format: ""} );

        this.getFeatureValue(featureSelect,"uis_j") && map.set('Industrial agrario', {value: this.getFeatureValue(featureSelect,"uis_j"), format: ""} );

        this.getFeatureValue(featureSelect, "uis_z" ) && map.set('Agrario', {value: this.getFeatureValue(featureSelect, "uis_z" ), format: ""} );

        map.set('ISDT100', {value: this.getFeatureValue(featureSelect,"isdt_100"), format: ""} );

        map.set('Factor económico', {value: this.getFeatureValue(featureSelect,"f_economico"), format: ""} );

        map.set('Factor alojamiento', {value: this.getFeatureValue(featureSelect, "f_alojamiento" ), format: ""} );

        map.set('Factor equipamiento y servicio', {value: this.getFeatureValue(featureSelect, "f_equpiamiento_servicio" ), format: ""} );

        map.set('Factor movilidad', {value: this.getFeatureValue(featureSelect, "f_movilidad" ), format: ""} );    

        map.set('Factor escenario y patrimonio', {value: this.getFeatureValue(featureSelect, "f_escenario_patrimonio" ), format: ""} );
      break;
      case "viviendas_zn_2022_x_muni" :
        map.set(this.TITLE, {value: "Municipio: " + this.getFeatureValue(featureSelect, "municipio" )+ " (2022)", format: ""});       
        
        map.set('Código municipio ine', {value: this.getFeatureValue(featureSelect, "c_muni_ine" ), format: ""} );

        map.set('Viviendas en zona negra', {value: this.getFeatureValue(featureSelect,"viviendas_zonanegra"), format: ""} );

        map.set('Porcentaje de viviendas totales', {value: this.getFeatureValue(featureSelect,"porcentaje_viviendas_zonanegra"), format: "||value|| %"} );
      break;
      default:
        break;
    }

    return map;
  }

  get titleMap(){
    return this.popupInfoDynamic?.get(this.TITLE);
  }

  get yearMap(){
    return this.popupInfoDynamic?.get("Año");
  }

  get propertiesMap(){
    return new Map(
      [...this.popupInfoDynamic as Map<string, any>]
      .filter(([k, v]) =>k != this.TITLE )
    );
  }

  asIsOrder(a, b) {
    return 1;
 }

  getFormatValue(element){
    return this.applyForm(element.value.value, element.value.format);
  }

  applyForm(value: string, format: string){
    return (format && format.length > 0) ? format.replace('||value||', value): value;
  }

  getFeatureValue(featureSelect: FeatureSelect, key:string){
    return featureSelect.feature.get(key);
  }

  ngAfterViewInit(): void {
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes.featureSelect.currentValue !== undefined) {
      /* this.updateInfo(changes.featureSelect.currentValue); */
      this.popupInfoDynamic = this.getPopupInfoBasedOnLayer(changes.featureSelect.currentValue);
      this.isHide = false;
      //this.updateChart(this.popupInfo.raw);
    }
  }

  /**updateInfo(featureSelect: FeatureSelect): void {
    const feature = featureSelect.feature;
    const formatter = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    });
    this.popupInfo.via_loc = feature.get('via_loc');
    for (let valor of JSON.parse(feature.get('valores'))) {
      if (valor.anyo >= this.popupInfo.anyo && valor.tipo === 1) {
        this.popupInfo.anyo = valor.anyo;
        this.popupInfo.vivienda_min = valor.min;
        this.popupInfo.vivienda_max = valor.max;
        this.popupInfo.vivienda_media = valor.media;
      } else if (valor.anyo >= this.popupInfo.anyo && valor.tipo === 2) {
        this.popupInfo.anyo = valor.anyo;
        this.popupInfo.local_min = valor.min;
        this.popupInfo.local_max = valor.max;
        this.popupInfo.local_media = valor.media;
      }
    }
    this.popupInfo.vivienda_min = formatter.format(parseFloat(this.popupInfo.vivienda_min));
    this.popupInfo.vivienda_max = formatter.format(parseFloat(this.popupInfo.vivienda_max));
    this.popupInfo.vivienda_media = formatter.format(parseFloat(this.popupInfo.vivienda_media));
    this.popupInfo.local_min = formatter.format(parseFloat(this.popupInfo.local_min));
    this.popupInfo.local_max = formatter.format(parseFloat(this.popupInfo.local_max));
    this.popupInfo.local_media = formatter.format(parseFloat(this.popupInfo.local_media));
    this.popupInfo.raw = JSON.parse(feature.get('valores'));
    this.isHide = false;
  }**/

  /* updateInfo(featureSelect: FeatureSelect): void {
    const feature = featureSelect.feature;
    const formatter = new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    });
    this.popupInfo.codigo_zon = feature.get('codigo_zon');
    this.popupInfo.d_muni_ine = feature.get('d_muni_ine');
    this.popupInfo.d_nucleo_i = feature.get('d_nucleo_i');
    this.popupInfo.por_afec_nuc_x_zona = feature.get('por_afec_nuc_x_zona');
    this.popupInfo.tipo_zona = feature.get('tipo_zona');
    this.isHide = false;
    console.log(this.layerSelection);
  } */

  

  /**updateChart(data: any): void {
    let labelSet = new Set();
    let labels: any = [];
    let data_aux: any = {};
    let data_vivienda: any = [];
    let data_locales: any = [];

    for (let row of data) {
      if (!data_aux[row.anyo]) {
        labelSet.add(row.anyo);
        data_aux[row.anyo] = {
          vivienda: NaN,
          locales: NaN
        }
      }
      if (row.tipo == 1) {
        data_aux[row.anyo]['vivienda'] = row.media;
      } else {
        data_aux[row.anyo]['locales'] = row.media;
      }
    }
    labels = Array.from(labelSet);

    for (let label of labels) {
      data_vivienda.push(data_aux[label]['vivienda']);
      data_locales.push(data_aux[label]['locales']);
    }

    const skipped = (ctx: any, value: any) => ctx.p0.skip || ctx.p1.skip ? value : undefined;
    if (this.chart !== undefined) {
      this.chart.destroy();
    }
    let ctx = this.chartRef.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Vivienda',
          data: data_vivienda,
          borderColor: 'rgb(255, 99, 132)',
          segment: {
            borderDash: ctx => skipped(ctx, [6, 6]),
          }
        }, {
          label: 'Locales',
          data: data_locales,
          borderColor: 'rgb(54, 162, 235)',
          segment: {
            borderDash: ctx => skipped(ctx, [6, 6]),
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }**/

  @ViewChild("popupContent") popupContent!: ElementRef;

  onClosePopup(): void {
    this.isHide = true;
    if(this.popupContent != undefined && this.popupContent.nativeElement !== undefined)
        this.popupContent.nativeElement.scrollTop = 0;
  }

}
