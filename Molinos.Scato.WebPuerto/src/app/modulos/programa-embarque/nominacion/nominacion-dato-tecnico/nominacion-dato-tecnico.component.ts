import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NominacionDatoTecnicoExportador } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-exportador';
import { NominacionDatoTecnicoDestino } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-destino';
import { NominacionDatoTecnicoCoordinador } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-coordinador';
import { NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';

import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { ProductoState } from '@ScatoStores/productos/material.state';
import { Select, Store } from '@ngxs/store';
import { combineLatest, forkJoin, Observable } from 'rxjs';
import { DestinoState } from '@ScatoStores/programa-embarque/destino/destino.state';
import { ExportadorState } from '@ScatoStores/programa-embarque/exportador/exportador.state';
import { CoordinadorPuertoState } from '@ScatoStores/programa-embarque/coordinador-puerto/coordinador-puerto.state';
import { VaporState } from '@ScatoStores/programa-embarque/vapor/vapor.state';
import { ATAPuertoState } from '@ScatoStores/programa-embarque/ata-puerto/ata-puerto.state';
import { AgenciaMaritimaPuertoState } from '@ScatoStores/programa-embarque/agencia-maritima-puerto/agencia-maritima-puerto.state';
import { Destino } from '@ScatoModels/destino';
import { AgenciaMaritimaPuerto } from '@ScatoModels/agencia-maritima-puerto';
import { ATAPuerto } from '@ScatoModels/ata-puerto';
import { Vapor } from '@ScatoModels/embarque';
import { CoordinadorPuerto } from '@ScatoModels/coordinador-puerto';
import { Exportador } from '@ScatoModels/exportador';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { GetObtenerProductos } from '@ScatoStores/productos/material.actions';
import { GetObtenerExportador } from '@ScatoStores/programa-embarque/exportador/exportador.actions';
import { GetObtenerDestino } from '@ScatoStores/programa-embarque/destino/destino.actions';
import { GetObtenerCoordinadorPuerto } from '@ScatoStores/programa-embarque/coordinador-puerto/coordinador-puerto.actions';
import { GetObtenerVapor } from '@ScatoStores/programa-embarque/vapor/vapor.actions';
import { GetObtenerATAPuerto } from '@ScatoStores/programa-embarque/ata-puerto/ata-puerto.actions';
import { GetObtenerAgenciaMaritimaPuerto } from '@ScatoStores/programa-embarque/agencia-maritima-puerto/agencia-maritima-puerto.actions';
import { GetObtenerBandera } from '@ScatoStores/programa-embarque/bandera/bandera.actions';
import { BanderaState } from '@ScatoStores/programa-embarque/bandera/bandera.state';
import { Bandera } from '@ScatoModels/bandera';
import { TipoDeContratoState } from '@ScatoStores/programa-embarque/tipo-de-contrato/tipo-de-contrato.state';
import { TipoDeContrato } from '@ScatoModels/programa-embarque/tipo-de-contrato';
import { Surveyor } from '@ScatoModels/programa-embarque/surveyor';
import { TasaDeCargaState } from '@ScatoStores/programa-embarque/tasa-de-carga/tasa-de-carga.state';
import { MuelleDeCargaState } from '@ScatoStores/programa-embarque/muelle-de-carga/muelle-de-carga.state';
import { SurveyorState } from '@ScatoStores/programa-embarque/surveyor/surveyor.state';
import { TasaDeCarga } from '@ScatoModels/programa-embarque/tasa-de-carga';
import { GetObtenerMuelleDeCarga } from '@ScatoStores/programa-embarque/muelle-de-carga/muelle-de-carga.actions';
import { GetObtenerTipoDeContrato } from '@ScatoStores/programa-embarque/tipo-de-contrato/tipo-de-contrato.actions';
import { GetObtenerSurveyor } from '@ScatoStores/programa-embarque/surveyor/surveyor.actions';
import { GetObtenerTasaDeCarga } from '@ScatoStores/programa-embarque/tasa-de-carga/tasa-de-carga.actions';
import { MuelleDeCarga } from '@ScatoModels/programa-embarque/muelle-de-carga';
import { TipoDeCalidadState } from '@ScatoStores/programa-embarque/tipo-de-calidad/tipo-de-calidad.state';
import { TipoDeCalidad } from '@ScatoModels/programa-embarque/tipo-de-calidad';
import { GetObtenerTipoDeCalidad } from '@ScatoStores/programa-embarque/tipo-de-calidad/tipo-de-calidad.actions';
import { CalidadValorState } from '@ScatoStores/programa-embarque/calidad-valor/calidad-valor.state';
import { CalidadValor } from '@ScatoModels/programa-embarque/calidad-valor';
import { GetObtenerCalidadValor } from '@ScatoStores/programa-embarque/calidad-valor/calidad-valor.actions';

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
  public datoTecnicoForm: FormGroup;
  public datoTecnicoExportador: NominacionDatoTecnicoExportador[];
  public datoTecnicoDestino: NominacionDatoTecnicoDestino[];
  public datoTecnicoCoordinador: NominacionDatoTecnicoCoordinador[];

  public formatoDestino;
  public formatoVapor; 
  public formatoCoordinadorPuerto; 
  public formatoExportador;
  public buscarDestino; 
  public buscarVapor; 
  public buscarCoordinadorPuerto; 
  public buscarExportador;
  
  public listaMaterialPuerto: MaterialPuerto[];
  public listaDestino: Destino[];
  public listaExportador: Exportador[];
  public listaCoordinadorPuerto: CoordinadorPuerto[];
  public listaVapor: Vapor[];
  public listaATAPuerto: ATAPuerto[];
  public listaAgenciaMaritimaPuerto: AgenciaMaritimaPuerto[];
  public listaBanderas: Bandera[];
  public listaSurveyor: Surveyor[];
  public listaTasaDeCarga: TasaDeCarga[];
  public listaMuelleDeCarga: MuelleDeCarga[];
  public listaTipoDeContrato: TipoDeContrato[];
  public listaTipoDeCalidad: TipoDeCalidad[];
  public listaCalidadValor: CalidadValor[];
  public mostrarParametroCalidad: boolean = false;

  @ViewChild('instance', { static: true }) instance: NgbTypeahead;


  @Select(ProductoState.getListaProductos) productos$: Observable<MaterialPuerto[]>;
  @Select(BanderaState.getListaBandera) banderas$: Observable<Bandera[]>;
  @Select(VaporState.getListaVapores) vapores$: Observable<Vapor[]>;
  @Select(DestinoState.getListaDestino) destino$: Observable<Destino[]>;
  @Select(ExportadorState.getListaExportadores) exportador$: Observable<Exportador[]>;
  @Select(CoordinadorPuertoState.getListaCoordinadorPuerto) coordinadorPuerto$: Observable<CoordinadorPuerto[]>;
  @Select(ATAPuertoState.getListaATAPuerto) ataPuerto$: Observable<ATAPuerto[]>;
  @Select(AgenciaMaritimaPuertoState.getListaAgenciaMaritimaPuerto) agenciaMaritimaPuerto$: Observable<AgenciaMaritimaPuerto[]>;
  @Select(TipoDeContratoState.getListaTipoDeContrato) tipoDeContrato$: Observable<TipoDeContrato[]>;
  @Select(SurveyorState.getListaSurveyor) surveyor$: Observable<Surveyor[]>;
  @Select(MuelleDeCargaState.getListaMuelleDeCarga) muelleDeCarga$: Observable<MuelleDeCarga[]>;
  @Select(TasaDeCargaState.getListaTasaDeCarga) tasaDeCarga$: Observable<TasaDeCarga[]>;
  @Select(TipoDeCalidadState.getListaTipoDeCalidad) tipoDeCalidad$: Observable<TipoDeCalidad[]>;
  @Select(CalidadValorState.getListaCalidadValor) calidadValor$: Observable<CalidadValor[]>;
  constructor(private nominacionService: NominacionService,
    private store: Store,
    private formBuilder: FormBuilder) {
    this.asignarNominacionParametros();

  }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.inicializarForm();
    this.cargarListasDeNominacion();
    this.obtenerListasDeNominacion();
    this.configurarListasDeNominacion();
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


  private inicializarForm() {
    this.datoTecnicoForm = this.formBuilder.group({
      id: [0, Validators.required],
      materialPuerto: ['', Validators.required],
      tipoDeCalidad:['', Validators.required],
      nominacionDatoTecnicoCalidad: ['', Validators.required],
      cantidadTotal: ['', Validators.required],
      tolerancia: ['', Validators.required],
      observaciones: ['', Validators.required],
      vapor: ['', Validators.required],
      bandera: ['', Validators.required],
      etaRecalada: ['', Validators.required],
      obligacionDeCarga: ['', Validators.required],
      muelleDeCarga: ['', Validators.required],
      tasaDeCarga: ['', Validators.required],
      tasaDeCargaValor: ['', Validators.required],
      dem: ['', Validators.required],
      des: ['', Validators.required],
      tipoDeContrato: ['', Validators.required],
      ataPuerto: ['', Validators.required],
      agenciaMaritimaPuerto: ['', Validators.required],
      surveyor: ['', Validators.required],
      observacionesSurveyor: ['', Validators.required],
      datoTecnicoExportador: this.formBuilder.array([]),
      datoTecnicoDestino: this.formBuilder.array([]),
      datoTecnicoCoordinador: this.formBuilder.array([]),
    });
  }

  public trackByFn(index: any, item: any) {
    return index;
  }
  public numberOnly(event): boolean {
    var charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }
  public decimalOnly(event): boolean {
    var charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode > 47 && charCode < 58) || charCode == 46)
      return true;
    return false;
  }

  get datoTecnicoExportadorFormArray(): FormArray {
    return this.datoTecnicoForm.get("datoTecnicoExportador") as FormArray
  }
  get datoTecnicoDestinoFormArray(): FormArray {
    return this.datoTecnicoForm.get("datoTecnicoDestino") as FormArray
  }
  get datoTecnicoCoordinadorFormArray(): FormArray {
    return this.datoTecnicoForm.get("datoTecnicoCoordinador") as FormArray
  }

  onAgregarDatoTecnicoExportador(){
    this.datoTecnicoExportadorFormArray.push(this.initCargaExportador());
  }
  onAgregarDatoTecnicoDestino(){
    this.datoTecnicoDestinoFormArray.push(this.initCargaDestino());
  }
  onAgregarDatoTecnicoCoordinador(){
    this.datoTecnicoCoordinadorFormArray.push(this.initCargaCoordinadorPuerto());
  }
  onCargarTipoCalidad(){
    console.log('onCargarTipoCalidad--->')
      this.tipoDeCalidad$.subscribe(data => {console.log('data--->',data); this.listaTipoDeCalidad = data;});
  }
  onMostrarParametroCalidad(){
    this.mostrarParametroCalidad = !this.mostrarParametroCalidad;
  }
  

  initCargaExportador(exportador: NominacionDatoTecnicoExportador = null){
    if(exportador != null){
      return this.formBuilder.group({
        nominacionDatoTecnicoExportador_Id: exportador.nominacionDatoTecnicoExportador_Id,
        exportador: exportador.exportador,
        cantidad: exportador.cantidad,
        tolerancia: exportador.tolerancia,
        nominacionDatoTecnico_Id: exportador.nominacionDatoTecnico.id
      })    
    }else{
      return this.formBuilder.group({
        nominacionDatoTecnicoExportador_Id: '',
        exportador: [],
        cantidad: 0,
        nominacionDatoTecnico_Id: 0
      })
    }    
  }
  initCargaDestino(destino: NominacionDatoTecnicoDestino = null){
    if(destino != null){
      return this.formBuilder.group({
        nominacionDatoTecnicoDestino_Id: destino.nominacionDatoTecnicoDestino_Id,
        exportador: destino.destino,
        cantidad: destino.cantidad,
        nominacionDatoTecnico_Id: destino.nominacionDatoTecnico.id
      })    
    }else{
      return this.formBuilder.group({
        nominacionDatoTecnicoDestino_Id: 0,
        destino: [],
        cantidad: 0,
        nominacionDatoTecnico_Id: 0
      })
    }
  }
  initCargaCoordinadorPuerto(coordinadorPuerto: NominacionDatoTecnicoCoordinador = null){
    if(coordinadorPuerto != null){
      return this.formBuilder.group({
        nominacionDatoTecnicoCoordinador_Id: coordinadorPuerto.nominacionDatoTecnicoCoordinador_Id,
        coordinadorPuerto: coordinadorPuerto.coordinadorPuerto,
        cantidad: coordinadorPuerto.cantidad,
        nominacionDatoTecnico_Id: coordinadorPuerto.nominacionDatoTecnico.id
      })    
    }else{
      return this.formBuilder.group({
        nominacionDatoTecnicoCoordinador_Id: 0,
        coordinadorPuerto: [],
        cantidad: 0,
        nominacionDatoTecnico_Id: 0
      })
    }
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
    this.store.dispatch(new GetObtenerMuelleDeCarga());
    this.store.dispatch(new GetObtenerTipoDeContrato());
    this.store.dispatch(new GetObtenerSurveyor());
    this.store.dispatch(new GetObtenerTasaDeCarga());
    this.store.dispatch(new GetObtenerTipoDeCalidad());
    this.store.dispatch(new GetObtenerCalidadValor());

  }
  public obtenerListasDeNominacion(){
    this.productos$.subscribe(data => {this.listaMaterialPuerto = data;});
    this.destino$.subscribe(destino => { this.listaDestino = destino; });
    this.exportador$.subscribe(exportador => { this.listaExportador = exportador; });
    this.banderas$.subscribe(bandera => {this.listaBanderas = bandera; });
    this.coordinadorPuerto$.subscribe(coordinadorPuerto => { this.listaCoordinadorPuerto = coordinadorPuerto; });
    this.vapores$.subscribe(vapor => {this.listaVapor = vapor});
    this.ataPuerto$.subscribe(ataPuerto => { this.listaATAPuerto = ataPuerto; });
    this.agenciaMaritimaPuerto$.subscribe(agenciaMaritimaPuerto => { this.listaAgenciaMaritimaPuerto = agenciaMaritimaPuerto; });
    this.surveyor$.subscribe(data => {this.listaSurveyor = data;});
    this.tasaDeCarga$.subscribe(data => {this.listaTasaDeCarga = data;});
    this.muelleDeCarga$.subscribe(data => {this.listaMuelleDeCarga = data;});
    this.tipoDeContrato$.subscribe(data => {this.listaTipoDeContrato = data;}); 
    this.calidadValor$.subscribe(data => {this.listaCalidadValor = data;}); 

  }
  public configurarListasDeNominacion(){
    this.formatoExportador = (exp: Exportador) => exp.nombre;
    this.buscarExportador  = (text$: Observable<string>) => text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => this.listaExportador.filter(v => v.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
    this.formatoDestino = (exp: Destino) => exp.nombre;
    this.buscarDestino = (text$: Observable<string>) => text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => this.listaDestino.filter(v => v.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
  
    this.formatoCoordinadorPuerto = (exp: CoordinadorPuerto) => exp.nombre;
    this.buscarCoordinadorPuerto = (text$: Observable<string>) => text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => this.listaCoordinadorPuerto.filter(v => v.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
  
    this.formatoVapor = (exp: Vapor) => exp.nombre;
    this.buscarVapor = (text$: Observable<string>) => text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => this.listaVapor.filter(v => v.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
  }
  public seleccionExportador($event) {
    console.log('$event--->>', $event);
    let { id, nombre } = $event.item
  }
  public seleccionVapor($event) {
    console.log('$event--->>', $event);
    let { id, nombre } = $event.item
  }
  public seleccionDestino($event) {
    console.log('$event--->>', $event);
    let { id, nombre } = $event.item
  }
  public seleccionCoordinadorPuerto($event) {
    console.log('$event--->>', $event);
    let { id, nombre } = $event.item
  }

  public onGuardarDatoTecnico(){
    console.log('this.datoTecnicoForm-->>', this.datoTecnicoForm);
  }

  public onCancelarDatoTecnico(){
  }

}
