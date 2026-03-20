import { Component, EventEmitter, Input, OnInit, OnChanges, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Destino } from '@ScatoModels/destino';
import { Embarque } from '@ScatoModels/embarque';
import { Exportador } from '@ScatoModels/exportador';
import { MaterialPuerto } from '@ScatoModels/material-puerto';
import { OtroMuelleCargaDetalle, OtroMuelleNominacion } from '@ScatoModels/otros-muelles';
import { CargaOtrosMuellesService } from '@ScatoServicios/carga-otros-muelles.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { SignalRService } from '@ScatoServicios/signal-r.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-detalle-de-carga',
  templateUrl: './detalle-de-carga.component.html',
  styleUrls: ['./detalle-de-carga.component.css']
})
export class DetalleDeCargaComponent implements OnInit, OnChanges {

  @Input() embarque: Embarque;
  @Input() datosNominacion: OtroMuelleNominacion;
  @Output() recargarEmbarque: EventEmitter<void> = new EventEmitter();
  @ViewChild('modalDetalleCarga') modalDetalleCarga: any;

  public detalleCargaForm: FormGroup;
  public exportadores: Exportador[] = [];
  public destinos: Destino[] = [];
  public materialPuertos: MaterialPuerto[] = [];
  public tiempos: string[];
  public mostrarSpinner: boolean = false;
  public mensajeSpinner: string = '';
  public observaciones: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private servicioCargaOtrosMuelles: CargaOtrosMuellesService,
    private confirmationDialogService: ConfirmationDialogService,
    private modalService: NgbModal,
    private signalr: SignalRService
  ) {
    this.inicializarForm();
  }

  ngOnInit(): void {
    this.inicializarListas();
  }

  ngOnChanges(): void {
    this.inicializarListas();
  }

  private inicializarListas() {
    if (this.datosNominacion) {
      this.exportadores = this.datosNominacion.exportadores;
      this.destinos = this.datosNominacion.destinos;
      this.materialPuertos = this.datosNominacion.materiales;
    }
  }

  public calcularTiempo(detalle: OtroMuelleCargaDetalle) {
    const inicio = new Date(detalle.fechaHoraInicio);
    const fin = new Date(detalle.fechaHoraFin);
    const diffMs = fin.getTime() - inicio.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.round((diffMs % 3600000) / 60000);
    return `${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}`;
  }

  private inicializarForm() {
    this.detalleCargaForm = this.formBuilder.group({
      id: 0,
      fechaHoraInicio: ['', Validators.required],
      fechaHoraFin: ['', Validators.required],
      exportador: [null, Validators.required],
      destino: [null, Validators.required],
      materialPuerto: [null, Validators.required],
      tipoMaterial: '',
      cantidadTn: [0, [Validators.required, Validators.min(0)]]
    });
  }



  public onAgregarDetalle() {
    this.detalleCargaForm.reset();
    this.detalleCargaForm.patchValue({ id: 0 });
    if (this.datosNominacion.exportadores.length == 1) {
      this.detalleCargaForm.patchValue({ exportador: this.datosNominacion.exportadores[0] });
    }
    if (this.datosNominacion.destinos.length == 1) {
      this.detalleCargaForm.patchValue({ destino: this.datosNominacion.destinos[0] });
    }
    if (this.datosNominacion.materiales.length == 1) {
      this.detalleCargaForm.patchValue({ materialPuerto: this.datosNominacion.materiales[0] });
    }
    this.abrirModal();
  }

  public onEditarDetalle(detalle: OtroMuelleCargaDetalle) {
    this.detalleCargaForm.reset();
    var exportador = this.datosNominacion.exportadores.find(e => e.id === detalle.exportador.id);
    var destino = this.datosNominacion.destinos.find(d => d.id === detalle.destino.id);
    var materialPuerto = this.datosNominacion.materiales.find(m => m.id === detalle.materialPuerto.id);
    this.detalleCargaForm.patchValue({
      id: detalle.id,
      fechaHoraInicio: detalle.fechaHoraInicio,
      fechaHoraFin: detalle.fechaHoraFin,
      exportador, destino, materialPuerto,
      tipoMaterial: detalle.tipoMaterial,
      cantidadTn: detalle.cantidadTn
    });
    this.abrirModal();
  }

  public async onEliminarDetalle(detalleId: number) {

    const confirm = await this.confirmationDialogService.confirmar('Atención', '¿Confirma la anulación de la línea de carga?');
    if (!confirm) return;

    this.mensajeSpinner = 'Eliminando detalle de carga...';
    this.mostrarSpinner = true;
    try {
      await this.servicioCargaOtrosMuelles.eliminarDetalleCarga(detalleId).pipe(take(1)).toPromise();
      this.signalr.enviarNotificacion('otrosMuelles', this.embarque.id);
      this.mostrarSpinner = false;
      this.recargarEmbarque.emit();
    } catch (error) {
      this.mostrarSpinner = false;
      console.error('Error al eliminar detalle', error);
      this.confirmationDialogService.error('No se pudo eliminar el detalle de carga. Por favor, intente nuevamente.');
    }
  }

  private abrirModal() {
    this.modalService.open(this.modalDetalleCarga);
  }

  public onCerrarModal() {
    this.modalService.dismissAll();
  }

  private async validarHorarios(detalleCarga: OtroMuelleCargaDetalle): Promise<{ valido: boolean, message?: string }> {
    const inicio = new Date(detalleCarga.fechaHoraInicio);
    const fin = new Date(detalleCarga.fechaHoraFin);
    if (inicio >= fin) {
      return { valido: false, message: 'La fecha de fin es menor a la fecha de inicio, por favor corregir.' };
    }
    // Se deshabilita la validación ya que el muelle podría trabajar con más de una balanza o línea de carga a la vez.
    // const valido = await this.servicioCargaOtrosMuelles.validarHorarios(detalleCarga, this.embarque.id).pipe(take(1)).toPromise();
    // if (!valido) {
    //   return { valido: false, message: 'El día/hora ingresada se superpone con el de otra carga.' };
    // }
    return { valido: true };
  }

  public async onGuardarDetalle() {
    this.detalleCargaForm.markAllAsTouched();

    if (this.detalleCargaForm.invalid) {
      this.confirmationDialogService.error('Faltan datos obligatorios.');
      return;
    }

    var detalleCarga = this.detalleCargaForm.value as OtroMuelleCargaDetalle;
    if (detalleCarga.cantidadTn == 0) {
      this.confirmationDialogService.error('La cantidad de producto no puede ser cero.');
      return;
    }

    this.onCerrarModal();

    this.mensajeSpinner = 'Guardando detalle de carga...';
    this.mostrarSpinner = true;

    try {
      const validacionHorarios = await this.validarHorarios(detalleCarga);
      if (!validacionHorarios.valido) {
        this.mostrarSpinner = false;
        this.abrirModal();
        this.confirmationDialogService.error(validacionHorarios.message);
        return;
      }
    } catch (error) {
      this.mostrarSpinner = false;
      console.error('Error en validación de horarios', error);
      this.abrirModal();
      this.confirmationDialogService.error('No se pudo validar los horarios. Por favor, intente nuevamente.');
      return;
    }

    try {
      await this.servicioCargaOtrosMuelles.guardarDetalleCarga(detalleCarga, this.embarque.id).pipe(take(1)).toPromise();
      this.signalr.enviarNotificacion('otrosMuelles', this.embarque.id);
      this.mostrarSpinner = false;
      this.onCerrarModal();
      this.recargarEmbarque.emit();
      await this.confirmationDialogService.exito('Detalle de carga guardado correctamente.');
    } catch (error) {
      this.mostrarSpinner = false;
      console.error('Error al guardar detalle', error);
      this.abrirModal();
      this.confirmationDialogService.error('No se pudo guardar el detalle de carga. Por favor, intente nuevamente.');
    }
  }

}
