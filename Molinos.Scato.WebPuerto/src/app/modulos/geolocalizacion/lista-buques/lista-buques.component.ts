import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-lista-buques',
  templateUrl: './lista-buques.component.html',
  styleUrls: ['./lista-buques.component.css']
})
export class ListaBuquesComponent implements OnInit, AfterViewInit  {
  
  @Input() listaBuquesGeolocalizacion;
  @Output() listaBuquesGeolocalizacionFiltro = new EventEmitter();
  @Output() coordenadasBuqueSeleccionado = new EventEmitter();

  constructor() { 
    
  }
  ngAfterViewInit(): void {
    console.log(this.listaBuquesGeolocalizacion)
  }

  ngOnInit(): void {
    console.log(this.listaBuquesGeolocalizacion)

  }

  onChangeBuqueSeleccionado(event: any){
    const embarqueId = event.target?.defaultValue;
    const esSeleccionado = event.target?.checked;
    const indexEmbarque = this.listaBuquesGeolocalizacion.findIndex((item => item.embarque_Id == embarqueId));
    this.listaBuquesGeolocalizacion[indexEmbarque].esSeleccionado = esSeleccionado
    this.listaBuquesGeolocalizacionFiltro.emit(this.listaBuquesGeolocalizacion)
  }
  onZoomBuqueSeleccionado(event) {
    this.coordenadasBuqueSeleccionado.emit(event);
  }
  

}
