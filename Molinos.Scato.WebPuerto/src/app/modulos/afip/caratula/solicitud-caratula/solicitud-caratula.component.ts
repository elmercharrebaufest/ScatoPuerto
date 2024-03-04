import { Caratula, SolicitudCambioBuque, SolicitudCambioFechas } from '@ScatoModels/afip/caratula';
import { COEM } from '@ScatoModels/afip/coem';
import { AfipMotivoSolicitudCambio } from '@ScatoModels/afip/tablas-afip';
import { CaratulaAfipService } from '@ScatoServicios/afip/caratula-afip.service';
import { CoemAfipService } from '@ScatoServicios/afip/coem-afip.service';
import { TablasAfipService } from '@ScatoServicios/afip/tablas-afip.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-solicitud-caratula',
  templateUrl: './solicitud-caratula.component.html',
  styleUrls: ['./solicitud-caratula.component.css']
})
export class SolicitudCaratulaComponent implements OnInit, OnDestroy {

  public caratula: Caratula
  private coems: COEM[];
  public solicitarCambioFechasForm: FormGroup;
  public solicitarCambioBuqueForm: FormGroup;

  public listaMotivos: AfipMotivoSolicitudCambio[] = [];

  public cargando: boolean;
  public mensajeCarga: string;

  private modal: NgbModalRef;
  private suscripciones: Subscription[] = [];

  constructor(
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private formBuilder: FormBuilder,
    private caratulaAfipService: CaratulaAfipService,
    private coemService: CoemAfipService,
    private tablasAfipService: TablasAfipService
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    // El request se hace en modal-crear-caratula.ts, este es un BehaviorSubject
    const susCaratula = this.caratulaAfipService.$caratula.subscribe(caratula => {
      if (!caratula) {
        return;
      }
      this.caratula = caratula;
      this.solicitarCambioFechasForm.get('caratulaId').setValue(caratula.id);
      this.solicitarCambioBuqueForm.get('caratulaId').setValue(caratula.id);
    });
    this.suscripciones.push(susCaratula);

    const susCoems = this.caratulaAfipService.$caratulaCoems.subscribe(coems => this.coems = coems);

    this.suscripciones.push(susCoems);

    this.tablasAfipService.listarMotivosSolicitudCambio().subscribe(motivos =>
      this.listaMotivos = motivos,
      err => console.error(err)
    );
  }

  ngOnDestroy(): void {
    this.suscripciones.forEach(s => s.unsubscribe());
  }

  private initForms() {
    this.solicitarCambioBuqueForm = this.formBuilder.group({
      caratulaId: [''],
      identificadorBuque: ['', Validators.required],
      nombreMedioTransporte: ['', Validators.required]
    });

    this.solicitarCambioFechasForm = this.formBuilder.group({
      caratulaId: [''],
      fechaArribo: ['', Validators.required],
      fechaZarpada: ['', Validators.required],
      codigoMotivo: ['', Validators.required],
      descripcionMotivo: ['', Validators.maxLength(200)]
    });
    // Borra la fecha de zarpada si la de arribo es menor
    const suscripcion = this.solicitarCambioFechasForm.get('fechaArribo').valueChanges.subscribe((val) => {
      const controlFechaZarpada = this.solicitarCambioFechasForm.get('fechaZarpada');
      const fechaArribo = new Date(val);
      const fechaZarpada = new Date(controlFechaZarpada.value);
      if (fechaArribo >= fechaZarpada) {
        controlFechaZarpada.setValue('');
      }
    });
    this.suscripciones.push(suscripcion);
  }

  public abrirModal(modal: any) {
    this.modal = this.modalService.open(modal, { size: 'xl', centered: true, backdrop: 'static', keyboard: false });
  }

  public cerrarModal() {
    this.modal.close();
  }

  public async solicitarCambio(solicitud: string) {
    let form: FormGroup;
    let request: Observable<SolicitudCambioBuque[] | SolicitudCambioFechas[]>;

    if (solicitud == 'buque') {
      form = this.solicitarCambioBuqueForm;
      request = this.caratulaAfipService.solicitarCambioBuque(form.getRawValue()).pipe(
        concatMap(() => this.caratulaAfipService.listarSolicitudesCambioBuque(this.caratula.id)),
        tap((solicitudes: SolicitudCambioBuque[]) => this.caratula.solicitudesCambioBuque = solicitudes)
      );
    } else {
      form = this.solicitarCambioFechasForm;
      request = this.caratulaAfipService.solicitarCambioFechas(form.getRawValue()).pipe(
        concatMap(() => this.caratulaAfipService.listarSolicitudesCambioFechas(this.caratula.id)),
        tap((solicitudes: SolicitudCambioFechas[]) => this.caratula.solicitudesCambioFechas = solicitudes)
      );
    }

    form.markAllAsTouched();
    if (form.invalid) {
      this.confirmationDialogService.alertar('Advertencia', 'Los campos que estan en rojo son requeridos');
      return;
    }

    const confirm = await this.confirmationDialogService.confirmar('Advertencia', `¿Está seguro de solicitar el cambio de ${solicitud}?`);
    if (!confirm) {
      return;
    }

    this.modal.close();
    this.mensajeCarga = 'Enviando solicitud';
    this.cargando = true;

    request.subscribe(() => {
      this.cargando = false;
      this.confirmationDialogService.exito(`Ha solicitado el cambio de ${solicitud} con éxito`);
      form.reset();
    }, (err) => {
      console.error(err);
      this.cargando = false;
      const msj = err.error || `No se ha podido enviar la solicitud, comunicarse con soporte técnico`;
      this.confirmationDialogService.error(msj);
    });
  }

