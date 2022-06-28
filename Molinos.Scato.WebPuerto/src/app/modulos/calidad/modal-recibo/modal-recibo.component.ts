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
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Mail } from '@ScatoModels/mail';



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
  enviado: boolean;
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
    private _formBuilder: FormBuilder,
    private _confirmationDialogService: ConfirmationDialogService,    
  ) 
  { 
    
    this._reciboSharingService.getFiltroRecibos().subscribe((data) => {
      this.reciboBuqueOjito = data;
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
    this.reciboDeBuqueForm = this._formBuilder.group({
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
        this.enviado = true;

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
    // this.reciboDeBuqueForm.disable();
  }

  openModalEmitirRecibo(modal: any) {
    this.enviado = false;
    // this.errorMessage = false;
    this._modalService.open(modal, { size: 'lg'});
    
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
    
    this.enviarMail(this.idEmbarque, this.reciboBuque);
    this.enviado = true;
  }
  
  enviarMail(idEmbarque, Recibo) {
    var titulo = "Enviar a supervisor";
    var text = "Cuerpo del Mail:"
    var textoCuerpoMail = 'Cuerpo del mail';
    var inputTitle = "Destinatarios";
    var mailSupervisor = new Mail(`Recibo.`,`${textoCuerpoMail}`);
    this._reciboBuqueService.obtenerDestinatariosRecibo('SupervisoresRecibo').subscribe(destinatarios => { mailSupervisor.destinatarios = destinatarios; });
    var button1 = 'Enviar';
    var button2 = 'Cancelar';

    this._confirmationDialogService.confirm(titulo, text, button1, button2, 'lg', mailSupervisor, null, inputTitle, true)
      .then((confirmed) => {
        if (confirmed) {
          this._reciboBuqueService.guardarReciboDeBuque(idEmbarque, Recibo).subscribe(() => console.log('200 Ok'));
          this._reciboSharingService.setRefreshRecibo(true);

          }
      })
      .catch((e) => {
         this._confirmationDialogService.confirm(e, 'Cerrar', button1, button2, null, )
         .then((confirmed) => {
          if (confirmed){
            
            return
          }
          return
       }).catch(() => window.location.reload());

        console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)');
      });
  }
}
