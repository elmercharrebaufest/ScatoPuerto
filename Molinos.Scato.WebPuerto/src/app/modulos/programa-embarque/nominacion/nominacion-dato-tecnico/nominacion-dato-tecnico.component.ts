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
import { NominacionDatoTecnicoCalidad } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-calidad';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';

@Component({
  selector: 'app-nominacion-dato-tecnico',
  templateUrl: './nominacion-dato-tecnico.component.html',
  styleUrls: ['./nominacion-dato-tecnico.component.css']
})
export class NominacionDatoTecnicoComponent implements OnInit, AfterViewInit {

  private _nominacionParametros: NominacionParametros = null;
  public datoTecnicoForm: FormGroup;
  public datoTecnicoExportador: NominacionDatoTecnicoExportador[];
  public datoTecnicoDestino: NominacionDatoTecnicoDestino[];
  public datoTecnicoCoordinador: NominacionDatoTecnicoCoordinador[];
  public nominacionDatoTecnicoCalidad: NominacionDatoTecnicoCalidad[];

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
  public listaNominacionDatoTecnicoCalidad: ListaNominacionCalidad[] = [];

  public mostrarParametroCalidad: boolean = false;
  public grabarNominacion: boolean = false;
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
    private confirmationDialogService: ConfirmationDialogService,
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

  public get frmDatosTecnicos() { return this.datoTecnicoForm.controls; }

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
  