  public async efectuarCambio(solicitud: string, id: number) {
    const confirm = await this.confirmationDialogService.confirmar('Advertencia', `¿Desea marcar como aceptada la solicitud de cambio de ${solicitud}? Esto efectuara los cambios en la carátula`);
    if (!confirm) {
      return;
    }
    const request = solicitud == 'buque' ? this.caratulaAfipService.efectuarSolicitudCambioBuque(id) : this.caratulaAfipService.efectuarSolicitudCambioFechas(id);
    this.mensajeCarga = 'Efecutando cambios';
    this.cargando = true;
    request.subscribe(async () => {
      this.cargando = false;
      await this.confirmationDialogService.exito(`Se ha efectuado la solicitud de cambio de ${solicitud} con éxito`);
      this.caratulaAfipService.$recargarCaratula.next(); // Este flujo sigue en modal-crear-caratula.ts
    }, (err) => {
      console.error(err);
      this.cargando = false;
      this.confirmationDialogService.error('No se ha podido efectuar el cambio, comunicarse con soporte técnico');
    });
  }

  public async rechazarCambio(solicitud: string, id: number) {
    const confirm = await this.confirmationDialogService.confirmar('Advertencia', `¿Desea marcar como rechazada la solicitud de cambio de ${solicitud}?`);
    if (!confirm) {
      return;
    }
    const request = solicitud == 'buque' ? this.caratulaAfipService.rechazarSolicitudCambioBuque(id) : this.caratulaAfipService.rechazarSolicitudCambioFechas(id);
    this.mensajeCarga = 'Efecutando cambios';
    this.cargando = true;
    request.subscribe(async () => {
      this.cargando = false;
      await this.confirmationDialogService.exito(`Se ha marcado como rechazada la solicitud de cambio de ${solicitud}`);
      this.caratulaAfipService.$recargarCaratula.next(); // Este flujo sigue en modal-crear-caratula.ts
    }, (err) => {
      console.error(err);
      this.cargando = false;
      this.confirmationDialogService.error(`Ocurrió un error al efectuar el cambio`);
    });
  }

  public async solicitarCierreCarga(modalCierreCarga: any) {
    if (this.caratula.estado == 'CODE') {
      this.confirmationDialogService.alertar('La caratula ya fue convertida a CODE')
    }
    if (this.caratula.solicitudesCierreCarga?.some(s => s.estado == 'Pendiente')) {
      this.confirmationDialogService.alertar('Ya existe una solicitud de cierre en curso que se encuentra pendiente');
      return;
    }
    const estadosValidos = ['AUTO', 'ANU'];
    const coemsEstadoinvalido = this.coems
      .filter(coem => !estadosValidos.includes(coem.afipCoemEstado.codigo))
      .map(coem => coem.identificadorCOEM).join('\n');
    if (coemsEstadoinvalido) {
      this.confirmationDialogService.error('Las siguientes COEMs no se encuentran autorizadas o anuladas:\n' + coemsEstadoinvalido);
      return;
    }
    this.abrirModal(modalCierreCarga);
  }

  public async efectuarCierre(id: number) {
    const confirm = await this.confirmationDialogService.confirmar('Advertencia', '¿Desea marcar como aceptada la solicitud de cierre de carga? Esto registrará que la carátula y sus COEM se han convertido en una CODE')
    if (!confirm) {
      return;
    }
    this.mensajeCarga = 'Efecutando cambios';
    this.cargando = true;
    this.caratulaAfipService.efectuarSolicitudCierreCarga(id).subscribe(async () => {
      this.cargando = false;
      await this.confirmationDialogService.exito(`Se ha efectuado el cierre de carga`);
      this.caratulaAfipService.$recargarCaratula.next(); // Este flujo sigue en modal-crear-caratula.ts
      this.coemService.$recargarCoems.next();
    }, (err) => {
      console.error(err);
      this.cargando = false;
      this.confirmationDialogService.error('No se ha podido efectuar el cambio');
    });
  }

  public async rechazarCierre(id: number) {
    const confirm = await this.confirmationDialogService.confirmar('Advertencia', '¿Desea marcar como rechazada la solicitud de cierre de carga?');
    if (!confirm) {
      return;
    }
    this.mensajeCarga = 'Efecutando cambios';
    this.cargando = true;
    this.caratulaAfipService.rechazarSolicitudCierreCarga(id).subscribe(async () => {
      this.cargando = false;
      await this.confirmationDialogService.exito(`Se ha marcado como rechazada la solicitud de cierre`);
      this.caratulaAfipService.$recargarCaratula.next(); // Este flujo sigue en modal-crear-caratula.ts
    }, (err) => {
      console.error(err);
      this.cargando = false;
      this.confirmationDialogService.error(`Ocurrió un error al efectuar el cambio`);
    });
  }

  public finalizarCierreCarga() {
    this.caratulaAfipService.$recargarCaratula.next();
  }

}
