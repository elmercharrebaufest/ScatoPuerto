import { EventEmitter, Injectable, Output } from '@angular/core';
import { BalanzaService } from '@ScatoServicios/balanza.service';
import { Balanzas, InformacionAdicional } from '@ScatoModels/balanzadas/balanza';
import { EmbarqueService } from './embarque.service';
import { RitmosBalanzas78 } from '@ScatoModels/balanzadas/ritmos-balanzas78';
import { ParametrosService } from '@ScatoServicios/parametros.service';

//SETEA VAPOR SELECCIONADO PARA EMITIR LAS BALANZADAS
  /**
   * @description setBalanza7 y setBalanza8 emiten los valores actuales del Form.
   * setBalanzada7 y setBalanzada7 emiten las balanzadas del endpoint.
   */
@Injectable({
  providedIn: 'root'
})
export class Balanzas78Service {
  
  private balanzadasArray: Balanzas[];
  filtroBalanza7: Balanzas[] = [];
  filtroBalanza8: Balanzas[] = [];
  private interval: any;
  private intervalRitmosBalanzas78: NodeJS.Timeout;

  @Output() sendDataBalanza7 = new EventEmitter<any>();
  @Output() sendDataBalanza8 = new EventEmitter<any>();
  
  @Output() sendDataBalanzada7y8 = new EventEmitter<Balanzas[]>();
  @Output() sendDataBalanzada7 = new EventEmitter<Balanzas[]>();
  @Output() sendDataBalanzada8 = new EventEmitter<Balanzas[]>();
  @Output() sendDataBalanzada7y8Completas = new EventEmitter<Balanzas[]>();
  @Output() sendDataBalanzada7Kilos = new EventEmitter<number>();
  @Output() sendDataBalanzada8Kilos = new EventEmitter<number>();
  
  @Output() sendDataBalanzadaAgrupada7 = new EventEmitter<Balanzas[]>();
  @Output() sendDataBalanzadaAgrupada8 = new EventEmitter<Balanzas[]>();

  @Output() informacionAdicional = new EventEmitter<InformacionAdicional>();
  @Output() sendRitmosBalanzas78 = new EventEmitter<RitmosBalanzas78>();

  materialesPuerto = [];
  tiempoActualizacionBalanzas: number = 0;
  tiempoActualizacionRitmosBlzas78: number = 0;

  constructor(private _balanzaService: BalanzaService, 
              private embarqueService: EmbarqueService,
              private parametrosService: ParametrosService){

    this.embarqueService.obtenerListadoMateriales().subscribe( mat => this.materialesPuerto = mat );
    this.tiempoActualizacionBalanzas = this.parametrosService.getParametroTiempoActualizacionBalanzas();
    this.tiempoActualizacionRitmosBlzas78 = this.parametrosService.getParametroTiempoActualizacionRitmosBlzas78();
  }

  //SETEA VAPOR SELECCIONADO PARA EMITIR LAS BALANZADAS
  /**
   * 
   * @param {number} id id del Modulo De Carga del embarque seleccionado
   * @returns {void}
   * @memberof Balanzas78Service
   * @description Setea el Vapor para emitir las balanzadas
   */
  setEmbarqueBalanza(idModuloDeCarga: number = 0) {
    if (idModuloDeCarga<=0 || !idModuloDeCarga) return;
    
    console.log('ID en setEmbarqueBalanza desde SERV', idModuloDeCarga);
    
    // this._balanzaService.listarBalanzadaBuque(vaporId).subscribe( res => {
    //   this.balanzadasArray = res;
    // })

    this.interval = setInterval(() => {
      this._balanzaService.sincronizarBalanzasCortes(idModuloDeCarga)
        .subscribe(resp => {
          // console.log('++++++++++++++++++++++++++++++++++');
          // console.log('sincronizarBalanzasCortes desde SERV', resp);
          // console.log('++++++++++++++++++++++++++++++++++');
          
          this.balanzadasArray = resp.balanzas;
          this.filtroBalanza7 = this.balanzadasArray.filter(x => x.numeroBalanza === '7');
          this.filtroBalanza8 = this.balanzadasArray.filter(x => x.numeroBalanza === '8');

          this.setBalanzada7y8(this.balanzadasArray);
          this.setBalanzada7(this.filtroBalanza7);
          this.setBalanzada8(this.filtroBalanza8);
          this.setBalanzada7y8Completas(resp.balanzas);
          this.setBalanzada7Kilos(resp.balanzas);
          this.setBalanzada8Kilos(resp.balanzas);
          this.setInfoAdicional(resp.informacionAdicional);
        })
    }, this.tiempoActualizacionBalanzas);

    this.intervalRitmosBalanzas78 = setInterval(() => {
      this._balanzaService.sincronizarRitmosBalanzas(idModuloDeCarga)
        .subscribe(resp => this.setSincRitmosBalanzas78(resp) )
    }, this.tiempoActualizacionRitmosBlzas78);

  }

  limpiarInterval(){
    clearInterval(this.interval);
    clearInterval(this.intervalRitmosBalanzas78);
  }

  // TODO: Gonzalo - Nuevos emitter para consumir balanzadas en los componentes
  setBalanzada7y8(balanzadas: Balanzas[]){
    this.sendDataBalanzada7y8.emit(balanzadas);
  }
  setBalanzada7(balanzada7: Balanzas[]){
    this.sendDataBalanzada7.emit(balanzada7);
  }
  setBalanzada8(balanzada8: Balanzas[]){
    this.sendDataBalanzada8.emit(balanzada8);
  }
  setBalanzada7y8Completas(balanzadasCompletas: Balanzas[]){
    this.sendDataBalanzada7y8Completas.emit(balanzadasCompletas);
  }

  // TODO: Evangelino - Se devuelven la lista de balanzas para utilizar el componente en calidad
  getBalanzada7(): Balanzas[]{
      return this.filtroBalanza7;
  }
  getBalanzada8(): Balanzas[]{
    return this.filtroBalanza8;
  }
  // Usados en "balanzas-ritmos"
  setBalanzada7Kilos(balanzadasCompletas: Balanzas[]){
    let kilos = 0;
    let balanzadasBajaCarga7 = balanzadasCompletas.filter( x => x.numeroBalanza == '7');
    balanzadasBajaCarga7.forEach( x => kilos += x.kg);
    this.sendDataBalanzada7Kilos.emit(kilos);
  }
  setBalanzada8Kilos(balanzadasCompletas: Balanzas[]){
    let kilos = 0;
    let balanzadasBajaCarga8 = balanzadasCompletas.filter( x => x.numeroBalanza == '8');
    balanzadasBajaCarga8.forEach( x => kilos += x.kg);
    this.sendDataBalanzada8Kilos.emit(kilos);
  }


  // Usados en "balanzas" y "calidad"
  setBalanzadaAgrupada7(balanzadaAgrupada7: Balanzas[]){
    this.sendDataBalanzadaAgrupada7.emit(balanzadaAgrupada7);
  }
  setBalanzadaAgrupada8(balanzadaAgrupada8: Balanzas[]){
    this.sendDataBalanzadaAgrupada8.emit(balanzadaAgrupada8);
  }

  setInfoAdicional(informacionAdicional: InformacionAdicional){
    this.informacionAdicional.emit(informacionAdicional);
  }

  setSincRitmosBalanzas78(ritmosBalanzas78: RitmosBalanzas78){
    this.sendRitmosBalanzas78.emit(ritmosBalanzas78);
  }

}
