import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-solidosvn',
  templateUrl: './solidosvn.component.html',
  styleUrls: ['./solidosvn.component.css']
})
export class SolidosvnComponent implements OnInit {

  @Input() moduloDeCargaId: number = 0;


  constructor() { }

  ngOnInit(): void {
    console.log('moduloDeCargaId recibido al iniciar:', this.moduloDeCargaId);
  }

  imprimir(imprimir: boolean = false) {
  }

  public async enviarMailFinalizacion() {
  }

  public openModalCargarAmarre() {
  }

}