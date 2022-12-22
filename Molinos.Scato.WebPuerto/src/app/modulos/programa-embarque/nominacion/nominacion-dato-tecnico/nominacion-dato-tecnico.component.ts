import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { combineLatest, forkJoin, Observable, Subject } from 'rxjs';
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
import { debounceTime, distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';
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
import { NominacionDatoTecnicoRegistroService } from './nominacion-dato-tecnico.services';
import { Nominacion } from '@ScatoModels/programa-embarque/nominacion';

@Component({
  selector: 'app-nominacion-dato-tecnico',
  templateUrl: './nominacion-dato-tecnico.component.html',
  styleUrls: ['./nominacion-dato-tecnico.component.css']
})
export class NominacionDatoTecnicoComponent implements OnInit, OnDestroy  {

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

  private destroy$ = new Subject();

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
    private datoTecnicoRegistroService: NominacionDatoTecnicoRegistroService,
    private confirmationDialogService: ConfirmationDialogService,
    private store: Store,) {
    this.asignarNominacionParametros();

  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();  
  }

  ngOnInit(): void {
    this.inicializarForm();
    this.cargarListasDeNominacion();
    this.obtenerListasDeNominacion();
    this.configurarListasDeNominacion();
    this.datoTecnicoRegistroService.obtenerNominacion();
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
    this.datoTecnicoForm = this.datoTecnicoRegistroService.inicializarForm();
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
    return this.datoTecnicoForm.get("nominacionDatoTecnicoExportador") as FormArray
  }
  get datoTecnicoDestinoFormArray(): FormArray {
    return this.datoTecnicoForm.get("nominacionDatoTecnicoDestino") as FormArray
  }
  get datoTecnicoCoordinadorFormArray(): FormArray {
    return this.datoTecnicoForm.get("nominacionDatoTecnicoCoordinadorPuerto") as FormArray
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
    this.datoTecnicoExportadorFormArray.push(this.inicializarFormExportador());
  }
  onAgregarDatoTecnicoDestino(){
    this.datoTecnicoDestinoFormArray.push(this.inicializarFormDestino());
  }
  onAgregarDatoTecnicoCoordinador(){
    this.datoTecnicoCoordinadorFormArray.push(this.inicializarFormCoordinadorPuerto());
  }
  onCargarTipoCalidad(){
    this.mostrarParametroCalidad = false;
    this.tipoDeCalidad$.subscribe(data => this.listaTipoDeCalidad = data);
  }
  onMostrarParametroCalidad(){
    this.mostrarParametroCalidad = !this.mostrarParametroCalidad;
  }
  onSeleccionarParametro(calidadValor){
    let nominacionDatoTecnicoCalidad = this.listaNominacionDatoTecnicoCalidad.filter(data => data.calidadValor == calidadValor);
    if (nominacionDatoTecnicoCalidad.length > 0){
      nominacionDatoTecnicoCalidad[0].esSeleccionado = !nominacionDatoTecnicoCalidad[0].esSeleccionado;
    }
  }
  onSeleccionarTodos(event){
    this.listaNominacionDatoTecnicoCalidad.forEach(data=>{ data.esSeleccionado = event.currentTarget.checked;});
  }
  private inicializarFormExportador(exportador: NominacionDatoTecnicoExportador = null){
    return this.datoTecnicoRegistroService.inicializarFormExportador(exportador);   
  }
  private inicializarFormDestino(destino: NominacionDatoTecnicoDestino = null){
    return this.datoTecnicoRegistroService.inicializarFormDestino(destino);   
  }
  private inicializarFormCoordinadorPuerto(coordinadorPuerto: NominacionDatoTecnicoCoordinador = null){
    return this.datoTecnicoRegistroService.inicializarFormCoordinadorPuerto(coordinadorPuerto);   
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
    this.productos$.pipe(takeUntil(this.destroy$)).subscribe(data => {this.listaMaterialPuerto = data;});
    this.destino$.pipe(takeUntil(this.destroy$)).subscribe(destino => { this.listaDestino = destino; });
    this.exportador$.pipe(takeUntil(this.destroy$)).subscribe(exportador => { this.listaExportador = exportador; });
    this.banderas$.pipe(takeUntil(this.destroy$)).subscribe(bandera => {this.listaBanderas = bandera; });
    this.coordinadorPuerto$.pipe(takeUntil(this.destroy$)).subscribe(coordinadorPuerto => { this.listaCoordinadorPuerto = coordinadorPuerto; });
    this.vapores$.pipe(takeUntil(this.destroy$)).subscribe(vapor => {this.listaVapor = vapor});
    this.ataPuerto$.pipe(takeUntil(this.destroy$)).subscribe(ataPuerto => { this.listaATAPuerto = ataPuerto; });
    this.agenciaMaritimaPuerto$.pipe(takeUntil(this.destroy$)).subscribe(agenciaMaritimaPuerto => { this.listaAgenciaMaritimaPuerto = agenciaMaritimaPuerto; });
    this.surveyor$.pipe(takeUntil(this.destroy$)).subscribe(data => {this.listaSurveyor = data;});
    this.tasaDeCarga$.pipe(takeUntil(this.destroy$)).subscribe(data => {this.listaTasaDeCarga = data;});
    this.muelleDeCarga$.pipe(takeUntil(this.destroy$)).subscribe(data => {this.listaMuelleDeCarga = data;});
    this.tipoDeContrato$.pipe(takeUntil(this.destroy$)).subscribe(data => {this.listaTipoDeContrato = data;}); 
    this.calidadValor$.pipe(takeUntil(this.destroy$)).subscribe(data => {this.listaCalidadValor = data;}); 

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

  public seleccionVapor($event) {
    const vaporId: number =  $event.item.id;
    this.datoTecnicoForm.controls['bandera'].setValue(null);
    this.datoTecnicoRegistroService.seleccionarInformacionVapor(vaporId).subscribe(data=>{
      if (data !=null){
        let banderaSeleccionada = this.listaBanderas.filter(x=> x.id == data.bandera_Id);
        if (banderaSeleccionada.length >0)
          this.datoTecnicoForm.controls['bandera'].setValue(banderaSeleccionada[0]);
      }
    });
  }


  public onGuardarDatoTecnico(){
    this.grabarNominacion = true;
    //if(this.datoTecnicoRegistroService.validacionGrabar(this.datoTecnicoForm)){
      console.log('listaNominacionDatoTecnicoCalidad>>', this.listaNominacionDatoTecnicoCalidad);
      const listaNominacionCalidad = this.listaNominacionDatoTecnicoCalidad.filter(data=> data.esSeleccionado == true);
      let listaCalidadSeleccionada = [];
      listaNominacionCalidad.forEach(calidad=>{
        listaCalidadSeleccionada.push({
          nominacionDatoTecnicoCalidad_Id: 0,
          calidadValor: calidad.calidadValor,
          nominacionDatoTecnico: null
        });
      });
      this.datoTecnicoForm.controls['nominacionDatoTecnicoCalidad'].setValue(listaCalidadSeleccionada);
      this.datoTecnicoForm.value.nominacionDatoTecnicoCalidad = listaCalidadSeleccionada;
      let agenciaMaritimaPuerto = this.datoTecnicoForm.value.agenciaMaritimaPuerto;
      let ataPuerto = this.datoTecnicoForm.value.ataPuerto;
      let surveyor = this.datoTecnicoForm.value.surveyor;

      this.datoTecnicoForm.get('agenciaMaritimaPuerto').setValue(
        agenciaMaritimaPuerto != null && agenciaMaritimaPuerto.length > 0 ?
          this.listaAgenciaMaritimaPuerto.find(x => x.id == agenciaMaritimaPuerto[0].id) : null);

      this.datoTecnicoForm.get('ataPuerto').setValue(
        ataPuerto != null && ataPuerto.length > 0 ?
          this.listaATAPuerto.find(x => x.id == ataPuerto[0].id) : null);

      this.datoTecnicoForm.get('surveyor').setValue(
        surveyor != null && surveyor.length > 0 ?
          this.listaSurveyor.find(x => x.id == surveyor[0].id) : null);          


  /*
        this.embarqueForm.get('coordinadores').setValue(
        this.embarqueForm.value.coordinadoresList != null && this.embarqueForm.value.coordinadoresList.length > 0 ?
          this.coordinadoresList.find(x => x.id == this.embarqueForm.value.coordinadoresList[0].id) : '');

      agenciaMaritimaPuerto = agenciaMaritimaPuerto!=null ? agenciaMaritimaPuerto[0] : null;
      ataPuerto = ataPuerto!=null ? ataPuerto[0] : null;
      surveyor = surveyor!=null ? surveyor[0] : null;
  */
      let nominacion: Nominacion = new Nominacion();
      nominacion.id = 0;
      nominacion.fechaCreacion = new Date();
      nominacion.embarque_Id = 0;
      nominacion.nominacionDatoTecnico= this.datoTecnicoForm.value;
      nominacion.nominacionDetalleIntervencion = null;
      nominacion.nominacionRecibo = null;
      /*
      this.datoTecnicoForm.controls['agenciaMaritimaPuerto'].setValue(agenciaMaritimaPuerto);
      this.datoTecnicoForm.controls['ataPuerto'].setValue(ataPuerto);
      this.datoTecnicoForm.controls['surveyor'].setValue(surveyor);
*/
      this.datoTecnicoRegistroService.grabarNominacion(nominacion);
      console.log('this.datoTecnicoForm-->>', this.datoTecnicoForm);
    //}
  }

  public onCancelarDatoTecnico(){
  }

}
export class ListaNominacionCalidad{
  calidadValor: CalidadValor;
  esSeleccionado: boolean;
}