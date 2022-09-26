import { Component, Input, OnInit } from '@angular/core';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { IdsDelEmbarque } from '@ScatoModels/idsDelEmbarque';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { BalanzaService } from '@ScatoServicios/balanza.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueSharingService } from '@ScatoServicios/embarque.shared.service';
import { TurnosService } from '@ScatoServicios/turnos.service';



@Component({
  selector: 'app-graficos-ritmos',
  templateUrl: './graficos-ritmos.component.html',
  styleUrls: ['./graficos-ritmos.component.css']
})
export class GraficosRitmosComponent implements OnInit {
  @Input() liquido: boolean;
  @Input() enBuque: boolean = false;
  
  valorRitmo: number = 0;
  valorCargando: number = 0;
  valorNeto: number = 0;
  tnTotales: number = 0;
  horaActualizacion: string = '18:00hs';
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

  constructor(
    private _turnosService: TurnosService,
    private _procesoService: DatosEmbarquesProcesoService,
    private balanzaService: BalanzaService,
    private embarqueSharingService: EmbarqueSharingService,
  ) 
  {
    if(this.enBuque = false){
    this.moduloDeCargaId = this._procesoService.getModuloDeCargaId();
    }else{
      this.moduloDeCargaId = this.embarqueSharingService.getModuloDeCargaId();
    }
  }

  ngOnInit(): void {
    this.cargarTurnosBalanzas();
  }
  //#e7af5ffa

  private cargarTurnosBalanzas() {
    if (this.liquido)
      this.subscribeTurnos();
    else
      this.subscribeBalanzas();
  }
  subscribeTurnos() {
    this.balanzaService.obtenerRitmosLiquidos(this.vaporId, this.moduloDeCargaId).subscribe(res => {
      // console.log('==> GRAFICOS-RITMOS - Líquido: ', res);
      this.valorCargando = res?.llevasCargado ? res.llevasCargado : 0;
      this.valorNeto = res?.ritmoAcumuladoNeto ? res.ritmoAcumuladoNeto : 0;
      this.valorRitmo = res?.ritmoAcumulado ? res.ritmoAcumulado : 0;
      this.colorRitmo = this.valorRitmo > 1000 ? '#1F8649' : '#F0AD4E';
      this.colorValorNeto = this.valorNeto > 1000 ? '#1F8649' : '#F0AD4E';
    });

    this._turnosService.sendTnTotal.subscribe(res => {
      this.tnTotales = res;
    });

    let fecha = new Date();
    this.horaActualizacion = `${fecha.getHours()}:${fecha.getMinutes()}hs`;
  }

  subscribeBalanzas() {

    this.moduloDeCargaId = (this.moduloDeCargaId == null || this.moduloDeCargaId == undefined) ? 0 : this.moduloDeCargaId;
if(this.moduloDeCargaId>0)
{
    this.balanzaService.obtenerRitmos(this.moduloDeCargaId).subscribe(res => {
      // console.log('obtenerRitmos: ', res);
      this.valorCargando = res?.totalCargado ? res.totalCargado : 0;
      this.valorNeto = res?.ritmoCargaNeto ? res.ritmoCargaNeto : 0;
      this.valorRitmo = res?.ritmoDeCarga ? res.ritmoDeCarga : 0;
      this.colorRitmo = this.valorRitmo > 1000 ? '#1F8649' : '#F0AD4E';
      this.colorValorNeto = this.valorNeto > 1000 ? '#1F8649' : '#F0AD4E';
    });

    this._procesoService.sendTotalPlanoDeEmbarque.subscribe(res => {
      this.tnTotales = res;
    });
  }
}
}