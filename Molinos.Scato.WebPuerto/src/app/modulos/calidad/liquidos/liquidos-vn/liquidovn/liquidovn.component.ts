import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-liquidovn',
  templateUrl: './liquidovn.component.html',
  styleUrls: ['./liquidovn.component.css']
})
export class LiquidovnComponent implements OnInit {

  @Input() esLiquido: boolean = false;
  @Input() moduloDeCargaId: number = 0;
  @Input() esVicentinNouryon: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  imprimir(imprimir: boolean = false) {
  }

  public async enviarMailFinalizacion() {
  }

  public openModalCargarAmarre() {
  }

}
