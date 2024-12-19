import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HistoricoEmbarqueLineUp } from '@ScatoModels/historicoEmbarqueLineup';

@Component({
  selector: 'app-lineup-buque',
  templateUrl: './lineup.component.html',
  styleUrls: ['./lineup.component.css']
})
export class LineupComponent implements OnInit {
  @Input() historicoEmbarqueLineUp: HistoricoEmbarqueLineUp;

  private embarqueId: number = 0;
  public mostrarOtroMuelle: boolean = false;

  constructor(
    private route: ActivatedRoute,
    ) {
    this.embarqueId = parseInt(this.route.snapshot.paramMap.get('embarqueid'));
  }

  ngOnInit(): void {
    if (this.historicoEmbarqueLineUp.puertoActual == 'Otros Muelles' && this.historicoEmbarqueLineUp.otroMuelleNombre) {
      this.mostrarOtroMuelle = true;
    }
  }
}
