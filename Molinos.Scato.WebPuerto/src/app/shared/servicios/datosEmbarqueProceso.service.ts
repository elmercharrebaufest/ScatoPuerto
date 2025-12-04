import { EventEmitter, Injectable, Output } from '@angular/core';
import { Embarque } from '@ScatoModels/embarque';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { ModuloDeCarga } from '@ScatoModels/modulo-carga';
import { EmbarqueService } from './embarque.service';
import { ModuloDeCargaService } from './modulo-de-carga.service';
import { PeriodoDeCarga } from '@ScatoModels/periodo-carga';
import { EstadoBuque } from '@ScatoModels/embarque';

@Injectable({
  providedIn: 'root',
})
export class DatosEmbarquesProcesoService {
  // DATOS DE EMBARQUES Y EMBARQUE SELECCIONADO PARA EL PROCESO DE OPERACIONES/TABLERISTAS/RECIBIDORES
  private embarques: EmbarqueNav[];
  private embarqueSelected: EmbarqueNav;
  private planoCargaId: number;
  private moduloDeCargaId: number;
  private embarqueId: number;
  private datosGrafico: Object;
  private moduloDeCarga: ModuloDeCarga;
  private estadoAltura: any;
  private vientoAmarre: string;
  private direccionViento: string;
  private fechaHoraInicioCarga: Date;
  private fechaHoraFinCarga: Date = null;
  private vaporId: number;
  private fechaComienzoCarga: Date;
  private periodoDeCarga: PeriodoDeCarga;
  private estadoBuque: EstadoBuque;
  @Output() sendEstadoAltura = new EventEmitter<number>();
  @Output() sendEmbarque = new EventEmitter<EmbarqueNav>();
  @Output() sendTotalPlanoDeEmbarque = new EventEmitter<number>();
  @Output() sendTotalCargadoBalanzas = new EventEmitter<number>();
  @Output() sendFechaHoraInicioCarga = new EventEmitter<Date>();
  @Output() sendSeActualizoEmbarque = new EventEmitter<any>();

  constructor(
    private _moduloCargaService: ModuloDeCargaService,
    private _embarqueService: EmbarqueService
  ) {}

  //GUARDA LOS DATOS DEL EMBARQUE SELECCIONADO
  /**
   *
   * @param {number} id id del embarque seleccionado
   * @returns {void}
   * @memberof DatosEmbarquesProcesoService
   */
  setEmbarque(id: number) {

    if (this.embarqueId != id) {
      this.embarqueId = id;
      this.embarqueSelected = this.embarques.find((e) => e.id === id);      

      this.sendEmbarque.emit(this.embarqueSelected);
      this.planoCargaId = this.embarqueSelected.planoDeCargaId;
      this.moduloDeCargaId = this.embarqueSelected.moduloDeCargaId;
      this._embarqueService
        .obtenerEmbarque(this.embarqueSelected.id)
        .subscribe((res: Embarque) => {
          this.fechaHoraInicioCarga = res.fechaHoraInicioCarga;
          this.estadoBuque = res.estadoBuque;
          this.vaporId = res.vapor.id;
          if (this.embarqueSelected.nombreBuque === '') {
            this.embarqueSelected.nombreBuque = res.vapor.nombre;
          }
        });
  
      this._moduloCargaService
        .obtenerModuloDeCarga(this.moduloDeCargaId)
        .subscribe((res) => {
          this.moduloDeCarga = res;
          this.periodoDeCarga = res.moduloDeCargaPeriodoDeCarga[0]
            ? res.moduloDeCargaPeriodoDeCarga[0]
            : null;
          this.vientoAmarre = res.moduloDeCargaPeriodoDeCarga[0]
            ? res.moduloDeCargaPeriodoDeCarga[0].vientoAmarro
            : '';
          this.direccionViento = res.moduloDeCargaPeriodoDeCarga[0]
            ? res.moduloDeCargaPeriodoDeCarga[0].direccionAmarro
            : '';
          this.fechaComienzoCarga = res.moduloDeCargaPeriodoDeCarga[0]
            ? res.moduloDeCargaPeriodoDeCarga[0].fechaComienzoCarga
            : null;
        });

      /*
            this.workflowService.obtenerListado().subscribe( (resp: any) => {
                let barquitos = resp.find(x => x.embarque.id === this.embarqueId);
                this.vaporId = barquitos['embarque'].vapor.id;
            });
            */
    }
  }

