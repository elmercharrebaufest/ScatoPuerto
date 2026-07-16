import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportesPorTurnosComponent } from './reportes-por-turnos.component';

const routes: Routes = [
  { path: '', component: ReportesPorTurnosComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportesPorTurnosRoutingModule { }
