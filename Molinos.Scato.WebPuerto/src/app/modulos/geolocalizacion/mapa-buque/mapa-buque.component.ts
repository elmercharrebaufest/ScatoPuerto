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
    //await this.cargarZonaRecalada();
    await this.cargarBuquesMapa();

    this.map.on('zoomend', this.handleMapZoomEnd.bind(this));
  }

  private async cargarPuntosInteres() {

    if (this.listaPuntosInteres!=undefined) {
      if (this.listaPuntosInteres.length > 0) {
          this.listaPuntosInteres.forEach(punto => {
              const latitud = punto.latitud;
              const longitud = punto.longitud;
              //const markerBuque = L.marker([latitud, longitud ],{icon: this.iconoBuque}).bindPopup(markerPopup).bindTooltip(mensajeToolTip);
              const mensajeToolTip = `<div style='border-width: 1px; border-color:gray;'><b> ${punto.nombre} </b><br> <span>${latitud} / ${longitud}</span></div>`;
              const mensajeToolTipHTML = `${punto.nombre} [${punto.pais}]<br>Tipo: ${punto.tipoUbicacion}`;
              
              let iconoPunto;
              switch(punto.imagen){
                case 'ancla': {
                  iconoPunto = this.iconoAncla;
                  this.markadorAncla = L.marker([latitud, longitud ], {icon: iconoPunto}).bindTooltip(mensajeToolTipHTML);
                  this.markadorAncla.addTo(this.map);
                  break;
                }
                case 'ubicacion':{
                  iconoPunto = this.iconoUbicacion;
                  this.markadorUbicacion = L.marker([latitud, longitud ], {icon: iconoPunto}).bindTooltip(mensajeToolTipHTML);
                  this.markadorUbicacion.addTo(this.map);
                  break;
                }
                default:{
                  iconoPunto = this.iconoUbicacion;
                  this.markadorAncla = L.marker([latitud, longitud ], {icon: iconoPunto}).bindTooltip(mensajeToolTipHTML);
                  this.markadorAncla.addTo(this.map);
                  break;
                }
              }
          });

      }   
    }

}

  private inicializarMapa() {

    const treeAncla = L.icon({
      iconUrl: '../../../../assets/ubicacion.svg',
      iconSize: [32, 37],
      iconAnchor: [16, 37],
      popupAnchor: [0, -37]
    });
    
    const treeUbicaciones = L.icon({
      iconUrl: '../../../../assets/ancla.svg',
      iconSize: [32, 37],
      iconAnchor: [16, 37],
      popupAnchor: [0, -37]
    });

    this.map = L.map('mapa', {
      center: [ -35.340, -56.577],
      zoom: this.zoom
    });
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ''
    });
    tiles.addTo(this.map);

    /*
    var overlayMaps = {
      "<img src='http://mollietaylor.com/skills/js/leaflet/train.png' height=24>Train": treeAncla,
      "<img src='http://mollietaylor.com/skills/js/leaflet/arbol.png' height=24>Tree": treeUbicaciones
    };
    
    
    L.control.layers(null, {treeAncla, treeUbicaciones}, {
      collapsed: false  
    }).addTo(this.map);
    */
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

    }else {
    
      this.cargarPuntosInteres();
    
    }
  }

  private async cargarZonaRecalada() {
    const polygon = L.polygon([
        [-34.23498032825036, -58.27365815557011],
        [-34.827796696564825, -54.40647067710693],
        [-36.59978024064985, -56.297158448419516]
    ],
    {color: "#ff7800", weight: 1}).addTo(this.map);
  }
  
  private async cargarBuquesMapa(){
  
    if (this.listaEmbarcacion!=undefined) {
      if (this.listaEmbarcacion.length > 0) {
          this.listaEmbarcacion.forEach(buque => {
            const latitud: number = Number(buque.latitud);
            const longitud: number = Number(buque.longitud);

            let markerPopup: any = this.cargarTarjetaBuque(TarjetaBuqueComponent, 
              (c: any) => {
                c.instance.nombreBuque = buque.Nombre;
            }, latitud, longitud);
              const mensajeToolTip = `<div style='border-width: 1px; border-color:gray;'><b> ${buque.Nombre} </b><br> <span>${latitud} / ${longitud}</span></div>`;
              const markerBuque = L.marker([latitud, longitud ],{icon: this.iconoBuque}).bindPopup(markerPopup).bindTooltip(mensajeToolTip);
              markerBuque.addTo(this.map);
          });
      }
    }
  }
  
  private cargarTarjetaBuque(component?: any, onAttach?: any, latitud?: number, longitud?: number){  
    
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

}
