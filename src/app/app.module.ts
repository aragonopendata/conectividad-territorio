import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HttpClientModule } from "@angular/common/http";
import { SharedModule } from './shared/shared.module';
import { MainModule } from './main/main.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AccesibleComponent } from './accesible/accesible.component';
import { RouterModule, Routes } from '@angular/router';

import { MainentryComponent } from './mainentry/mainentry.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
const appRoutes: Routes = [
  { path: 'accesible', component: AccesibleComponent },
  { path: 'indicadores', component: MainentryComponent },
  { path: '', component: MainentryComponent },
];



@NgModule({
  declarations: [
    AppComponent,
    AccesibleComponent,
    MainentryComponent,
  ],
  imports: [
    MatSelectModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    BrowserModule,
    MatFormFieldModule,
    MatInputModule,
    HttpClientModule,
    SharedModule,
    MainModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    BrowserAnimationsModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true }), // <-- debugging purposes only
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
