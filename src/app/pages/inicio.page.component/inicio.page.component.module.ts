import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesyAngularModule } from 'desy-angular';
import { InicioPage } from './inicio.page.component';
import { InicioPageRoutingModule } from './inicio.page.component.routing.module';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ModalComponent } from '../../components/modal/modal.component';

@NgModule({
  declarations: [
    InicioPage,
    ModalComponent
  ],
  imports: [
    CommonModule,
    DesyAngularModule,
    InicioPageRoutingModule,
    FormsModule,
    NgxPaginationModule
  ],
  exports: [InicioPage],
})
export class InicioPageModule {
 }
