import { AfterViewInit, ApplicationRef, Component, ComponentFactoryResolver, Injector, Input, OnInit } from '@angular/core';
import { PuntosInteres } from '@ScatoModels/geolocalizacion/puntos-interes';
import { UbicacionEmbarcacion } from '@ScatoModels/geolocalizacion/ubicacion-embarcacion';
import * as L from 'leaflet';
import { TarjetaBuqueComponent } from '../tarjeta-buque/tarjeta-buque.component';

@Component({
  selector: 'app-mapa-buque',
  templateUrl: './mapa-buque.component.html',
  styleUrls: ['./mapa-buque.component.css']
})
export class MapaBuqueComponent implements AfterViewInit {

  @Input() listaEmbarcacion;
  @Input() listaPuntosInteres;

  zoom = 8;
  map!: L.Map;
  private iconoBuque!:L.Icon;
  private iconoAncla!:L.Icon;
  private iconoUbicacion!:L.Icon;
  private markadorAncla!: L.Marker;
  private markadorUbicacion!: L.Marker;
  private recargarMarkadores: boolean = false;
  constructor(private resolver: ComponentFactoryResolver,
              private appRef: ApplicationRef,
              private injector: Injector) {

    this.iconoUbicacion = new L.Icon({
      iconUrl: '../../../../assets/ubicacion.svg',
      iconSize: [24, 40]
    });
    this.iconoAncla = new L.Icon({
      iconUrl: '../../../../assets/ancla.svg',
      iconSize: [24, 40]
    });
  }

  async ngAfterViewInit() {
    await this.inicializarMapa();
    await this.cargarPuntosInteres();
    await this.cargarBuquesMapa();
    this.map.on('zoomend', this.handleMapZoomEnd.bind(this));
  }


  async cargarPuntosInteres() {

    if (this.listaPuntosInteres!=undefined) {
      if (this.listaPuntosInteres.length > 0) {
          this.listaPuntosInteres.forEach(punto => {
              
            const mensajeToolTipHTML = `${punto.nombre} [${punto.pais}]<br>Tipo: ${punto.tipoUbicacion}`;
              
              let iconoPunto;
              switch(punto.imagen){
                case 'ancla': {
                  iconoPunto = this.iconoAncla;
                  this.markadorAncla = L.marker([punto.latitud, punto.longitud ], {icon: iconoPunto}).bindTooltip(mensajeToolTipHTML);
                  this.markadorAncla.addTo(this.map);
                  break;
                }
                case 'ubicacion':{
                  iconoPunto = this.iconoUbicacion;
                  this.markadorUbicacion = L.marker([punto.latitud, punto.longitud ], {icon: iconoPunto}).bindTooltip(mensajeToolTipHTML);
                  this.markadorUbicacion.addTo(this.map);
                  break;
                }
                default:{
                  iconoPunto = this.iconoUbicacion;
                  this.markadorAncla = L.marker([punto.latitud, punto.longitud ], {icon: iconoPunto}).bindTooltip(mensajeToolTipHTML);
                  this.markadorAncla.addTo(this.map);
                  break;
                }
              }
          });

      }   
    }
  }

  async inicializarMapa() {

    this.map = L.map('mapa', {
      center: [ -35.340, -56.577],
      zoom: this.zoom
    });
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ''
    });
    tiles.addTo(this.map);

  }
  
  handleMapZoomEnd(map: L.Map):void{
    console.log('onMapZoomEnd');
    console.log(this.map.getZoom());
    if (this.map.getZoom() <= 5){
      
      this.map.eachLayer((layer) => {
        if (layer instanceof L.Marker){
            this.map.removeLayer(layer)
        }
      });
      this.recargarMarkadores = true;
    }else {
      if (this.recargarMarkadores){
          this.cargarPuntosInteres();
          this.cargarBuquesMapa();
          this.recargarMarkadores = false;
      }
    }
  }

  async cargarBuquesMapa(){

    if (this.listaEmbarcacion!=undefined) {
      if (this.listaEmbarcacion.length > 0) {
          this.listaEmbarcacion.forEach(buque => {
              if (buque.esSeleccionado){
                  const latitud = buque.posicion.latitud;
                  const longitud = buque.posicion.longitud;

                  let buqueIconUrl = '';

                  if (buque.sanBenito)
                      buqueIconUrl = '../../../../assets/buque_san_benito.svg';
                  
                  if (buque.vicentin)
                      buqueIconUrl = '../../../../assets/buque_vicentin.svg';
                  
                  if (buque.otrosMuelles)
                      buqueIconUrl = '../../../../assets/buque_otro_muelle.svg';
                  
                  if (buque.noryon)
                      buqueIconUrl = '../../../../assets/buque_nouryon.svg';
                  
                  this.iconoBuque = new L.Icon({
                    iconUrl: buqueIconUrl,
                    iconSize: [32, 37]
                  });

                  let markerPopup: any = this.cargarTarjetaBuque(TarjetaBuqueComponent, 
                    (c: any) => {
                      c.instance.nombreBuque = buque.nombreBuque;
                  }, latitud, longitud);
                    let mensajeToolTip  = `<div style='border-width: 1px; border-color:gray;'><b> ${buque.nombreBuque} [${buque.viaje.paisOrigen}]</b><br>`;
                        mensajeToolTip += `<span>Destino: ${buque.viaje.puertoDestino} [${buque.viaje.paisDestino}]</span><br>`;
                        mensajeToolTip += `<span>Vel./Curso: ${buque.posicion.velocidadCurso}</span><br>`;
                        mensajeToolTip += `<span>Posición recibido: ${buque.posicion.horaUTCPosicionRecibida}</span><br>`;
                        mensajeToolTip += `</div>`;
                    const markerBuque = L.marker([latitud, longitud ],{icon: this.iconoBuque}).bindPopup(markerPopup).bindTooltip(mensajeToolTip);
                    markerBuque.addTo(this.map);
              }
          });
        }
    }
  }

  async limpiarMarcadores(){
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker){
          this.map.removeLayer(layer)
      }
    });
  }

  async cargarBuquesPuntosInteres(){
    this.cargarBuquesPuntosInteres();
    this.cargarBuquesMapa();
  }

  private cargarTarjetaBuque(component?: any, onAttach?: any, latitud?: any, longitud?: any){  
    
    const lat = latitud != undefined ? latitud : 0;
    const lng = longitud != undefined ? longitud : 0;
    this.map.panTo([lat, lng]);
    const compFactory: any = this.resolver.resolveComponentFactory(component);
    let compRef: any = compFactory.create(this.injector);
    if (onAttach)
      onAttach(compRef);

    this.appRef.attachView(compRef.hostView);
    compRef.onDestroy(() => this.appRef.detachView(compRef.hostView));
    
    let div = document.createElement('div');
    div.appendChild(compRef.location.nativeElement);
    return div;

  }
  
  onZoomBuqueSeleccionado(event){
    console.log('mapaaaaaaa')
    const latitud = event.latitud;
    const longitud = event.longitud;
    this.map.setView([latitud, longitud], 13);
  }

}
