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
import { SessionService } from '@ScatoServicios/session.service';
import { ToWords } from 'to-words';
import { formatDate } from '@angular/common';



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
  desdeTabla:boolean = false;
  // enviado: boolean;
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
    public session: SessionService    
  ) 
  { 
    this.desdeTabla = false;
    // session.getUser().username
    this._reciboSharingService.getFiltroRecibos().subscribe((data) => {
      this.reciboBuqueOjito = data;
      this.mostrarModalOjito();
    });
    this.initObtenerEmbarque();
  }
  //#endregion
  ngOnInit(): void {
    this.initFormReciboDetalles()
  }
  ngAfterViewInit(){
    this.mostrarModalOjito()
  }
  
  private initFormReciboDetalles() {
    const toWords = new ToWords();
    this.reciboDeBuqueForm = this._formBuilder.group({
      exportador: ['MOLINOS AGRO S.A'],
      cantidad: [],
      puertoDestino: [''],
      fechaRecibo: new Date(),
      puertoOrigen: ['San Lorenzo, ARGENTINA'],
      nombreBuque: [this.nombreBuque],
      cantidadLetras: [''],
      claseCarga: [''],
      cantidadLetrasYClaseCarga: [' '],
      estibadoEnBodega: [''],
      calidadYCantidadDesconocida: [''],
      fechaImpresion: [''],
      incluirImpresionDestino: [true],
      incluirImpresionCalidad: [true],
      incluirImpresionEstibado: [true],
      esEuropeo:[true],
      valorEnKG:[true],
    })
  }

  initObtenerEmbarque(){

    this.idEmbarque = this._datosEmbarqueProcesoService.getEmbarqueId();

    forkJoin([
      this._embarqueService.obtenerEmbarque(this.idEmbarque),
      this._reciboBuqueService.obtenerRecibos(this.idEmbarque)
    ]).subscribe(([res1]) => {
      this.nombreBuque = res1.nombreBuque;
      });

  }

  onChangeCantidadEnLetras(cantidad: any){
    if(cantidad != null){
      const toWords = new ToWords({localeCode: 'en-US'});
      // this.reciboDeBuqueForm.controls.cantidadLetras.setValue(converter.toWords(cantidad).toUpperCase());
      let convertido = toWords.convert(cantidad)
      this.reciboDeBuqueForm.controls.cantidadLetras.setValue(convertido.toString().toUpperCase());
    }
    
  }

  mostrarModalOjito(){
    if(this.ojitoRecibo != undefined){
      if (this.mostrarModal){
        this.desdeTabla = true;
        // this.enviado = true;

        this._modalService.open(this.ojitoRecibo, { size: 'lg'});
        this.setModalOjito()
      }
    }
  }

  setModalOjito(){
    let cantidadYClaseCarga = this.reciboBuqueOjito.reciboDeBuqueDetalles[0].cantidadLetrasYClaseCarga
    let arrClase = cantidadYClaseCarga.split(' OF ');

    this.reciboDeBuqueForm.controls.puertoOrigen.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].puertoOrigen);



    this.reciboDeBuqueForm.controls.fechaRecibo.setValue(formatDate(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].fechaRecibo,'yyyy-MM-dd','en'));
    // this.reciboDeBuqueForm.controls.fechaRecibo.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].fechaRecibo);
    this.reciboDeBuqueForm.controls.nombreBuque.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].nombreBuque);
    this.reciboDeBuqueForm.controls.exportador.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].exportador);
    this.reciboDeBuqueForm.controls.puertoDestino.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].puertoDestino);
    this.reciboDeBuqueForm.controls.cantidad.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].cantidad);
    this.reciboDeBuqueForm.controls.cantidadLetras.setValue(arrClase[0]);
    this.reciboDeBuqueForm.controls.claseCarga.setValue(arrClase[1]);
    this.reciboDeBuqueForm.controls.estibadoEnBodega.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].estibadoEnBodega);
    this.reciboDeBuqueForm.controls.calidadYCantidadDesconocida.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].calidadYCantidadDesconocida);
    this.reciboDeBuqueForm.controls.incluirImpresionDestino.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].incluirImpresionDestino);
    this.reciboDeBuqueForm.controls.incluirImpresionCalidad.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].incluirImpresionCalidad);
    this.reciboDeBuqueForm.controls.incluirImpresionEstibado.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].incluirImpresionEstibado);
    this.reciboDeBuqueForm.controls.esEuropeo.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].esEuropeo);
    this.reciboDeBuqueForm.controls.valorEnKG.setValue(this.reciboBuqueOjito.reciboDeBuqueDetalles[0].esEuropeo);
    this.reciboDeBuqueForm.disable();
  }

  openModalEmitirRecibo(modal: any) {
    // this.enviado = false;
    // this.errorMessage = false;
    this.initFormReciboDetalles();
    this._modalService.open(modal, { size: 'lg'});
    
  }
  
  guardarRecibo(modifico:boolean){
    let reciboActual = this.reciboDeBuqueForm.getRawValue();
    let material = (reciboActual.claseCarga != undefined && reciboActual.claseCarga.length > 0) ? `OF ${reciboActual.claseCarga}` : '';
    if(reciboActual.valorEnKG == true){
      this.reciboDeBuqueForm.controls.cantidadLetrasYClaseCarga.setValue(`${reciboActual.cantidadLetras} KILOS ${material}`);
    }else this.reciboDeBuqueForm.controls.cantidadLetrasYClaseCarga.setValue(`${reciboActual.cantidadLetras} METRIC TONS ${material}`);

    this.reciboBuqueDetalles = this.reciboDeBuqueForm.getRawValue();
    this.reciboBuque = new ReciboDeBuque();
    this.reciboBuque.emitio = this.session.getUser().username
    // this.reciboBuque.reciboDeBuqueDetalles[0].cantidadLetrasYClaseCarga = this.reciboBuqueDetalles
    // this.reciboBuque.emitio = 'pepito recibidor';
    this.reciboBuque.superviso = 'pepito sipervisor';
    this.reciboBuque.estado = "Aprobado";
    this.reciboBuque.fechaHoraImpresion = null;
    this.reciboBuque.reciboDeBuqueDetalles = [];
    this.reciboBuque.reciboDeBuqueDetalles.unshift(this.reciboBuqueDetalles);
    this._reciboBuqueService.guardarReciboDeBuque(this.idEmbarque, this.reciboBuque).subscribe((res) => {
    console.log('200 Ok')
    this._reciboSharingService.setRefreshRecibo(true);
  });
    
    
    // this.enviarMail(this.idEmbarque, this.reciboBuque);
    // this.enviado = true;
  }
  
  // enviarMail(idEmbarque, Recibo) {
  //   var titulo = "Enviar a supervisor";
  //   var text = "Cuerpo del Mail:"
  //   var textoCuerpoMail = 'Cuerpo del mail';
  //   var inputTitle = "Destinatarios";
  //   var mailSupervisor = new Mail(`Recibo.`,`${textoCuerpoMail}`);
  //   this._reciboBuqueService.obtenerDestinatariosRecibo('SupervisoresRecibo').subscribe(destinatarios => { mailSupervisor.destinatarios = destinatarios; });
  //   var button1 = 'Enviar';
  //   var button2 = 'Cancelar';

  //   this._confirmationDialogService.confirm(titulo, text, button1, button2, 'lg', mailSupervisor, null, inputTitle, true)
  //     .then((confirmed) => {
  //       if (confirmed) {
  //         this._reciboBuqueService.guardarReciboDeBuque(idEmbarque, Recibo).subscribe(() => console.log('200 Ok'));
  //         this._reciboSharingService.setRefreshRecibo(true);

  //         }
  //     })
  //     .catch((e) => {
  //        this._confirmationDialogService.confirm(e, 'Cerrar', button1, button2, null, )
  //        .then((confirmed) => {
  //         if (confirmed){
            
  //           return
  //         }
  //         return
  //      }).catch(() => window.location.reload());

  //       console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)');
  //     });
  // }
}
