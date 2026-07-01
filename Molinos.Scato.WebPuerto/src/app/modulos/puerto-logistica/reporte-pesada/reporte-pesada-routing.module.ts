import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportePesadaComponent } from './reporte-pesada.component';

const routes: Routes = [
  { path: '', component: ReportePesadaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportePesadaRoutingModule { }
