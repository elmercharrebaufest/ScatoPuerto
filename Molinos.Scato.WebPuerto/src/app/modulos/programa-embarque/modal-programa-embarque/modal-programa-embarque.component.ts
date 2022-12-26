import { Component, OnInit } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ProgramaEmbarqueService } from '@ScatoServicios/programa-embarque.service';

@Component({
  selector: 'app-modal-programa-embarque',
  templateUrl: './modal-programa-embarque.component.html',
  styleUrls: ['./modal-programa-embarque.component.css']
})
export class ModalProgramaEmbarqueComponent implements OnInit {
  estaCargando: boolean;
  //#region Variables
  public nominacion: any;
  subscripcionProgramaModal: Subscription
  productoDescripcionCorta: any;
  productoDescripcionLarga: any;
  cantidadTotal: any;
  calidad: any;
  tolerancia: string;
  observacionesDatotecnico: any;
  etaRecalada: any;
  obligacion: any;
  cantidadPorDestino: any;
  cantidadPorCargador: any;
  nombreBuque: any;
  bandera: any;
  imo: any;
  muelle: any;
  ata: any;
  cantidadPorCliente: any;
  agenciaMaritima: any;
  surveyor: any;
  observacionSurveyor: any;
  loadingRateValor: any;
  loadingRate: any;
  desYDem: string;
  tipoDeContrato: any;
  tipoDeBuque: any;
  //#endregion

  // #region Observables
  constructor(private programaEmbarqueService: ProgramaEmbarqueService) {

  }

  ngOnInit(): void {
    this.subscripcionProgramaModal = this.programaEmbarqueService.observableProgramaModal.subscribe(
      (data: any) => {
        this.nominacion = data;
        this.setearCampos();
      }
    )

  }

  setearCampos() {
    if (this.nominacion != undefined) {
      this.productoDescripcionCorta = this.nominacion.nominacionDatoTecnico.materialPuerto != null ? 
      this.nominacion.nominacionDatoTecnico.materialPuerto.descripcionCorta : "";
      this.productoDescripcionLarga = this.nominacion.nominacionDatoTecnico.materialPuerto != null ? 
      this.nominacion.nominacionDatoTecnico.materialPuerto.descripcion : "";
      this.cantidadTotal = this.nominacion.nominacionDatoTecnico.cantidadTotal;
      this.calidad = this.nominacion.nominacionDatoTecnico.nominacionDatoTecnicoCalidad != null?
      this.nominacion.nominacionDatoTecnico.nominacionDatoTecnicoCalidad
      .calidadValor.tipoDeCalidad.Descripcion : "";
      this.tolerancia = "+/-" + this.nominacion.nominacionDatoTecnico.tolerancia;
      this.observacionesDatotecnico = this.nominacion.nominacionDatoTecnico.observaciones;
      this.etaRecalada = this.nominacion.nominacionDatoTecnico.etaRecalada;
      this.obligacion = this.nominacion.nominacionDatoTecnico.obligacionDeCarga;
      this.cantidadPorDestino = this.nominacion.nominacionDatoTecnico.nominacionDatoTecnicoDestino;
      this.cantidadPorCargador = this.nominacion.nominacionDatoTecnico.nominacionDatoTecnicoExportador;
      this.cantidadPorCliente = this.nominacion.nominacionDatoTecnico.nominacionDatoTecnicoCoordinadorPuerto;
      this.nombreBuque = this.nominacion.nominacionDatoTecnico.nombreBuque;
      this.bandera = this.nominacion.nominacionDatoTecnico.bandera;
      this.imo = this.nominacion.nominacionDatoTecnico.imo;
      this.tipoDeBuque = this.nominacion.nominacionDatoTecnico.tipoBuque;
      this.muelle = this.nominacion.nominacionDatoTecnico.muelleDeCarga != null ?
      this.nominacion.nominacionDatoTecnico.muelleDeCarga.descripcion : "";
      this.ata =  this.nominacion.nominacionDatoTecnico.ataPuerto.nombre;
      this.agenciaMaritima = this.nominacion.nominacionDatoTecnico.agenciaMaritimaPuerto != null ?
      this.nominacion.nominacionDatoTecnico.agenciaMaritimaPuerto.nombre : "";
      this.surveyor = this.nominacion.nominacionDatoTecnico.surveyor != null ?
      this.nominacion.nominacionDatoTecnico.surveyor.descripcion : "";
      this.observacionSurveyor = this.nominacion.nominacionDatoTecnico.observacionSurveyor;
      this.loadingRateValor = this.nominacion.nominacionDatoTecnico.tasaDeCargaValor;
      this.loadingRate = this.nominacion.nominacionDatoTecnico.tasaDeCarga != null ?
      this.nominacion.nominacionDatoTecnico.tasaDeCarga.descripcion : "";
      this.desYDem = "u$ " + this.nominacion.nominacionDatoTecnico.dem + "/" + this.nominacion.nominacionDatoTecnico.des;
      this.tipoDeContrato = this.nominacion.nominacionDatoTecnico.tipoDeContrato != null ?
      this.nominacion.nominacionDatoTecnico.tipoDeContrato.Descripcion : "";





    }
  }
}
