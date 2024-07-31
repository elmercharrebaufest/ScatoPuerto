import { Component, ViewChild, OnInit } from '@angular/core';
import { SemaforoRitmoEmbarqueComponent } from 'app/shared/componentes/semaforo-ritmo-embarque/semaforo-ritmo-embarque.component';
import { ActivatedRoute } from '@angular/router';
import { RegistroFechas } from '@ScatoModels/Buques/registroFechas';
import { ResumenOperatoriaEmbarque } from '@ScatoModels/Buques/resumenOperatoria';
import { Balanzas78Service } from '@ScatoServicios/balanzas78.service';
import { BuqueService } from '@ScatoServicios/buque.service';
import { BuqueSharingService } from '@ScatoServicios/buque.shared.service';
import { EmbarqueSharingService } from '@ScatoServicios/embarque.shared.service';
import { FechaDto, TurnoDto } from '@ScatoModels/calidad/combos-fechas-y-turnos';
import { BalanzaCorteFilledDto } from '@ScatoModels/calidad/balanzas-cortes';
import { BalanzasRitmosService } from '@ScatoServicios/calidad/balanzas-ritmos.service';

@Component({
  selector: 'app-fechas-ritmos',
  templateUrl: './fechas-ritmos.component.html',
  styleUrls: ['./fechas-ritmos.component.css']
})
export class FechasRitmosComponent implements OnInit {
  @ViewChild(SemaforoRitmoEmbarqueComponent) semaforoRitmoEmbarqueComponent: SemaforoRitmoEmbarqueComponent;

  //#region variables
  moduloDeCargaId: number = 0;
  embarqueId: number;
  vaporId: number = 0;
  registroFechas: RegistroFechas;
  mostrarFechas : boolean = false;
  horasPuerto: number;
  tieneLimpieza: boolean;
  enBuque: boolean = false;
  liquido: boolean;
  tieneMotivoLimpieza: boolean;
  tieneObsLimpieza: boolean;

  fechas: FechaDto[] = [];
  turnos: TurnoDto[] = [];
  availableDates: string[] = [];

  habilitarFechasYTurnos: boolean = false;

  selectedDate: string;
  selectedTurn: number = 0;
  dateMin: string;
  dateMax: string;

  startBalanza7: string;
  tnCargadasHastaAhora7: number;
  ritmoEmbarque7: number;
  horasTotalesBalanza7: number;
  ultimaActualizacion7: string;

  startBalanza8: string;
  tnCargadasHastaAhora8: number;
  ritmoEmbarque8: number;
  horasTotalesBalanza8: number;
  ultimaActualizacion8: string;

  valorRitmoBruto: number ;
  valorCargando: number;
  tnTotales: number;
  valorRitmoNeto: number;
//#endregion
//#region constructor
  constructor(
    private balanzas78Service: Balanzas78Service,
    private route: ActivatedRoute,
    private buqueService: BuqueService,
    private buqueSharingService: BuqueSharingService,
    private embarqueSharingService: EmbarqueSharingService,
    private balanzasRitmosService: BalanzasRitmosService
  ) {
    this.enBuque = true;
    this.cargarParametros();  
    
    this.embarqueSharingService.getParametrosIdsEmbarque().subscribe(data =>{
      if (data!=null && data!= undefined){
        this.moduloDeCargaId = data.moduloDeCarga_Id;
        this.embarqueId = data.embarque_Id;
        this.liquido = data.esLiquido;
        this.balanzas78Service.setEmbarqueBalanzaCalidad(this.moduloDeCargaId);
        this.embarqueSharingService.setEmbarqueId(this.embarqueId); 
      }
    });
    this.vaporId = parseInt(this.route.snapshot.paramMap.get('vaporid'));      //consigo el vaporID que esta en la ruta y lo seteo
  }

  //#endregion
  //#region metodos


