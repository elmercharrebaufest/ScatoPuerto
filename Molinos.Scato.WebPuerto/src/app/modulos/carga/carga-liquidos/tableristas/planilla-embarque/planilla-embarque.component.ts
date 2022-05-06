import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PlanillaDeEmbarque } from '@ScatoModels/planilla-de-embarque';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { TurnosService } from '@ScatoServicios/turnos.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Alert } from 'selenium-webdriver';
@Component({
  selector: 'app-planilla-embarque',
  templateUrl: './planilla-embarque.component.html',
  styleUrls: ['./planilla-embarque.component.css']
})
export class PlanillaEmbarqueComponent implements OnInit, AfterViewInit {
  lineasEmbarque: FormGroup;
  exportadores: any;
  bodegas: any[];
  lineas: any[];
  productos: any[];
  destinos: any[];
  partidas: any[];
  tanquesAbordo: any[];
  idModuloDeCarga: number;
  planillaDeEmbarque: PlanillaDeEmbarque[];
  mostrarbtnGuardar:boolean=true;
  constructor(
    private builder: FormBuilder,
    private turnosService: TurnosService,
    private moduloCargaService: ModuloDeCargaService,
    private confirmationDialogService: ConfirmationDialogService,
    private procesoService: DatosEmbarquesProcesoService
  ) {
    this.turnosService.sendExportadores.subscribe(res => this.exportadores = res);
    this.turnosService.sendBodega.subscribe(res => {
      this.bodegas = res;
      this.getProductos();
      this.getTanqueAbordo();
    });
  }

  ngAfterViewInit(): void {
  }
  ngOnInit(): void {
    this.newForm();
  }
  expandir()
  {
    document.getElementById('planillaEmbarque').className = "pb-5 collapse show";
  }

  desabilitarEmbarque()
  {
   
    this.mostrarbtnGuardar=false;
  }
  newForm() {
    this.lineas = this.procesoService.getModuloDeCarga().moduloDeCargaLineasDeEmbarque;
    
    // Evangelino Se considera exportadores unicos no duplicados
    //this.exportadores = this.turnosService.getExportadores().filter(e => e.exportador && e.cantidad);
    const exportadoresData = this.turnosService.getExportadores().filter(e => e.exportador && e.cantidad)
    const exportadorFiltro = exportadoresData.map(item => item.exportador);
    this.exportadores = [...new Map(exportadorFiltro.map(item => [item['nombre'], item])).values()];
/*
    const bodegasData = this.turnosService.getBodega();
    const bodegasFiltro = bodegasData.map(item => item.destino);

    //this.bodegas = [...new Map(bodegasFiltro.map(item => [item['nombre'], item])).values()];

    const productosFiltro = bodegasData.map(item => item.materialPuerto);
    this.productos = [...new Map(productosFiltro.map(item => [item['descripcionCorta'], item])).values()];
*/

    this.bodegas = this.turnosService.getBodega();
    //this.partidas = this.bodegas.map(item => ({bodegaParcel: item.bodegaParcel}));


    //antes de iniciar las lineas vacias me fijo cuantos registros hay de la DB.
    this.planillaDeEmbarque = this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeEmbarque;
    

    this.getProductos();
    this.getTanqueAbordo();
    this.idModuloDeCarga = this.procesoService.getModuloDeCargaId();
    this.lineasEmbarque = new FormGroup({
      linea:  this.builder.array([])
    });
    
    // this.planillaDeEmbarque = this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeEmbarque;

    //Si tengo items en la planilla de embarque los agrego a la tabla.
    if (this.planillaDeEmbarque){
      
      if (this.planillaDeEmbarque.length > 0){
        this.fillPlanillaDeEmbarque();
      }
      
      //Agrego registros restantes para llegar a 3 registros.
      for (let i = 0; i < (5- this.planillaDeEmbarque.length); i++) {
        this.getPlanillaDeEmbarque().push(this.initLinea());
      }
    }


    
  }

  fillPlanillaDeEmbarque(){
    this.planillaDeEmbarque.forEach((item: PlanillaDeEmbarque) => {
      this.getPlanillaDeEmbarque().push(this.initLinea(item));
    })
  }

  getPlanillaDeEmbarque() : FormArray {
    return this.lineasEmbarque.controls.linea as FormArray;
  }


  getProductos() {
    this.productos = new Array();
    this.destinos = new Array();
    this.bodegas.forEach(b => {
      if (b.destino && !this.destinos.find(d => d == b.destino.nombre)) 
        this.destinos.push(b.materialPuerto.descripcionCorta);

      if (b.materialPuerto && !this.productos.find(p => p == b.materialPuerto.descripcionCorta)) 
        this.productos.push(b.materialPuerto)
    })
  }

