import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-semaforo-ritmo-embarque',
  templateUrl: './semaforo-ritmo-embarque.component.html',
  styleUrls: ['./semaforo-ritmo-embarque.component.css']
})
export class SemaforoRitmoEmbarqueComponent {
  @Input() valueRhythmGross: number;
  @Input() color1: string;
  @Input() valueLoaded: number;
  @Input() tonsTotal: number;
  @Input() color2: string;
  @Input() valueRhythmNet: number;
  @Input() color3: string;
}
