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
import { BalanzasRitmosService } from '@ScatoServicios/calidad/balanzas-ritmos.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { TurnosCerrados } from '@ScatoModels/calidad/turnos-cerrados';

@Component({
  selector: 'app-fechas-ritmos',
  templateUrl: './fechas-ritmos.component.html',
  styleUrls: ['./fechas-ritmos.component.css']
})
export class FechasRitmosComponent implements OnInit {
  turnosModuloDeCarga: TurnosCerrados;
  @ViewChild(SemaforoRitmoEmbarqueComponent) semaforoRitmoEmbarqueComponent: SemaforoRitmoEmbarqueComponent;

  turns = [
    { id: 1, nombre: '00-06', inicio: 0, fin: 6 },
    { id: 2, nombre: '06-12', inicio: 6, fin: 12 },
    { id: 3, nombre: '12-18', inicio: 12, fin: 18 },
    { id: 4, nombre: '18-24', inicio: 18, fin: 24 }
  ];

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
  selectedTurnName: string = "";
  dateMin: string;
  dateMax: string;

  toneladasCargadas7: string;
  ritmoEmbarque7: string;
  ultimaActualizacion7: string;

  toneladasCargadas8: string;
  ritmoEmbarque8: string;
  ultimaActualizacion8: string;

  valorRitmoBruto: string ;
  valorCargando: string;
  tnTotales: string;
  valorRitmoNeto: string;
//#endregion
//#region constructor
  constructor(
    private balanzas78Service: Balanzas78Service,
    private route: ActivatedRoute,
    private buqueService: BuqueService,
    private buqueSharingService: BuqueSharingService,
    private embarqueSharingService: EmbarqueSharingService,
    private balanzasRitmosService: BalanzasRitmosService,
    private procesoService: DatosEmbarquesProcesoService,
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

    this.balanzasRitmosService.TurnosCalidad.subscribe(turno =>{
      if (turno != null){
        this.turnosModuloDeCarga = turno;
        this.inicializarCarga();
      }
    });

    this.vaporId = parseInt(this.route.snapshot.paramMap.get('vaporid'));      //consigo el vaporID que esta en la ruta y lo seteo
  }
  
  cargarParametros = () => {
    this.embarqueId = parseInt(this.route.snapshot.paramMap.get('embarqueid'));
    this.buqueSharingService.getActualizarResumenOperatoria().subscribe(res=>{
      const resumenOperatoriaEmbarque: ResumenOperatoriaEmbarque = res;
      if (resumenOperatoriaEmbarque !=null && resumenOperatoriaEmbarque.actualizarDatos) {
        this.embarqueId = resumenOperatoriaEmbarque.embarqueId;
      }
    });
  }

  ngOnInit(): void {
    this.initRegistroFechas();
    this.initRitmos();
    this.inicializarValores();
    this.inicializarCarga();
  }

  inicializarValores = () => { 
    this.valorRitmoBruto = '0';
    this.valorCargando = '0';
    this.tnTotales = '0';
    this.valorRitmoNeto = '0';

    this.toneladasCargadas7 = '0';
    this.ritmoEmbarque7 = '0';
    this.ultimaActualizacion7 = '';
  
    this.toneladasCargadas8 = '0';
    this.ritmoEmbarque8 = '0';
    this.ultimaActualizacion8 = '';
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

  initRegistroFechas() {
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

  loadFechasYTurnos = (idModuloDeCarga: number): void => {
    this.balanzasRitmosService.consultarCombosFechasYTurnos(idModuloDeCarga).subscribe(response => {
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
      this.ultimaActualizacion8= data.ritmoBalanza7 != -1 ? data.ultimaActualizacionBalanza8: 'N.A';
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