  //GUARDA LA LISTA DE EMBARQUE
  setEmbarquesList(embarques: EmbarqueNav[]) {
    this.embarques = embarques;
  }

  //GUARDA LOS DATOS DE GRAFICO
  setDatosGrafico(datos: object) {
    this.datosGrafico = datos;
  }

  //GUARDA LOS DATOS DE PLANO DE CARGA Y SETEA EL EMBARQUE SELECTED POR EL PLANO
  setPlanoDeCarga(id: number) {
    this.planoCargaId = id;
    if (this.embarques) {
      this.embarqueSelected = this.embarques.find(
        (e) => e.planoDeCargaId === this.planoCargaId
      );
      this.moduloDeCargaId = this.embarqueSelected.moduloDeCargaId;
      this.embarqueId = this.embarqueSelected.id;
    }
  }

  // OBJETO MODULO DE CARGANDO
  setModuloDeCarga(moduloDeCarga: ModuloDeCarga) {
    this.moduloDeCarga = moduloDeCarga;
  }
  //GUARDA LOS DATOS DE MODULO DE CARGA Y SETEA EL EMBARQUE SELECTED POR EL MODULO
  setModulodDeCarga(id: number) {
    this.moduloDeCargaId = id;

    this.embarqueSelected = this.embarques.find(
      (e) => e.moduloDeCargaId === this.moduloDeCargaId
    );

    this.planoCargaId = this.embarqueSelected.planoDeCargaId;
    this.embarqueId = this.embarqueSelected.id;
  }

  //GUARDA LOS DATOS DE ALTURA
  setEstadoAltura(altura: number) {
    this.sendEstadoAltura.emit(altura);
    this.estadoAltura = altura;
  }

  //OBTIENE EL ID DEL VAPOR
  getVaporId() {
    return this.vaporId;
  }

  //OBTIENE LA LISTA DE EMBARQUES
  getEmbarquesList() {
    return this.embarques;
  }

  //OBTIENE EL EMBARQUE SELECCIONADO
  getEmbarqueSelected = (): EmbarqueNav => {
    return this.embarqueSelected;
  };

  //OBTIENE EL ID PLANO DE CARGA
  getPlanoDeCargaId() {
    return this.planoCargaId;
  }

  //OBTIENE EL ID MODULO DE CARGA
  getModuloDeCargaId() {
    return this.moduloDeCargaId;
  }
  //OBTIENE VELOCIDAD DEL VIENTO
  getVientoAmarre() {
    return this.vientoAmarre;
  }
  //OBTIENE DIRECCION DEL VIENTO
  getDireccionViento() {
    return this.direccionViento;
  }
  //OBTIENE EL ID DEL EMBARQUE
  getEmbarqueId() {
    return this.embarqueId;
  }

  //OBTIENE DATOS DE GRAFICO
  getDatosGrafico() {
    return this.datosGrafico;
  }

  //OBTIENE MODULO DE CARGA
  getModuloDeCarga() {
    return this.moduloDeCarga;
  }

  //OBTIENE ESTADO DE ALTURA
  getEstadoAltura() {
    return this.estadoAltura;
  }

  getFechaHoraInicioCarga() {
    return this.fechaHoraInicioCarga;
  }

  setFechaHoraInicioCarga(fechaHoraInicioCarga) {
    this.fechaHoraInicioCarga = fechaHoraInicioCarga;
  }

  getFechaHoraFinCarga() {
    return this.fechaHoraFinCarga;
  }

  setFechaHoraFinCarga(fechaHoraFinCarga) {
    this.fechaHoraFinCarga = fechaHoraFinCarga;
  }

  getFechaComienzoCarga() {
    return this.fechaComienzoCarga;
  }

  setFechaComienzoCarga(fechaComienzoCarga) {
    this.fechaComienzoCarga = fechaComienzoCarga;
  }

  getEstadoBuque() {
    return this.estadoBuque;
  }

  getPeriodoDeCarga() {
    return this.periodoDeCarga;
  }

  emitSeActualizoEmbarque() {
    this.sendSeActualizoEmbarque.emit();
  }

  disposeData() {
    this.embarques = undefined;
    this.embarqueSelected = undefined;
    this.planoCargaId = undefined;
    this.moduloDeCargaId = undefined;
    this.embarqueId = undefined;
    this.datosGrafico = undefined;
  }
}
