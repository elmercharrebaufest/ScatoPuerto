import { AfterViewInit, ApplicationRef, Component, ComponentFactoryResolver, Injector, OnDestroy, Renderer2 } from '@angular/core';
import { PuntosInteres } from '@ScatoModels/geolocalizacion/puntos-interes';
import { UbicacionEmbarcacion } from '@ScatoModels/geolocalizacion/ubicacion-embarcacion';
import { GeolocalizacionSharingService } from '@ScatoServicios/geolocalizacion.sharing.service';
import * as L from 'leaflet';
import { TarjetaBuqueComponent } from '../tarjeta-buque/tarjeta-buque.component';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-mapa-buque',
  templateUrl: './mapa-buque.component.html',
  styleUrls: ['./mapa-buque.component.css']
})
export class MapaBuqueComponent implements AfterViewInit, OnDestroy {

  // #region Variables
  private listaEmbarcacion: any;
  private listadoEmbarques: any[];
  private listaPuntosInteres: any;
  private zoom = 8;
  private map!: L.Map;
  private iconoBuque!: L.Icon;
  private iconoBuqueSeleccionado!: L.Icon;
  private iconoAncla!: L.Icon;
  private iconoUbicacion!: L.Icon;
  private markadorAncla!: L.Marker;
  private markadorAnclaCirculo!: L.Circle;
  private markadorUbicacion!: L.Marker;
  private markadorUbicacionPolygon!: L.Polygon;
  private referenciaOverlay;
  private recargarMarkadores: boolean = false;
  // #endregion

  // #region Observable
  private puntosInteresSubject$: any
  private embarcacionSubject$: any
  // #endregion

  // #region Constructor
  constructor(private resolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private geolocalizacionSharingService: GeolocalizacionSharingService,
    private rederer: Renderer2,
    private workflowService: WorkflowService
  ) {
    this.setCargarConfiguracion();
  }
  // #endregion

  // #region Eventos del Componente
  async ngAfterViewInit() {
    await this.inicializarMapa();
    await this.cargarPuntosInteres();
    await this.cargarBuquesMapa();
    let element = document.getElementsByClassName('buque-lerp')[0];
    this.map.on('zoomend', this.onMapZoomEnd.bind(this));

  }
  public ngOnDestroy(): void {
    this.puntosInteresSubject$.unsubscribe();
    this.embarcacionSubject$.unsubscribe();
  }
  // #endregion

  // #region Metodos
  public setCargarConfiguracion() {
    this.embarcacionSubject$ = this.geolocalizacionSharingService.getBuquesLineUp().subscribe((data) => {
      const buquesSel = data.filter(x=> x.esSeleccionado === true);
      this.setListaEmbarcacion(buquesSel);
    });

    this.puntosInteresSubject$ = this.geolocalizacionSharingService.getPuntosInteres().subscribe((data) => {
      this.setListaPuntosInteres(data);
    });

    this.iconoUbicacion = new L.Icon({
      iconUrl: './assets/ubicacion.svg',
      iconSize: [21, 21]
    });

    this.iconoAncla = new L.Icon({
      iconUrl: './assets/ancla.svg',
      iconSize: [21, 21]
    });
  }

  public getListaEmbarcacion() {
    return this.listaEmbarcacion;
  }

  public getListaPuntosInteres() {
    return this.listaPuntosInteres;
  }

  public setListaEmbarcacion(listaBuques) {
    this.listaEmbarcacion = listaBuques;
  }

  public setListaPuntosInteres(listaPuntos) {
    this.listaPuntosInteres = listaPuntos;
  }

