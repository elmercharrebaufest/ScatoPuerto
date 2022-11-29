import { Component,Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-fechas-puerto',
  templateUrl: './fechas-puerto.component.html',
  styleUrls: ['./fechas-puerto.component.css']
})
export class FechasPuertoComponent implements OnInit {
  @Input() registroFechas; 
  @Input() tieneLimpieza; 
  @Input() horasPuerto; 

  constructor() { }

  ngOnInit(): void {
  }

}
