import { Component, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PuntosInteres } from '@ScatoModels/geolocalizacion/puntos-interes';
import { GeolocalizacionService } from '@ScatoServicios/geolocalizacion.services';
import { SessionService } from '@ScatoServicios/session.service';
import { MapaBuqueComponent } from './mapa-buque/mapa-buque.component';

@Component({
  selector: 'app-geolocalizacion',
  templateUrl: './geolocalizacion.component.html',
  styleUrls: ['./geolocalizacion.component.css']
})
export class GeolocalizacionComponent implements OnInit, OnChanges {
  
  mostrarSpinner: boolean = true;
  mostrarMapa: boolean = false;
  mostrarListaBuque: boolean = false;

  fechaActualizacion: Date;
  user: any;
  listaPuntosInteres;
  listaBuquesGeolocalizacion;
  @ViewChild(MapaBuqueComponent) mapaBuqueComponent: MapaBuqueComponent;

  constructor(private session: SessionService,
              private geolocalizacionService: GeolocalizacionService,
              private router: Router) { 
      this.user = this.session.getUser();
      this.cargarPuntosInteres();
      this.cargarBuquesGeolocalizacion();

    }

  ngOnChanges(): void {
    
  }

  ngOnInit(): void {
    this.fechaActualizacion = new Date(Date.now());
    this.mostrarSpinner = false;

  }
  tienePermiso(permiso: number) {
    return this.user.permisos.find(x => x === permiso);
  }
  
  cambiarLineUp() {
    this.router.navigate(['lineup']);

  }
  cargarPuntosInteres(){
    this.mostrarMapa = false;
    this.geolocalizacionService.ListarPuntosInteresGeolocalizacion().subscribe(
      data => {
        console.log(data)
        this.listaPuntosInteres = data;
      },
      err => {
            console.error('Observer got an error: ' + err)
            this.mostrarMapa = true;  
            },
      () => {
            this.mostrarMapa = true;
            }
    );
  }
  
  cargarBuquesGeolocalizacion(){
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
                });
                this.listaBuquesGeolocalizacion = data;
                
             },
      err => {
                console.error('Observer got an error: ' + err)
                this.mostrarListaBuque = false;
             },
      () => {
                this.mostrarListaBuque = true;
            }
    );
  }

  async onChangeBuqueMapa(event){
    this.listaBuquesGeolocalizacion = event;
    await this.mapaBuqueComponent.limpiarMarcadores();
    await this.mapaBuqueComponent.cargarPuntosInteres();
    await this.mapaBuqueComponent.cargarBuquesMapa();
  }
  async onZoomBuqueSeleccionado(event){
    await this.mapaBuqueComponent.onZoomBuqueSeleccionado(event);
  }
}

