import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { GeolocalizacionSharingService } from '@ScatoServicios/geolocalizacion.sharing.service';

@Component({
  selector: 'app-lista-buques',
  templateUrl: './lista-buques.component.html',
  styleUrls: ['./lista-buques.component.css']
})
export class ListaBuquesComponent implements OnDestroy  {
  
  private listaBuquesGeolocalizacion: any;
  @Output() listaBuquesGeolocalizacionFiltro = new EventEmitter();
  @Output() coordenadasBuqueSeleccionado = new EventEmitter();
  private embarcacionSubject$: any

  constructor(private geolocalizacionSharingService : GeolocalizacionSharingService) {
    this.embarcacionSubject$ = this.geolocalizacionSharingService.getBuquesLineUp().subscribe((data) =>{
      this.setListaBuquesGeolocalizacion(data);
    });
  }

  setListaBuquesGeolocalizacion(listaBuques: any){
    this.listaBuquesGeolocalizacion = listaBuques;
  }
  
  getListaBuquesGeolocalizacion(){
    return this.listaBuquesGeolocalizacion;
  }
  
  onChangeBuqueSeleccionado(event: any){
    const embarqueId = event.target?.defaultValue;
    const esSeleccionado = event.target?.checked;
    const indexEmbarque = this.listaBuquesGeolocalizacion.findIndex((item => item.embarque_Id == embarqueId));
    this.listaBuquesGeolocalizacion[indexEmbarque].esSeleccionado = esSeleccionado
    this.listaBuquesGeolocalizacionFiltro.emit(this.listaBuquesGeolocalizacion)
    this.geolocalizacionSharingService.setBuquesLineUp(this.listaBuquesGeolocalizacion);
  }
  
  onZoomBuqueSeleccionado(event) {
    this.coordenadasBuqueSeleccionado.emit(event);
  }
  
  ngOnDestroy() {
    this.embarcacionSubject$.unsubscribe();
  }

}
