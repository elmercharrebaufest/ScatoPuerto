import { AfterViewInit, ApplicationRef, Component, ComponentFactoryResolver, Injector, OnDestroy, Renderer2 } from '@angular/core';
import { PuntosInteres } from '@ScatoModels/geolocalizacion/puntos-interes';
import { UbicacionEmbarcacion } from '@ScatoModels/geolocalizacion/ubicacion-embarcacion';
import { GeolocalizacionSharingService } from '@ScatoServicios/geolocalizacion.sharing.service';
import * as L from 'leaflet';
import { TarjetaBuqueComponent } from '../tarjeta-buque/tarjeta-buque.component';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';

@Component({
  selector: 'app-mapa-buque',
  templateUrl: './mapa-buque.component.html',
  styleUrls: ['./mapa-buque.component.css']
})
export class MapaBuqueComponent implements AfterViewInit, OnDestroy{

  private listaEmbarcacion: any;
  private listadoEmbarques: any[];
  private listaPuntosInteres: any;
  private zoom = 8;
  private map!: L.Map;
  private iconoBuque!:L.Icon;
  private iconoAncla!:L.Icon;
  private iconoUbicacion!:L.Icon;
  private markadorAncla!: L.Marker;
  private markadorAnclaCirculo!: L.Circle;
  private markadorUbicacion!: L.Marker;
  private markadorUbicacionCirculo!: L.Circle;
  private referenciaOverlay;
  private recargarMarkadores: boolean = false;
  private puntosInteresSubject$: any
  private embarcacionSubject$: any

  constructor(private resolver: ComponentFactoryResolver,
              private appRef: ApplicationRef,
              private injector: Injector,
              private geolocalizacionSharingService : GeolocalizacionSharingService,
              private rederer: Renderer2,
              private workflowService: WorkflowService
              ) {

    this.embarcacionSubject$ = this.geolocalizacionSharingService.getBuquesLineUp().subscribe((data) =>{
        this.setListaEmbarcacion(data);
    });
    
    this.puntosInteresSubject$ = this.geolocalizacionSharingService.getPuntosInteres().subscribe((data) =>{
        this.setListaPuntosInteres(data);
    });

    this.iconoUbicacion = new L.Icon({
      iconUrl: '../../../../assets/ubicacion.svg',
      iconSize: [24, 40]
    });

    this.iconoAncla = new L.Icon({
      iconUrl: '../../../../assets/ancla.svg',
      iconSize: [24, 40]
    });

  }
  
  getListaEmbarcacion(){
    return this.listaEmbarcacion;
  }
  
  getListaPuntosInteres(){
    return this.listaPuntosInteres;
  }
  
  setListaEmbarcacion(listaBuques){
    this.listaEmbarcacion = listaBuques;
  }
  
  setListaPuntosInteres(listaPuntos){
    this.listaPuntosInteres = listaPuntos;
  }
  
  async ngAfterViewInit() {
    await this.inicializarMapa();
    await this.cargarPuntosInteres();
    await this.cargarBuquesMapa();
    this.map.on('zoomend', this.handleMapZoomEnd.bind(this));
    this.mostrarBuqueSeleccionado();
  }

  async mostrarBuqueSeleccionado(){
    let embarqueSeleccionado;
    this.embarcacionSubject$ = this.geolocalizacionSharingService.getBuqueSeleccionado().subscribe((data) => {
      embarqueSeleccionado = data;
      if(embarqueSeleccionado != undefined) {
        if (embarqueSeleccionado.length > 0){
          const embarque = embarqueSeleccionado[0];
          const latitud = embarque.posicion.latitud;
          const longitud = embarque.posicion.longitud;
          this.map.setView([latitud, longitud], 13);
        }
      }else{
        // sino hay buque seleccionado muestra por defecto la vista general del map
        this.map.setView([ -35.340, -56.577]);
      }
    });
  }

