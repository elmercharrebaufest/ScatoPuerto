import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ritmo-embarque-balanza',
  templateUrl: './ritmo-embarque-balanza.component.html',
  styleUrls: ['./ritmo-embarque-balanza.component.css']
})
export class RitmoEmbarqueBalanzaComponent {
  @Input() balanceName: string;
  @Input() startBalance: string;
  @Input() tonsLoadedUntilNow: number;
  @Input() boardRhythm: string;
  @Input() lastUpdate: string;
}