  ngOnInit(): void {
    this.initRegistroFechas();
    this.initRitmos()

    this.startBalanza7 = '';
    this.tnCargadasHastaAhora7 = 0;
    this.ritmoEmbarque7 = 0;
    this.horasTotalesBalanza7 = 0;
    this.ultimaActualizacion7 = '';

    this.startBalanza8 = '';
    this.tnCargadasHastaAhora8 = 0;
    this.ritmoEmbarque8 = 0;
    this.horasTotalesBalanza8 = 0;
    this.ultimaActualizacion8 = '';

    this.valorRitmoBruto = 0;
    this.valorCargando = 0;
    this.tnTotales = 0;
    this.valorRitmoNeto = 0;
  }
  private cargarParametros(){
    this.embarqueId = parseInt(this.route.snapshot.paramMap.get('embarqueid'));
    this.buqueSharingService.getActualizarResumenOperatoria().subscribe(res=>{
      const resumenOperatoriaEmbarque: ResumenOperatoriaEmbarque = res;
      if (resumenOperatoriaEmbarque !=null && resumenOperatoriaEmbarque.actualizarDatos) {
        this.embarqueId = resumenOperatoriaEmbarque.embarqueId;
      }
    });
  }
  //obtengo las fechas para la linea temporal que luego seteo en el HTML
  initRegistroFechas(){
    this.buqueService.obtenerRegistroFechas(this.embarqueId).subscribe((res:RegistroFechas) => {
      this.registroFechas = res
      if(this.registroFechas.limpiezaDesde != "-") this.tieneLimpieza = true;    //si limpieza == "-" es por que no tiene y no se mostrará
      if(this.registroFechas.motivoLimpieza != "-") this.tieneMotivoLimpieza = true;  //en el registro de fechas
      if(this.registroFechas.obsLimpieza != "-") this.tieneObsLimpieza = true;
      this.horasPuerto= parseInt(this.registroFechas.hsEnPuerto);
      this.mostrarFechas = true;

    });
  }

  initRitmos(){
    this.embarqueSharingService.setModuloDeCargaId(this.moduloDeCargaId);
    this.balanzas78Service.setBalanzadaAgrupada7(this.balanzas78Service.getBalanzada7());
    this.balanzas78Service.setBalanzadaAgrupada8(this.balanzas78Service.getBalanzada8());
    this.balanzas78Service.setBalanzada7Kilos(this.balanzas78Service.getBalanzada7());
    this.balanzas78Service.setBalanzada8Kilos(this.balanzas78Service.getBalanzada8());
  }








  toggleFechasYTurnos = () => {
    if (this.habilitarFechasYTurnos) {
      this.loadFechasYTurnos(329);
    } else {
      this.selectedDate = null;
      this.fechas = [];
      this.dateMin = '';
      this.dateMax = '';
      this.turnos = [];
    }
  }

  loadFechasYTurnos = (idModuloDeCarga: number): void => {
    // console.log('loadFechasYTurnos');
    this.balanzasRitmosService.consultarCombosFechasYTurnos(idModuloDeCarga).subscribe(response => {
      console.log(' response: ', response);
      this.fechas = response.fechas;
      this.dateMin = response.fechaMinima;
      this.dateMax = response.fechaMaxima;
      this.selectedDate = this.dateMin;
      this.availableDates = this.fechas.map(f => f.fecha);
      if (this.fechas.length > 0) {
        this.turnos = this.fechas[0].turnos;
      }
    });
  }

  updateDate = (event: any) => {
    // console.log('updateDate');
    const mySelectedDate = new Date(event.target.value);
    const selectedFecha = this.fechas.find(f => new Date(f.fecha).toDateString() === mySelectedDate.toDateString());
    if (selectedFecha) {
      this.turnos = selectedFecha.turnos;
    } else {
      this.turnos = [];
    }
  }

  updateTurn = (event: any) => {
    console.log('updateTurn');
    this.selectedTurn = event.target.value;
    this.updateData();
  }