  private async mostrarBuqueSeleccionado() {
    console.log("mostrarBuqueSeleccionado");
    let embarqueSeleccionado;
    this.embarcacionSubject$ = this.geolocalizacionSharingService.getBuqueSeleccionado().subscribe((data) => {
      embarqueSeleccionado = data;
      if (embarqueSeleccionado != undefined) {
        if (embarqueSeleccionado.length > 0) {
          const embarque = embarqueSeleccionado[0];
          const latitud = embarque.posicion.latitud;
          const longitud = embarque.posicion.longitud;
         this.map.setView([latitud, longitud], 9);

         this.modificarIconoSeleccionado(latitud, longitud);

        }
        else
{
  this.cargarPosicionPorDefectoMapa();
}

      } else {
        // sino hay buque seleccionado muestra por defecto la vista general del map
       this.cargarPosicionPorDefectoMapa();
      }
    });
  }



  public async cargarPuntosInteres() {
    let layerAncla = new L.LayerGroup();
    let layerUbicacion = new L.LayerGroup();
    let layerZona01 = new L.LayerGroup();
    let layerZona02 = new L.LayerGroup();

    if (this.listaPuntosInteres == undefined) return;
    if (this.listaPuntosInteres.length == 0) return;

    // creando puntos de interes
    this.marcadororesPuntoInteres(layerAncla, layerZona01, layerUbicacion);

    // creando zonas (cuadrados o triangulos)
    const filtroZona01 = this.listaPuntosInteres.filter(item => item.tipoUbicacion == 'Zona 01');
    const filtroZona02 = this.listaPuntosInteres.filter(item => item.tipoUbicacion == 'Zona 02');

    if (filtroZona01 != undefined) {
      const filtroCuadrados = filtroZona01.filter(item => item.tipoZona == 'Cuadrado').sort((a, b) => (a.agrupadorZona > b.agrupadorZona) ? 1 : (a.agrupadorZona === b.agrupadorZona) ? ((a.posicionZona > b.posicionZona) ? 1 : -1) : -1)
      const gruposCuadrados = [...new Set(filtroCuadrados.map(item => item.agrupadorZona))];
      const filtroTriangulo = filtroZona01.filter(item => item.tipoZona == 'Triangulo').sort((a, b) => (a.agrupadorZona > b.agrupadorZona) ? 1 : (a.agrupadorZona === b.agrupadorZona) ? ((a.posicionZona > b.posicionZona) ? 1 : -1) : -1)
      const gruposTriangulo = [...new Set(filtroTriangulo.map(item => item.agrupadorZona))]

      this.marcadorCuadradoZona01(gruposCuadrados, filtroCuadrados, layerZona01);
      this.marcadorTrianguloZona01(gruposTriangulo, filtroTriangulo, layerZona01);
    }

    if (filtroZona02 != undefined) {
      const filtroCuadrados = filtroZona02.filter(item => item.tipoZona == 'Cuadrado').sort((a, b) => (a.agrupadorZona > b.agrupadorZona) ? 1 : (a.agrupadorZona === b.agrupadorZona) ? ((a.posicionZona > b.posicionZona) ? 1 : -1) : -1)
      const gruposCuadrados = [...new Set(filtroCuadrados.map(item => item.agrupadorZona))];
      const filtroTriangulo = filtroZona02.filter(item => item.tipoZona == 'Triangulo').sort((a, b) => (a.agrupadorZona > b.agrupadorZona) ? 1 : (a.agrupadorZona === b.agrupadorZona) ? ((a.posicionZona > b.posicionZona) ? 1 : -1) : -1)
      const gruposTriangulo = [...new Set(filtroTriangulo.map(item => item.agrupadorZona))]

      this.marcadorCuadradoZona02(gruposCuadrados, filtroCuadrados, layerZona02);
      this.marcadorTrianguloZona02(gruposTriangulo, filtroTriangulo, layerZona02);
    }

    await this.cargarReferenciasMapa(layerUbicacion, layerAncla, layerZona01, layerZona02);
  }

