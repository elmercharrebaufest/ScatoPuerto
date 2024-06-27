import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { NominacionDatoTecnico } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico';
import { NominacionValida } from '@ScatoModels/programa-embarque/nominacion-valida';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { AltaBajaMantenimientoComponent } from 'app/shared/componentes/alta-baja-mantenimiento/alta-baja-mantenimiento.component';
import { AltaBajaTipo } from '@ScatoEnums/alta-baja-tipo';
import { NominacionExportadores } from '@ScatoModels/programa-embarque/nominacion-exportadores';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nominacion-dato-tecnico',
  templateUrl: './nominacion-dato-tecnico.component.html',
  styleUrls: ['./nominacion-dato-tecnico.component.css']
})
export class NominacionDatoTecnicoComponent implements OnInit, OnDestroy  {

  //#region Variables
  @ViewChild('modalABM') modalABM: TemplateRef<any>;
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
  public listaVapor: VaporInformacion[]=[];
  public listaVaporFiltro: VaporInformacion[]=[];
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

  idAgencia: number;
  tittle: string;
  typeAgencia: number;

  public cargandoDatoTecnico: boolean = true;
  public mostrarParametroCalidad: boolean = false;
  public grabarNominacion: boolean = false;
  public mensajeDatoTecnico = '';
  public fechaMinimaEtaRecalada = '';
  public fechaMinimaObligacionCarga = '';
  public tipoAltaBaja: number = 0;
  public nominacionId: number = 0;
  public mensajeValidaSeleccion='';
  @ViewChild('instance', { static: true }) instance: NgbTypeahead;
  @ViewChild('AltaBaja') altaBaja: AltaBajaMantenimientoComponent;


  private destroy$ = new Subject();
  //#endregion

  //#region Contructor
  constructor(private nominacionService: NominacionService,
    private confirmationDialogService: ConfirmationDialogService,
    private modalService: NgbModal,
    private datoTecnicoRegistroService: NominacionDatoTecnicoRegistroService,
    private toastr: ToastrService
    ) {
    this.cargandoDatoTecnico = true;
    this.mensajeDatoTecnico = Mensajes.cargando;
    this.calcularFechaMinimaEtaRecalada();
    this.calcularFechaMinimaObligacionDeCarga();
    this.configurarListasDeNominacion();
    this.inicializarForm();
    this.obtenerListasDeNominacion();
  }
  //#endregion