  async cargarPuntosInteres() {
    let layerAncla = new L.LayerGroup();
    let layerUbicacion = new L.LayerGroup();
    let layerZona01 = new L.LayerGroup();
    let layerZona02 = new L.LayerGroup();
      if (this.listaPuntosInteres!=undefined) {
        if (this.listaPuntosInteres.length > 0) {
            this.listaPuntosInteres.forEach(punto => {
                
                const mensajeToolTipHTML = `${punto.nombre} [${punto.pais}]<br>Tipo: ${punto.tipoUbicacion}`;
                
                let iconoPunto;
                switch(punto.imagen){
                  case 'ancla': {
                    iconoPunto = this.iconoAncla;
                    this.markadorAncla = L.marker([punto.latitud, punto.longitud ], {icon: iconoPunto}).bindTooltip(mensajeToolTipHTML);
                    //this.markadorAncla.addTo(this.map);
                    layerAncla.addLayer(this.markadorAncla);

                    if (punto.distanciaKM != 0 && punto.radioPunto != 0){
                      this.markadorAnclaCirculo = L.circle([ punto.latitud, punto.longitud ], 
                                                           { color: '#FF9D4A',
                                                             fillColor: '#FF9D4A',
                                                             fillOpacity: 0.40,
                                                             radius: punto.radioPunto,
                                                             weight: 0.2
                                                           }).addTo(this.map);
                      layerZona01.addLayer(this.markadorAnclaCirculo);

                    }

                    break;
                  }
                  case 'ubicacion':{
                    iconoPunto = this.iconoUbicacion;
                    this.markadorUbicacion = L.marker([punto.latitud, punto.longitud ], {icon: iconoPunto}).bindTooltip(mensajeToolTipHTML);
                    //this.markadorUbicacion.addTo(this.map);
                    layerUbicacion.addLayer(this.markadorUbicacion);
                    if (punto.distanciaKM != 0 && punto.radioPunto != 0){
                      this.markadorUbicacionCirculo = L.circle([ punto.latitud, punto.longitud ], 
                                                           { color: '#B26FFF',
                                                             fillColor: '#B26FFF',
                                                             fillOpacity: 0.40,
                                                             radius: 500,
                                                             weight: 0.2
                                                           }).addTo(this.map);
                      layerZona02.addLayer(this.markadorUbicacionCirculo);

                    }
                    break;
                  }
                  default:{
                    iconoPunto = this.iconoUbicacion;
                    this.markadorAncla = L.marker([punto.latitud, punto.longitud ], {icon: iconoPunto}).bindTooltip(mensajeToolTipHTML);
                    layerAncla.addLayer(this.markadorAncla);
                    break;
                  }
                }

            });
        }   
      }
      
      await this.cargarReferenciasMapa(layerUbicacion, layerAncla, layerZona01,layerZona02);
  }