  private marcadororesPuntoInteres(layerAncla, layerZona01, layerUbicacion) {
    this.listaPuntosInteres.forEach(punto => {
      if (punto.tipoUbicacion == 'Zona 01' || punto.tipoUbicacion == 'Zona 02') {
        return;
      }
      const mensajeToolTipHTML = `${punto.nombre} [${punto.pais}]<br>Tipo: ${punto.tipoUbicacion}`;
      switch (punto.imagen) {
        case 'ancla': {
          this.markadorAncla = L.marker([punto.latitud, punto.longitud], { icon: this.iconoAncla }).bindTooltip(mensajeToolTipHTML);
          layerAncla.addLayer(this.markadorAncla);
          if (punto.distanciaKM != 0 && punto.radioPunto != 0) {
            this.markadorAnclaCirculo = L.circle([punto.latitud, punto.longitud],
              {
                color: '#FF9D4A',
                fillColor: '#FF9D4A',
                fillOpacity: 0.40,
                radius: punto.radioPunto * 2,
                weight: 0.2,

              }).addTo(this.map);
            layerZona01.addLayer(this.markadorAnclaCirculo);
          }
          break;
        }
        case 'ubicacion': {
          this.markadorUbicacion = L.marker([punto.latitud, punto.longitud], { icon: this.iconoUbicacion }).bindTooltip(mensajeToolTipHTML);
          layerUbicacion.addLayer(this.markadorUbicacion);
          break;
        }
        default: {
          this.markadorAncla = L.marker([punto.latitud, punto.longitud], { icon: this.iconoUbicacion }).bindTooltip(mensajeToolTipHTML);
          layerAncla.addLayer(this.markadorAncla);
          break;
        }
      }
    });
  }

  private marcadorCuadradoZona01(gruposCuadrados, filtroCuadrados, layerZona01) {
    if (gruposCuadrados == undefined) return;
    if (gruposCuadrados.length == 0) return;

    gruposCuadrados.forEach(zona => {
      const grupo = filtroCuadrados.filter(item => item.agrupadorZona == zona);
      if (grupo.length == 4) {
        this.markadorUbicacionPolygon = L.polygon(
          [
            [grupo[0].latitud, grupo[0].longitud],
            [grupo[1].latitud, grupo[1].longitud],
            [grupo[2].latitud, grupo[2].longitud],
            [grupo[3].latitud, grupo[3].longitud],
          ],
          {
            fillColor: '#B26FFF',
            color: '#B26FFF'
          }
        ).addTo(this.map);
        layerZona01.addLayer(this.markadorUbicacionPolygon);
      }
    });
  }

  private marcadorTrianguloZona01(gruposTriangulo, filtroTriangulo, layerZona01) {
    if (gruposTriangulo == undefined) return;
    if (gruposTriangulo.length == 0) return;
    gruposTriangulo.forEach(zona => {
      const grupo = filtroTriangulo.filter(item => item.agrupadorZona == zona);
      if (grupo.length == 3) {
        this.markadorUbicacionPolygon = L.polygon(
          [
            [grupo[0].latitud, grupo[0].longitud],
            [grupo[1].latitud, grupo[1].longitud],
            [grupo[2].latitud, grupo[2].longitud],
          ]
        ).addTo(this.map);
        layerZona01.addLayer(this.markadorUbicacionPolygon);
      }
    });
  }

  private marcadorTrianguloZona02(gruposTriangulo, filtroTriangulo, layerZona02) {
    if (gruposTriangulo == undefined) return;
    if (gruposTriangulo.length == 0) return;
    gruposTriangulo.forEach(zona => {
      const grupo = filtroTriangulo.filter(item => item.agrupadorZona == zona);
      if (grupo.length == 3) {
        this.markadorUbicacionPolygon = L.polygon(
          [
            [grupo[0].latitud, grupo[0].longitud],
            [grupo[1].latitud, grupo[1].longitud],
            [grupo[2].latitud, grupo[2].longitud],
          ]
        ).addTo(this.map);
        layerZona02.addLayer(this.markadorUbicacionPolygon);

      }
    });
  }