  //#region Eventos
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
  }
  //#endregion

  //#region Propiedades
  private calcularFechaMinimaEtaRecalada(fechaModificacion: Date = null){
    let fechaActual = fechaModificacion !=null? fechaModificacion : new Date();
    const fechaHoy = new Date();
    if (fechaHoy < fechaActual)
      fechaActual = new Date();
    let dia = String(fechaActual.getDate()).padStart(2, '0');
    let mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); //January is 0!
    let anio = fechaActual.getFullYear();
    this.fechaMinimaEtaRecalada = anio + '-' + mes + '-' + dia;
  }
  private calcularFechaMinimaObligacionDeCarga(fechaModificacion: Date = null){
    let fechaActual = fechaModificacion !=null? fechaModificacion : new Date();
    const fechaHoy = new Date();
    if (fechaHoy < fechaActual)
      fechaActual = new Date();
    let dia = String(fechaActual.getDate()).padStart(2, '0');
    let mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); //January is 0!
    let anio = fechaActual.getFullYear();
    this.fechaMinimaObligacionCarga = anio + '-' + mes + '-' + dia;
  }

  public get frmDatosTecnicos() { return this.datoTecnicoForm.controls; }
  private get nominacionParametros(): NominacionParametros {
    return this._nominacionParametros;
  }
  private set nominacionParametros(value: NominacionParametros) {
    this._nominacionParametros = value;
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
  private filtrarMaterialEnvioLineUp(esLiquido: boolean){
    this.listaMaterialPuerto = this.listaMaterialPuerto.filter(x=> x.esLiquido == esLiquido);
  }
  //#endregion

  //#region Metodos Privados
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
        this.nominacionId = this.nominacionParametros.nominacion_Id;
        if (nominacionParametos.actualizarDatoTecnico){
          if (nominacionParametos.nominacion!=null){
            this.inicializarForm();
            this.inicializarFormEdicion(this.datoTecnicoForm, nominacionParametos.nominacion.nominacionDatoTecnico);
            const etaRecalada = new Date(nominacionParametos.nominacion.nominacionDatoTecnico.etaRecalada);
            const obligacionDeCarga = new Date(nominacionParametos.nominacion.nominacionDatoTecnico.obligacionDeCarga);
            this.calcularFechaMinimaEtaRecalada(etaRecalada);
            this.calcularFechaMinimaObligacionDeCarga(obligacionDeCarga);
            setTimeout(() =>{this.deshabilitarEnvioLineUp()}, 10);
          }
        }
      }
    });
  }
  private inicializarForm() {
    this.datoTecnicoForm = null;
    this.datoTecnicoForm = this.datoTecnicoRegistroService.inicializarFormNuevo();
  }

  private deshabilitarEnvioLineUp(){
    const nominacion = this.nominacionParametros.nominacion;
    if (nominacion.fechaEnvioLineUp) {
      const vaporInformacion = this.datoTecnicoForm.get('vaporInformacion').value as VaporInformacion;
      if (vaporInformacion) {
        const esLiquido = vaporInformacion.tipoBuque != 'Bulk Carrier';
        this.filtrarMaterialEnvioLineUp(esLiquido);
      }
      this.nominacionService.validarPuedeCambiarBuque(nominacion.id).subscribe(puedeCambiar => {
        if (!puedeCambiar) {
          this.datoTecnicoForm.controls['vaporInformacion'].disable();
        }
      });
    }
    if (nominacion.enMuelleDeCarga) {
      this.datoTecnicoForm.controls['vaporInformacion'].disable();
      this.datoTecnicoForm.controls['materialPuerto'].disable();
      this.datoTecnicoForm.controls['tipoDeCalidad'].disable();
      this.datoTecnicoForm.controls['cantidadTotal'].disable();
      this.datoTecnicoForm.controls['tolerancia'].disable();
      this.datoTecnicoForm.controls['muelleDeCarga'].disable();
    }
  }

  private inicializarFormEdicion(datoTecnicoForm: FormGroup, dataTecnico: NominacionDatoTecnico) {
    let material: MaterialPuerto = null;
    let datoTecnicoCalidadSel = null;
    let tipoDeCalidad: TipoDeCalidad = null;
    let muelleDeCarga: MuelleDeCarga = null;
    let tasaDeCarga: TasaDeCarga = null;
    let tipoDeContrato: TipoDeContrato = null;
    let surveyor: Surveyor = null;
    let agenciaMaritimaPuerto: AgenciaMaritimaPuerto = null;
    let ataPuerto: ATAPuerto = null;
    let bandera: Bandera = null;
    let etaRecalada  = null;
    let obligacionDeCarga  = null;

    if (dataTecnico.materialPuerto !=null)
     material = this.listaMaterialPuerto.filter(x=> x.id == dataTecnico.materialPuerto.id)[0];
    if (dataTecnico.materialPuerto !=null)
     datoTecnicoCalidadSel = dataTecnico.nominacionDatoTecnicoCalidad.filter(x=> x.calidadValor.tipoDeCalidad.materialPuerto.id == material.id)[0];

    if (dataTecnico.nominacionDatoTecnicoCalidad !=null && dataTecnico.nominacionDatoTecnicoCalidad.length >0 && (datoTecnicoCalidadSel!=null || datoTecnicoCalidadSel!=undefined))
      tipoDeCalidad = this.listaTipoDeCalidad.filter(x=> x.id == datoTecnicoCalidadSel.calidadValor.tipoDeCalidad.id)[0];

    if (dataTecnico.muelleDeCarga !=null)
      muelleDeCarga = this.listaMuelleDeCarga.filter(x=> x.id == dataTecnico.muelleDeCarga.id)[0];

    if (dataTecnico.tasaDeCarga !=null)
      tasaDeCarga = this.listaTasaDeCarga.filter(x=> x.id == dataTecnico.tasaDeCarga.id)[0];

    if (dataTecnico.tipoDeContrato !=null)
      tipoDeContrato = this.listaTipoDeContrato.filter(x=> x.id == dataTecnico.tipoDeContrato.id)[0];

    if (dataTecnico.surveyor !=null)
      surveyor = this.listaSurveyor.filter(x=> x.id == dataTecnico.surveyor.id)[0];

    if (dataTecnico.agenciaMaritimaPuerto !=null)
      agenciaMaritimaPuerto = this.listaAgenciaMaritimaPuerto.filter(x=> x.id == dataTecnico.agenciaMaritimaPuerto.id)[0];

    if (dataTecnico.ataPuerto !=null)
      ataPuerto = this.listaATAPuerto.filter(x=> x.id == dataTecnico.ataPuerto.id)[0];

    if (dataTecnico.vaporInformacion.bandera !=null)
      bandera = this.listaBanderas.filter(x=> x.id == dataTecnico.vaporInformacion.bandera.id)[0];

    if (dataTecnico.etaRecalada !=null)
      etaRecalada = new Date(dataTecnico.etaRecalada).toISOString().slice(0, 10);

    if (dataTecnico.obligacionDeCarga !=null)
      obligacionDeCarga = new Date(dataTecnico.obligacionDeCarga).toISOString().slice(0, 10);

    datoTecnicoForm.controls['id'].setValue(dataTecnico.id);
    datoTecnicoForm.controls['materialPuerto'].setValue(material);
    datoTecnicoForm.controls['tipoDeCalidad'].setValue(tipoDeCalidad);
    datoTecnicoForm.controls['cantidadTotal'].setValue(dataTecnico.cantidadTotal);
    datoTecnicoForm.controls['tolerancia'].setValue(dataTecnico.tolerancia);
    datoTecnicoForm.controls['observaciones'].setValue(dataTecnico.observaciones);
    datoTecnicoForm.controls['vaporInformacion'].setValue(dataTecnico.vaporInformacion);
    datoTecnicoForm.controls['bandera'].setValue(bandera);
    datoTecnicoForm.controls['etaRecalada'].setValue(etaRecalada);
    datoTecnicoForm.controls['obligacionDeCarga'].setValue(obligacionDeCarga);
    datoTecnicoForm.controls['muelleDeCarga'].setValue(muelleDeCarga);
    datoTecnicoForm.controls['tasaDeCarga'].setValue(tasaDeCarga);
    datoTecnicoForm.controls['tasaDeCargaValor'].setValue(dataTecnico.tasaDeCargaValor);
    datoTecnicoForm.controls['tipoDeContrato'].setValue(tipoDeContrato);
    datoTecnicoForm.controls['dem'].setValue(dataTecnico.dem);
    datoTecnicoForm.controls['des'].setValue(dataTecnico.des);
    datoTecnicoForm.controls['observacionesSurveyor'].setValue(dataTecnico.observacionesSurveyor);

    if (surveyor!=null) datoTecnicoForm.controls['surveyor'].setValue([surveyor]);
    if (agenciaMaritimaPuerto!=null) datoTecnicoForm.controls['agenciaMaritimaPuerto'].setValue([agenciaMaritimaPuerto]);
    if (ataPuerto!=null) datoTecnicoForm.controls['ataPuerto'].setValue([ataPuerto]);

    this.mostrarParametroCalidad = true;
    const nominacionDatoTecnicoCalidad: NominacionDatoTecnicoCalidad[] = dataTecnico.nominacionDatoTecnicoCalidad;
    this.onActualizarListaCalidadValor(tipoDeCalidad, true, nominacionDatoTecnicoCalidad);

    dataTecnico.nominacionDatoTecnicoExportador.forEach(exportador =>{
      this.datoTecnicoExportadorFormArray.push(this.inicializarFormExportador(exportador, dataTecnico.id));
    });
    dataTecnico.nominacionDatoTecnicoDestino.forEach(destino =>{
      this.datoTecnicoDestinoFormArray.push(this.inicializarFormDestino(destino, dataTecnico.id));
    });
    dataTecnico.nominacionDatoTecnicoCoordinadorPuerto.forEach(coordinador =>{
      this.datoTecnicoCoordinadorFormArray.push(this.inicializarFormCoordinadorPuerto(coordinador, dataTecnico.id));
    });
    this.enviarExportadoresRecibo();
    this.actualizarExportadores(material);
  }
  private enviarExportadoresRecibo(){
    let listaExportadores: Exportador[] = [];
    this.datoTecnicoExportadorFormArray.controls.forEach(item=>{
      const exportadoresForm = item['controls'].exportador;
      let exportador: Exportador = new Exportador();
      exportador.id = exportadoresForm.value.id;
      exportador.nombre = exportadoresForm.value.nombre;
      listaExportadores.push(exportador);
    });
    let nominacionExportadores:NominacionExportadores = new NominacionExportadores(true, listaExportadores);
    this.nominacionService.NominacionExportadores = nominacionExportadores;
  }
  private cargarFormulario(nominacionId: number){
    this.cargandoDatoTecnico = true;
    this.mensajeDatoTecnico = Mensajes.cargando;
    this.nominacionService.obtenerNominacion(nominacionId).pipe(takeUntil(this.destroy$)).subscribe(data =>{
      this.cargandoDatoTecnico = false;
      this.inicializarFormEdicion(this.datoTecnicoForm, data.nominacionDatoTecnico);
    });
  }
  private inicializarFormExportador(exportador: NominacionDatoTecnicoExportador = null, nominacionDatoTecnico: number = 0){
    return this.datoTecnicoRegistroService.inicializarFormExportador(exportador,nominacionDatoTecnico);
  }
  private inicializarFormDestino(destino: NominacionDatoTecnicoDestino = null, nominacionDatoTecnico: number = 0){
    return this.datoTecnicoRegistroService.inicializarFormDestino(destino,nominacionDatoTecnico);
  }
  private inicializarFormCoordinadorPuerto(coordinadorPuerto: NominacionDatoTecnicoCoordinador = null, nominacionDatoTecnico: number = 0){
    return this.datoTecnicoRegistroService.inicializarFormCoordinadorPuerto(coordinadorPuerto,nominacionDatoTecnico);
  }
  private guardarDatoTecnico(validacion: boolean){
    if (!validacion){
      this.confirmationDialogService.confirm('Registro Nominación - Dato Tecnico', 'Ya existe una nominación para el buque, material y muelle de carga.', 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }

    let nominacion: Nominacion = new Nominacion();
    nominacion= this.crearObjectoDatoTecnico();
    this.cargandoDatoTecnico = true;
    this.mensajeDatoTecnico = Mensajes.grabando;
    this.datoTecnicoRegistroService.grabarNominacion(nominacion).pipe(takeUntil(this.destroy$)).subscribe(data =>{
      this.cargandoDatoTecnico = false;
      if (data) {
        this.confirmationDialogService.confirm('Registro Nominación - Dato Tecnico', 'Dato tecnico guardado correctamente.', 'Aceptar', '', null, null, Tipoalerta.Success);
        this.inicializarForm();
        this.cargarFormulario(nominacion.id);
        this.nominacionService.ActualizarAuditoria = true;
      }
    });
  }
  //#endregion

  //#region Metodos Publicos
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
      this.cargandoDatoTecnico = false;
      this.actualizarExportadores(null);
      this.asignarNominacionParametros();
    });
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
      map(term => this.listaVaporFiltro.filter(v => v.nombreBuque.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
  }
  public validaSeleccionVapor($event) {
    console.log('evento vapor', $event);
    this.mensajeValidaSeleccion = '';
    let vapor = this.datoTecnicoForm.controls["vaporInformacion"].value;
    console.log('evento vapor 2', vapor);
    if (typeof vapor !== 'object') {
      $event.target.value = '';
      this.datoTecnicoForm.controls["vaporInformacion"].setValue('');
      this.mensajeValidaSeleccion = 'El buque ingresado no existe.';
    }
  }
  public seleccionExportador($event) {
    setTimeout(() => this.enviarExportadoresRecibo(), 2000);
  }
  public validaSeleccionExportador($event, formulario: FormGroup, index: number) {
    this.mensajeValidaSeleccion = '';
    let formExportador: FormGroup[] = this.datoTecnicoForm.controls['nominacionDatoTecnicoExportador']['controls'];
    const exportadorForm = formulario['exportador'];
    if (typeof exportadorForm !== 'object') {
      $event.target.value = '';
      formulario['exportador'] = '';
      formExportador[index].controls.exportador.setValue('');
      this.mensajeValidaSeleccion = 'El cargador ingresado no existe.';
    }
    const controlTolerancia = formExportador[index].controls.tolerancia;
    if (!controlTolerancia.value) controlTolerancia.setValue(0);
  }
  public validaSeleccionCoordinadorPuerto($event, formulario: FormGroup, index: number) {
    this.mensajeValidaSeleccion = '';
    let formCoordinadorPuerto: FormGroup[] = this.datoTecnicoForm.controls['nominacionDatoTecnicoCoordinadorPuerto']['controls'];
    const destinoForm = formulario['coordinadorPuerto'];
    if (typeof destinoForm !== 'object') {
      $event.target.value = '';
      formulario['coordinadorPuerto'] = '';
      formCoordinadorPuerto[index].controls.coordinadorPuerto.setValue('');
      this.mensajeValidaSeleccion = 'El cliente ingresado no existe.';
    }
  }
  public validaSeleccionDestino($event, formulario: FormGroup, index: number) {
    this.mensajeValidaSeleccion = '';
    let formDestino: FormGroup[] = this.datoTecnicoForm.controls['nominacionDatoTecnicoDestino']['controls'];
    const destinoForm = formulario['destino'];
    if (typeof destinoForm !== 'object') {
      $event.target.value = '';
      formulario['destino'] = '';
      formDestino[index].controls.destino.setValue('');
      this.mensajeValidaSeleccion = 'El destino ingresado no existe.';
    }
  }

  public seleccionVapor($event) {
    const bandera: Bandera =  $event.item.bandera;
    this.datoTecnicoForm.controls['bandera'].setValue(null);
    let banderaSeleccionada = this.listaBanderas.filter(x=> x.id == bandera.id);
    if (banderaSeleccionada.length >0)
      this.datoTecnicoForm.controls['bandera'].setValue(banderaSeleccionada[0]);
  }
  public listaTipoDeCalidadxMaterial(materialPuerto){
    var listaTipoDeCalidad = null;
    if (materialPuerto!=null && materialPuerto != undefined && this.listaTipoDeCalidad!=null && this.listaTipoDeCalidad != undefined)
      listaTipoDeCalidad = this.listaTipoDeCalidad.filter(x=> x.materialPuerto.id == materialPuerto.id);
    return listaTipoDeCalidad
  }
  public actualizarExportadores(materialPuerto){
    let tipoBuque: string = '';
    if (materialPuerto!=null && materialPuerto != ''){
      tipoBuque= materialPuerto.esLiquido? 'Oil Tanker':'Bulk Carrier';
      this.listaVaporFiltro = this.listaVapor.filter(x=> x.tipoBuque == tipoBuque);
      let vaporIngresado = this.datoTecnicoForm.controls['vaporInformacion'];
      if (materialPuerto !=null && vaporIngresado!=null)
        this.validarBuqueIngresado(materialPuerto, vaporIngresado);
    }
  }
  private validarBuqueIngresado(materialPuerto: MaterialPuerto, vaporIngresado){
    const tipoBuqueMaterial = materialPuerto.esLiquido? 'Oil Tanker':'Bulk Carrier';
    if (vaporIngresado.value == null && vaporIngresado.value == undefined) return false;
    if (vaporIngresado.value.length == 0) return false;
    if (vaporIngresado.value.tipoBuque != tipoBuqueMaterial){
      let mensaje = `El buque ${vaporIngresado.value.nombreBuque} no corresponde al producto seleccionado, por favor ingresar un nuevo buque.`;
      this.toastr.error(mensaje,'Registro Nominación - Dato Tecnico');
      this.datoTecnicoForm.controls['vaporInformacion'].setValue(null);
      this.datoTecnicoForm.controls['bandera'].setValue(null);
    }
  }

  public validarRegistroDatoTecnico(): boolean {
    this.grabarNominacion = true;
    return this.datoTecnicoRegistroService.validacionGrabar(this.datoTecnicoForm);
  }

  public validarCreacionNominacion(): Subject<boolean>{
    let subjectValidarDatoTecnico = new Subject<boolean>();
    const nominacionValida: NominacionValida = new NominacionValida();
    nominacionValida.id = this._nominacionParametros.nominacion != null? this._nominacionParametros.nominacion.id : 0;
    nominacionValida.materialPuerto = this.datoTecnicoForm.controls['materialPuerto'].value;
    nominacionValida.muelleDeCarga = this.datoTecnicoForm.controls['muelleDeCarga'].value;
    nominacionValida.vaporInformacion = this.datoTecnicoForm.controls['vaporInformacion'].value;
    forkJoin([
      this.datoTecnicoRegistroService.validarCreacionNominacion(nominacionValida)
    ]).pipe(takeUntil(this.destroy$)).subscribe(([validacion]) => {
      if (!validacion)
        this.confirmationDialogService.confirm('Registro Nominación - Dato Tecnico', 'Ya existe una nominación para el buque, material y muelle de carga.', 'Cerrar', '', null, null, Tipoalerta.Warning);
        subjectValidarDatoTecnico.next(validacion);
    });
    return subjectValidarDatoTecnico;
  }

  public validarDatoTecnico(): Subject<boolean>{
    let subjectValidarDatoTecnico = new Subject<boolean>();

    if(this.validarRegistroDatoTecnico()){
      const nominacionValida: NominacionValida = new NominacionValida();
      nominacionValida.id = this._nominacionParametros.nominacion != null? this._nominacionParametros.nominacion.id : 0;
      nominacionValida.materialPuerto = this.datoTecnicoForm.controls['materialPuerto'].value;
      nominacionValida.muelleDeCarga = this.datoTecnicoForm.controls['muelleDeCarga'].value;
      nominacionValida.vaporInformacion = this.datoTecnicoForm.controls['vaporInformacion'].value;
      forkJoin([
        this.datoTecnicoRegistroService.validarCreacionNominacion(nominacionValida)
      ]).pipe(takeUntil(this.destroy$)).subscribe(([validacion]) => {
        if (!validacion)
          this.confirmationDialogService.confirm('Registro Nominación - Dato Tecnico', 'Ya existe una nominación para el buque, material y muelle de carga.', 'Cerrar', '', null, null, Tipoalerta.Warning);
          subjectValidarDatoTecnico.next(validacion);
      });
    }
    return subjectValidarDatoTecnico;
  }
  public crearObjectoDatoTecnico(): Nominacion{
    let nominacion: Nominacion = new Nominacion();
    const listaCalidadSeleccionada = this.listaNominacionDatoTecnicoCalidad.filter(data=> data.esSeleccionado == true).map(calidad => ({
      nominacionDatoTecnicoCalidad_Id: 0,
      calidadValor: calidad.calidadValor,
      nominacionDatoTecnico: null,
      calidadValorEditado: calidad.calidadValorEditado
    }));
    this.datoTecnicoForm.controls['nominacionDatoTecnicoCalidad'].setValue(listaCalidadSeleccionada);
    this.datoTecnicoForm.value.nominacionDatoTecnicoCalidad = listaCalidadSeleccionada;
    let agenciaMaritimaPuerto = this.datoTecnicoForm.value.agenciaMaritimaPuerto;
    let ataPuerto = this.datoTecnicoForm.value.ataPuerto;
    let surveyor = this.datoTecnicoForm.value.surveyor;
    let jsonDatoTecnico = JSON.parse(JSON.stringify(this.datoTecnicoForm.value));
    jsonDatoTecnico.agenciaMaritimaPuerto = (agenciaMaritimaPuerto != null && agenciaMaritimaPuerto.length > 0 ?
    this.listaAgenciaMaritimaPuerto.find(x => x.id == agenciaMaritimaPuerto[0].id) : null);
    jsonDatoTecnico.ataPuerto = (ataPuerto != null && ataPuerto.length > 0 ? this.listaATAPuerto.find(x => x.id == ataPuerto[0].id) : null);
    jsonDatoTecnico.surveyor = (surveyor != null && surveyor.length > 0 ? this.listaSurveyor.find(x => x.id == surveyor[0].id) : null);
    nominacion.id = this._nominacionParametros.nominacion != null? this._nominacionParametros.nominacion.id : 0;
    nominacion.fechaCreacion = new Date();
    nominacion.embarque_Id = 0;
    nominacion.nominacionDatoTecnico= jsonDatoTecnico;
    nominacion.nominacionDetalleIntervencion = null;
    nominacion.nominacionRecibo = null;
    return nominacion;
  }
  //#endregion

  //#region Eventos de controles
  onEliminarDatoTecnicoExportador(index: number){
    const value = this.datoTecnicoExportadorFormArray.value;
    this.datoTecnicoExportadorFormArray.setValue(
      value.slice(0, index).concat(
        value.slice(index + 1),
      ).concat(value[index]),
    );
    this.datoTecnicoExportadorFormArray.removeAt(value.length - 1);
    setTimeout(() => this.enviarExportadoresRecibo(), 2000);

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
  onActualizarListaCalidadValor(tipoDeCalidad, editarNominacion: boolean = false, nominacionDatoTecnicoCalidad: NominacionDatoTecnicoCalidad[] = null) {
    if (tipoDeCalidad == null) return;
    this.listaNominacionDatoTecnicoCalidad = [];
    const listaCalidad = this.listaCalidadValor.filter(x=> x.tipoDeCalidad.id == tipoDeCalidad.id);
    listaCalidad.forEach(calidad =>{
      let esSeleccionado = false;
      let valorEditado;
      if (editarNominacion){
        const existe = nominacionDatoTecnicoCalidad.filter(x=> x.calidadValor.id == calidad.id);
        if (existe!=null && existe.length > 0) {
          esSeleccionado = true;
          valorEditado = existe[0].calidadValorEditado;
        }
      }
      const calidadValor:ListaNominacionCalidad = {
        calidadValor : calidad,
        esSeleccionado: esSeleccionado,
        calidadValorEditado: valorEditado,
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
    this.listaNominacionDatoTecnicoCalidad = [];
    this.listaTipoDeCalidadxMaterial(materialPuerto);
    this.actualizarExportadores(materialPuerto.value);
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

  onGuardarDatoTecnico() {

    this.grabarNominacion = true;

    if (this.datoTecnicoRegistroService.validacionGrabar(this.datoTecnicoForm)) {
      const nominacionValida: NominacionValida = new NominacionValida();
      nominacionValida.id = this._nominacionParametros.nominacion.id;
      nominacionValida.materialPuerto = this.datoTecnicoForm.controls['materialPuerto'].value;
      nominacionValida.muelleDeCarga = this.datoTecnicoForm.controls['muelleDeCarga'].value;
      nominacionValida.vaporInformacion = this.datoTecnicoForm.controls['vaporInformacion'].value;
      this.datoTecnicoRegistroService.validarCreacionNominacion(nominacionValida).pipe(takeUntil(this.destroy$)).subscribe(validacion => {
        this.guardarDatoTecnico(validacion);
      });
    }
  }

  onCancelarDatoTecnico(){
    const nominacionId = this._nominacionParametros.nominacion.id;
    this.datoTecnicoForm = this.datoTecnicoRegistroService.inicializarFormNuevo();
    this.cargarFormulario(nominacionId)
  }

  nuevaAgenciaMaritimaAta = (type: number, modal: NgbModal) => {
    console.log('nuevaAgenciaMaritimaAta');
    this.tittle = "Nueva ";

    this.idAgencia = null;
    this.typeAgencia = type;

    if (this.typeAgencia == 1) {
      this.tittle += "Agencia Marítima";
    } else {
      this.tittle += "ATA";
    }

    this.modalService.open(modal, { size: 'lg', centered: true, backdrop: 'static', keyboard: false });
  }

  onAltaBajaMantenimiento(opcion) {
    this.tipoAltaBaja = opcion;
    return this.modalService.open(this.modalABM);
  }

  onActualizarTipoLista(tipoLista: number) {
    this.cargandoDatoTecnico = true;
    this.mensajeDatoTecnico = Mensajes.listados;
    switch (tipoLista) {
      case AltaBajaTipo.Surveyor:

        this.datoTecnicoRegistroService.listarSurveyor().pipe(takeUntil(this.destroy$)).subscribe((data: Surveyor[]) =>{
          this.listaSurveyor = data;
          this.cargandoDatoTecnico = false;
        });
        break;
      case AltaBajaTipo.AgenciaMaritimaPuerto:
        this.datoTecnicoRegistroService.listarAgenciaMaritimaPuerto().pipe(takeUntil(this.destroy$)).subscribe((data: AgenciaMaritimaPuerto[]) =>{
          this.listaAgenciaMaritimaPuerto = data;
          this.cargandoDatoTecnico = false;
        });
        break;
      case AltaBajaTipo.ATA:
        this.datoTecnicoRegistroService.listarATAPuerto().pipe(takeUntil(this.destroy$)).subscribe((data: ATAPuerto[]) =>{
          this.listaATAPuerto = data;
          this.cargandoDatoTecnico = false;
        });
        break;
    }

  }

  onEditCalidadValor(event: any, calidad: ListaNominacionCalidad){
    if(calidad.calidadValor.valor !== event.target.value){
      calidad.calidadValorEditado = event.target.value;
    }
    
  }
  //#endregion

  //#region ARMOA005-1771 -> Permitir cantidades con max: tres decimales 
  onCantidadNominacionDatoTecnicoChange(event: any){
    const valorInput = parseFloat(event.target.value);
    this.datoTecnicoForm.controls.cantidadTotal.setValue(valorInput.toFixed(3));
  }

  onCantidadDestinoChange(event: any, i: number): void {
    const cantidadFormControl = this.datoTecnicoDestinoFormArray.at(i).get('cantidad') as FormControl;
    const valorCantidad = parseFloat(event.target.value);
    cantidadFormControl.setValue(valorCantidad.toFixed(3));
  }

  onCantidadExportadorChange(event: any, i: number): void {
    const cantidadFormControl = this.datoTecnicoExportadorFormArray.at(i).get('cantidad') as FormControl;
    const valorCantidad = parseFloat(event.target.value);
    cantidadFormControl.setValue(valorCantidad.toFixed(3));
  }

  onCantidadClienteChange(event: any, i: number): void {
    const cantidadFormControl = this.datoTecnicoCoordinadorFormArray.at(i).get('cantidad') as FormControl;
    const valorCantidad = parseFloat(event.target.value);
    cantidadFormControl.setValue(valorCantidad.toFixed(3));
  }

  onCantidadLoadingChange(event: any){
    const valorInput = parseFloat(event.target.value);
    this.datoTecnicoForm.controls.tasaDeCargaValor.setValue(valorInput.toFixed(3).toString());
  }
  //#endregion

}

//#region Clases adicionales
export class ListaNominacionCalidad {
  calidadValor: CalidadValor;
  esSeleccionado: boolean;
  calidadValorEditado: string;
}
enum Mensajes {
  cargando = "Cargando información de dato tecnico. Por favor, espere...",
  grabando = "Guardando información de dato tecnico. Por favor, espere...",
  listados = "Cargando listados de dato tecnico. Por favor, espere...",
}
  //#endregion
