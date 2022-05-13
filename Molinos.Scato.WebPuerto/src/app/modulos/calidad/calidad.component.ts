import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { InstanciaWorkflowPuerto } from '@ScatoModels/instancia-wokflow-puerto';
import { WorkflowService } from '@ScatoServicios/workflow.service';
import { ProcesoCalidadService } from '@ScatoServicios/procesoCalidad.service';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueNav } from '@ScatoModels/embarque-nav';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Balanzas78Service } from '@ScatoServicios/balanzas78.service';
import { Balanzas } from '@ScatoModels/balanzadas/balanza';
import { takeUntil } from 'rxjs/operators';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { ReciboDeBuque } from '@ScatoModels/recibo-buque';
import { PDFService } from '@ScatoServicios/pdf.service';


@Component({
  selector: 'app-calidad',
  templateUrl: './calidad.component.html',
  styleUrls: ['./calidad.component.css']
})
export class CalidadComponent implements OnInit, OnDestroy {
  mostrarSpinner: boolean = true;
  mostrarTabs: boolean = false;
  mostrarPlano: boolean = false;
  mostrarCargas: boolean = false;
  embarquesEnLineUp: EmbarqueNav[] = [];
  embarqueSelected: EmbarqueNav;
  unsubscribe: Subject<any>;
  errorMessage: boolean = false;
  reciboBuque: ReciboDeBuque;
  
  embarquesEnLineUpSinFiltrar: EmbarqueNav[];
  listadoEmbarques: InstanciaWorkflowPuerto[];

  buqueEnSanBenito: InstanciaWorkflowPuerto | undefined;
  buqueEnNoryon: InstanciaWorkflowPuerto | undefined;
  buqueEnVicentin: InstanciaWorkflowPuerto | undefined;
  buqueEnOtrosMuelles: InstanciaWorkflowPuerto | undefined;

  embarqueId: number;
  barquitos: InstanciaWorkflowPuerto[];
  vaporId: number = 0;
  materialesPuerto = [];
  startBalanza7: string = '';
  startBalanza8: string = '';
  resultados: Balanzas[] = [];
  embarque: EmbarqueNav;
  moduloDeCarga_Id: number = 0;

  constructor(
    private workflowService: WorkflowService,
    private _modalService: NgbModal,
    private procesoCalidadService: ProcesoCalidadService,
    private _procesoService: DatosEmbarquesProcesoService,
    private balanzas78Service: Balanzas78Service,
    private embarqueService: EmbarqueService,
    private _PDFService: PDFService
    ) {

    this.unsubscribe = new Subject();

    // TODO: lo nuevo para datos de balanzadas -----------------------------
    // this.embarque = this._procesoService.getEmbarqueSelected();
    // this.embarqueId = this._procesoService.getEmbarqueId();

    this.embarqueService.obtenerListadoMateriales().subscribe( mat => this.materialesPuerto = mat );
    this.moduloDeCarga_Id = this._procesoService.getModuloDeCargaId();

    this.procesoCalidadService.sendBuqueCambiaEstado.subscribe( res => {
      this.trabajoOrdenado();
      this.obtenerBalanzadasEnVivo();
      this.inicializarReciboBuque();
    });

    // this.workflowService.obtenerListado().subscribe((resp: any) => {
    //   this.barquitos = resp.find(x => x.embarque.id === this.embarqueId);
    //   this.vaporId = this.barquitos['embarque'].vapor.id;

    //   // Seteamos el vapor para que el Servicio comience a enviar las balanzadas.
    //   this.balanzas78Service.setEmbarqueBalanza(this.vaporId);
    // });
    // finTODO: lo nuevo para datos de balanzadas --------------------------
  }

  // ngAfterViewInit(): void {
  //   this.obtenerBalanzadasEnVivo();
  // }

