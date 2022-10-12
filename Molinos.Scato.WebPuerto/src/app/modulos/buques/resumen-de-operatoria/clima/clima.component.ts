import { Component, OnInit } from '@angular/core';
import { EstadoPuerto } from '@ScatoModels/estado-puerto';
import { LineupService } from '@ScatoServicios/lineup.service';

@Component({
  selector: 'app-clima',
  templateUrl: './clima.component.html',
  styleUrls: ['./clima.component.css']
})
export class ClimaComponent implements OnInit {
  estadoPuerto: EstadoPuerto;
  estadoCalado: string;
  estadoAltura: string;

  constructor(private lineupService: LineupService) { }

  ngOnInit(): void {
    this.lineupService.obtenerEstadoPuerto().subscribe(x => {
      this.estadoPuerto = x; 
      this.cargarEstadosPuerto(); 
    });
  }

  public cargarEstadosPuerto(){
    this.estadoCalado = this.estadoPuerto.calado == null ? '' : this.estadoPuerto.calado;
    this.estadoAltura = this.estadoPuerto.alturaDelRio == null ? '' : this.estadoPuerto.alturaDelRio;
  }

}
