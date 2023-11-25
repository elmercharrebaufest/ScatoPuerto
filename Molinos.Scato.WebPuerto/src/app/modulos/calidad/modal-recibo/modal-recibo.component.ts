import { AfterViewInit, Component, Input, OnInit, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { ReciboDeBuqueDetalles, ReciboDeBuque } from '@ScatoModels/reciboDeBuque';
import { ReciboBuqueService } from '@ScatoServicios/reciboBuque.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatosEmbarquesProcesoService } from '@ScatoServicios/datosEmbarqueProceso.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { ReciboSharingService } from '@ScatoServicios/recibo.shared.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Mail } from '@ScatoModels/mail';
import { SessionService } from '@ScatoServicios/session.service';
import { Usuario } from '@ScatoInterfaces/usuario';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { ToWords } from 'to-words';
import { formatDate } from '@angular/common';



@Component({
  selector: 'app-modal-recibo',
  templateUrl: './modal-recibo.component.html',
  styleUrls: ['./modal-recibo.component.css']
})
export class ModalReciboComponent implements OnInit, AfterViewInit, OnDestroy {
  //#region variables
  reciboBuqueDetalles: ReciboDeBuqueDetalles;
  reciboBuque: ReciboDeBuque;
  reciboBuqueOjito: ReciboDeBuque;
  errorMessage: boolean = false;
  idEmbarque: number;
  nombreBuque: string;
  reciboDeBuqueForm: FormGroup;
  // enviado: boolean;
  @Input() mostrarModal: boolean = false;
  @ViewChild('emitirRecibo', { read: TemplateRef }) ojitoRecibo: TemplateRef<any>;
  private user: Usuario;
  permisosScato: typeof PermisosScato = PermisosScato;

  private suscripcionRecibo: Subscription;

  //#endregion

  //#region constructor
  constructor(
    private _reciboBuqueService: ReciboBuqueService,
    private _modalService: NgbModal,
    private _datosEmbarqueProcesoService: DatosEmbarquesProcesoService,
    private _embarqueService: EmbarqueService,
    private _reciboSharingService: ReciboSharingService,
    private _formBuilder: FormBuilder,
    public session: SessionService
  ) {
    // session.getUser().username
    this.user = this.session.getUser();
    this.suscripcionRecibo = this._reciboSharingService.getFiltroRecibos().subscribe((data) => {
      this.reciboBuqueOjito = data;
      this.mostrarModalOjito();
    });
    this.initObtenerEmbarque();

  }
  //#endregion
  ngOnInit(): void {
    this.initFormReciboDetalles()
  }

  ngAfterViewInit() {
    this.mostrarModalOjito()
  }

  ngOnDestroy(): void {
    this.suscripcionRecibo.unsubscribe();
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
      esEuropeo: [true],
      valorEnKG: [true],
    })
  }

  initObtenerEmbarque() {

    this.idEmbarque = this._datosEmbarqueProcesoService.getEmbarqueId();

    forkJoin([
      this._embarqueService.obtenerEmbarque(this.idEmbarque),
      this._reciboBuqueService.obtenerRecibos(this.idEmbarque)
    ]).subscribe(([res1]) => {
      this.nombreBuque = res1.nombreBuque;
    });

  }

  keyUpCantidadEnLetras(cantidad: any, event: any) {
    if (cantidad != null || event.key == 'Backspace') {
      const toWords = new ToWords({ localeCode: 'en-US' });
      // this.reciboDeBuqueForm.controls.cantidadLetras.setValue(converter.toWords(cantidad).toUpperCase());
      if (cantidad != null) {
        let convertido = toWords.convert(cantidad)
        this.reciboDeBuqueForm.controls.cantidadLetras.setValue(convertido.toString().toUpperCase());
      } else {
        this.reciboDeBuqueForm.controls.cantidadLetras.setValue('');
      }
    }
  }

  getCantidadEnLetras(cantidad: any): string {
    if (cantidad != null) {
      const toWords = new ToWords({ localeCode: 'en-US' });
      return toWords.convert(cantidad)
    }
    return '';
  }

  public decimalOnly(event): boolean {
    var charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode > 47 && charCode < 58) || charCode == 46 || charCode == 8)
      return true;
    return false;
  }

  mostrarModalOjito() {
    if (this.ojitoRecibo != undefined) {
      if (this.mostrarModal) {

        this._modalService.open(this.ojitoRecibo, { size: 'lg' });
        this.setModalOjito()
      }
    }
  }

  setModalOjito() {
    const detalles = this.reciboBuqueOjito.reciboDeBuqueDetalles[0];
    this.reciboDeBuqueForm.enable();

    // asignación automática de controles con mismos nombres de propiedades
    for (let [prop, val] of Object.entries(detalles)) {
      this.reciboDeBuqueForm.controls[prop]?.setValue(val);
    }
    const fechaRecibo = detalles.fechaRecibo ? formatDate(detalles.fechaRecibo, 'yyyy-MM-dd', 'en') : new Date();
    this.reciboDeBuqueForm.controls.fechaRecibo.setValue(fechaRecibo);
    this.reciboDeBuqueForm.controls.cantidadLetras.setValue(this.getCantidadEnLetras(detalles.cantidad));
    this.reciboDeBuqueForm.controls.claseCarga.setValue(detalles.cantidadLetrasYClaseCarga);

    if (this.reciboBuqueOjito.desdeTabla) { this.reciboDeBuqueForm.disable(); }
  }

  openModalEmitirRecibo(modal: any) {
    this.initFormReciboDetalles();
    this._modalService.open(modal, { size: 'lg' });
  }

  guardarRecibo() {
    let reciboActual = this.reciboDeBuqueForm.getRawValue();
    let material = (reciboActual.claseCarga != undefined && reciboActual.claseCarga.length > 0) ? `OF ${reciboActual.claseCarga}` : '';

    this.reciboDeBuqueForm.controls.cantidadLetrasYClaseCarga.setValue(reciboActual.claseCarga);

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

  hasPermisoRecibidores_EmitirRecibo() {
    return this.user.permisos.find(p => p === this.permisosScato.Recibidores_EmitirRecibo);
  }
  hasPermisoRecibidores_Recibo_ConfirmarDatos() {
    return this.user.permisos.find(p => p === this.permisosScato.Recibidores_Recibo_ConfirmarDatos);
  }
}
