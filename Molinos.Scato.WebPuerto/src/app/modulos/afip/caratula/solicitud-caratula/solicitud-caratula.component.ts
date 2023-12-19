import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Caratula, SolicitudCambioBuque, SolicitudCambioFechas } from '@ScatoModels/afip/caratula';
import { AfipMotivoSolicitudCambio } from '@ScatoModels/afip/tablas-afip';
import { CaratulaAfipService } from '@ScatoServicios/afip/caratula-afip.service';
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
    private tablasAfipService: TablasAfipService
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    // El request se hace en modal-crear-caratula.ts, este es un BehaviorSubject
    const suscripcion = this.caratulaAfipService.$caratula.subscribe(caratula => {
      if (!caratula) {
        return;
      }
      this.caratula = caratula;
      this.solicitarCambioFechasForm.get('caratulaId').setValue(caratula.id);
      this.solicitarCambioBuqueForm.get('caratulaId').setValue(caratula.id);
    });
    this.suscripciones.push(suscripcion);
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
      this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
      return;
    }

    const confirm = await this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de solicitar el cambio de ${solicitud}?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning);
    if (!confirm) {
      return;
    }

    this.modal.close();
    this.mensajeCarga = 'Enviando solicitud';
    this.cargando = true;

    request.subscribe(() => {
      this.cargando = false;
      this.confirmationDialogService.confirm('¡Felicitaciones!', `Ha solicitado el cambio de ${solicitud} con éxito`, 'Cerrar', '', null, null, Tipoalerta.Success);
      form.reset();
    }, (err) => {
      console.error(err);
      this.cargando = false;
      const msj = err.error || `No se ha podido enviar la solicitud, comunicarse con soporte técnico`;
      this.confirmationDialogService.confirm('¡Error!', msj, 'Cerrar', '', null, null, Tipoalerta.Error)
    });
  }

  public async efectuarCambio(solicitud: string, id: number) {
    const confirm = await this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de marcar como aceptada la solicitud de cambio de ${solicitud}? Esto efectuara los cambios en la carátula`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning);
    if (!confirm) {
      return;
    }
    const request = solicitud == 'buque' ? this.caratulaAfipService.efectuarSolicitudCambioBuque(id) : this.caratulaAfipService.efectuarSolicitudCambioFechas(id);
    this.mensajeCarga = 'Efecutando cambios';
    this.cargando = true;
    request.subscribe(async () => {
      this.cargando = false;
      await this.confirmationDialogService.confirm('¡Felicitaciones!', `Se ha efectuado la solicitud de cambio de ${solicitud} con éxito`, 'Cerrar', '', null, null, Tipoalerta.Success);
      this.caratulaAfipService.$recargarCaratula.next(); // Este flujo sigue en modal-crear-caratula.ts
    }, (err) => {
      console.error(err);
      this.cargando = false;
      this.confirmationDialogService.confirm('¡Error!', `No se ha podido efectuar el cambio, comunicarse con soporte técnico`, 'Cerrar', '', null, null, Tipoalerta.Error);
    });
  }

  public async rechazarCambio(solicitud: string, id: number) {
    const confirm = await this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de marcar como rechazada la solicitud de cambio de ${solicitud}?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning);
    if (!confirm) {
      return;
    }
    const request = solicitud == 'buque' ? this.caratulaAfipService.rechazarSolicitudCambioBuque(id) : this.caratulaAfipService.rechazarSolicitudCambioFechas(id);
    this.mensajeCarga = 'Efecutando cambios';
    this.cargando = true;
    request.subscribe(async () => {
      this.cargando = false;
      await this.confirmationDialogService.confirm('¡Felicitaciones!', `Se ha marcado como rechazada la solicitud de cambio de ${solicitud}`, 'Cerrar', '', null, null, Tipoalerta.Success);
      this.caratulaAfipService.$recargarCaratula.next(); // Este flujo sigue en modal-crear-caratula.ts
    }, (err) => {
      console.error(err);
      this.cargando = false;
      this.confirmationDialogService.confirm('¡Error!', `No se ha podido efectuar el cambio, comunicarse con soporte técnico`, 'Cerrar', '', null, null, Tipoalerta.Error);
    });
  }

}