  private async cargarReferenciasMapa(layerUbicacion, layerAncla, layerZona01, layerZona02){
    var ubicaciones = L.layerGroup([layerUbicacion]);
    var ancla = L.layerGroup([layerAncla]);
    var zona01 = L.layerGroup([layerZona01]);
    var zona02 = L.layerGroup([layerZona02]);

    this.map.addLayer(ubicaciones);
    this.map.addLayer(ancla);
    this.map.addLayer(zona01);
    this.map.addLayer(zona02);
    var LayerGroup = L.layerGroup();

    var overlayMaps = {
        "<b style='font-family:roboto;font-size:14px'> Referencias </b>": LayerGroup,
        " <img src='../../../../assets/ubicacion.svg' width='21' height='21' > <label style='font-family:roboto;font-size:12px;display:inline; margin-left:5px'> Muelles </label> " : ubicaciones,
        " <img src='../../../../assets/ancla.svg' width='21' height='21' > <label style='font-family:roboto;font-size:12px;display:inline; margin-left:5px'>Fondeaderos y Puertos </label> ": ancla,
        " <img src='../../../../assets/buque.svg' width='21' height='21'> <label style='font-family:roboto;font-size:12px;display:inline; margin-left:5px'>Buques </label> ": LayerGroup,
        " <img src='../../../../assets/zona01.svg' width='21' height='21'> <label style='font-family:roboto;font-size:12px;display:inline; margin-left:5px'>Zona 01 </label> ": zona01,
        " <img src='../../../../assets/zona02.svg' width='21' height='21'> <label style='font-family:roboto;font-size:12px;display:inline; margin-left:5px'>Zona 02 </label> ": zona02

    };
    this.referenciaOverlay = L.control.layers (
                    null,
                    overlayMaps, 
                    {
                      collapsed: false,
                      position: "bottomleft",
                    }
                    ).addTo(this.map);
    
    let divsCuadroReferencia = document.getElementsByClassName("leaflet-control-layers leaflet-control-layers-expanded leaflet-control");                
    let divsOverlayChilds = document.getElementsByClassName("leaflet-control-layers-overlays");

    if (divsCuadroReferencia !=undefined) {
        this.rederer.setStyle(divsCuadroReferencia[0], 'border','none');
    }

    if(divsOverlayChilds != undefined){
      if(divsOverlayChilds.length > 0){
          let divChildsNodes = divsOverlayChilds[0].childNodes;
          let itemIndex = 1;
          divChildsNodes.forEach((item)=>{
            // Se retira el checkbox para las referencias y buques
            if (itemIndex == 1 || itemIndex == 4){ 
                item.childNodes[0].childNodes[0].remove()
            }else{

              // Cambia la posicion de los check hacia la derecha
              const checkBoxReference = item.childNodes[0].childNodes[0];
              const spanReference = item.childNodes[0].childNodes[1];
              item.childNodes[0].appendChild(spanReference)
              item.childNodes[0].appendChild(checkBoxReference);
              
              // Se establece la separacion de los controles para mejorar el diseño
              this.rederer.setStyle(item.childNodes[0],'display','flex');
              this.rederer.setStyle(item.childNodes[0],'list-style-type','none');
              this.rederer.setStyle(item.childNodes[0],'padding','0');
              this.rederer.setStyle(item.childNodes[0],'justify-content','flex-end');
              this.rederer.setStyle(item.childNodes[0].childNodes[0],'margin-right','auto');
              this.rederer.setStyle(item.childNodes[0].childNodes[0],'padding-right','10px');

            }
            itemIndex++;
          })
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
    if (this.map.getZoom() <= 5){
      
      this.map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Circle){
            this.map.removeLayer(layer)
        }
      });
      this.map.removeControl(this.referenciaOverlay)
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
              await this.agregarEmbarque();
              // await this.cargarBuqueEnMapa();
            }
        }
  }

  private async agregarEmbarque(){
    this.workflowService.obtenerListado().subscribe(
      data => this.listadoEmbarques = data,
      err => console.log(err),
      () => this.dibujarBuqueEnMapa()
    );
  }

  private dibujarBuqueEnMapa(){
    this.listaEmbarcacion.forEach(buque => {

      if(this.listadoEmbarques){
        let encontrado: InstanciaWorkflowPuerto[] = this.listadoEmbarques.filter( x => x.embarque.id == buque.embarque_Id );
        if(encontrado.length>0) buque.embarque = encontrado[0].embarque;
      }

      if (buque.esSeleccionado && buque.esSeleccionadoPorMuelle){
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
              c.instance.tipoBuque = buque.embarque ? buque.embarque.tipoBuque : '';
              // c.instance.imo = buque.informacion.imo;
              c.instance.imo = buque.embarque ? buque.embarque.imo : '';
              // c.instance.bandera = buque.informacion.bandera;
              c.instance.bandera = buque.embarque ? buque.embarque.destino ? buque.embarque.destino.nombre : '' : '';
              c.instance.porteNeto = buque.embarque ? buque.embarque.porteNeto : '';
              c.instance.puntal = buque.embarque ? buque.embarque.puntal : '';
              c.instance.freeboard = buque.embarque ? buque.embarque.freeboard : '';
              c.instance.cantidadBodegas = '';
              c.instance.eslora = buque.embarque ? buque.embarque.eslora : '';
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

  async limpiarMarcadores(){
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker){
          this.map.removeLayer(layer)
      }
    });
    this.map.removeControl(this.referenciaOverlay)
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
    const latitud = event.latitud;
    const longitud = event.longitud;
    this.map.setView([latitud, longitud], 13);
  }

  ngOnDestroy(): void {
    this.puntosInteresSubject$.unsubscribe();
    this.embarcacionSubject$.unsubscribe();
  }

}
