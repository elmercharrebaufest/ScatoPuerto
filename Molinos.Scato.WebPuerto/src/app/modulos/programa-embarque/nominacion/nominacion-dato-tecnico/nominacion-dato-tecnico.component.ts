import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NominacionDatoTecnicoExportador } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-exportador';
import { NominacionDatoTecnicoDestino } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-destino';
import { NominacionDatoTecnicoCoordinador } from '@ScatoModels/programa-embarque/nominacion-dato-tecnico-coordinador';

import { NominacionParametros } from '@ScatoModels/programa-embarque/nominacion-parametros';
import { NominacionService } from '@ScatoServicios/programa-embarque/nominacion.service';
import { NominacionDatoTecnicoService } from './nominacion-dato-tecnico.services';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { ProductoState } from 'app/store/productos/material.state';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
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

  private listaMaterialPuerto: MaterialPuerto[]; 
  private listaDestino: Destino[]; 
  private listaExportador: Exportador[]; 
  private listaCoordinadorPuerto: CoordinadorPuerto[]; 
  private listaVapor: Vapor[]; 
  private listaATAPuerto: ATAPuerto[]; 
  private listaAgenciaMaritimaPuerto: AgenciaMaritimaPuerto[]; 



  @Select(ProductoState.getListaProductos) productos$: Observable<MaterialPuerto[]>;
  @Select(DestinoState.GetObtenerDestino) destino$: Observable<Destino[]>;
  @Select(ExportadorState.GetObtenerExportador) exportador$: Observable<Exportador[]>;
  @Select(CoordinadorPuertoState.GetObtenerCoordinadorPuerto) coordinadorPuerto$: Observable<CoordinadorPuerto[]>;
  @Select(VaporState.GetObtenerVapor) vapor$: Observable<Vapor[]>;
  @Select(ATAPuertoState.GetObtenerATAPuerto) ataPuerto$: Observable<ATAPuerto[]>;
  @Select(AgenciaMaritimaPuertoState.GetObtenerAgenciaMaritimaPuerto) agenciaMaritimaPuerto$: Observable<AgenciaMaritimaPuerto[]>;


  constructor(private nominacionService: NominacionService,
              private nominacionDatoTecnicoService: NominacionDatoTecnicoService,
              private formBuilder: FormBuilder) { 
    this.asignarNominacionParametros();
  }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {

    this.inicializarForm();
  }

  private get nominacionParametros(): NominacionParametros {
    return this._nominacionParametros;
  }
  private set nominacionParametros(value: NominacionParametros){
    this._nominacionParametros = value;
  }
  private asignarNominacionParametros(){
    this.nominacionService.NominacionParametros.subscribe(parametro =>{
      
      const nominacionParametos: NominacionParametros = {
        nominacion_Id : parametro.nominacion_Id,
        actualizarDatoTecnico : parametro.actualizarDatoTecnico,
        actualizarRecibos  : parametro.actualizarRecibos,
        actualizarIntervenciones : parametro.actualizarIntervenciones};
      this.nominacionParametros = nominacionParametos;
    });
  }
  private inicializarForm(){
    this.datoTecnicoForm = this.formBuilder.group({
      id                   : [0, Validators.required],
      materialPuerto       : ['', Validators.required],
      cantidadTotal        : ['', Validators.required],
      tolerancia           : ['', Validators.required],
      observaciones        : ['', Validators.required],
      vapor                : ['', Validators.required],
      bandera              : ['', Validators.required],
      eTARecalada          : ['', Validators.required],     
      obligacionDeCarga    : ['', Validators.required],     
      muelleDeCarga        : ['', Validators.required],
      tasaDeCarga          : ['', Validators.required],
      tasaDeCargaValor     : ['', Validators.required],
      dEM                  : ['', Validators.required],
      dES                  : ['', Validators.required],
      tipoContrato         : ['', Validators.required],
      aTAPuerto            : ['', Validators.required],
      agenciaMaritimaPuerto: ['', Validators.required],
      surveyor             : ['', Validators.required],
      observacionesSurveyor: ['', Validators.required],
      datoTecnicoExportador: this.formBuilder.array([]),
      datoTecnicoDestino: this.formBuilder.array([]),
      datoTecnicoCoordinador: this.formBuilder.array([]),
    });
    this.cargarNominacionListas();
  }

  private cargarNominacionListas(){
    this.nominacionDatoTecnicoService.cargarMaterialPuerto();
    this.nominacionDatoTecnicoService.cargarDestinos();
    this.nominacionDatoTecnicoService.cargarExportador();
    this.nominacionDatoTecnicoService.cargarCoordinadorPuerto();
    this.nominacionDatoTecnicoService.cargarVapor();
    this.nominacionDatoTecnicoService.cargarATAPuerto();
    this.nominacionDatoTecnicoService.cargarAgenciaMaritima();

  }

  public obtenerMaterialPuerto(){
    this.productos$.subscribe(materialPuerto =>{ this.listaMaterialPuerto = materialPuerto;});
    return this.listaMaterialPuerto;
  }
  public obtenerDestinos(){
    this.destino$.subscribe(destino =>{ this.listaDestino = destino;});
    return this.listaDestino;
  }
  public obtenerExportador(){
    this.exportador$.subscribe(exportador =>{ this.listaExportador = exportador;});
    return this.listaExportador;
  }
  public obtenerCoordinadorPuerto(){
    this.coordinadorPuerto$.subscribe(coordinadorPuerto =>{ this.listaCoordinadorPuerto = coordinadorPuerto;});
    return this.listaCoordinadorPuerto;
  }
  public obtenerVapor(){
    this.vapor$.subscribe(vapor =>{ this.listaVapor = vapor;});
    return this.listaVapor;
  }
  public obtenerATAPuerto(){
    this.ataPuerto$.subscribe(ataPuerto =>{ this.listaATAPuerto = ataPuerto;});
    return this.listaATAPuerto;
  }
  public obtenerAgenciaMaritima(){
    this.agenciaMaritimaPuerto$.subscribe(agenciaMaritimaPuerto =>{ this.listaAgenciaMaritimaPuerto = agenciaMaritimaPuerto;});
    return this.listaAgenciaMaritimaPuerto;
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

  public formatoVapor = (exp: Vapor) => exp.nombre;
  public buscarVapor = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => this.listaVapor.filter(v => v.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  )

  public formatoATAPuerto = (exp: ATAPuerto) => exp.nombre;
  public buscarATAPuerto = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => this.listaATAPuerto.filter(v => v.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  )

  public formatoAgenciaMaritimaPuerto = (exp: AgenciaMaritimaPuerto) => exp.nombre;
  public buscarAgenciaMaritimaPuerto = (text$: Observable<string>) => text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => this.listaAgenciaMaritimaPuerto.filter(v => v.nombre.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  )

}
