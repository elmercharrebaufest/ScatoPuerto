import { Component, Input, ViewChild } from '@angular/core';
import { RitmoEmbarqueBalanzaComponent } from 'app/shared/componentes/ritmo-embarque-balanza/ritmo-embarque-balanza.component';
import { SemaforoRitmoEmbarqueComponent } from 'app/shared/componentes/semaforo-ritmo-embarque/semaforo-ritmo-embarque.component';
import { BalanzasRitmosService } from '../../../../shared/servicios/calidad/balanzas-ritmos.service';
import { FechaDto, TurnoDto } from '@ScatoModels/calidad/combos-fechas-y-turnos';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { TurnosCerrados } from '@ScatoModels/calidad/turnos-cerrados';

@Component({
  selector: 'app-new-balanzas-ritmos',
  templateUrl: './new-balanzas-ritmos.component.html',
  styleUrls: ['./new-balanzas-ritmos.component.css']
})
export class NewBalanzasRitmosComponent {
  turnosModuloDeCarga: TurnosCerrados;
  @ViewChild(RitmoEmbarqueBalanzaComponent) ritmoEmbarqueBalanzaComponent: RitmoEmbarqueBalanzaComponent;
  @ViewChild(SemaforoRitmoEmbarqueComponent) semaforoRitmoEmbarqueComponent: SemaforoRitmoEmbarqueComponent;
  
  turns = [
    { id: 1, nombre: '00-06', inicio: 0, fin: 6 },
    { id: 2, nombre: '06-12', inicio: 6, fin: 12 },
    { id: 3, nombre: '12-18', inicio: 12, fin: 18 },
    { id: 4, nombre: '18-24', inicio: 18, fin: 24 }
  ];

  fechas: FechaDto[] = [];
  turnos: TurnoDto[] = [];
  availableDates: string[] = [];

  habilitarFechasYTurnos: boolean = true;

  selectedDate: string;
  selectedTurn: number = 0;
  selectedTurnName: string = "";
  dateMin: string;
  dateMax: string;

  arranco7: string;
  ultimaBalanzada7: string;
  toneladasCargadas7: string;
  ritmoEmbarque7: string;
  ultimaActualizacion7: string;

  arranco8: string;
  ultimaBalanzada8: string;
  toneladasCargadas8: string;
  ritmoEmbarque8: string;
  ultimaActualizacion8: string;

  valorRitmoBruto: string ;
  valorCargando: string;
  tnTotales: string;
  valorRitmoNeto: string;

  constructor(
    private procesoService: DatosEmbarquesProcesoService,
    private balanzasRitmosService: BalanzasRitmosService) {
    this.balanzasRitmosService.TurnosCalidad.subscribe(turno =>{
      if (turno != null){
        this.turnosModuloDeCarga = turno;
        this.inicializarCarga();
      }
    });
  }

  ngOnInit() {
    this.inicializarCarga();
  }

  inicializarCarga = () => {
    this.inicializarValores();
    if (this.turnosModuloDeCarga.cargaFinalizada){
      if (this.turnosModuloDeCarga.todosTurnosCerrados){
        this.updateData(true);
      }else{
        this.toggleFechasYTurnos();
      }
    }else{
      this.toggleFechasYTurnos();
    }
  }

  inicializarValores = () => {
    this.valorRitmoBruto = '0';
    this.valorCargando = '0';
    this.tnTotales = '0';
    this.valorRitmoNeto = '0';

    this.arranco7 = '';
    this.ultimaBalanzada7 = '';
    this.toneladasCargadas7 = '0';
    this.ritmoEmbarque7 = '0';
    this.ultimaActualizacion7 = '';
  
    this.arranco8 = '';
    this.ultimaBalanzada8 = '';
    this.toneladasCargadas8 = '0';
    this.ritmoEmbarque8 = '0';
    this.ultimaActualizacion8 = '';
  }

