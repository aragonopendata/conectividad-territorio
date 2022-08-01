import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../main/layout/layout.component';
import { HeaderComponent } from '../main/header/header.component';
import { FooterComponent } from '../main/footer/footer.component';
import { MapComponent } from '../main/map/map.component';
import { PopupComponent } from './popup/popup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { MatSelectModule } from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';

@NgModule({
  declarations: [
    LayoutComponent,
    HeaderComponent,
    FooterComponent,
    MapComponent,
    PopupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule
  ],
  exports: [
    LayoutComponent
  ]
})
export class MainModule { }
