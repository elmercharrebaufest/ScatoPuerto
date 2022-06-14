import { AfterViewInit, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ReciboDeBuqueDetalles, ReciboDeBuque } from '@ScatoModels/reciboDeBuque';
import { ReciboBuqueService } from '@ScatoServicios/reciboBuque.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { ReciboSharingService } from '@ScatoServicios/recibo.shared.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';



@Component({
  selector: 'app-modal-recibo',
  templateUrl: './modal-recibo.component.html',
  styleUrls: ['./modal-recibo.component.css']
})
export class ModalReciboComponent implements OnInit, AfterViewInit {
  //#region variables
  reciboBuqueDetalles: ReciboDeBuqueDetalles;
  reciboBuque: ReciboDeBuque;
  reciboBuqueOjito:ReciboDeBuque;
  errorMessage: boolean = false;
  idEmbarque:number;
  nombreBuque:string;
  reciboDeBuqueForm: FormGroup;
  @Input() mostrarModal:boolean = false;
  @ViewChild('emitirRecibo', { read: TemplateRef }) ojitoRecibo:TemplateRef<any>;

  //#endregion

  //#region constructor
  constructor(
    private _reciboBuqueService: ReciboBuqueService,
    private _modalService: NgbModal,
    private _datosEmbarqueProcesoService: DatosEmbarquesProcesoService,
    private _embarqueService: EmbarqueService,
    private _reciboSharingService: ReciboSharingService,
    private formBuilder: FormBuilder,
    
  ) 
  { 
    this._reciboSharingService.getFiltroRecibos().pipe(finalize(() => {
    }))
    .subscribe(
      (data) => {this.reciboBuqueOjito = data;
        console.log(data);
        this.mostrarModalOjito();
    });
    

  }
  //#endregion
  ngOnInit(): void {
    this.initFormReciboDetalles();
    this.initObtenerEmbarque();
    
  }
  ngAfterViewInit(){
    this.mostrarModalOjito()
  }
  
  private initFormReciboDetalles() {
    var converter = require('number-to-words');
    this.reciboDeBuqueForm = this.formBuilder.group({
      exportador: ['MOLINOS AGRO S.A'],
      cantidad: [''],
      puertoDestino: [''],
      fechaRecibo: new Date(),
      puertoOrigen: ['San Lorenzo, ARGENTINA'],
      nombreBuque: {disabled:true},
      cantidadLetrasYClaseCarga: [''],
      estibadoEnBodega: [''],
      calidadYCantidadDesconocida: [''],
      fechaImpresion: [''],
      incluirImpresionDestino: [true],
      incluirImpresionCalidad: [true],
      incluirImpresionEstibado: [true],
    })
  }

  initObtenerEmbarque(){

    this.idEmbarque = this._datosEmbarqueProcesoService.getEmbarqueId();

    forkJoin([
      this._embarqueService.obtenerEmbarque(this.idEmbarque),
      this._reciboBuqueService.obtenerRecibos(this.idEmbarque)
    ]).subscribe(([res1]) => {
      this.nombreBuque = res1.nombreBuque;
      this.reciboDeBuqueForm.controls.nombreBuque.setValue(this.nombreBuque);
      });

  }

  onChangeCantidadEnLetras(cantidad: number){
    if(cantidad != null){
      var converter = require('number-to-words');
      this.reciboDeBuqueForm.controls.cantidadLetrasYClaseCarga.setValue(converter.toWords(cantidad).toUpperCase());
    }
    
  }

  mostrarModalOjito(){
    if(this.ojitoRecibo != undefined){
      if (this.mostrarModal){
        this._modalService.open(this.ojitoRecibo, { size: 'lg'});
        this.setModalOjito()

      }
    }
  }

  setModalOjito(){
    this.reciboDeBuqueForm.controls.puertoOrigen.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].puertoOrigen);
    this.reciboDeBuqueForm.controls.fechaRecibo.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].fechaRecibo);
    this.reciboDeBuqueForm.controls.nombreBuque.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].nombreBuque);
    this.reciboDeBuqueForm.controls.exportador.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].exportador);
    this.reciboDeBuqueForm.controls.puertoDestino.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].puertoDestino);
    this.reciboDeBuqueForm.controls.cantidad.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].cantidad);
    this.reciboDeBuqueForm.controls.cantidadLetrasYClaseCarga.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].cantidadLetrasYClaseCarga);
    this.reciboDeBuqueForm.controls.estibadoEnBodega.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].estibadoEnBodega);
    this.reciboDeBuqueForm.controls.calidadYCantidadDesconocida.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].calidadYCantidadDesconocida);
    this.reciboDeBuqueForm.controls.incluirImpresionDestino.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].incluirImpresionDestino);
    this.reciboDeBuqueForm.controls.incluirImpresionCalidad.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].incluirImpresionCalidad);
    this.reciboDeBuqueForm.controls.incluirImpresionEstibado.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].incluirImpresionEstibado);
    this.reciboDeBuqueForm.disable();
  }

  openModalEmitirRecibo(modal: any) {
    // this.errorMessage = false;
    this._modalService.open(modal, { size: 'lg'});
    
  }
  get recibos() : FormArray {
    return this.reciboDeBuqueForm.get("recibos") as FormArray;
  }
  guardarRecibo(){
    
    this.reciboBuqueDetalles = this.reciboDeBuqueForm.getRawValue();
    this.reciboBuque = new ReciboDeBuque();
    this.reciboBuque.emitio = 'pepito recibidor';
    this.reciboBuque.superviso = 'pepito sipervisor';
    this.reciboBuque.estado = "Aprobado";
    this.reciboBuque.fechaHoraImpresion = null;
    this.reciboBuque.reciboDeBuqueDetalles = [];
    this.reciboBuque.reciboDeBuqueDetalles.unshift(this.reciboBuqueDetalles);
    this._reciboBuqueService.guardarReciboDeBuque(this.idEmbarque, this.reciboBuque).subscribe(() => console.log('200 Ok'));
    
    // this._reciboBuqueService.obtenerRecibos(this.idEmbarque); 

  }
  // generarPDF(){
  //   this._reciboBuqueService.sendGenerarPDF.emit();
  // }

}