  ngOnInit(): void {
    // this._procesoService.disposeData();
    this.embarque = this._procesoService.getEmbarqueSelected();
    // this.embarqueId = this._procesoService.getEmbarqueId();
    // this.subscribeEmbarques();
    
    // if( this.vaporId > 0 ){
      this.trabajoOrdenado();
      this.obtenerBalanzadasEnVivo();
    // }

    this.inicializarReciboBuque();
  }

  subscribeEmbarques(){
    try {
      this.workflowService.obtenerListado()
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((resp: any) => {
          this.barquitos = resp.find(x => x.embarque.id === this.embarqueId);
          this.vaporId = this.barquitos['embarque'].vapor.id;
          // Seteamos el vapor para que el Servicio comience a enviar las balanzadas.
          this.balanzas78Service.setEmbarqueBalanza(this.vaporId);
        });
    } catch (e) {
      console.log(e);
      console.log("Error en listarEmbarquesEnLineUp");
    }
  }

  trabajoOrdenado(){
    forkJoin({
      obtenerListado: this.workflowService.obtenerListado(),
      listarEmbarquesEnLineUp: this.workflowService.listarEmbarquesEnLineUp()
    })
    // .subscribe( (res: any) => {
    .subscribe( (res: {
                        obtenerListado: InstanciaWorkflowPuerto[], 
                        listarEmbarquesEnLineUp: EmbarqueNav[]
                      }) => {
      this.listadoEmbarques = res.obtenerListado;
      this.filtrarMuelles();
      
      this.embarquesEnLineUpSinFiltrar = res.listarEmbarquesEnLineUp;

      
      let embEnLineUp = this.embarquesEnLineUpSinFiltrar.find(m => m.id == this.buqueEnSanBenito?.embarque.id);
      if(embEnLineUp) this.embarquesEnLineUp.push(embEnLineUp);

      this._procesoService.setEmbarquesList(this.embarquesEnLineUp);
      this.embarque = this._procesoService.getEmbarqueSelected();
      this.embarqueId = this._procesoService.getEmbarqueId();


      if(this.embarqueId){
        // this.barquitos = res.obtenerListado.find(x => x.embarque.id === this.embarqueId);
        res.obtenerListado.forEach( x => x.embarque.id === this.embarqueId ?? this.barquitos.push(x) );
        if(this.barquitos){
          // this.vaporId = this.barquitos['embarque'].vapor.id;
          this.vaporId = this.barquitos[0]['embarque'].vapor.id;
          // Seteamos el vapor para que el Servicio comience a enviar las balanzadas.        
          // TODO: Evangelino - Se asigna el Modulo de carga para cargar los ritmo de carga
          // const selLineUp = this.barquitos['lineUp'];
          const selLineUp = this.barquitos[0].lineUp;
          const selModuloDeCarga = selLineUp['moduloDeCarga'];
          this.moduloDeCarga_Id = selModuloDeCarga.id;
          this.balanzas78Service.setEmbarqueBalanza(this.moduloDeCarga_Id);
        }
      }

      this.mostrarTabs = true;
    });
    
  }

  filtrarMuelles() {
    // Hasta que el pasaje a produccion de recibidores, pasar de Cargando → Post operativo (ticket 293)
    // let idEstadoCargando = 3; // ControlCalidad
    let idEstadoCargando = 4; // PostOperativo

    // Filtro los buques de cada muelle. Buque que esta cargando en el muelle
    this.buqueEnSanBenito = this.listadoEmbarques ? this.listadoEmbarques
      .filter(i => i.embarque.sanBenito || (!i.embarque.vicentin && !i.embarque.otrosMuelles && !i.embarque.noryon))
      .find(m => m.embarque.estadoBuque?.id == idEstadoCargando) : undefined;
    this.buqueEnNoryon = this.listadoEmbarques ? this.listadoEmbarques.filter(i => i.embarque.noryon)
      .find(m => m.embarque.estadoBuque?.id == idEstadoCargando) : undefined;
    this.buqueEnVicentin = this.listadoEmbarques ? this.listadoEmbarques.filter(i => i.embarque.vicentin)
      .find(m => m.embarque.estadoBuque?.id == idEstadoCargando) : undefined;
    this.buqueEnOtrosMuelles = this.listadoEmbarques ? this.listadoEmbarques.filter(i => i.embarque.otrosMuelles)
      .find(m => m.embarque.estadoBuque?.id == idEstadoCargando) : undefined;

    this.procesoCalidadService.setSanBenito(this.buqueEnSanBenito);
    this.procesoCalidadService.setNoryoun(this.buqueEnNoryon);
    this.procesoCalidadService.setVicentin(this.buqueEnVicentin);
    this.procesoCalidadService.setOtrosMuelles(this.buqueEnOtrosMuelles);
  }