  private marcadorCuadradoZona02(gruposCuadrados, filtroCuadrados, layerZona02) {
    if (gruposCuadrados == undefined) return;
    if (gruposCuadrados.length == 0) return;
    gruposCuadrados.forEach(zona => {
      const grupo = filtroCuadrados.filter(item => item.agrupadorZona == zona);
      if (grupo.length == 4) {
        this.markadorUbicacionPolygon = L.polygon(
          [
            [grupo[0].latitud, grupo[0].longitud],
            [grupo[1].latitud, grupo[1].longitud],
            [grupo[2].latitud, grupo[2].longitud],
            [grupo[3].latitud, grupo[3].longitud],
          ],
          {
            fillColor: '#B26FFF',
            color: '#B26FFF'
          }
        ).addTo(this.map);
        layerZona02.addLayer(this.markadorUbicacionPolygon);
      }
    });
  }

  private async cargarReferenciasMapa(layerUbicacion, layerAncla, layerZona01, layerZona02) {
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
      " <img src='./assets/ubicacion.svg' width='21' height='21' > <label style='font-family:roboto;font-size:12px;display:inline; margin-left:5px'> Muelles </label> ": ubicaciones,
      " <img src='./assets/ancla.svg' width='21' height='21' > <label style='font-family:roboto;font-size:12px;display:inline; margin-left:5px'>Fondeaderos y Puertos </label> ": ancla,
      " <img src='./assets/buque.svg' width='21' height='21'> <label style='font-family:roboto;font-size:12px;display:inline; margin-left:5px'>Buques </label> ": LayerGroup,
      " <img src='./assets/zona01.svg' width='21' height='21'> <label style='font-family:roboto;font-size:12px;display:inline; margin-left:5px'>Zona Recalada </label> ": zona01,
      " <img src='./assets/zona02.svg' width='21' height='21'> <label style='font-family:roboto;font-size:12px;display:inline; margin-left:5px'>Rada San Lorenzo </label> ": zona02

    };
    this.referenciaOverlay = L.control.layers(
      null,
      overlayMaps,
      {
        collapsed: false,
        position: "bottomleft",
      }
    ).addTo(this.map);
    this.cambiarReferenciaMapa();

  }

  private cambiarReferenciaMapa() {
    let divsCuadroReferencia = document.getElementsByClassName("leaflet-control-layers leaflet-control-layers-expanded leaflet-control");
    let divsOverlayChilds = document.getElementsByClassName("leaflet-control-layers-overlays");

    if (divsCuadroReferencia != undefined) {
      this.rederer.setStyle(divsCuadroReferencia[0], 'border', 'none');
    }

    if (divsOverlayChilds == undefined) return;
    if (divsOverlayChilds.length == 0) return;


    let divChildsNodes = divsOverlayChilds[0].childNodes;
    let itemIndex = 1;
    divChildsNodes.forEach((item) => {
      // Se retira el checkbox para las referencias y buques
      if (itemIndex == 1 || itemIndex == 4) {
        item.childNodes[0].childNodes[0].remove();
      } else {
        // Cambia la posicion de los check hacia la derecha
        const checkBoxReference = item.childNodes[0].childNodes[0];
        const spanReference = item.childNodes[0].childNodes[1];
        item.childNodes[0].appendChild(spanReference)
        item.childNodes[0].appendChild(checkBoxReference);

        // Se establece la separacion de los controles para mejorar el diseño
        this.rederer.setStyle(item.childNodes[0], 'display', 'flex');
        this.rederer.setStyle(item.childNodes[0], 'list-style-type', 'none');
        this.rederer.setStyle(item.childNodes[0], 'padding', '0');
        this.rederer.setStyle(item.childNodes[0], 'justify-content', 'flex-end');
        this.rederer.setStyle(item.childNodes[0].childNodes[0], 'margin-right', 'auto');
        this.rederer.setStyle(item.childNodes[0].childNodes[0], 'padding-right', '10px');
      }
      itemIndex++;
    })
  }

  private async inicializarMapa() {
    this.map = L.map('mapa', {
      center: [-35.340, -56.577],
      zoom: this.zoom
    });
    //const tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '',
      maxZoom: 16,
      minZoom: 4
    });
    tiles.addTo(this.map);
  }

  public async cargarBuquesMapa() {
    if (this.listaEmbarcacion != undefined) {
      if (this.listaEmbarcacion.length > 0) {
        await this.agregarEmbarque();
      }
    }
  }

  private async agregarEmbarque() {
    console.log("agregarEmbarque");
    this.workflowService.obtenerListado().subscribe(
      data => this.listadoEmbarques = data,
      err => console.log(err),
      () => {
              this.crearTarjetaBuque();
              this.mostrarBuqueSeleccionado();
            }
    );
  }
  private cargarPosicionPorDefectoMapa(){
    this.map.setView([-35.340, -56.577], this.zoom);
  }
  private crearTarjetaBuque() {
    this.listaEmbarcacion.forEach(buque => {

      if (this.listadoEmbarques) {
        let encontrado: InstanciaWorkflowPuerto[] = this.listadoEmbarques.filter(x => x.embarque.id == buque.embarque_Id);
        if (encontrado.length > 0) buque.embarque = encontrado[0].embarque;
      }

      if (buque.esSeleccionado && buque.esSeleccionadoPorMuelle) {
        const latitud = buque.posicion.latitud;
        const longitud = buque.posicion.longitud;

        let buqueIconUrl = '';

       if (buque.sanBenito) buqueIconUrl = './assets/buque_san_benito.svg';

     // if (buque.sanBenito) buqueIconUrl = './assets/buque_san_benito.gif';

        if (buque.vicentin) buqueIconUrl = './assets/buque_vicentin.svg';

        if (buque.otrosMuelles) buqueIconUrl = './assets/buque_otro_muelle.svg';

        if (buque.noryon) buqueIconUrl = './assets/buque_nouryon.svg';

        this.iconoBuque = new L.Icon({
          iconUrl: buqueIconUrl,
          iconSize: [32, 32]
        });
        let fechaPosicionRecibida = this.ultimaPosicionRecibida(buque.posicion.horaUTCPosicionRecibida)
        fechaPosicionRecibida = fechaPosicionRecibida == undefined ? '' : fechaPosicionRecibida;
        fechaPosicionRecibida = fechaPosicionRecibida == null      ? '' : fechaPosicionRecibida;
        let markerPopup: any = this.cargarTarjetaBuque(TarjetaBuqueComponent,
          (c: any) => {
            c.instance.nombreBuque = buque.nombreBuque;
            c.instance.tipoBuque = buque.embarque ? buque.embarque.tipoBuque : '-';
            c.instance.imo = buque.informacion ? buque.informacion.imo : '-';
            c.instance.bandera = buque.informacion.bandera ? buque.informacion.bandera.nombre : '-';
            c.instance.porteNeto = buque.embarque ? buque.embarque.porteNeto : '-';
            c.instance.porteBruto = buque.embarque ? buque.embarque.porteBruto : '-';
            c.instance.puntal = buque.embarque ? buque.embarque.puntal : '-';
            c.instance.freeboard = buque.embarque ? buque.embarque.freeboard : '-';
            c.instance.cantidadBodegas = buque.embarque ? buque.embarque.cantidadBodegasTanques : '-';
            c.instance.eslora = buque.informacion ? buque.informacion.largoxAnchoExtremo : '-';
            c.instance.fotoEmbarque = buque.informacion ? buque.informacion.fotoEmbarque : '-';
          }, latitud, longitud);
        let mensajeToolTip = `<div style='border-width: 1px; border-color:gray;'><b> ${buque.nombreBuque} [${buque.viaje.paisOrigen}]</b><br>`;
        mensajeToolTip += `<span>Destino: ${buque.viaje.puertoDestino} [${buque.bandera}]</span><br>`;
        mensajeToolTip += `<span>Vel./Curso: ${buque.posicion.velocidadCurso}</span><br>`;
        //mensajeToolTip += `<span>Posición recibido: ${buque.posicion.horaUTCPosicionRecibida}</span><br>`;

        mensajeToolTip += `<span>Ultima posición recibida: ${fechaPosicionRecibida }</span><br>`;
        mensajeToolTip += `</div>`;
        const markerBuque = L.marker([latitud, longitud], { icon: this.iconoBuque }).bindPopup(markerPopup).bindTooltip(mensajeToolTip);
        markerBuque.on('click', this.markerOnClick, this);
        markerBuque.addTo(this.map);
      }
    });
  }

  markerOnClick(e)
  {
    this.modificarIconoSeleccionado(e.latlng.lat, e.latlng.lng);
  }

  private ultimaPosicionRecibida(fechaPosicionRecibida) {
    const fechaActual: Date = new Date();
    const fechaPosicion: Date = new Date(fechaPosicionRecibida);
    const fechaActualTime = fechaActual.getTime()
    const fechaPosicionTime = fechaPosicion.getTime()
    const tempDays = (fechaActualTime - fechaPosicionTime) / (1000 * 60 * 60 * 24);
    const tempHours = ((Math.abs(fechaActualTime - fechaPosicionTime) / (1000 * 60 * 60) % 24));
    const tempMinutes = ((Math.abs(fechaActualTime - fechaPosicionTime) / (1000 * 60) % 60));

    const days = parseInt(tempDays.toString())
    const hours = parseInt(tempHours.toString())
    const minutes = parseInt(tempMinutes.toString())

    let messageDays = '';
    let messageHours = '';
    let messageMinutes = '';

    if (days > 0)
      messageDays = days > 1 ? days + ' dias ' : days + ' dia ';

    if (hours > 0)
      messageHours = hours > 1 ? hours + ' horas ' : hours + ' hora ';

    if (minutes > 0)
      messageMinutes = minutes > 1 ? minutes + ' minutos ' : minutes + ' minuto ';
      var mensajeUltimaPosicion = 'Hace ' + messageDays + messageHours + messageMinutes;

    var hoy = new Date();
    hoy.setHours(hoy.getHours() - 3);
    if(fechaPosicion < hoy){
       mensajeUltimaPosicion = 'El buque está fuera de alcance';
    }

    return mensajeUltimaPosicion;
  }
  public async limpiarMarcadores() {
    this.map.eachLayer((layer) => {
      if ((layer instanceof L.Marker) ||
        (layer instanceof L.Circle) ||
        (layer instanceof L.Polygon)) {
        this.map.removeLayer(layer)
      }
    });
    this.map.removeControl(this.referenciaOverlay)
  }

  private cargarTarjetaBuque(component?: any, onAttach?: any, latitud?: any, longitud?: any) {
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
  // #endregion

  // #region Eventos Controles
  public onZoomBuqueSeleccionado(event) {
    const latitud = event.latitud;
    const longitud = event.longitud;
    this.map.setView([latitud, longitud], 12);
    this.modificarIconoSeleccionado(latitud, longitud);


  }

  private modificarIconoSeleccionado(latitud?: any, longitud?: any)
  {
    this.map.eachLayer((layer) => {
      if ((layer instanceof L.Marker)) {
        if(layer.getLatLng().lat==latitud && layer.getLatLng().lng == longitud)
        {
          var icon = layer.getIcon();
          icon.options.iconSize = [48,48];
          (layer as any)._icon .style.animation = 'a 1s infinite alternate'
          layer.getIcon().remove;
          layer.setIcon(icon);

        }
        else
        {
          var icon = layer.getIcon();
          if(icon.options.iconUrl.includes("buque_"))
            {
              icon.options.iconSize = [32,32];
              (layer as any)._icon .style.animation = ''
              layer.getIcon().remove;
              layer.setIcon(icon);
            }
        }
      }
    });
  }
  private onMapZoomEnd(map: L.Map): void {
    /*
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

          this.map.removeControl(this.referenciaOverlay)
          this.cargarPuntosInteres();
          this.cargarBuquesMapa();
          this.recargarMarkadores = false;
      }
    }
    */
  }
  // #endregion

}
