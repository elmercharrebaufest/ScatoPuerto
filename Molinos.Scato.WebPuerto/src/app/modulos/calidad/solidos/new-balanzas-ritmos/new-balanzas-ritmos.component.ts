import { Component, ViewChild } from '@angular/core';
import { RelojBalanzasComponent } from 'app/shared/componentes/modulos/carga/reloj-balanzas/reloj-balanzas.component';
import { BalanzasRitmosService } from '../../../../shared/servicios/calidad/balanzas-ritmos.service';
import { FechaDto, TurnoDto } from '@ScatoModels/calidad/combos-fechas-y-turnos';

@Component({
  selector: 'app-new-balanzas-ritmos',
  templateUrl: './new-balanzas-ritmos.component.html',
  styleUrls: ['./new-balanzas-ritmos.component.css']
})
export class NewBalanzasRitmosComponent {
  @ViewChild(RelojBalanzasComponent) relojBalanzasComponent: RelojBalanzasComponent;
  
  fechas: FechaDto[] = [];
  turnos: TurnoDto[] = [];
  availableDates: string[] = [];

  habilitarFechasYTurnos: boolean = false;

  date: string;
  turno: number = 0;
  dateMin: string;
  dateMax: string;

  // Variables para los datos de las balanzas
  startBalanza7: string;
  tnCargadasHastaAhora7: number;
  ritmoEmbarque7: number;
  ultimaActualizacion7: string;

  startBalanza8: string;
  tnCargadasHastaAhora8: number;
  ritmoEmbarque8: number;
  ultimaActualizacion8: string;

  // Variables para los semáforos
  valorRitmoBruto: number ;
  valorCargando: number;
  tnTotales: number;
  valorRitmoNeto: number;

  constructor(
    private balanzasRitmosService: BalanzasRitmosService) {}

  ngOnInit() {
    this.updateData();
    this.startBalanza7 = '';
    this.tnCargadasHastaAhora7 = 0;
    this.ritmoEmbarque7 = 0;
    this.ultimaActualizacion7 = '';

    this.startBalanza8 = '';
    this.tnCargadasHastaAhora8 = 0;
    this.ritmoEmbarque8 = 0;
    this.ultimaActualizacion8 = '';

    this.valorRitmoBruto = 0;
    this.valorCargando = 0;
    this.tnTotales = 0;
    this.valorRitmoNeto = 0;
  }

  toggleFechasYTurnos = () => {
    if (this.habilitarFechasYTurnos) {
      this.loadFechasYTurnos(290);
    } else {
      this.date = null;
      this.fechas = [];
      this.dateMin = '';
      this.dateMax = '';
      this.turnos = [];
    }
  }

  loadFechasYTurnos = (idModuloDeCarga: number): void => {
    console.log('loadFechasYTurnos');
    this.balanzasRitmosService.consultarCombosFechasYTurnos(idModuloDeCarga).subscribe(response => {
      console.log(' response: ', response);
      this.fechas = response.fechas;
      this.dateMin = response.fechaMinima;
      this.dateMax = response.fechaMaxima;
      this.date = this.dateMin;
      this.availableDates = this.fechas.map(f => f.fecha);
      if (this.fechas.length > 0) {
        this.turnos = this.fechas[0].turnos;
      }
    });
  }

  updateDate = (event: any) => {
    // console.log('updateDate');
    const selectedDate = new Date(event.target.value);
    const selectedFecha = this.fechas.find(f => new Date(f.fecha).toDateString() === selectedDate.toDateString());
    if (selectedFecha) {
      this.turnos = selectedFecha.turnos;
    } else {
      this.turnos = [];
    }
  }

  updateTurn = (event: any) => {
    console.log('updateTurn');
    this.turno = event.target.value;
    this.updateData();
  }

