import { Component, Input } from '@angular/core';
import { TotalBalanza } from '../../models/aduana.models';

@Component({
  selector: 'app-aduana-panel',
  templateUrl: './aduana.component.html',
  styleUrls: ['./aduana.component.css']
})
export class AduanaComponent {
  @Input() mostrarTotales = false;
  @Input() tituloResumen = 'Pesadas Online';
  @Input() linkIzquierdoTexto = 'IR A PESADAS HISTÓRICAS';
  @Input() linkIzquierdoUrl = '/aduana/pesadas-historicas';
  @Input() linkDerechoTexto = 'IR A CÁMARAS';
  @Input() linkDerechoUrl = '/aduana/camaras';
  @Input() totales: TotalBalanza[] = [];
}