  private inicializarForm() {
    this.datoTecnicoForm = this.formBuilder.group({
      id: [0, Validators.required],
      materialPuerto: ['', Validators.required],
      tipoDeCalidad:[''],
      nominacionDatoTecnicoCalidad: [],
      cantidadTotal: ['', Validators.required],
      tolerancia: [''],
      observaciones: [''],
      vapor: ['', Validators.required],
      bandera: ['', Validators.required],
      etaRecalada: ['', Validators.required],
      obligacionDeCarga: ['', Validators.required],
      muelleDeCarga: ['', Validators.required],
      tasaDeCarga: [''],
      tasaDeCargaValor: [''],
      dem: [''],
      des: [''],
      tipoDeContrato: [''],
      ataPuerto: ['', Validators.required],
      agenciaMaritimaPuerto: ['', Validators.required],
      surveyor: [''],
      observacionesSurveyor: [''],
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
  
  listaTipoDeCalidadxMaterial(materialPuerto){
    return this.listaTipoDeCalidad.filter(x=> x.materialPuerto.id == materialPuerto.id);
  }

  onEliminarDatoTecnicoExportador(index: number){
    const value = this.datoTecnicoExportadorFormArray.value;
    this.datoTecnicoExportadorFormArray.setValue(
      value.slice(0, index).concat(
        value.slice(index + 1),
      ).concat(value[index]),
    );
    this.datoTecnicoExportadorFormArray.removeAt(value.length - 1);
  }
  onEliminarDatoTecnicoDestino(index: number){
    const value = this.datoTecnicoDestinoFormArray.value;
    this.datoTecnicoDestinoFormArray.setValue(
      value.slice(0, index).concat(
        value.slice(index + 1),
      ).concat(value[index]),
    );
    this.datoTecnicoDestinoFormArray.removeAt(value.length - 1);
  }
  onEliminarDatoTecnicoCoordinador(index: number){
    const value = this.datoTecnicoCoordinadorFormArray.value;
    this.datoTecnicoCoordinadorFormArray.setValue(
      value.slice(0, index).concat(
        value.slice(index + 1),
      ).concat(value[index]),
    );
    this.datoTecnicoCoordinadorFormArray.removeAt(value.length - 1);
  }

  onActualizarListaCalidadValor(tipoDeCalidad){
    this.listaNominacionDatoTecnicoCalidad = [];
    const listaCalidad = this.listaCalidadValor.filter(x=> x.tipoDeCalidad.id == tipoDeCalidad.id);
    listaCalidad.forEach(calidad =>{
      const calidadValor:ListaNominacionCalidad = {
        calidadValor : calidad,
        esSeleccionado: false
      };
      this.listaNominacionDatoTecnicoCalidad.push(calidadValor);
    });
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
    this.mostrarParametroCalidad = false;
    this.tipoDeCalidad$.subscribe(data => this.listaTipoDeCalidad = data);
  }
  onMostrarParametroCalidad(){
    this.mostrarParametroCalidad = !this.mostrarParametroCalidad;
  }
  onSeleccionarParametroCalidad(calidadValor){
    let nominacionDatoTecnicoCalidad = this.listaNominacionDatoTecnicoCalidad.filter(data => data.calidadValor == calidadValor);
    if (nominacionDatoTecnicoCalidad.length > 0){
      nominacionDatoTecnicoCalidad[0].esSeleccionado = !nominacionDatoTecnicoCalidad[0].esSeleccionado;
    }
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
        exportador: ['', Validators.required],
        cantidad: [0, Validators.required],
        tolerancia: [0, Validators.required],
        nominacionDatoTecnico_Id: '',
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
        destino: ['', Validators.required],
        cantidad: [0, Validators.required],
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
        coordinadorPuerto: ['', Validators.required],
        cantidad: [0, Validators.required],
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
    this.grabarNominacion = true;
    if (this.datoTecnicoForm.invalid) {
      let erroresDestinos: boolean = false;
      let erroresCoordinador: boolean = false;
      let erroresExportador: boolean = false;
      const datoTecnicoCoordinador = this.datoTecnicoForm.controls['datoTecnicoCoordinador']['controls'];
      const datoTecnicoDestino = this.datoTecnicoForm.controls['datoTecnicoDestino']['controls'];
      const datoTecnicoExportador = this.datoTecnicoForm.controls['datoTecnicoExportador']['controls'];
      if (datoTecnicoExportador.length == 0 || datoTecnicoDestino.length == 0 || datoTecnicoExportador.length == 0){
          this.confirmationDialogService.confirm('Registro Nominación', 'Debe agregar destino, cargador y cliente a la nominación', 'Cerrar', '', null, null, Tipoalerta.Warning);
          return false;
      }
      datoTecnicoDestino.forEach(detalle=>{
        const datos = detalle['controls'];
        if (datos.destino.value == '' ||  datos.cantidad.value=='' || datos.cantidad.value == '0'){
          erroresDestinos = true;
          return;
        }
      });
      datoTecnicoCoordinador.forEach(detalle=>{
        const datos = detalle['controls'];
        if (datos.coordinadorPuerto.value == '' || (datos.cantidad.value=='' || datos.cantidad.value == '0')){
          erroresCoordinador = true;
          return;
        }
      });
      datoTecnicoExportador.forEach(detalle=>{
        const datos = detalle['controls'];
        if (datos.exportador.value == '' ||  
        (datos.cantidad.value=='' || datos.cantidad.value == '0') ||
        (datos.tolerancia.value=='' || datos.tolerancia.value == '0')){
          erroresExportador = true;
          return;
        }
      });

      if (erroresDestinos || erroresCoordinador || erroresExportador){
        this.confirmationDialogService.confirm('Registro Nominación', 'Falta completar información en destino, cargador o cliente.', 'Cerrar', '', null, null, Tipoalerta.Warning);
        return false;
      }
    }
    console.log('listaNominacionDatoTecnicoCalidad>>', this.listaNominacionDatoTecnicoCalidad);
    const listaNominacion = this.listaNominacionDatoTecnicoCalidad.filter(data=> data.esSeleccionado == true);
    this.datoTecnicoForm.controls['nominacionDatoTecnicoCalidad'].setValue(listaNominacion);
    this.datoTecnicoForm.value.nominacionDatoTecnicoCalidad = listaNominacion;
    console.log('this.datoTecnicoForm-->>', this.datoTecnicoForm);
  }

  public onCancelarDatoTecnico(){
  }

}
export class ListaNominacionCalidad{
  calidadValor: CalidadValor;
  esSeleccionado: boolean;
}