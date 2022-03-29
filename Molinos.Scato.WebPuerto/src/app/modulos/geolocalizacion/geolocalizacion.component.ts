import { Component, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PuntosInteres } from '@ScatoModels/geolocalizacion/puntos-interes';
import { GeolocalizacionService } from '@ScatoServicios/geolocalizacion.services';
import { SessionService } from '@ScatoServicios/session.service';

@Component({
  selector: 'app-geolocalizacion',
  templateUrl: './geolocalizacion.component.html',
  styleUrls: ['./geolocalizacion.component.css']
})
export class GeolocalizacionComponent implements OnInit, OnChanges {
  
  mostrarSpinner: boolean = true;
  mostrarContent: boolean = true;
  mostrarLineUp: boolean = true;
  fechaActualizacion: Date;
  user: any;
  listaPuntosInteres;

  constructor(private session: SessionService,
              private geolocalizacionService: GeolocalizacionService,
              private router: Router) { 
      this.user = this.session.getUser();
      this.cargarPuntosInteres();
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
    this.geolocalizacionService.ListarPuntosInteresGeolocalizacion().subscribe(data=>{
      this.listaPuntosInteres = data;
    });
  }

}

