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
    BrowserModule,
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
