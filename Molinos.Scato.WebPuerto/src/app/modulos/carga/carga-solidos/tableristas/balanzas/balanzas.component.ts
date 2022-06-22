import { Component, OnInit, OnDestroy, AfterViewInit, Input } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// Excel
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
// Models
import { Balanzas, ListadoTotalBalanzadas, MotivosFallasBalanza, Bodega } from '@ScatoModels/balanzadas/balanza';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
// Services
import { Balanzas78Service } from '@ScatoServicios/balanzas78.service';
import { BalanzaService } from '@ScatoServicios/balanza.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { FuncionesGeneralesService } from '@ScatoServicios/funciones-generales.service';
import { ParametrosService } from '@ScatoServicios/parametros.service';

import { Tipoalerta } from '@ScatoEnums/tipo-alerta';

interface TotToneladas {
  producto: string;
  toneladas: number;
}

@Component({
  selector: 'app-balanzas',
  templateUrl: './balanzas.component.html',
  styleUrls: ['./balanzas.component.css']
})
export class BalanzasComponent implements OnInit, OnDestroy, AfterViewInit {
  agregaCorte: boolean = false;
  balanza7Form: FormGroup;
  balanza8Form: FormGroup;
  balanza7DiferenteNombre: boolean = false;
  balanza8DiferenteNombre: boolean = false;
  balanzasIncompletas: boolean = false;
  balanzaCorteManual: number = 0;
  bodegas: Bodega[] = [];
  confirmationDialogService: any;
  corteManualForm: FormGroup;
  datosEmbarque: any;
  embarque: EmbarqueNav;
  embarqueId: number;
  esCorteManual: boolean = false;
  estadosBuque = [{id: 1, descripcion: 'PreOperativo'}, 
                  {id: 2, descripcion: 'Cargando'}, 
                  {id: 3, descripcion: 'ControlCalidad'}, 
                  {id: 4, descripcion: 'PostOperativo'}];
  fileName = 'Balanzas_7y8.xlsx';
  listadoBalanza7: Balanzas[] = [];
  listadoBalanza8: Balanzas[] = [];
  materialesPuerto: MaterialPuerto[] = [];
  moduloDeCarga_Id: number;
  motivosBalanzas78: MotivosFallasBalanza[];
  productos: MaterialPuerto[] = [];
  resultado7: TotToneladas[] = [];
  resultado8: TotToneladas[] = [];
  startBalanza7: any;
  startBalanza8: any;
  totalTnBodegas7: TotToneladas[] = [];
  totalTnBodegas8: TotToneladas[] = [];
  unsubscribe: Subject<any>;
  vaporId: number = 0;
  yaCargoModal: boolean = false;
  @Input() imprimir : boolean = false; 

  constructor(private _modalService: NgbModal,
    private formBuilder: FormBuilder,
    private _procesoService: DatosEmbarquesProcesoService,
    private moduloDeCargaService: ModuloDeCargaService,
    private balanzas78Service: Balanzas78Service,
    config: NgbModalConfig,
    confirmationDialogService: ConfirmationDialogService,
    private embarqueService: EmbarqueService,
    private _balanzaService: BalanzaService,
    private funcionesGeneralesService: FuncionesGeneralesService,
    private parametrosService: ParametrosService) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;
    this.confirmationDialogService = confirmationDialogService;
    this.unsubscribe = new Subject();
    this.embarque = this._procesoService.getEmbarqueSelected();
    this.embarqueId = this._procesoService.getEmbarqueId();
    this.moduloDeCarga_Id = this._procesoService.getModuloDeCargaId();
    this.vaporId = this._procesoService.getVaporId();
    this.datosEmbarque = this._procesoService.getDatosGrafico();
    this.materialesPuerto = this.datosEmbarque.listaMateriales;
    console.log('this.moduloDeCarga_Id: ', this.moduloDeCarga_Id);
    
