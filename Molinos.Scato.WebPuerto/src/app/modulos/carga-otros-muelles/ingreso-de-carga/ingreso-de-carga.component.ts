import { Component, OnInit } from '@angular/core';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';

@Component({
  selector: 'app-ingreso-de-carga',
  templateUrl: './ingreso-de-carga.component.html',
  styleUrls: ['./ingreso-de-carga.component.css']
})
export class IngresoDeCargaComponent implements OnInit {

  elementos: EmbarqueNav[];
  hayEmbarque: boolean = false;
  mostrarSpinner: boolean = false


  constructor() { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  
cargarDatos() {
  setTimeout(() => {

    // 🔹 Si quieres probar SIN barcos:
    this.elementos = [];

    // Si quieres probar CON barco:
    // this.elementos = [{ nombreBuque: 'TM LUSTROUS' } as EmbarqueNav];

    this.hayEmbarque = this.elementos.length > 0;
    this.mostrarSpinner = false;

  }, 2000);
}

  tieneEmbarques(): boolean {
    return this.elementos && this.elementos.length > 0;
  }

  cancelar() {
    window.history.back();
  }

}
