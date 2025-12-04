import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-turnos-recibidores',
  templateUrl: './turnos-recibidores.component.html',
  styleUrls: ['./turnos-recibidores.component.css']
})
export class TurnosRecibidoresComponent implements OnInit, OnChanges {

   @Input() esLiquido: boolean = false;   

  constructor() { }

  ngOnInit(): void {    
  }

  ngOnChanges(changes: any) {
    if (changes.esLiquido) {
      console.log('esLiquido cambió:', changes.esLiquido.currentValue);
      // aquí podés ejecutar lógica de inicialización/limpieza cuando cambie el tipo
    }
  }

}
