import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-ritmo-embarque-carga-manual',
  templateUrl: './ritmo-embarque-carga-manual.component.html',
  styleUrls: ['./ritmo-embarque-carga-manual.component.css']
})
export class RitmoEmbarqueCargaManualComponent implements OnInit {

  @Input() numeroBalanza: string;
  @Input() toneladasCargadas: number;
  @Input() ritmoEmbarque: string;
  @Input() ultimaActualizacion: string;

  ngOnInit(): void {
  }

}
