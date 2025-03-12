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
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';

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
  moduloDeCarga = null;
  moduloDeCargaId: number = 0;
  embarqueId: number;
  vaporId: number = 0;
  registroFechas: RegistroFechas;
  mostrarFechas : boolean = false;
  horasPuerto: number;
  tieneLimpieza: boolean;
  enBuque: boolean = false;
  liquido: boolean;
  ingresoManualSolido: boolean;
  tieneMotivoLimpieza: boolean;
  tieneObsLimpieza: boolean;

  fechas: FechaDto[] = [];
  turnos: TurnoDto[] = [];
  availableDates: string[] = [];

  selectedDate: string;
  selectedTurn: number = 0;
  selectedTurnName: string = "";
  dateMin: string;
  dateMax: string;

  valorRitmoBruto: string ;
  valorCargando: string;
  tnTotales: string;
  valorRitmoNeto: string;

  valorRitmoBrutoGeneral: string ;
  valorCargandoGeneral: string;
  tnTotalesGeneral: string;
  valorRitmoNetoGeneral: string;


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


//#endregion
//#region constructor
  constructor(
    private balanzas78Service: Balanzas78Service,
    private route: ActivatedRoute,
    private buqueService: BuqueService,
    private buqueSharingService: BuqueSharingService,
    private embarqueSharingService: EmbarqueSharingService,
    private balanzasRitmosService: BalanzasRitmosService,
    private moduloCargaService: ModuloDeCargaService
  ) {
    console.log('entrooooo fechas ritmos');
    this.enBuque = true;
    this.cargarParametros();  
    
    this.embarqueSharingService.getParametrosIdsEmbarque().subscribe(data =>{
      if (data!=null && data!= undefined){
        this.moduloDeCargaId = data.moduloDeCarga_Id;
        this.embarqueId = data.embarque_Id;
        this.liquido = data.esLiquido;
        if(!this.liquido && !this.ingresoManualSolido){
          this.balanzas78Service.setEmbarqueBalanzaCalidad(this.moduloDeCargaId);
        }
        this.embarqueSharingService.setEmbarqueId(this.embarqueId); 

        this.moduloCargaService.obtenerModuloDeCarga(this.moduloDeCargaId).subscribe(res=>{
          this.moduloDeCarga = res;
          this.ingresoManualSolido = res.ingresoManualSolido;
          let turnosCerrados: boolean = false;
          let cargaFinalizada: boolean = false;
          let todosTurnosCerrados: boolean = false;
          if (res.moduloDeCargaPlanillaDeTurnos.length > 0){
            let turnos = res.moduloDeCargaPlanillaDeTurnos.filter(x=> x.cerrado == true);
            if (turnos != null && turnos.length > 0)
              turnosCerrados = true;
          }
          cargaFinalizada = res.moduloDeCargaPeriodoDeCarga[0].fechaFinalizacionCarga!=null? true : false;
          let turnosAbiertos = res.moduloDeCargaPlanillaDeTurnos.filter(x=> x.cerrado == false);
          if (turnosAbiertos == null || turnosAbiertos.length == 0)
            todosTurnosCerrados = true;
          this.turnosModuloDeCarga = {
            cargaFinalizada : cargaFinalizada,
            todosTurnosCerrados: todosTurnosCerrados,
            turnosCerrados: turnosCerrados
          };
          this.inicializarCarga();
        });
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
    this.inicializarCarga();
  }

  inicializarValores = () => { 
    this.valorRitmoBruto = '0';
    this.valorCargando = '0';
    this.tnTotales = '0';
    this.valorRitmoNeto = '0';

    this.valorRitmoBrutoGeneral = '0';
    this.valorCargandoGeneral = '0';
    this.tnTotalesGeneral = '0';
    this.valorRitmoNetoGeneral = '0';		
  }

  inicializarCarga = () => {
    this.inicializarValores();
    if (this.turnosModuloDeCarga != null && this.turnosModuloDeCarga.cargaFinalizada){
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
    this.loadFechasYTurnos(this.moduloDeCargaId);
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
        this.selectedTurn = this.turnos[0].turno.orden;
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
    this.obtenerDatosGenerales();

    if (this.selectedDate && this.selectedTurn) {
      this.obtenerDatosPorTurno(this.selectedDate, this.selectedTurn);
    }
  }

  private obtenerDatosGenerales() {
    this.balanzasRitmosService.consultaRitmosCargaSolidos(
      this.moduloDeCargaId, 
      '', 
      null, 
      true
    ).subscribe({
      next: (data) => {
        this.actualizarValoresGenerales(data);
        this.actualizarDatosBalanzas(data);
      },
      error: (err) => {
        console.error('Error al obtener datos generales:', err);
        this.resetearValores();
      }
    });
  }

  private obtenerDatosPorTurno(selectedDate: string, selectedTurn: number) {
    this.balanzasRitmosService.consultaRitmosCargaSolidos(
      this.moduloDeCargaId, 
      selectedDate, 
      selectedTurn, 
      false
    ).subscribe({
      next: (data) => {
        this.actualizarValoresPorTurno(data);
        this.actualizarDatosBalanzas(data);
      },
      error: (err) => {
        console.error('Error al obtener datos por turno:', err);
      }
    });
  }

  private actualizarValoresGenerales(data: any) {
    this.valorRitmoBrutoGeneral = this.formatearValor(data.ritmoCargaBruto);
    this.valorCargandoGeneral = this.formatearValor(data.lLevasCargando);
    this.tnTotalesGeneral = this.formatearValor(data.lLevasCargando);
    this.valorRitmoNetoGeneral = this.formatearValor(data.ritmoCargaNeto);
  }

  private actualizarValoresPorTurno(data: any) {
    this.valorRitmoBruto = this.formatearValor(data.ritmoCargaBruto);
    this.valorCargando = this.formatearValor(data.lLevasCargando);
    this.tnTotales = this.formatearValor(data.lLevasCargando);
    this.valorRitmoNeto = this.formatearValor(data.ritmoCargaNeto);
  }

  private actualizarDatosBalanzas(data: any) {
    // Balanza 7
    this.toneladasCargadas7 = this.formatearValor(data.cargaBalanza7);
    this.ritmoEmbarque7 = this.formatearValor(data.ritmoBalanza7);
    this.ultimaActualizacion7 = data.ritmoBalanza7 !== -1 ? data.ultimaActualizacionBalanza7 : 'N.A';
    this.ultimaBalanzada7 = data.ritmoBalanza7 !== -1 ? data.ultimaBalanzada7 : 'N.A';

    // Balanza 8
    this.toneladasCargadas8 = this.formatearValor(data.cargaBalanza8);
    this.ritmoEmbarque8 = this.formatearValor(data.ritmoBalanza8);
    this.ultimaActualizacion8 = data.ritmoBalanza8 !== -1 ? data.ultimaActualizacionBalanza8 : 'N.A';
    this.ultimaBalanzada8 = data.ritmoBalanza8 !== -1 ? data.ultimaBalanzada8 : 'N.A';
  }

  private formatearValor(valor: number): string {
    return valor !== -1 ? valor.toString() : 'N.A';
  }


  private resetearValores() {
    this.valorRitmoBruto = 'N.A';
    this.valorCargando = 'N.A';
    this.tnTotales = 'N.A';
    this.valorRitmoNeto = 'N.A';
    this.valorRitmoBrutoGeneral = 'N.A';
    this.valorCargandoGeneral = 'N.A';
    this.tnTotalesGeneral = 'N.A';
    this.valorRitmoNetoGeneral = 'N.A';
    this.toneladasCargadas7 = 'N.A';
    this.ritmoEmbarque7 = 'N.A';
    this.ultimaActualizacion7 = 'N.A';
    this.toneladasCargadas8 = 'N.A';
    this.ritmoEmbarque8 = 'N.A';
    this.ultimaActualizacion8 = 'N.A';
    this.ultimaBalanzada7 = 'N.A';
    this.ultimaBalanzada8 = 'N.A';
  }

  obtenerNombreTurno = (turnoId: number): string => {
    const turno = this.turns.find(t => t.id == turnoId);
    if (turno) {
      return turno.nombre;
    }
    return "";
  }
}