  updateData = () => {
    console.log('updateData');
    let loadTons7 = 0;
    let loadTons8 = 0;
    let loadTonsAll = 0;

    this.tnCargadasHastaAhora7 = 0;
    this.tnCargadasHastaAhora8 = 0;
    if (this.selectedDate != '' && this.selectedTurn != 0) {
      console.log(' consultarRitmosBrutos');
      let dateSelectedDate = this.convertToDate(this.selectedDate);
      this.balanzasRitmosService.consultarRitmosBrutos(329, this.selectedDate, this.selectedTurn).subscribe(rb => {
        // console.log(' response: ', rb);

        const firstItemBalanza7 = rb.ritmosBrutos.filter(item => item.codigoBalanza == '7')[0];
        const firstItemBalanza8 = rb.ritmosBrutos.filter(item => item.codigoBalanza == '8')[0];
        const lastItemBalanza7 = rb.ritmosBrutos.filter(item => item.codigoBalanza == '7').pop();
        const lastItemBalanza8 = rb.ritmosBrutos.filter(item => item.codigoBalanza == '8').pop();
        this.startBalanza7 = firstItemBalanza7.fecha;
        this.startBalanza8 = firstItemBalanza8.fecha;
        this.ultimaActualizacion7 = lastItemBalanza7.fecha;
        this.ultimaActualizacion8 = lastItemBalanza8.fecha;

        this.horasTotalesBalanza7 = this.calcularHorasTotales(firstItemBalanza7, lastItemBalanza7);
        this.horasTotalesBalanza8 = this.calcularHorasTotales(firstItemBalanza8, lastItemBalanza8);

        rb.ritmosBrutos.forEach(item => {
          let turnoHasta = this.getRitmosBrutos(item.fecha, this.selectedTurn);
          let dateActualDate = this.convertToDate(item.fecha.substring(0, 10));
          if (item.codigoBalanza == '7') {
            if ((dateSelectedDate.getTime() > dateActualDate.getTime()) || 
              (dateSelectedDate.getTime() === dateActualDate.getTime() && turnoHasta)) {
              let tnActualQuantity7 = ((item.cantidad)/1000).toFixed(2);
              loadTons7 = loadTons7 + parseFloat(tnActualQuantity7);
              // console.log(' loadTons7: ', loadTons7);
            }
          }
          else if (item.codigoBalanza == '8') {
            if ((dateSelectedDate.getTime() > dateActualDate.getTime()) || 
              (dateSelectedDate.getTime() === dateActualDate.getTime() && turnoHasta)) {
              let tnActualQuantity8 = ((item.cantidad)/1000).toFixed(2);
              loadTons8 = loadTons8 + parseFloat(tnActualQuantity8);
              // console.log(' loadTons8: ', loadTons8);
            }
          }
          let tnActualQuantityAll = ((item.cantidad)/1000).toFixed(2);
          loadTonsAll = loadTonsAll + parseFloat(tnActualQuantityAll);
        });

        this.tnCargadasHastaAhora7 = parseFloat(loadTons7.toFixed(2));
        this.tnCargadasHastaAhora8 = parseFloat(loadTons8.toFixed(2));
  
        let ritmo7 = this.tnCargadasHastaAhora7 / this.horasTotalesBalanza7;
        let ritmo8 = this.tnCargadasHastaAhora8 / this.horasTotalesBalanza8;
  
        this.ritmoEmbarque7 = parseFloat(ritmo7.toFixed(2));
        this.ritmoEmbarque8 = parseFloat(ritmo8.toFixed(2));

        this.valorRitmoBruto = this.ritmoEmbarque7 + this.ritmoEmbarque8;
        this.valorCargando = this.tnCargadasHastaAhora7 + this.tnCargadasHastaAhora8;
        this.tnTotales = parseFloat(loadTonsAll.toFixed(2));


        this.balanzasRitmosService.consultarBalanzasCortes(329).subscribe(item => {
          // console.log(' response: ', item);
          // console.log(' horasTotalesBalanza7: ', this.horasTotalesBalanza7);
          // console.log(' horasTotalesBalanza8: ', this.horasTotalesBalanza8);
          const horasNetasBalanza7 = this.horasTotalesBalanza7 - this.calcularHorasCortes(item.balanzasCortes, '7');
          const horasNetasBalanza8 = this.horasTotalesBalanza8 - this.calcularHorasCortes(item.balanzasCortes, '8');
          // console.log(' horasNetasBalanza7: ', horasNetasBalanza7);
          // console.log(' horasNetasBalanza8: ', horasNetasBalanza8);
  
          let ritmoNeto7 = this.tnCargadasHastaAhora7 / horasNetasBalanza7;
          let ritmoNeto8 = this.tnCargadasHastaAhora8 / horasNetasBalanza8;
          // console.log(' ritmoNeto7: ', ritmoNeto7);
          // console.log(' ritmoNeto8: ', ritmoNeto8);
    
          this.valorRitmoNeto = parseFloat((ritmoNeto7 + ritmoNeto8).toFixed(2));
          // console.log(' valorRitmoNeto: ', this.valorRitmoNeto);
        });
      });
    }
  }

