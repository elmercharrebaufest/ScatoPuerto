import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-reloj-balanzas',
  templateUrl: './reloj-balanzas.component.html',
  styleUrls: ['./reloj-balanzas.component.css']
})
export class RelojBalanzasComponent {
  @Input() titulo: string;
  @Input() valor: number;
  @Input() maximo: number;
  @Input() color: string;
  @Input() descripcion: string;
  @Input() footer: string;
}
