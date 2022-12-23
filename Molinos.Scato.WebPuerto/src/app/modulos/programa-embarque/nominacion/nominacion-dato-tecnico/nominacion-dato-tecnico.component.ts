import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NominacionDatoTecnicoExportador } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-exportador';
import { NominacionDatoTecnicoDestino } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-destino';
import { NominacionDatoTecnicoCoordinador } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-coordinador';
import { NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';

import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { combineLatest, forkJoin, Observable, Subject } from 'rxjs';
import { Destino } from '@ScatoModels/destino';
import { AgenciaMaritimaPuerto } from '@ScatoModels/agencia-maritima-puerto';
import { ATAPuerto } from '@ScatoModels/ata-puerto';
import { Vapor } from '@ScatoModels/embarque';
import { CoordinadorPuerto } from '@ScatoModels/coordinador-puerto';
import { Exportador } from '@ScatoModels/exportador';
import { debounceTime, distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';
import { Bandera } from '@ScatoModels/bandera';
import { TipoDeContrato } from '@ScatoModels/programa-embarque/tipo-de-contrato';
import { Surveyor } from '@ScatoModels/programa-embarque/surveyor';
import { TasaDeCarga } from '@ScatoModels/programa-embarque/tasa-de-carga';
import { MuelleDeCarga } from '@ScatoModels/programa-embarque/muelle-de-carga';
import { TipoDeCalidad } from '@ScatoModels/programa-embarque/tipo-de-calidad';
import { CalidadValor } from '@ScatoModels/programa-embarque/calidad-valor';
import { NominacionDatoTecnicoCalidad } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-calidad';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { NominacionDatoTecnicoRegistroService } from './nominacion-dato-tecnico.services';
import { Nominacion } from '@ScatoModels/programa-embarque/nominacion';
import { VaporInformacion } from '@ScatoModels/Buques/VaporInformacion';
import { ProgramaEmbarqueNominacionDatoTecnico } from '@ScatoModels/programa-embarque/programa-embarque-nominacion-dato-tecnico';

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
  public listaVapor: VaporInformacion[];
  public listaATAPuerto: ATAPuerto[];
  public listaAgenciaMaritimaPuerto: AgenciaMaritimaPuerto[];
  public listaBanderas: Bandera[];
  public listaSurveyor: Surveyor[];
  public listaTasaDeCarga: TasaDeCarga[];
  public listaMuelleDeCarga: MuelleDeCarga[];
  public listaTipoDeContrato: TipoDeContrato[];
  public listaTipoDeCalidad: TipoDeCalidad[];
  public listaTipoDeCalidadMaterial: TipoDeCalidad[];
  public listaCalidadValor: CalidadValor[];
  public listaNominacionDatoTecnicoCalidad: ListaNominacionCalidad[] = [];

  public mostrarParametroCalidad: boolean = false;
  public grabarNominacion: boolean = false;
  @ViewChild('instance', { static: true }) instance: NgbTypeahead;

  private destroy$ = new Subject();

  constructor(private nominacionService: NominacionService,
    private datoTecnicoRegistroService: NominacionDatoTecnicoRegistroService) {
    this.obtenerListasDeNominacion();
    this.configurarListasDeNominacion();
    this.asignarNominacionParametros();
    this.inicializarForm();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();  
  }

  ngOnInit(): void {
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
      if (parametro!=null){
        const nominacionParametos: NominacionParametros = {
          nominacion_Id: parametro.nominacion_Id,
          actualizarDatoTecnico: parametro.actualizarDatoTecnico,
          actualizarRecibos: parametro.actualizarRecibos,
          actualizarIntervenciones: parametro.actualizarIntervenciones,
          nominacion: parametro.nominacion,
        };
        this.nominacionParametros = nominacionParametos;
        console.log('this.nominacionParametros-->>', this.nominacionParametros);
        console.log('fecha 1.1  -->>', new Date());
        //this.inicializarFormEdicion(this.datoTecnicoForm);
      }
    });
  }
  

  private inicializarForm() {
    this.datoTecnicoForm = this.datoTecnicoRegistroService.inicializarForm();
  }
  private inicializarFormEdicion(datoTecnicoForm: FormGroup) {
    
    console.log('this.listaTipoDeCalidad 1111-->>',this.listaTipoDeCalidad);

    const dataTecnico = this.nominacionParametros.nominacion.nominacionDatoTecnico;
    console.log('datoTecnicoForm--->>', datoTecnicoForm);
    let material: MaterialPuerto = this.listaMaterialPuerto.filter(x=> x.id == dataTecnico.materialPuerto.id)[0];
    let datoTecnicoCalidadSel = dataTecnico.nominacionDatoTecnicoCalidad.filter(x=> x.calidadValor.tipoDeCalidad.materialPuerto.id == material.id)[0];

    let tipoDeCalidad: TipoDeCalidad = this.listaTipoDeCalidad.filter(x=> x.id == datoTecnicoCalidadSel.calidadValor.tipoDeCalidad.id)[0];
    console.log('this.listaTipoDeCalidad-->>',this.listaTipoDeCalidad)
    console.log('tipoDeCalidad-->>',tipoDeCalidad)
    datoTecnicoForm.controls['materialPuerto'].setValue(material);
    datoTecnicoForm.controls['tipoDeCalidad'].setValue(tipoDeCalidad);
    datoTecnicoForm.controls['cantidadTotal'].setValue(dataTecnico.cantidadTotal);
    datoTecnicoForm.controls['tolerancia'].setValue(dataTecnico.tolerancia);
    datoTecnicoForm.controls['observaciones'].setValue(dataTecnico.observaciones);
    datoTecnicoForm.controls['vaporInformacion'].setValue(dataTecnico.vaporInformacion);
    datoTecnicoForm.controls['bandera'].setValue(dataTecnico.vaporInformacion.bandera);
    datoTecnicoForm.controls['etaRecalada'].setValue(dataTecnico.etaRecalada);
    datoTecnicoForm.controls['obligacionDeCarga'].setValue(dataTecnico.obligacionDeCarga);
    //let muelleDeCarga: MuelleDeCarga = this.listaMuelleDeCarga.filter(x=> x.id == dataTecnico.muelleDeCarga.id)[0];
    //let tasaDeCarga: TasaDeCarga = this.listaTasaDeCarga.filter(x=> x.id == dataTecnico.tasaDeCarga.id)[0];
    console.log('this.listaMuelleDeCarga-->>', this.listaMuelleDeCarga);
    console.log('this.listaTasaDeCarga-->>', this.listaTasaDeCarga);
    datoTecnicoForm.controls['muelleDeCarga'].setValue(dataTecnico.muelleDeCarga);
    datoTecnicoForm.controls['tasaDeCarga'].setValue(dataTecnico.tasaDeCarga);
    datoTecnicoForm.controls['tasaDeCargaValor'].setValue(dataTecnico.tasaDeCargaValor);
    datoTecnicoForm.controls['dem'].setValue(dataTecnico.dem);
    datoTecnicoForm.controls['des'].setValue(dataTecnico.des);
    
    console.log('dataTecnico--->>', dataTecnico);
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
    let materialPuerto = this.datoTecnicoForm.controls['materialPuerto'];
    this.listaTipoDeCalidadxMaterial(materialPuerto);
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

  public obtenerListasDeNominacion(){

    this.datoTecnicoRegistroService.listarCombosDatoTecnico().pipe(takeUntil(this.destroy$)).subscribe((data: ProgramaEmbarqueNominacionDatoTecnico) =>{
      this.listaMaterialPuerto = data.materialPuerto;
      this.listaDestino = data.destino;
      this.listaExportador = data.exportador;
      this.listaBanderas = data.bandera;
      this.listaCoordinadorPuerto = data.coordinadorPuerto;
      this.listaATAPuerto = data.ataPuerto;
      this.listaAgenciaMaritimaPuerto = data.agenciaMaritimaPuerto;
      this.listaVapor = data.vaporInformacion;
      this.listaTipoDeCalidad = data.tipoDeCalidad;   
      this.listaSurveyor = data.surveyor;
      this.listaTasaDeCarga = data.tasaDeCarga;
      this.listaMuelleDeCarga = data.muelleDeCarga;
      this.listaTipoDeContrato = data.tipoDeContrato; 
      this.listaCalidadValor = data.calidadValor; 
    });
    /*
    this.productos$.pipe(takeUntil(this.destroy$)).subscribe(data => {this.listaMaterialPuerto = data;});
    this.destino$.pipe(takeUntil(this.destroy$)).subscribe(destino => { this.listaDestino = destino; });
    this.exportador$.pipe(takeUntil(this.destroy$)).subscribe(exportador => { this.listaExportador = exportador; });
    this.banderas$.pipe(takeUntil(this.destroy$)).subscribe(bandera => {this.listaBanderas = bandera; });
    this.coordinadorPuerto$.pipe(takeUntil(this.destroy$)).subscribe(coordinadorPuerto => { this.listaCoordinadorPuerto = coordinadorPuerto; });
    this.ataPuerto$.pipe(takeUntil(this.destroy$)).subscribe(ataPuerto => { this.listaATAPuerto = ataPuerto; });
    this.agenciaMaritimaPuerto$.pipe(takeUntil(this.destroy$)).subscribe(agenciaMaritimaPuerto => { this.listaAgenciaMaritimaPuerto = agenciaMaritimaPuerto; });
    this.vapores$.pipe(takeUntil(this.destroy$)).subscribe(vapor => { this.listaVapor = vapor; });
    this.tipoDeCalidad$.pipe(takeUntil(this.destroy$)).subscribe(data => this.listaTipoDeCalidad = data);   
    this.surveyor$.pipe(takeUntil(this.destroy$)).subscribe(data => {this.listaSurveyor = data;});
    this.tasaDeCarga$.pipe(takeUntil(this.destroy$)).subscribe(data => {this.listaTasaDeCarga = data;});
    this.muelleDeCarga$.pipe(takeUntil(this.destroy$)).subscribe(data => {this.listaMuelleDeCarga = data;});
    this.tipoDeContrato$.pipe(takeUntil(this.destroy$)).subscribe(data => {this.listaTipoDeContrato = data;}); 
    this.calidadValor$.pipe(takeUntil(this.destroy$)).subscribe(data => {this.listaCalidadValor = data;}); 
    */
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
  
    this.formatoVapor = (exp: VaporInformacion) => exp.nombreBuque;
    this.buscarVapor = (text$: Observable<string>) => text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => this.listaVapor.filter(v => v.nombreBuque.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
  }

  public seleccionVapor($event) {
    console.log('$event---->>', $event)
    const bandera: Bandera =  $event.item.bandera;
    this.datoTecnicoForm.controls['bandera'].setValue(null);
    let banderaSeleccionada = this.listaBanderas.filter(x=> x.id == bandera.id);
    if (banderaSeleccionada.length >0)
      this.datoTecnicoForm.controls['bandera'].setValue(banderaSeleccionada[0]);
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

      let nominacion: Nominacion = new Nominacion();
      nominacion.id = 0;
      nominacion.fechaCreacion = new Date();
      nominacion.embarque_Id = 0;
      nominacion.nominacionDatoTecnico= this.datoTecnicoForm.value;
      nominacion.nominacionDetalleIntervencion = null;
      nominacion.nominacionRecibo = null;

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