  updateData = () => {
    console.log('updateData');
    console.log(' date: ', this.date);
    console.log(' turno: ', this.turno);
    // const data = this.balanzasRitmosService.getMockData(this.date, this.turno);
    // console.log(' data:', data);
    // if (data) {
    //   this.startBalanza7 = data.startBalanza7;
    //   this.tnCargadasHastaAhora7 = data.tnCargadasHastaAhora7;
    //   this.ritmoEmbarque7 = data.ritmoEmbarque7;
    //   this.ultimaActualizacion7 = data.ultimaActualizacion7;

    //   this.startBalanza8 = data.startBalanza8;
    //   this.tnCargadasHastaAhora8 = data.tnCargadasHastaAhora8;
    //   this.ritmoEmbarque8 = data.ritmoEmbarque8;
    //   this.ultimaActualizacion8 = data.ultimaActualizacion8;

    //   console.log(' ritmoEmbarque7: ', this.ritmoEmbarque7);
    //   console.log(' ritmoEmbarque8: ', this.ritmoEmbarque8);
    //   this.valorRitmoBruto = this.ritmoEmbarque7 + this.ritmoEmbarque8;
    //   console.log(' valorRitmoBruto: ', this.valorRitmoBruto);
    //   this.valorCargando = this.tnCargadasHastaAhora7 + this.tnCargadasHastaAhora8;

    //   const totalTn = this.balanzasRitmosService.getTotalTnForDate(this.date);
    //   this.tnTotales = totalTn.totalTn7 + totalTn.totalTn8;
    // }

    let tnCargadas7 = 0;
    let tnCargadas8 = 0;

    this.tnCargadasHastaAhora7 = 0;
    this.tnCargadasHastaAhora8 = 0;
    if (this.date != '' && this.turno != 0) {
      this.balanzasRitmosService.consultarRitmosBrutos(290, this.date, this.turno).subscribe(response => {
        console.log(' response: ', response);
        response.ritmosBrutos.forEach(e => {
          let turnoHasta = this.getRitmosBrutos(e.fecha, this.turno);

          if (e.codigoBalanza == '7') {
            this.startBalanza7 = e.fecha;

            if (turnoHasta) {
              let tnCargadas77 = ((e.cantidad)/1000).toFixed(2);
              tnCargadas7 = tnCargadas7 + parseFloat(tnCargadas77);
              // console.log(' tnCargadas7: ', tnCargadas7);
            }
          } 
          if (e.codigoBalanza == '8') {
            this.startBalanza8 = e.fecha;

            if (turnoHasta) {
              let tnCargadas88 = ((e.cantidad)/1000).toFixed(2);
              tnCargadas8 = tnCargadas8 + parseFloat(tnCargadas88);
              // console.log(' tnCargadas8: ', tnCargadas8);
            }
          }
        });


        this.tnCargadasHastaAhora7 = parseFloat(tnCargadas7.toFixed(2));
        this.tnCargadasHastaAhora8 = parseFloat(tnCargadas8.toFixed(2));
        console.log(' tnCargadasHastaAhora7: ', this.tnCargadasHastaAhora7);
        console.log(' tnCargadasHastaAhora8: ', this.tnCargadasHastaAhora8);
  
        let ritmo7 = (this.tnCargadasHastaAhora7 / (this.turno * 6)).toFixed(2);
        let ritmo8 = (this.tnCargadasHastaAhora8 / (this.turno * 6)).toFixed(2);
  
        this.ritmoEmbarque7 = parseFloat(ritmo7);
        this.ritmoEmbarque8 = parseFloat(ritmo8);
  
        // console.log(' ritmoEmbarque7: ', this.ritmoEmbarque7);
        // console.log(' ritmoEmbarque8: ', this.ritmoEmbarque8);

        this.valorRitmoBruto = this.ritmoEmbarque7 + this.ritmoEmbarque8;
        this.valorCargando = this.tnCargadasHastaAhora7 + this.tnCargadasHastaAhora8;
        this.tnTotales = this.valorCargando * 2;
      });
      
    }
  }

  getRitmosBrutos = (endTime: string, idTurnoPuerto: number): boolean => {
    // console.log('getRitmosBrutos');
    let myIdTurnoPuerto = 0;
    let end = parseInt(endTime.substring(11, 13));
    // console.log(' endTime: ', endTime);
    // console.log(' endTime: ', endTime.substring(11, 13));
    // console.log(' end: ', end);
    if (end >= 0 && end < 6)
    {
      myIdTurnoPuerto = 1;
    } else if (end >= 6 && end < 12)
    {
      myIdTurnoPuerto = 2;
    } else if (end >= 12 && end < 18)
    {
      myIdTurnoPuerto = 3;
    }
    else if (end >= 18 && end <= 23)
    {
      myIdTurnoPuerto = 4;
    }

    // console.log(' myIdTurnoPuerto: ', myIdTurnoPuerto);
    // console.log(' idTurnoPuerto: ', idTurnoPuerto);
    if (myIdTurnoPuerto <= idTurnoPuerto){
      return true;
    }

    return false;
  }
}
