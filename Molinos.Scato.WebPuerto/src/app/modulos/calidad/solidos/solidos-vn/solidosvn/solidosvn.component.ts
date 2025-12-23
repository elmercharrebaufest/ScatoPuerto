import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-solidosvn',
  templateUrl: './solidosvn.component.html',
  styleUrls: ['./solidosvn.component.css']
})
export class SolidosvnComponent implements OnInit {

  @Input() moduloDeCargaId: number = 0;
  @Input() esVicentinNouryon: boolean = false;
  mostrarTurnosRecibidores: boolean;


  constructor() {
    this.mostrarTurnosRecibidores = false;
  }

  ngOnInit(): void {
    console.log('moduloDeCargaId recibido al iniciar:', this.moduloDeCargaId);
  }

  onInicioCarga(valor: boolean) {  
    if (valor) {
      this.mostrarTurnosRecibidores = true;
    }
  }

  imprimir(imprimir: boolean = false) {
  }

  public async enviarMailFinalizacion() {
  }

  public openModalCargarAmarre() {
  }

}