  initLinea(planilla?: PlanillaDeEmbarque) {
    var result= localStorage.getItem('desabilitar');
    return this.builder.group({

      id: {value: planilla?.id ? planilla.id :'0',  disabled: true},
      exportador: {value:planilla?.exportador ? planilla.exportador :'',  disabled:result=='true'?true:false},
      bodegaParcel: {value:planilla?.bodegaParcel ? planilla.bodegaParcel : '',  disabled:result=='true'?true:false},
      tanqueDeAbordo: { value: planilla?.tanqueDeAbordo ? planilla.tanqueDeAbordo : '', disabled: true },
      destino: { value: planilla?.destino ? planilla.destino : null, disabled: true },
      tk: { value:planilla?.tk ? planilla.tk : '',  disabled:result=='true'?false:false},
      tn: { value: planilla?.tn ? planilla.tn : null, disabled: true },
      materialPuerto: { value: planilla?.materialPuerto ? planilla.materialPuerto : null, disabled: true },
      fechaComienzoCarga: { value:planilla?.fechaComienzoCarga ? planilla.fechaComienzoCarga: '',disabled:result=='true'?true:false},
      fechaFinalizacionCarga: { value:planilla?.fechaFinalizacionCarga ?  planilla.fechaFinalizacionCarga: '',disabled:result=='true'?true:false},
      //fechaComienzoCarga: planilla?.fechaComienzoCarga ? planilla.fechaComienzoCarga.toString().split('T')[0] : '',
      //horaComienzoCarga: planilla?.horaComienzoCarga ? planilla.horaComienzoCarga : '',
      //fechaFinalizacionCarga: planilla?.fechaFinalizacionCarga ?  planilla.fechaFinalizacionCarga.toString().split('T')[0] : '',
      //horaFinalizacionCarga: planilla?.horaFinalizacionCarga ? planilla.horaFinalizacionCarga : ''
      //finalizo: planilla.fechaFinalizacionCarga? planilla.fechaFinalizacionCarga : ''
    })
  }

  compareLineaItem(c1: any, c2: any){
      return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  get linea(): FormArray {
    return this.lineasEmbarque.get('linea') as FormArray;
  }

  autoCompleteParcel(parcel, l: FormGroup) {   

    // Evangelino Se corrige el codigo para obtener por parcel los valores de tanque, destino, tn y producto(material)
    /*
    const parcelValue =  parcel.split(":");
    parcel = (parcelValue.length > 0) ? parcelValue[1] :  parcel;
    */
    let bodega = this.bodegas.find(b => b.bodegaParcel == parcel);
    l.controls.tanqueDeAbordo.setValue(bodega.tanqueDeAbordo);
    l.controls.destino.setValue(bodega.destino);
    l.controls.tn.setValue(bodega.cantidad);
    l.controls.materialPuerto.setValue(bodega.materialPuerto);

  }

  obtenerDatosPlanillaDeEmbarque(){
    return this.lineasEmbarque.getRawValue()['linea'].filter(x => x.materialPuerto != null && x.exportador != null && x.destino != null);;
  }

  getTanqueAbordo(){
    this.tanquesAbordo = new Array();
    this.bodegas.forEach(b => {
      if (this.tanquesAbordo.find(t => t == b.tanqueDeAbordo)) this.tanquesAbordo.push(b.tanqueDeAbordo);
    })
  }
  cargarPlanilla(){
    this.moduloCargaService.obtenerModuloDeCarga(this.idModuloDeCarga).subscribe(resp => {
      this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeEmbarque = resp.moduloDeCargaPlanillaDeEmbarque;
      this.planillaDeEmbarque = this.procesoService.getModuloDeCarga().moduloDeCargaPlanillaDeEmbarque;
      console.log('this.planillaDeEmbarque ini-->>>');
      console.log(this.planillaDeEmbarque);
        if (this.planillaDeEmbarque){
          this.lineasEmbarque = null;
          this.lineasEmbarque = new FormGroup({
            linea:  this.builder.array([])
          });

          if (this.planillaDeEmbarque.length > 0){
            this.fillPlanillaDeEmbarque();
          }
          
          //Agrego registros restantes para llegar a 3 registros.
          for (let i = 0; i < (5- this.planillaDeEmbarque.length); i++) {
            this.getPlanillaDeEmbarque().push(this.initLinea());
          }
        }
      console.log(resp);
    });
  }
  guardar() {      
      const planillaEmbarque = this.getPlanillaDeEmbarque().getRawValue().filter(x => x.materialPuerto > '' && x.exportador > '' && x.destino != null);
      console.log('this.planillaDeEmbarque fin-->>>');
      console.log(planillaEmbarque);
      
      this.moduloCargaService.guardarPlanillaDeEmbarque( planillaEmbarque, this.idModuloDeCarga).subscribe( 
        res => {
          console.log(res);
          const texto = "Se guardo la planilla de embarque correctamente";
          this.confirmationDialogService.confirm('¡Atención!', texto, 'Aceptar', '', null, null, Tipoalerta.Success);
      

          console.log('termino');
        }, 
        err => {
          console.log(err);
        }, 
        () => {
          this.cargarPlanilla();  
        });
  }
}