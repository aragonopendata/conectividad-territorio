import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { InicioPageModule } from './pages/inicio.page.component/inicio.page.component.module';

const routes: Routes = [
  
  { path: 'inicio', loadChildren: './pages/inicio.page.component/inicio.page.component.module#InicioPageModule' },
  { path: '**', redirectTo: 'inicio' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