  toggleFechasYTurnos = () => {
    if (this.habilitarFechasYTurnos) {
      this.loadFechasYTurnos(this.procesoService.getModuloDeCargaId());
    } else {
      this.selectedDate = null;
      this.fechas = [];
      this.dateMin = '';
      this.dateMax = '';
      this.turnos = [];
    }
  }

  loadFechasYTurnos = (idModuloDeCarga: number): void => {
    this.balanzasRitmosService.consultarCombosFechasYTurnos(idModuloDeCarga).subscribe(response => {
      this.fechas = response.fechas;
      this.dateMin = response.fechaMinima;
      this.dateMax = response.fechaMaxima;
      this.selectedDate = this.dateMin;
      this.availableDates = this.fechas.map(f => f.fecha);
      if (this.fechas.length > 0) {
        this.turnos = this.fechas[0].turnos;
        this.selectedTurn = this.turnos[0].turno.orden;
        this.updateTurn(null);
      }
    });
  }

  updateDate = (event: any) => {
    const mySelectedDate = new Date(event.target.value);
    const selectedFecha = this.fechas.find(f => new Date(f.fecha).toDateString() === mySelectedDate.toDateString());
    if (selectedFecha) {
      this.turnos = selectedFecha.turnos;
      this.selectedTurn = this.turnos[0].turno.orden;
      this.updateTurn(null)
    } else {
      this.turnos = [];
    }
  }

  updateTurn = (event: any) => {
    this.selectedTurn = event != null ? event.target.value : this.selectedTurn;
    this.selectedTurnName = this.obtenerNombreTurno(this.selectedTurn);
    this.inicializarValores();
    this.updateData();
  }

  updateData = (esCargaFinalizada = false) => {
    let selectedDate = '';
    let selectedTurn = null;
    let esCalculoGeneral: boolean = true;
    if (!esCargaFinalizada){
      if (this.selectedDate != '' && this.selectedTurn != 0) {
        selectedDate = this.selectedDate;
        selectedTurn = this.selectedTurn;
        esCalculoGeneral = false;
      }
    }
    this.balanzasRitmosService.consultaRitmosCargaSolidos(this.procesoService.getModuloDeCargaId(), selectedDate, selectedTurn, esCalculoGeneral).subscribe(data => {
      this.valorRitmoBruto     = data.ritmoCargaBruto != -1 ? data.ritmoCargaBruto.toString() : 'N.A';
      this.valorCargando       = data.lLevasCargando != -1 ? data.lLevasCargando.toString(): 'N.A';
      this.tnTotales           = data.lLevasCargando != -1 ? data.lLevasCargando.toString(): 'N.A';
      this.valorRitmoNeto      = data.ritmoCargaNeto != -1 ? data.ritmoCargaNeto.toString(): 'N.A';
      
      this.toneladasCargadas7  = data.ritmoBalanza7 != -1 ? data.cargaBalanza7.toString(): 'N.A';
      this.ritmoEmbarque7      = data.ritmoBalanza7 != -1 ? data.ritmoBalanza7.toString(): 'N.A';
      this.ultimaActualizacion7= data.ritmoBalanza7 != -1 ? data.ultimaActualizacionBalanza7: 'N.A';

      this.toneladasCargadas8  = data.cargaBalanza8 != -1 ? data.cargaBalanza8.toString(): 'N.A';
      this.ritmoEmbarque8      = data.ritmoBalanza8 != -1 ? data.ritmoBalanza8.toString(): 'N.A';
      this.ultimaActualizacion8 = data.ritmoBalanza7 != -1 ? data.ultimaActualizacionBalanza8: 'N.A';
      this.ultimaBalanzada7 = data.ritmoBalanza7 != -1 ? data.ultimaBalanzada7 : 'N.A';
      this.ultimaBalanzada8 = data.ritmoBalanza8 != -1 ? data.ultimaBalanzada8 : 'N.A';
    });
  }

  obtenerNombreTurno = (turnoId: number): string => {
    const turno = this.turns.find(t => t.id == turnoId);
    if (turno) {
      return turno.nombre;
    }
    return "";
  }
}
