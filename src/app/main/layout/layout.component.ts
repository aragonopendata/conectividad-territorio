import { Component, Input, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { WFSResponse } from 'src/app/shared/models/wfs-response.model';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  @Input() wfsResponse!: WFSResponse;
  
  //Tester Ag-Grid Table
/*
  rowData: any[] = [
    {provincia: 'Teruel', permiso: 'A2', edad: 30 + " a "+ +34, total: 7},
    {provincia: 'Huesca', permiso: 'A2', edad: 30 + " a "+ +34, total: 10},
    {provincia: 'Zaragoza', permiso: 'A2', edad: 30 + " a "+ +34, total: 32},
    {provincia: 'Teruel', permiso: 'A2', edad: 30 + " a "+ +34, total: 8},
    {provincia: 'Zaragoza', permiso: 'A2', edad: 30 + " a "+ +34, total: 32},
    {provincia: 'Teruel', permiso: 'A2', edad: 30 + " a "+ +34, total: 8},
    {provincia: 'Zaragoza', permiso: 'A2', edad: 30 + " a "+ +34, total: 32},
    {provincia: 'Teruel', permiso: 'A2', edad: 30 + " a "+ +34, total: 8},
    {provincia: 'Teruel', permiso: 'A2', edad: 30 + " a "+ +34, total: 7},
    {provincia: 'Huesca', permiso: 'A2', edad: 30 + " a "+ +34, total: 10},
    {provincia: 'Zaragoza', permiso: 'A2', edad: 30 + " a "+ +34, total: 32},
    {provincia: 'Teruel', permiso: 'A2', edad: 30 + " a "+ +34, total: 8},
    {provincia: 'Zaragoza', permiso: 'A2', edad: 30 + " a "+ +34, total: 32},
    {provincia: 'Teruel', permiso: 'A2', edad: 30 + " a "+ +34, total: 8},
    {provincia: 'Zaragoza', permiso: 'A2', edad: 30 + " a "+ +34, total: 32},
    {provincia: 'Teruel', permiso: 'A2', edad: 30 + " a "+ +34, total: 8},
    
  ];
  colDefs: ColDef[] = [
    {field: 'provincia', sortable: true, filter: true},
    {field: 'permiso',sortable: true, filter: true},
    {field: 'edad',sortable: true, filter: true},
    {field: 'total',sortable: true, filter: true},

  ];
*/
  constructor() { }

  ngOnInit(): void {
    
  }

  updateMap(wfsResponse: WFSResponse): void {
    this.wfsResponse = wfsResponse;
    console.log("Features:");
    console.log(this.wfsResponse.features[0].properties);
  }

 

}