    this.cargarMotivosBalanzas78();
    this._balanzaService.obtenerListadoBodegas().subscribe( b => this.bodegas = b );
    this.balanzas78Service.setEmbarqueBalanza(this.moduloDeCarga_Id);
  }

  ngOnInit(): void {
    this.balanza7Form = this.formBuilder.group({
      balanzas7: this.formBuilder.array([])
      // balanzas7: this.formBuilder.array([this.initBalanzas7()])
    });

    this.balanza8Form = this.formBuilder.group({
      balanzas8: this.formBuilder.array([])
      // balanzas8: this.formBuilder.array([this.initBalanzas8()])
    });

    this.initCorteManualForm();
    this.obtenerBalanzadasEnVivo();
  }

  ngAfterViewInit(): void {
    this.yaCargoModal = true;
  }

  initCorteManualForm(){
    this.corteManualForm = this.formBuilder.group({
      bodega_id: 0,
      cerrado: true,
      corteManual: true,
      fecha_Corte: "",
      fecha_Inicio: "",
      id: 0,
      kg: 0,
      material_id: 0,
      moduloDeCarga_id: 0,
      motivosFallasBalanza_id: 0,
      numeroBalanza: "",
      observaciones: "",
      tn: 0,
      fechaHora_Corte: this.funcionesGeneralesService.getFechaHora(new Date()),
      fechaHora_Inicio: this.funcionesGeneralesService.getFechaHora(new Date()),
      fecha_Corte_Inicial: '',
      fecha_Inicio_Inicial: '',
      hora_Corte_Inicial: '',
      hora_Inicio_Inicial: '',
      listadoTotalBalanzadas: this.initListadoTotalBalanzadas(),
    });
  }

  cargarMotivosBalanzas78() {
    this.moduloDeCargaService.obtenerListadoMotivosFallasBalanza()
      .subscribe( motivos => this.motivosBalanzas78 = motivos );
  }

  initBalanzas7(x: Balanzas = null) {
    return this.formBuilder.group({
      bodega_id: x?.bodega_id ?? 0,
      cerrado: x?.cerrado ?? false,
      corteManual: x?.corteManual ?? false,
      fecha_Corte: x?.fecha_Corte ?? '',
      fecha_Inicio: x?.fecha_Inicio ?? '',
      id: x.id ?? 0,
      kg: x?.kg ?? 0,
      material_id: x?.material_id ?? 0,
      moduloDeCarga_id: x?.moduloDeCarga_id ?? 0,
      motivosFallasBalanza_id: x?.motivosFallasBalanza_id ?? 0,
      motivosFallasBalanza_id_Nueva: x?.motivosFallasBalanza_id_Nueva ?? 0,
      numeroBalanza: x?.numeroBalanza ?? "",
      observaciones: x?.observaciones ?? "",
      observaciones_Nueva: x?.observaciones_Nueva ?? "",
      tn: x?.tn ?? 0,
      
      fechaHora_Corte: x?.fecha_Corte ? this.funcionesGeneralesService.getFechaHora(new Date(x.fecha_Corte)) : "",
      fechaHora_Inicio: x?.fecha_Inicio ? this.funcionesGeneralesService.getFechaHora(new Date(x.fecha_Inicio)) : "",

      fecha_Corte_Inicial: x?.fecha_Corte ? this.getDia(x.fecha_Corte, 'EN') : '',
      fecha_Corte_InicialHTML: x?.fecha_Corte ? this.getDia(x.fecha_Corte, 'ES') : '',
      fecha_Inicio_Inicial: x?.fecha_Inicio ? this.getDia(x.fecha_Inicio, 'EN') : '',
      fecha_Inicio_InicialHTML: x?.fecha_Inicio ? this.getDia(x.fecha_Inicio, 'ES') : '',
      hora_Corte_Inicial: x?.fecha_Corte ? this.getHora(x.fecha_Corte) : '',
      hora_Inicio_Inicial: x?.fecha_Inicio ? this.getHora(x.fecha_Inicio) : '',

      fecha_Corte_Nueva: x?.fecha_Corte ? this.getDia(x.fecha_Corte, 'EN') : '',
      fecha_Inicio_Nueva: x?.fecha_Inicio ? this.getDia(x.fecha_Inicio, 'EN') : '',
      hora_Corte_Nueva: x?.fecha_Corte ? this.getHora(x.fecha_Corte) : '',
      hora_Inicio_Nueva: x?.fecha_Inicio ? this.getHora(x.fecha_Inicio) : '',

      listadoTotalBalanzadas: x?.listadoTotalBalanzadas ? 
        this.initListadoTotalBalanzadas(x.listadoTotalBalanzadas) : this.initListadoTotalBalanzadas(),
      
      material_nombre: x?.material_id ? this.getDescripcionCortaMaterial(x.material_id) : "",
      bodega_nombre: x?.bodega_id ? this.getNombreBodega(x.bodega_id) : "",

      seleccionado: false,
      totalProducto: 0,
    });
  }

  initBalanzas8(x: Balanzas = null) {
    return this.formBuilder.group({
      bodega_id: x?.bodega_id ?? 0,
      cerrado: x?.cerrado ?? false,
      corteManual: x?.corteManual ?? false,
      fecha_Corte: x?.fecha_Corte ?? '',
      fecha_Inicio: x?.fecha_Inicio ?? '',
      id: x.id ?? 0,
      kg: x?.kg ?? 0,
      material_id: x?.material_id ?? 0,
      moduloDeCarga_id: x?.moduloDeCarga_id ?? 0,
      motivosFallasBalanza_id: x?.motivosFallasBalanza_id ?? 0,
      motivosFallasBalanza_id_Nueva: x?.motivosFallasBalanza_id_Nueva ?? 0,
      numeroBalanza: x?.numeroBalanza ?? "",
      observaciones: x?.observaciones ?? "",
      observaciones_Nueva: x?.observaciones_Nueva ?? "",
      tn: x?.tn ?? 0,
      
      fechaHora_Corte: x?.fecha_Corte ? this.funcionesGeneralesService.getFechaHora(new Date(x.fecha_Corte)) : "",
      fechaHora_Inicio: x?.fecha_Inicio ? this.funcionesGeneralesService.getFechaHora(new Date(x.fecha_Inicio)) : "",

      fecha_Corte_Inicial: x?.fecha_Corte ? this.getDia(x.fecha_Corte, 'EN') : '',
      fecha_Corte_InicialHTML: x?.fecha_Corte ? this.getDia(x.fecha_Corte, 'ES') : '',
      fecha_Inicio_Inicial: x?.fecha_Inicio ? this.getDia(x.fecha_Inicio, 'EN') : '',
      fecha_Inicio_InicialHTML: x?.fecha_Inicio ? this.getDia(x.fecha_Inicio, 'ES') : '',
      hora_Corte_Inicial: x?.fecha_Corte ? this.getHora(x.fecha_Corte) : '',
      hora_Inicio_Inicial: x?.fecha_Inicio ? this.getHora(x.fecha_Inicio) : '',

      fecha_Corte_Nueva: x?.fecha_Corte ? this.getDia(x.fecha_Corte, 'EN') : '',
      fecha_Inicio_Nueva: x?.fecha_Inicio ? this.getDia(x.fecha_Inicio, 'EN') : '',
      hora_Corte_Nueva: x?.fecha_Corte ? this.getHora(x.fecha_Corte) : '',
      hora_Inicio_Nueva: x?.fecha_Inicio ? this.getHora(x.fecha_Inicio) : '',

      listadoTotalBalanzadas: x?.listadoTotalBalanzadas ? 
        this.initListadoTotalBalanzadas(x.listadoTotalBalanzadas) : this.initListadoTotalBalanzadas(),
      
      material_nombre: x?.material_id ? this.getDescripcionCortaMaterial(x.material_id) : "",
      bodega_nombre: x?.bodega_id ? this.getNombreBodega(x.bodega_id) : "",

      seleccionado: false,
      totalProducto: 0,
    });
  }

  initListadoTotalBalanzadas(x: ListadoTotalBalanzadas = null){
    if(!x){
      return this.formBuilder.group({
        motivosFallasBalanza: "",
        motivosFallasBalanza_Nueva: "",
        bodegaCorteManual: "",
        materialCorteManual: "",
      })
    }else{
      return this.formBuilder.group({
        motivosFallasBalanza: x?.motivosFallasBalanza ?? "",
        motivosFallasBalanza_Nueva: x?.motivosFallasBalanza_Nueva ?? "",
        bodegaCorteManual: x?.bodegaCorteManual ?? "",
        materialCorteManual: x?.materialCorteManual ?? "",
      })
    }
  }

  getDia(fecha: Date, formato: string = 'ES'): string{
    let date1 = fecha.toString().substr(0, 10);
    let aa = date1.toString().substr(0, 4);
    let mm = date1.toString().substr(5, 2);
    let dd = date1.toString().substr(8, 2);
    let date = ``;

    if( formato == 'EN' ){
      date = `${aa}-${mm}-${dd}`;
    } else {
      date = `${dd}-${mm}-${aa}`;
    }

    return date;
  }

  getDiaES(fecha: string, formato: string = 'ES'): string{
    let aa = fecha.substr(0, 4);
    let mm = fecha.substr(5, 2);
    let dd = fecha.substr(8, 2);
    let date = ``;

    if( formato == 'EN' ){
      date = `${aa}-${mm}-${dd}`;
    } else {
      date = `${dd}-${mm}-${aa}`;
    }

    return date;
  }

  getHora( fecha: Date ): string{
    let hour = fecha.toString().substr(11, 5);
    return hour;
  }

  getDescripcionCortaMaterial(materialId: number): string{
    if (!materialId) return '';

    let materialesPuerto = this.materialesPuerto.find( x => x.id == materialId );
    // TODO: La siguiente linea es para cuando el id del material del corte no está en plano de carga
    let descripcionCorta = materialesPuerto?.descripcionCorta ? materialesPuerto.descripcionCorta : '';
    return descripcionCorta;
  }

  getNombreBodega(bodega_id: number): string{
    if (!bodega_id) return '';
    
    let { nombre } = this.bodegas.find( x => x.id == bodega_id );
    return nombre;
  }

  getPorcentajeCarga(pesoNeto: number = 0, pesoProgramado: number = 0): number{
    let porcentajeCarga = pesoNeto * 100 / pesoProgramado;
    return porcentajeCarga;
  }

  obtenerBalanzadasEnVivo() {
    this.parametrosService.consola(`vapor: `,this.vaporId);
    this.parametrosService.consola(`moduloDeCarga: `,this.moduloDeCarga_Id);

    this.balanzas78Service.sendDataBalanzada7
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( blzas7 => {
        
        this.balanzas7.clear();
        this.balanzas7.reset();

        if(blzas7.length>0){
          let cortes7 = blzas7.map( b => {
            let motivo = this.motivosBalanzas78.find( m => m.id == b.motivosFallasBalanza_id );
            let prop = {
              ...b,
              listadoTotalBalanzadas: {
                motivosFallasBalanza: motivo
              }
            }
            return prop;
          });

         // this.startBalanza7 = `${this.getDia( blzas7[0].fecha_Inicio )} ${this.getHora( blzas7[0].fecha_Inicio )}`;
          let blzaConStartBalanza7 = blzas7.reduce( (blzas71, blzas72) => { return blzas71.fecha_Inicio < blzas72.fecha_Inicio ? blzas71 : blzas72; });
          this.startBalanza7 = `${this.getDia( blzaConStartBalanza7.fecha_Inicio )} ${this.getHora( blzaConStartBalanza7.fecha_Inicio )}`;

          this.parametrosService.consola(`---- CORTES 7: ----: `,cortes7);
          
          this.actualizarBalanzadas7(cortes7);
        } else {
          let cortes7 = [];
          this.actualizarBalanzadas7(cortes7);
        }
      } );

    this.balanzas78Service.sendDataBalanzada8
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( blzas8 => {

        this.balanzas8.clear();
        this.balanzas8.reset();

        if(blzas8.length>0){
          let cortes8 = blzas8.map( b => {
            let motivo = this.motivosBalanzas78.find( m => m.id == b.motivosFallasBalanza_id );
            let prop = {
              ...b,
              listadoTotalBalanzadas: {
                motivosFallasBalanza: motivo
              }
            }
            return prop;
          });

        //  this.startBalanza8 = `${this.getDia( blzas8[0].fecha_Inicio )} ${this.getHora( blzas8[0].fecha_Inicio )}`;
        let blzaConStartBalanza8 = blzas8.reduce( (blzas81, blzas82) => { return blzas81.fecha_Inicio < blzas82.fecha_Inicio ? blzas81 : blzas82; });
        this.startBalanza8 = `${this.getDia( blzaConStartBalanza8.fecha_Inicio )} ${this.getHora( blzaConStartBalanza8.fecha_Inicio )}`;

          this.parametrosService.consola(`---- CORTES 8: ----: `,cortes8);

          this.actualizarBalanzadas8(cortes8);
        } else {
          let cortes8 = [];
          this.actualizarBalanzadas8(cortes8);
        }
      } );
  }

  actualizarBalanzadas8(balanzada: Balanzas[]) {
    this.listadoBalanza8 = [];
    this.listadoBalanza8.push(...balanzada); // solo se usa para verificar nombre de buque
    
    this.balanzas8.clear();
    
    balanzada.forEach(x => this.balanzas8.push(this.initBalanzas8(x)) );
    
    if (balanzada)
        this.balanzas78Service.setBalanzadaAgrupada8(this.obtenerBalanzas8());

    // Productos y toneladas, agrupado por producto
    // let balanzadasDataOK = this.balanzas8.value.filter( x => x.material_nombre != '' && x.tn > 0 );
    // let balanzadasDataOK = this.balanzas8.value.filter( x => x.material_id > 0 && x.tn > 0 && x.bodega_id > 0 );
    let balanzadasDataOK = this.balanzas8.value.filter( x => x.material_id > 0 && x.tn > 0);
    this.resultado8 = this.agruparProductos(balanzadasDataOK);
    // this.totalTnBodegas8 = this.agruparBodegas(balanzadasDataOK);

    // this.verificarNombresBuque();
    this.parametrosService.consola(`---- FORM BAL8: ----: `,this.balanzas8.value);
  }

  actualizarBalanzadas7(balanzada: Balanzas[]) {
    this.listadoBalanza7 = [];
    this.listadoBalanza7.push(...balanzada);

    this.balanzas7.clear();
    
    balanzada.forEach(x => this.balanzas7.push(this.initBalanzas7(x)) );

    if (balanzada)
      this.balanzas78Service.setBalanzadaAgrupada7(this.obtenerBalanzas7());

    // Productos y toneladas, agrupado por producto
    let balanzadasDataOK = this.balanzas7.value.filter( x => x.material_id > 0 && x.tn > 0);
    this.resultado7 = this.agruparProductos(balanzadasDataOK);
    // this.totalTnBodegas7 = this.agruparBodegas(balanzadasDataOK);

    // this.verificarNombresBuque();
    this.parametrosService.consola(`---- FORM BAL7: ----: `,this.balanzas7.value);
  }

  agruparProductos(balanza: any): TotToneladas[] {
    let resumen = balanza.reduce((p, c) => { // <-- primero agrupamos 
      p[c.material_nombre] = (p[c.material_nombre] || 0) + c.tn;
      return p;
    }, {});

    return Object.keys(resumen).map(e => { // <-- después transformamos el formato
      const o: any = {};
      o.material_nombre = e;
      o.tn = resumen[e];
      return o;
    });
  }

  agruparBodegas(balanza: any): TotToneladas[] {
    let resumen = balanza.reduce((p, c) => { // <-- primero agrupamos 
      p[c.bodega_nombre] = (p[c.bodega_nombre] || 0) + c.tn;
      return p;
    }, {});

    return Object.keys(resumen).map(e => { // <-- después transformamos el formato
      const o: any = {};
      o.bodega_nombre = e;
      o.tn = resumen[e];
      return o;
    });
  }

  // verificarNombresBuque() {
  //   let balanza7Diferente = this.listadoBalanza7.find(x => x.nombreBuque != this.embarque.nombreBuque);
  //   let balanza8Diferente = this.listadoBalanza8.find(x => x.nombreBuque != this.embarque.nombreBuque);

  //   if (balanza7Diferente) this.balanza7DiferenteNombre = true;
  //   if (balanza8Diferente) this.balanza8DiferenteNombre = true;
  // }

  verificaCamposCompletos() {
    let balanza7Incompleta = this.balanzas7.value.find(x => x.toneladas < 1000 && (x.listadoTotalBalanzadas.motivosFallasBalanza == null || x.listadoTotalBalanzadas.observaciones == '') && x.id != 0);
    let balanza8Incompleta = this.balanzas8.value.find(x => x.toneladas < 1000 && (x.listadoTotalBalanzadas.motivosFallasBalanza == null || x.listadoTotalBalanzadas.observaciones == '') && x.id != 0);

    this.balanzasIncompletas = balanza7Incompleta != undefined || balanza8Incompleta != undefined ? true : false;
  }

  get balanzadas8FormArray(): FormArray {
    return this.balanzas8.get("balanzadas") as FormArray;
  }

  get balanzas7(): FormArray {
    return this.balanza7Form.get("balanzas7") as FormArray;
  }
  get balanzas8(): FormArray {
    return this.balanza8Form.get("balanzas8") as FormArray;
  }

  obtenerBalanzas7(): Balanzas[] {
    return this.balanza7Form.getRawValue().balanzas7;
  }
  obtenerBalanzas8(): Balanzas[] {
    return this.balanza8Form.getRawValue().balanzas8;
  }

  // obtenerBalanzadas78(): ListadoTotalBalanzadasBack[]{
  //   let listadoTotalBalanzadasBack: ListadoTotalBalanzadasBack[] = [];

  //   let balanzadas7 = this.obtenerBalanzas7().filter( x => x.observaciones !== "" );
  //   let balanzadas8 = this.obtenerBalanzas8().filter( x => x.observaciones !== "" );
  //   // let balanzadas7 = this.obtenerBalanzas7().filter( x => x.listadoTotalBalanzadas.observaciones !== "" );
  //   // let balanzadas8 = this.obtenerBalanzas8().filter( x => x.listadoTotalBalanzadas.observaciones !== "" );
  //   let balanzasEmbarque = balanzadas7.concat(balanzadas8);

  //   balanzasEmbarque.forEach( blzdaAgrupada => {
  //     let blzdaParaBack = this.generarObjetoParaGuardadoBack( blzdaAgrupada );
  //     listadoTotalBalanzadasBack.push(blzdaParaBack);
  //   } );

  //   return listadoTotalBalanzadasBack;
  // }

  compareMotivosBalanzas(c1: MotivosFallasBalanza, c2: MotivosFallasBalanza) {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  guardarModalCorteManual( balanzaCorteManual: number, modal: any ){
    let objetoNuevo;
    let cortes = [];
    let bc = this.corteManualForm.value;
    // console.log('this.corteManualForm.value: ', this.corteManualForm.value);
    let fechaHoraInicioInicial1 = new Date(bc.fecha_Inicio_Inicial+' '+bc.hora_Inicio_Inicial);
    let fechaHoraInicioInicial2 = fechaHoraInicioInicial1.getTime();
    let fechaHoraCorteInicial1 = new Date(bc.fecha_Corte_Inicial+' '+bc.hora_Corte_Inicial);
    let fechaHoraCorteInicial2 = fechaHoraCorteInicial1.getTime();
    if( bc.observaciones == '' || !bc.listadoTotalBalanzadas.motivosFallasBalanza.id || bc.fecha_Inicio_Inicial == '' ||
        bc.hora_Inicio_Inicial == '' || bc.fecha_Corte_Inicial == '' || bc.hora_Corte_Inicial == '' ){
        // !bc.listadoTotalBalanzadas.materialCorteManual.id || !bc.listadoTotalBalanzadas.bodegaCorteManual.id
      this.mensajeGenerico('Por favor, completar todos los datos.');
      return;
    }
    if( fechaHoraInicioInicial2 > fechaHoraCorteInicial2 ){
      this.mensajeGenerico('La fecha-hora de inicio es menor a la fecha-hora de corte.');
      return;
    }
    objetoNuevo = {
      ...this.corteManualForm.value,
      bodega_id: bc.listadoTotalBalanzadas.bodegaCorteManual.id,
      fecha_Corte: bc.fecha_Corte_Inicial + ' ' + bc.hora_Corte_Inicial,
      fecha_Inicio: bc.fecha_Inicio_Inicial + ' ' + bc.hora_Inicio_Inicial,
      id: 0,
      material_id: bc.listadoTotalBalanzadas.materialCorteManual.id,
      moduloDeCarga_id: this.moduloDeCarga_Id,
      motivosFallasBalanza_id: bc.listadoTotalBalanzadas.motivosFallasBalanza.id,
      numeroBalanza: balanzaCorteManual,
      listadoTotalBalanzadas: {
        motivosFallasBalanza: bc.listadoTotalBalanzadas.motivosFallasBalanza,
        bodegaCorteManual: bc.listadoTotalBalanzadas.bodegaCorteManual,
        materialCorteManual: bc.listadoTotalBalanzadas.materialCorteManual,
      },
      observaciones: bc.observaciones,
    }
    if(balanzaCorteManual == 7){
      this.balanzas7.push( this.initBalanzas7( objetoNuevo ) )
    }else{
      this.balanzas8.push( this.initBalanzas8( objetoNuevo ) )
    }
    cortes.push(objetoNuevo);
    this._balanzaService.guardarBalanzaCorte( cortes )
        .subscribe( res => this.balanzas78Service.setEmbarqueBalanza(this.moduloDeCarga_Id) );
    this.initCorteManualForm();
    this._modalService.dismissAll(modal);
  }

  guardarModal(index: number, numeroBalanza: number, modal: any) {
    let balanza = 'balanzas' + numeroBalanza.toString();
    let balanzadas = this[balanza].value.filter( b => b.seleccionado);
    let cortes = [];
    let bc = this[balanza].value[index];
    let lfecha_Inicio = '';
    let lfecha_Corte = '';
    let fecha_Inicio_Inicial = bc.fecha_Inicio_Inicial + ' ' + bc.hora_Inicio_Inicial;
    let fecha_Corte_Inicial = bc.fecha_Corte_Inicial + ' ' + bc.hora_Corte_Inicial;

    if( balanzadas.length === 0 ){ // Cuando no selecciona ninguno
      if( !bc.listadoTotalBalanzadas.motivosFallasBalanza.id ){
        this.mensajeGenerico('Falta el motivo del corte original');
        return;
      }
      if( bc.observaciones == '' ){
        this.mensajeGenerico('Falta la observación del corte original');
        return;
      }

      if(this.agregaCorte){
        if( !bc.listadoTotalBalanzadas.motivosFallasBalanza_Nueva.id ){
          this.mensajeGenerico('Falta el motivo del nuevo corte');
          return;
        }
        if( bc.observaciones_Nueva == '' ){
          this.mensajeGenerico('Falta la observación del nuevo corte');
          return;
        }
        if( bc.fecha_Inicio_Inicial == bc.fecha_Inicio_Nueva && bc.hora_Inicio_Inicial == bc.hora_Inicio_Nueva &&
          bc.fecha_Corte_Inicial == bc.fecha_Corte_Nueva && bc.hora_Corte_Inicial == bc.hora_Corte_Nueva ){
          this.mensajeGenerico('La fecha y hora del Corte nuevo es igual a la fecha y hora del original.');
          return;
        }

        let objetoNuevo;
        lfecha_Inicio = bc.fecha_Inicio_Nueva + ' ' + bc.hora_Inicio_Nueva;
        lfecha_Corte = bc.fecha_Corte_Nueva + ' ' + bc.hora_Corte_Nueva;

        let fechaHoraInicioInicial1 = new Date(bc.fecha_Inicio_Inicial+' '+bc.hora_Inicio_Inicial);
        let fechaHoraInicioInicial2 = fechaHoraInicioInicial1.getTime();
        let fechaHoraCorteInicial1 = new Date(bc.fecha_Corte_Inicial+' '+bc.hora_Corte_Inicial);
        let fechaHoraCorteInicial2 = fechaHoraCorteInicial1.getTime();
        let fechaHoraInicioNueva1 = new Date(bc.fecha_Inicio_Nueva+' '+bc.hora_Inicio_Nueva);
        let fechaHoraInicioNueva2 = fechaHoraInicioNueva1.getTime();
        let fechaHoraCorteNueva1 = new Date(bc.fecha_Corte_Nueva+' '+bc.hora_Corte_Nueva);
        let fechaHoraCorteNueva2 = fechaHoraCorteNueva1.getTime();

        if( fechaHoraInicioNueva2 != fechaHoraInicioInicial2 && fechaHoraCorteNueva2 != fechaHoraCorteInicial2 ){
          this.mensajeGenerico('Para el nuevo corte solo debe modificar la fecha-hora de inicio del corte original o la fecha-hora de corte del corte original.');
          return;
        }

        if( fechaHoraInicioInicial2 <= fechaHoraInicioNueva2 && fechaHoraInicioNueva2 <= fechaHoraCorteInicial2 && 
              fechaHoraInicioInicial2 <= fechaHoraCorteNueva2 && fechaHoraCorteNueva2 <= fechaHoraCorteInicial2 && 
              fechaHoraInicioNueva2 < fechaHoraCorteNueva2 ){

          if( fechaHoraInicioNueva2 == fechaHoraInicioInicial2 ){
            // console.log('La nueva FHi será la fechaHoraCorteNueva2');
            fecha_Inicio_Inicial = bc.fecha_Corte_Nueva+' '+bc.hora_Corte_Nueva;
            fecha_Corte_Inicial = bc.fecha_Corte_Inicial+' '+bc.hora_Corte_Inicial;

            objetoNuevo = {
              ...this[balanza].controls[index].value,
              fecha_Inicio: lfecha_Inicio,
              fecha_Corte: lfecha_Corte,
              id: 0,
              listadoTotalBalanzadas: {
                motivosFallasBalanza_Nueva: bc.listadoTotalBalanzadas.motivosFallasBalanza_Nueva
              },
              motivosFallasBalanza_id: bc.listadoTotalBalanzadas.motivosFallasBalanza_Nueva.id,
              observaciones: bc.observaciones_Nueva
            }
          }

          if( fechaHoraCorteNueva2 == fechaHoraCorteInicial2 ){
            // console.log('La nueva FHc será la fechaHoraInicioNueva2');
            fecha_Inicio_Inicial = bc.fecha_Inicio_Inicial+' '+bc.hora_Inicio_Inicial;
            fecha_Corte_Inicial = bc.fecha_Inicio_Nueva+' '+bc.hora_Inicio_Nueva;

            objetoNuevo = {
              ...this[balanza].controls[index].value,
              fecha_Inicio: lfecha_Inicio,
              fecha_Corte: lfecha_Corte,
              id: 0,
              motivosFallasBalanza_id: bc.listadoTotalBalanzadas.motivosFallasBalanza_Nueva.id,
              listadoTotalBalanzadas: {
                motivosFallasBalanza_Nueva: bc.listadoTotalBalanzadas.motivosFallasBalanza_Nueva
              },
              observaciones: bc.observaciones_Nueva,
            }
          }

          if(numeroBalanza == 7){
            this.balanzas7.push( this.initBalanzas7( objetoNuevo ) )
          }else{
            this.balanzas8.push( this.initBalanzas8( objetoNuevo ) )
          }

          cortes.push(objetoNuevo);
          // this._balanzaService.guardarBalanzaCorte( cortes )
          //   .subscribe( res => console.log('se guardo correctamente') );
        } else {
          this.mensajeGenerico('La fecha y hora del nuevo Inicio y/o Corte quedó fuera del rango que está modificando.');
          return;
        }
      }

      this[balanza].controls[index].patchValue({
        fecha_Inicio: fecha_Inicio_Inicial,
        fecha_Corte: fecha_Corte_Inicial,
        listadoTotalBalanzadas: {
          motivosFallasBalanza: bc.listadoTotalBalanzadas.motivosFallasBalanza
        },
        motivosFallasBalanza_id: bc.listadoTotalBalanzadas.motivosFallasBalanza.id,
        observaciones: bc.observaciones,
      });

      let objetoListadoTotalBalanzadas = this.generarObjetoParaGuardado( this[balanza].controls[index].controls );
      // cortes = [];
      cortes.push(objetoListadoTotalBalanzadas);

      this._balanzaService.guardarBalanzaCorte( cortes )
        .subscribe( res => this.balanzas78Service.setEmbarqueBalanza(this.moduloDeCarga_Id) );

    } else {
      console.log('NO DEBERÍA PASAR POR ACÁ PORQUE NO SE ESTÁ IMPLEMENTANDO.');

      // for (let i = 0; i < this[balanza].length; i++) {
      //   if (this[balanza].value[i].seleccionado) {
      //     this[balanza].controls[i].patchValue({
      //       motivosFallasBalanza_id: bc.listadoTotalBalanzadas.motivosFallasBalanza.id,
      //       listadoTotalBalanzadas: {
      //         motivosFallasBalanza: bc.listadoTotalBalanzadas.motivosFallasBalanza
      //       },
      //       observaciones: bc.observaciones,
      //       hora_Corte: bc.hora_Corte,
      //       hora_Inicio: bc.hora_Inicio
      //     });

      //     let objetoListadoTotalBalanzadas = this.generarObjetoParaGuardado( this[balanza].controls[i].controls );
      //     cortes.push(objetoListadoTotalBalanzadas);

      //     this._balanzaService.guardarBalanzaCorte( cortes )
      //       .subscribe(res => this.balanzas78Service.setEmbarqueBalanza(this.moduloDeCarga_Id) );
      //   }
      // }
    }
    this.agregaCorte = false;

    this._modalService.dismissAll(modal);
  }

  mensajeGenerico(text: string){
    this.confirmationDialogService.confirm("Atención!", text, 'Aceptar', '', null, null, Tipoalerta.Success)
      .then( (confirmed) => {
        if (confirmed) console.log('mensaje genérico de aviso');
      })
      .catch(() => {
        console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)');
      });
  }

  eliminarCorteManual( index: number, numeroBalanza: number, modal ){
    let balanza = 'balanzas' + numeroBalanza.toString();
    let idCorteManual = this[balanza].value[index].id;

    this.confirmationDialogService.confirm("Atención!", "Seguro desea eliminar el Corte Manual?", 'Si', 'No', null, null, Tipoalerta.Success)
      .then( (confirmed) => {
        if (confirmed) {
          this.agregaCorte = false;
          this._modalService.dismissAll(modal);
          this._balanzaService.eliminarBalanzaCorte( idCorteManual )
            .subscribe( res => {
              this[balanza].removeAt(index);
              this.balanzas78Service.setEmbarqueBalanza(this.moduloDeCarga_Id);
            } );
        } else {
          this.balanzas78Service.setEmbarqueBalanza(this.moduloDeCarga_Id);
        }
      })
      .catch(() => {
        console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)');
        this.agregaCorte = false;
      });
  }

  generarObjetoParaGuardado( balanzadasAgrupadas: Balanzas ): Balanzas { // para modal

    let listadoTotalBalanzadas: Balanzas = {
      "bodega_id": balanzadasAgrupadas.bodega_id['value'],
      "cerrado": balanzadasAgrupadas.cerrado['value'],
      "corteManual": balanzadasAgrupadas.corteManual['value'],
      "fecha_Corte": balanzadasAgrupadas.fecha_Corte['value'],
      "fecha_Inicio": balanzadasAgrupadas.fecha_Inicio['value'],
      "id": balanzadasAgrupadas.id['value'],
      "kg": balanzadasAgrupadas.kg['value'],
      "material_id": balanzadasAgrupadas.material_id['value'],
      "moduloDeCarga_id": balanzadasAgrupadas.moduloDeCarga_id['value'],
      "motivosFallasBalanza_id": balanzadasAgrupadas.motivosFallasBalanza_id['value'],
      "numeroBalanza": balanzadasAgrupadas.numeroBalanza['value'],
      "observaciones": balanzadasAgrupadas.observaciones['value'],
      "tn": balanzadasAgrupadas.tn['value'],
    };
    
    return listadoTotalBalanzadas;
  }

  // seleccionarTodo(numeroBalanza: number) {
  //   let balanza = 'balanzas' + numeroBalanza.toString();
  //   let seleccionado = 'seleccionado' + numeroBalanza.toString();

  //   this[seleccionado] = !this[seleccionado];

  //   for (let i = 0; i < this[balanza].length; i++) {
  //     if (this[balanza].value[i].tn < 1000) {
  //       this[balanza].controls[i].patchValue({ seleccionado: this[seleccionado] });
  //     }
  //   }
  // }

  generarCorte() {
    var titulo = "Atención!";
    var text = "Seguro desea generar un Corte?";
    var button1 = 'Si';
    var button2 = 'No';
    this.confirmationDialogService.confirm(titulo, text, button1, button2, null, null, Tipoalerta.Success)
      .then( (confirmed) => {
        if (confirmed) {
          this.agregaCorte = true;
        } else {
          this.agregaCorte = false;
        }
      })
      .catch(() => {
        console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)');
        this.agregaCorte = false;
      });
  }

  openModalCorte(modal, corteManual?: boolean, balanzaCorteManual?: number) {
    this.esCorteManual = corteManual;
    this.balanzaCorteManual = balanzaCorteManual;
    this.agregaCorte = false;
    this.balanzas78Service.limpiarInterval();

    this.parametrosService.consola(`this.corteManualForm.value: `,this.corteManualForm.value);
    
    this._modalService.open(modal, { windowClass: 'window-modal-corte', backdropClass: 'modal-corte' }).result
    .then(() => {
      console.log('_modalService.open');
    })
    .catch((res) => { console.log(res) });
  }

  cerrarModal(){
    this.balanzas78Service.setEmbarqueBalanza(this.moduloDeCarga_Id);
  }

  terminarCargaExportar() {
    this.verificaCamposCompletos();
    // this.balanzasIncompletas = false; // Descomentar para probar el otro camino
    let texto = this.balanzasIncompletas ? "En las Balanzas hay campos incompletos. Para poder continuar, debe completarlos." :
      "Desea terminar la carga y exportar planillas?";

    this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Success)
      .then((confirmed) => {
        if (confirmed && !this.balanzasIncompletas) {
          this.modificarEstadoBuque('ControlCalidad');
          // Hasta que el pasaje a produccion de recibidores, pasar de Cargando → Post operativo (ticket 293)
          // this.modificarEstadoBuque('PostOperativo');
          this.exportarBalanzasAExcel();
        }
        else
          return;
      })
      // .catch( err => console.error(err),() => window.location.reload());
      .catch( err => {
        console.error(err);
        this.confirmationDialogService.confirm('¡Atención!', 'Se produjo un error al exportar la planilla.', 'Aceptar', '', null, null, Tipoalerta.Error)
          .then((confirmed) => {
            if (confirmed) 
              console.log('Se produjo un error al exportar la planilla');
            else
              return;
          });
      });
  }

  modificarEstadoBuque(estado: string){
    try {
      let estadoBuque = this.estadosBuque.find( e => e.descripcion.includes(estado));
      this.embarqueService.actualizarEstadoBuque(this.embarqueId, estadoBuque.id).subscribe( res => console.log(res) );
    } catch (e) {
      console.log(e);
      console.log("Error al modificarEstadoBuque");
    }
  }

  exportarBalanzasAExcel(): void {
    try {
      let header = ["Balanza", "Fecha", "Hora", "Kilos", "Toneladas", "Producto", "Bodega", "Motivo", "Observaciones"]
      //create new excel work book
      let workbook = new Workbook();

      // ---------- inicio BALANZA 7 ----------
      let propiedadesDeBalanza7 = this.procesarPropiedadesBalanza('7');
      //add name to sheet
      let worksheet = workbook.addWorksheet("Balanza-7");
      //add column name
      let headerRow = worksheet.addRow(header);

      for (let x1 of propiedadesDeBalanza7) {
        let x2 = Object.keys(x1);
        let temp = []
        for (let y of x2) {
          temp.push(x1[y])
        }
        worksheet.addRow(temp)
      }
      // ---------- fin BALANZA 7 ----------

      // ---------- inicio BALANZA 8 ----------
      let propiedadesDeBalanza8 = this.procesarPropiedadesBalanza('8');
      let worksheet8 = workbook.addWorksheet("Balanza-8");
      let headerRow8 = worksheet8.addRow(header);

      for (let x1 of propiedadesDeBalanza8) {
        let x2 = Object.keys(x1);
        let temp = []
        for (let y of x2) {
          temp.push(x1[y])
        }
        worksheet8.addRow(temp)
      }
      // ---------- fin BALANZA 8 ----------

      //set downloadable file name
      let fname = "Balanzas_7y8"

      //add data and file name and download
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        // fs.saveAs(blob, fname + '-' + new Date().valueOf() + '.xlsx');
        saveAs(blob, fname + '-' + new Date().valueOf() + '.xlsx');
      });
    } catch (e) {
      console.log(e);
      // console.log("Error al exportar Planillas");
      this.confirmationDialogService.confirm('¡Atención!', 'Se produjo un error al exportar la planilla.', 'Aceptar', '', null, null, Tipoalerta.Error)
        .then((confirmed) => {
          if (confirmed) 
            console.log('Se produjo un error al exportar la planilla');
          else
            return;
        });
    }
  }

  procesarPropiedadesBalanza(blza: string): Object[] {
    let balanza = 'balanzas' + blza;

    let propiedadesDeBalanzas = this[balanza].value.map(b => {
      let siglaNombreMotivo = '';
      if (b.listadoTotalBalanzadas.motivosFallasBalanza) {
        let { nombre, siglas } = b.listadoTotalBalanzadas.motivosFallasBalanza;
        siglaNombreMotivo = siglas + ' - ' + nombre;
      };

      let propiedades = {
        "balanza": b.numeroBalanza,
        "fecha": this.getDia(b.fecha_Corte, 'ES'),
        "hora": this.getHora(b.fecha_Corte),
        "kilos": b.kg,
        "toneladas": b.tn,
        "producto": this.getDescripcionCortaMaterial(b.material_id),
        "bodega": this.getNombreBodega(b.bodega_id),
        "motivo": siglaNombreMotivo,
        "observaciones": b.observaciones
      };
      return propiedades;
    });

    return propiedadesDeBalanzas;
  }

  ngOnDestroy() {
    this.balanzas78Service.limpiarInterval();
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