  getRitmosBrutos = (endTime: string, idTurnoPuerto: number): boolean => {
    // console.log('getRitmosBrutos');
    let myIdTurnoPuerto = 0;
    let end = parseInt(endTime.substring(11, 13));
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

    if (myIdTurnoPuerto <= idTurnoPuerto){
      return true;
    }

    return false;
  }

  convertToDate = (stringDate: string): Date => {
    const partDate = stringDate.split("-");
    const dateDate = new Date(parseInt(partDate[0], 10), parseInt(partDate[1], 10) - 1, parseInt(partDate[2], 10));
    return dateDate;
  }

  obtenerHorasDeTurno = (turnoId: number): number => {
    const turnos = [
      { id: 1, nombre: '00-06', inicio: 0, fin: 6 },
      { id: 2, nombre: '06-12', inicio: 6, fin: 12 },
      { id: 3, nombre: '12-18', inicio: 12, fin: 18 },
      { id: 4, nombre: '18-24', inicio: 18, fin: 24 }
    ];

    const turno = turnos.find(t => t.id === turnoId);
    if (turno) {
      return turno.fin - turno.inicio;
    }
    return 0;
  }
  
  calcularHorasTotales = (firstItem: any, lastItem: any): number => {
    const startDate = this.convertToDate(firstItem.fecha.substring(0, 10));
    const endDate = this.convertToDate(lastItem.fecha.substring(0, 10));
    let horasTotales = 0;
  
    if (startDate.toDateString() === endDate.toDateString()) {
      horasTotales += (startDate.getTime() - endDate.getTime()) / (1000 * 60 * 60);
    } else {
      const turnoInicio = firstItem.idTurnoPuerto;
      const horasPrimerTurno = this.obtenerHorasDeTurno(turnoInicio) - startDate.getHours();
      horasTotales += horasPrimerTurno;
      let fechaIntermedia = new Date(startDate);
      fechaIntermedia.setDate(fechaIntermedia.getDate() + 1);
      while (fechaIntermedia.toDateString() !== endDate.toDateString()) {
        horasTotales += 24;
        fechaIntermedia.setDate(fechaIntermedia.getDate() + 1);
      }

      const horasUltimoTurno = endDate.getHours();
      horasTotales += horasUltimoTurno;
    }
  
    return horasTotales;
  }

  calcularHorasCortes = (cortes: BalanzaCorteFilledDto[], nombreBalanza: string): number => {
    // console.log('calcularHorasCortes');
    let horasCorte = 0;

    cortes.forEach(corte => {
      // console.log(' corte: ', corte);
      if (corte.numeroBalanza == nombreBalanza) {
        const inicioCorte = new Date(corte.fechaInicio);
        // console.log(' inicioCorte: ', inicioCorte);
        const finCorte = new Date(corte.fechaCorte);
        // console.log(' finCorte: ', finCorte);
        horasCorte += (finCorte.getTime() - inicioCorte.getTime()) / (1000 * 60 * 60);
        // console.log(' horasCorte: ', horasCorte);
      }
    });
    // console.log(' horasCorte: ', horasCorte);

    return horasCorte;
  }
  //#endregion
}
