import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NominacionDatoTecnicoExportador } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-exportador';
import { NominacionDatoTecnicoDestino } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-destino';
import { NominacionDatoTecnicoCoordinador } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-coordinador';
import { NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';

import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';
import { NominacionDatoTecnicoService } from './nominacion-dato-tecnico.services';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { ProductoState } from 'app/store/productos/material.state';
import { Select, Store } from '@ngxs/store';
import { combineLatest, forkJoin, Observable } from 'rxjs';
import { DestinoState } from 'app/store/programa-embarque/destino/destino.state';
import { ExportadorState } from 'app/store/programa-embarque/exportador/exportador.state';
import { CoordinadorPuertoState } from 'app/store/programa-embarque/coordinador-puerto/coordinador-puerto.state';
import { VaporState } from 'app/store/programa-embarque/vapor/vapor.state';
import { ATAPuertoState } from 'app/store/programa-embarque/ata-puerto/ata-puerto.state';
import { AgenciaMaritimaPuertoState } from 'app/store/programa-embarque/agencia-maritima-puerto/agencia-maritima-puerto.state';
import { Destino } from '@ScatoModels/destino';
import { AgenciaMaritimaPuerto } from '@ScatoModels/agencia-maritima-puerto';
import { ATAPuerto } from '@ScatoModels/ata-puerto';
import { Vapor } from '@ScatoModels/embarque';
import { CoordinadorPuerto } from '@ScatoModels/coordinador-puerto';
import { Exportador } from '@ScatoModels/exportador';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { GetObtenerProductos } from 'app/store/productos/material.actions';
import { GetObtenerExportador } from 'app/store/programa-embarque/exportador/exportador.actions';
import { GetObtenerDestino } from 'app/store/programa-embarque/destino/destino.actions';
import { GetObtenerCoordinadorPuerto } from 'app/store/programa-embarque/coordinador-puerto/coordinador-puerto.actions';
import { GetObtenerVapor } from 'app/store/programa-embarque/vapor/vapor.actions';
import { GetObtenerATAPuerto } from 'app/store/programa-embarque/ata-puerto/ata-puerto.actions';
import { GetObtenerAgenciaMaritimaPuerto } from 'app/store/programa-embarque/agencia-maritima-puerto/agencia-maritima-puerto.actions';
import { GetObtenerBandera } from 'app/store/programa-embarque/bandera/bandera.actions';
import { BanderaState } from 'app/store/programa-embarque/bandera/bandera.state';
import { Bandera } from '@ScatoModels/bandera';

@Component({
  selector: 'app-nominacion-dato-tecnico',
  templateUrl: './nominacion-dato-tecnico.component.html',
  styleUrls: ['./nominacion-dato-tecnico.component.css']
})
export class NominacionDatoTecnicoComponent implements OnInit, AfterViewInit {

  public datoTecnicoForm: FormGroup;
  public datoTecnicoExportador: NominacionDatoTecnicoExportador[];
  public datoTecnicoDestino: NominacionDatoTecnicoDestino[];
  public datoTecnicoCoordinador: NominacionDatoTecnicoCoordinador[];
  private _nominacionParametros: NominacionParametros = null;

  public listaMaterialPuerto: MaterialPuerto[];
  public listaDestino: Destino[];
  public listaExportador: Exportador[];
  public listaCoordinadorPuerto: CoordinadorPuerto[];
  public listaVapor: Vapor[];
  public listaATAPuerto: ATAPuerto[];
  public listaAgenciaMaritimaPuerto: AgenciaMaritimaPuerto[];
  public listaBanderas: Bandera[];
  @ViewChild('instance', { static: true }) instance: NgbTypeahead;


  @Select(ProductoState.getListaProductos) productos$: Observable<MaterialPuerto[]>;
  @Select(BanderaState.getListaBandera) banderas$: Observable<Bandera[]>;
  @Select(VaporState.getListaVapores) vapores$: Observable<Vapor[]>;
  @Select(DestinoState.GetListaDestino) destino$: Observable<Destino[]>;
  @Select(ExportadorState.GetListaExportadores) exportador$: Observable<Exportador[]>;
  @Select(CoordinadorPuertoState.GetListaCoordinadorPuerto) coordinadorPuerto$: Observable<CoordinadorPuerto[]>;
  @Select(ATAPuertoState.GetListaATAPuerto) ataPuerto$: Observable<ATAPuerto[]>;
  @Select(AgenciaMaritimaPuertoState.GetListaAgenciaMaritimaPuerto) agenciaMaritimaPuerto$: Observable<AgenciaMaritimaPuerto[]>;

  constructor(private nominacionService: NominacionService,
    private store: Store,
    private modalService: NgbModal,
    private formBuilder: FormBuilder) {
    this.asignarNominacionParametros();

  }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.inicializarForm();
    this.cargarListasDeNominacion();
    this.obtenerMaterialPuerto();
    this.obtenerVapor();
    this.obtenerBanderas();
    this.obtenerATAPuerto();
    this.obtenerAgenciaMaritima();
  }

  private get nominacionParametros(): NominacionParametros {
    return this._nominacionParametros;
  }
  private set nominacionParametros(value: NominacionParametros) {
    this._nominacionParametros = value;
  }
  private asignarNominacionParametros() {
    this.nominacionService.NominacionParametros.subscribe(parametro => {

      const nominacionParametos: NominacionParametros = {
        nominacion_Id: parametro.nominacion_Id,
        actualizarDatoTecnico: parametro.actualizarDatoTecnico,
        actualizarRecibos: parametro.actualizarRecibos,
        actualizarIntervenciones: parametro.actualizarIntervenciones
      };
      this.nominacionParametros = nominacionParametos;
    });
  }
  public obtenerMaterialPuerto() {
    this.productos$.subscribe(data => {
      this.listaMaterialPuerto = data;
    });
  }
  private inicializarForm() {
    this.datoTecnicoForm = this.formBuilder.group({
      id: [0, Validators.required],
      materialPuerto: ['', Validators.required],
      cantidadTotal: ['', Validators.required],
      tolerancia: ['', Validators.required],
      observaciones: ['', Validators.required],
      vapor: ['', Validators.required],
      bandera: ['', Validators.required],
      eTARecalada: ['', Validators.required],
      obligacionDeCarga: ['', Validators.required],
      muelleDeCarga: ['', Validators.required],
      tasaDeCarga: ['', Validators.required],
      tasaDeCargaValor: ['', Validators.required],
      dEM: ['', Validators.required],
      dES: ['', Validators.required],
      tipoContrato: ['', Validators.required],
      ataPuerto: [],
      agenciaMaritimaPuerto: [],
      surveyor: ['', Validators.required],
      observacionesSurveyor: ['', Validators.required],
      datoTecnicoExportador: this.formBuilder.array([]),
      datoTecnicoDestino: this.formBuilder.array([]),
      datoTecnicoCoordinador: this.formBuilder.array([]),
    });
  }

  public cargarListasDeNominacion() {
    this.store.dispatch(new GetObtenerProductos());
    this.store.dispatch(new GetObtenerDestino());
    this.store.dispatch(new GetObtenerBandera());
    this.store.dispatch(new GetObtenerExportador());
    this.store.dispatch(new GetObtenerCoordinadorPuerto());
    this.store.dispatch(new GetObtenerVapor());
    this.store.dispatch(new GetObtenerATAPuerto());
    this.store.dispatch(new GetObtenerAgenciaMaritimaPuerto());
  }

  public obtenerDestinos() {
    this.destino$.subscribe(destino => { this.listaDestino = destino; });
  }
  public obtenerExportador() {
    this.exportador$.subscribe(exportador => { this.listaExportador = exportador; });
  }
  public obtenerBanderas() {
    this.banderas$.subscribe(bandera => {this.listaBanderas = bandera; });
  }
  public obtenerCoordinadorPuerto() {
    this.coordinadorPuerto$.subscribe(coordinadorPuerto => { this.listaCoordinadorPuerto = coordinadorPuerto; });
  }
  public obtenerVapor() {
    this.vapores$.subscribe(vapor => {
      this.listaVapor = vapor;
    });
  }
  public obtenerATAPuerto() {
    this.ataPuerto$.subscribe(ataPuerto => { this.listaATAPuerto = ataPuerto; });
  }
  public obtenerAgenciaMaritima() {
    this.agenciaMaritimaPuerto$.subscribe(agenciaMaritimaPuerto => { this.listaAgenciaMaritimaPuerto = agenciaMaritimaPuerto; });
  }


  public formatoExportador = (exp: Exportador) => exp.nombre;
  public buscarExportador = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => this.listaExportador.filter(v => v.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  )

  public formatoDestino = (exp: Destino) => exp.nombre;
  public buscarDestino = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => this.listaDestino.filter(v => v.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  )

  public formatoCoordinadorPuerto = (exp: CoordinadorPuerto) => exp.nombre;
  public buscarCoordinadorPuerto = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => this.listaCoordinadorPuerto.filter(v => v.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  )

  public seleccionVapor($event) {
    console.log('$event--->>', $event);
    let { id, nombre } = $event.item
  }

  public buscarVapor = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => this.listaVapor.filter(v => v.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  )

  public formatoVapor = (exp: Vapor) => exp.nombre;


}