  obtenerBalanzadasEnVivo() {

    this.balanzas78Service.setBalanzadaAgrupada7(this.balanzas78Service.filtroBalanza7);
    this.balanzas78Service.setBalanzadaAgrupada8(this.balanzas78Service.filtroBalanza8);
    
    this.balanzas78Service.sendDataBalanzadaAgrupada7
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( blzas7 => {
        if(blzas7.length>0){
          this.startBalanza7 = ``;
          this.balanzas78Service.setBalanzadaAgrupada7(blzas7);
        }
      } );

    this.balanzas78Service.sendDataBalanzadaAgrupada8
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( blzas8 => {
        if(blzas8.length>0){
          this.startBalanza8 = ``;
          this.balanzas78Service.setBalanzadaAgrupada8(blzas8);
        }
      } );
  }

  getDate(fecha: Date): string{
    let fechaDate = new Date(fecha);
    let date = fechaDate.getDate()+"-"+fechaDate.getMonth()+"-"+fechaDate.getFullYear();
    return date;
  }

  getHour( fecha: Date ): string{
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

  showPlano(event: boolean) {
    this.embarqueSelected = this._procesoService.getEmbarqueSelected();
  
    setTimeout(() => {
      this.mostrarSpinner = false;
      this.mostrarPlano = event;
    }, 50);
  }

  showCargas(event) {
    this.mostrarCargas = event;
  }

  hideSpinner(event) {
    setTimeout(() => {
      this.mostrarSpinner = event;
    }, 50);
  }

  changeEmbarque() {
    this.mostrarCargas = false;
    this.mostrarSpinner = true;
    this.embarqueSelected = this._procesoService.getEmbarqueSelected();
  }

  inicializarReciboBuque(){
    this.reciboBuque = new ReciboDeBuque();
    var converter = require('number-to-words');
    this.reciboBuque.nombrePuertoOrigen = "San Lorenzo, ARGENTINA";
    // this.reciboBuque.fechaRecibo = new Date();
    this.reciboBuque.nombreVapor = "";
    this.reciboBuque.nombreEmpresaRemitente = "MOLINOS AGRO S.A";
    this.reciboBuque.nombrePuertoDestino = "";
    this.reciboBuque.cantidad = 0;
    this.reciboBuque.cantidadEnLetras = converter.toWords(this.reciboBuque.cantidad).toUpperCase();
    this.reciboBuque.estibadoEnBodega = "";
    this.reciboBuque.calidadYCantidadDesconocidas = "";
    this.reciboBuque.incluirParaImpresionDesconocida = true
    this.reciboBuque.incluirParaImpresionBodega = true
    this.reciboBuque.incluirParaImpresionDesconocida = true
  }

  onChangeCantidadEnLetras(cantidad: number){
    var converter = require('number-to-words');
     this.reciboBuque.cantidadEnLetras = converter.toWords(cantidad).toUpperCase();
    // let cantstr = cantidadLetras.toString();
    // this.reciboBuque.cantidadEnLetras = converter.toWords(cantidad);
  }

  openModalEmitirRecibo(modal: any) {
    this.errorMessage = false;
    this._modalService.open(modal, { size: 'lg'});
  }

  generarPDF(){
    this._PDFService.sendGenerarPDF.emit();
  }

  ngOnDestroy() {
    this.balanzas78Service.limpiarInterval();
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
