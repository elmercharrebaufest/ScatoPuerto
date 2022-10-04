import { Component, Input, OnInit } from '@angular/core';
import { Ritmos, RitmosLiquido } from '@ScatoModels/balanzadas/ritmos';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { IdsDelEmbarque } from '@ScatoModels/idsDelEmbarque';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { Parametros } from '@ScatoModels/parametros';
import { BalanzaService } from '@ScatoServicios/balanza.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueSharingService } from '@ScatoServicios/embarque.shared.service';
import { ParametrosService } from '@ScatoServicios/parametros.service';
import { TurnosService } from '@ScatoServicios/turnos.service';

@Component({
  selector: 'app-graficos-ritmos',
  templateUrl: './graficos-ritmos.component.html',
  styleUrls: ['./graficos-ritmos.component.css']
})
export class GraficosRitmosComponent implements OnInit {
  @Input() liquido: boolean = false;
  @Input() enBuque: boolean = false;

  valorRitmo: number = 0;
  valorCargando: number = 0;
  valorNeto: number = 0;
  tnTotales: number = 0;
  turno: any;
  colorRitmo = '';
  colorValorNeto = '';
  cantTurnos: number = 0;
  balanzadasCompletas: any;

  vaporId: number = 0;
  moduloDeCargaId: number = 0;
  embarque: EmbarqueNav;
  embarqueId: number;
  barquitos: InstanciaWorkflowPuerto[] = [];
  idsDelEmbarque: IdsDelEmbarque;
  tiempoActualizacionRelojes: number;

  constructor(
    private _turnosService: TurnosService,
    private _procesoService: DatosEmbarquesProcesoService,
    private balanzaService: BalanzaService,
    private embarqueSharingService: EmbarqueSharingService,
    private _parametros: ParametrosService) 
  {
    
  }

  ngOnInit(): void {
    this._parametros.obtenerParametro("tiempoActualizacionRelojes").subscribe((res: Parametros) => {
      this.tiempoActualizacionRelojes = res.parametro2 != null && res.parametro2 > 0? res.parametro2 : 0;
      this.cargarTurnosBalanzas();
    })    
  }
  
  cargarTurnosBalanzas() {
    if (this._procesoService.getModuloDeCargaId() !=undefined || this._procesoService.getModuloDeCargaId() !=null)
      this.moduloDeCargaId = this._procesoService.getModuloDeCargaId(); 
    
    this.moduloDeCargaId = (this.moduloDeCargaId == null || this.moduloDeCargaId == undefined) ? 0 : this.moduloDeCargaId;
    this.liquido = false;
    if (this.liquido)
      this.subscribeTurnos();
    else
      this.subscribeBalanzas();
  }

  subscribeTurnos() { 

    if(this.moduloDeCargaId > 0){
      this.setRitmosRelojesLiquidos();    
      setInterval(() => {
        this.setRitmosRelojesLiquidos();    
      }, this.tiempoActualizacionRelojes > 0 ? this.tiempoActualizacionRelojes: 15000)      
    }
    
    this._turnosService.sendTnTotal.subscribe(res => {
      this.tnTotales = res;
    });
  }

  subscribeBalanzas() {    
    if(this.moduloDeCargaId > 0)
    {   
      this.setRitmosRelojesSolidos();    
      setInterval(() => {
        this.setRitmosRelojesSolidos();    
      }, this.tiempoActualizacionRelojes > 0 ? this.tiempoActualizacionRelojes: 15000)      
    }

    this._procesoService.sendTotalPlanoDeEmbarque.subscribe(res => {
      this.tnTotales = res;
    });
  }

  setRitmosRelojesSolidos(){
    this.balanzaService.obtenerRitmos(this.moduloDeCargaId).subscribe((res: Ritmos) => {
      this.valorCargando = res?.totalCargado ? res.totalCargado : 0;
      this.valorNeto = res?.ritmoCargaNeto ? res.ritmoCargaNeto : 0;
      this.valorRitmo = res?.ritmoDeCarga ? res.ritmoDeCarga : 0;
      this.colorRitmo = this.valorRitmo > 1000 ? '#1F8649' : '#F0AD4E';
      this.colorValorNeto = this.valorNeto > 1000 ? '#1F8649' : '#F0AD4E';
    });
        
  }

  setRitmosRelojesLiquidos(){
    this.balanzaService.obtenerRitmosLiquidos(this.moduloDeCargaId).subscribe((res: RitmosLiquido) => {
      this.valorCargando = res?.llevasCargado ? res.llevasCargado : 0;
      this.valorNeto = res?.ritmoAcumuladoNeto ? res.ritmoAcumuladoNeto : 0;
      this.valorRitmo = res?.ritmoAcumulado ? res.ritmoAcumulado : 0;
      this.colorRitmo = this.valorRitmo > 1000 ? '#5CB85C' : '#F0AD4E';
      this.colorValorNeto = this.valorNeto > 1000 ? '#5CB85C' : '#F0AD4E';
    });
    
  }

}