import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmbarquesComponent } from './embarques.component';
import { EmbarqueModificarComponent } from './embarque-modificar/embarque-modificar.component';

const routes: Routes = [
  { path: '', component: EmbarquesComponent },
  { path: 'modificar/:id/:numeroBalanza/:idFin', component: EmbarqueModificarComponent },
  { path: 'modificar/:id/:numeroBalanza', component: EmbarqueModificarComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmbarquesRoutingModule { }
