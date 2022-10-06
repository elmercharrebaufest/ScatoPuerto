import { Component, OnChanges, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AutenticadorService } from '@ScatoServicios/autenticador.service';
import { GeolocalizacionService } from '@ScatoServicios/geolocalizacion.services';
import { GeolocalizacionSharingService } from '@ScatoServicios/geolocalizacion.sharing.service';
import { ParametrosService } from '@ScatoServicios/parametros.service';

import { SessionService } from '@ScatoServicios/session.service';
import { MapaBuqueComponent } from './mapa-buque/mapa-buque.component';

@Component({
  selector: 'app-geolocalizacion',
  templateUrl: './geolocalizacion.component.html',
  styleUrls: ['./geolocalizacion.component.css']
})
export class GeolocalizacionComponent implements OnInit {

  // #region Variables
  mostrarSpinner: boolean = true;
  mostrarMapa: boolean = false;
  mostrarListaBuque: boolean = false;
  user: any;
  private listaPuntosInteres;
  private listaBuquesGeolocalizacion;
  @ViewChild(MapaBuqueComponent) mapaBuqueComponent: MapaBuqueComponent;
  // #endregion

  // #region Constructor
  constructor(private session: SessionService,
    private geolocalizacionService: GeolocalizacionService,
    private geolocalizacionSharingService: GeolocalizacionSharingService,
    private router: Router,
    private route: ActivatedRoute,
    private parametrosService: ParametrosService,
    private auth: AutenticadorService) {
    this.auth.renovarAuthUsuario();
    this.user = this.session.getUser();
    this.parametrosService.obtenerParametros().subscribe( res => this.parametrosService.setParametros(res) );
    this.cargarPuntosInteres();
    this.cargarBuquesGeolocalizacion();
    
  }
  // #endregion

  // #region Eventos del Componente  
  ngOnInit() {
    this.mostrarSpinner = false;
  }
  // #endregion

  // #region Metodos 
  private setListaPuntosInteres(puntosInteres) {
    this.listaPuntosInteres = puntosInteres;
  }

  private setListaBuquesGeolocalizacion(BuquesGeolocalizacion) {
    this.listaBuquesGeolocalizacion = BuquesGeolocalizacion;
  }

  public getListaPuntosInteres() {
    return this.listaPuntosInteres;
  }

  public getListaBuquesGeolocalizacion() {
    return this.listaBuquesGeolocalizacion;
  }

  public tienePermiso(permiso: number) {
    return this.user.permisos.find(x => x === permiso);
  }

  public getUltimaActualizacion() {
    if (this.listaBuquesGeolocalizacion.length == 0) return null;
    const fechaActualizacion = Math.max.apply(Math, this.listaBuquesGeolocalizacion.map(function (item) { return new Date(item.posicion.fechaRegistro); }));
    return fechaActualizacion;
  }

  private cargarPuntosInteres() {
    this.mostrarMapa = false;
    this.geolocalizacionService.ListarPuntosInteresGeolocalizacion().subscribe(
      data => {
        this.setListaPuntosInteres(data);
        this.geolocalizacionSharingService.setPuntosInteres(this.getListaPuntosInteres());
      },
      err => {
        this.mostrarMapa = true;
      },
      () => {
        this.mostrarMapa = true;
      }
    );
  }

  private cargarBuquesGeolocalizacion() {
    this.mostrarListaBuque = false;
    this.geolocalizacionService.ListarEmbarqueLineUpGeolocalizacion().subscribe(
      data => {
        let muelleCarga = '';
        data.forEach((item) => {
          if (item.sanBenito) muelleCarga = 'San Benito';
          if (item.vicentin) muelleCarga = 'Vicentin';
          if (item.otrosMuelles) muelleCarga = 'Otros Muelles';
          if (item.noryon) muelleCarga = 'Nouryon';

          item.muelleCarga = muelleCarga;
          item.esSeleccionado = true;
          item.esCordenadaModificada = false;
          item.esSeleccionadoPorMuelle = true;
          item.numeroPaginado = 0;
        });
        this.setListaBuquesGeolocalizacion(data);

      },
      err => {
        this.mostrarListaBuque = false;
      },
      () => {
        this.mostrarListaBuque = true;
        this.cargarBuqueAdicionales();
        this.cargarBuqueSeleccionado();
      }
    );
  }

  private cargarBuqueAdicionales() {
    if (this.listaBuquesGeolocalizacion != undefined) {
      if (this.listaBuquesGeolocalizacion.length > 0) {

        this.listaBuquesGeolocalizacion.forEach((item) => {

          if (!item.sanBenito) {
            const embarqueSel = this.listaBuquesGeolocalizacion.find(buque => buque.vapor_Id == item.vapor_Id && buque.sanBenito == true);

            if (embarqueSel != undefined) {
              let maxEmbarque_Id;
              const embarqueIds = this.listaBuquesGeolocalizacion.find(data => data.vapor_Id == item.vapor_Id && data.esCordenadaModificada == true && data.embarque_Id != item.embarque_Id && item.sanBenito != true);

              if (embarqueIds != undefined) {
                maxEmbarque_Id = embarqueIds.embarque_Id;
              }
              const embarqueSelCord = this.listaBuquesGeolocalizacion.find(buque => buque.embarque_Id == maxEmbarque_Id);

              let latitudVal = null;
              let longitudVal = null;

              if (embarqueSelCord != undefined) {
                latitudVal = Number(embarqueSelCord.posicion.latitud) + 0.00879;
                longitudVal = Number(embarqueSelCord.posicion.longitud) + 0.00290;
                item.posicion.latitud = latitudVal;
                item.posicion.longitud = longitudVal;
                item.esCordenadaModificada = true;
              } else {
                latitudVal = Number(item.posicion.latitud) + 0.00879;
                longitudVal = Number(item.posicion.longitud) + 0.00290;
                item.posicion.latitud = latitudVal;
                item.posicion.longitud = longitudVal;
                item.esCordenadaModificada = true;
              }
            }
          }
        })

        this.geolocalizacionSharingService.setBuquesLineUp(this.getListaBuquesGeolocalizacion());
      }
    }
  }

  private cargarBuqueSeleccionado() {
    let embarque_Id;
    let tipo;
    if (this.route.snapshot.queryParams.embarque_id != undefined) {
      embarque_Id = this.route.snapshot.queryParams.embarque_id
    }
    if (this.route.snapshot.queryParams.tipo != undefined) {
      tipo = this.route.snapshot.queryParams.tipo
    }
    if (this.listaBuquesGeolocalizacion != undefined) {
      if (tipo == 'zoom') {
        const embarque = this.listaBuquesGeolocalizacion.filter(buque => buque.embarque_Id == embarque_Id);
        this.geolocalizacionSharingService.setBuqueSeleccionado(embarque);
      }
    }
  }
  // #endregion

  // #region Eventos Controles
  public async onChangeBuqueMapa(event) {
    this.geolocalizacionSharingService.setBuquesLineUp(event);
    await this.mapaBuqueComponent.limpiarMarcadores();
    await this.mapaBuqueComponent.cargarPuntosInteres();
    await this.mapaBuqueComponent.cargarBuquesMapa();
  }

  public async onZoomBuqueSeleccionado(event) {
    document.getElementById('mapaGeolocalizacion').scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
    await this.mapaBuqueComponent.onZoomBuqueSeleccionado(event);
  }

  public onCambiarLineUp() {
    this.router.navigate(['lineup']);
  }
  // #endregion
}