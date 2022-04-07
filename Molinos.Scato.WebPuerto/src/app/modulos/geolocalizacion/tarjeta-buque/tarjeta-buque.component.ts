import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tarjetabuque',
  templateUrl: './tarjeta-buque.component.html',
  styleUrls: ['./tarjeta-buque.component.css']
})
export class TarjetaBuqueComponent implements OnInit {

  @Input() nombreBuque!: string
  @Input() tipoBuque!: string
  @Input() puertoActual!: string
  @Input() puertoDestino!: string
  @Input() ATA!: string
  @Input() ETA!: string
  @Input() latitud!: string
  @Input() longitud!: string
  @Input() estado!: string
  @Input() velocidadCurso!: string
  @Input() cargaBuque!: string
  constructor() { }

  ngOnInit(): void {
  }

}
