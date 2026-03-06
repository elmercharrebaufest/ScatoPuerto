import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Embarque } from '@ScatoModels/embarque';
import { OtroMuelleCarga, OtroMuelleNominacion } from '@ScatoModels/otros-muelles';
import { CargaOtrosMuellesService } from '@ScatoServicios/carga-otros-muelles.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { EmbarqueService } from '@ScatoServicios/embarque.service';
import { forkJoin } from 'rxjs';
import { FumigacionBodegaOtrosMuellesComponent } from '../fumigacion-bodega-otros-muelles/fumigacion-bodega-otros-muelles.component';
import { DetalleDeCargaComponent } from '../detalle-de-carga/detalle-de-carga.component';
import { take } from 'rxjs/operators';
import { EnvioMailDialogService } from '@ScatoServicios/envio-mail-dialog.service';
import { Mail } from '@ScatoModels/mail';

@Component({
  selector: 'app-ingreso-de-carga',
  templateUrl: './ingreso-de-carga.component.html',
  styleUrls: ['./ingreso-de-carga.component.css']
})
export class IngresoDeCargaComponent implements OnInit {

  @ViewChild(FumigacionBodegaOtrosMuellesComponent) fumigacionComponent: FumigacionBodegaOtrosMuellesComponent;
  @ViewChild(DetalleDeCargaComponent) detalleCargaComponent: DetalleDeCargaComponent;

  public embarque: Embarque;
  public datosNominacion: OtroMuelleNominacion;
  public mostrarSpinner: boolean = false
  public mensajeSpinner: string = 'Cargando datos del embarque...';
  public esLiquido: boolean = false;
  public cargado: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private embarqueService: EmbarqueService,
    private cargaOtrosMuellesService: CargaOtrosMuellesService,
    private confirmationDialogService: ConfirmationDialogService,
    private envioDialogService: EnvioMailDialogService
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  public cargarDatos() {
    this.mensajeSpinner = 'Cargando datos del embarque...';
    this.mostrarSpinner = true;
    const embarqueId = this.route.snapshot.params['id'];
    forkJoin([
      this.embarqueService.obtenerEmbarque(embarqueId),
      this.cargaOtrosMuellesService.obtenerDatosNominacion(embarqueId)
    ]).subscribe(([embarque, datosNominacion]) => {
      this.embarque = embarque;
      this.datosNominacion = datosNominacion;
      this.esLiquido = embarque.esLiquido;

      if (!this.embarque.otroMuelleCarga) {
        this.embarque.otroMuelleCarga = {
          id: 0, observacion: '', otroMuelleCargaDetalles: [],
          fumigacionPreventiva: datosNominacion.tieneFumigacion,
          senasa: datosNominacion.tieneSenasa,
          fumigacionCurativa: false,
        };
      }

      this.cargado = true;
      this.mostrarSpinner = false;
      setTimeout(() => { this.detalleCargaComponent.observaciones = this.embarque.otroMuelleCarga.observacion; }, 100);
    }, error => {
      console.error('Error al cargar el embarque', error);
      this.confirmationDialogService.error('No se pudo cargar el embarque. Por favor, intente nuevamente.');
      this.mostrarSpinner = false;
    });
  }

  cancelar() {
    window.history.back();
  }

  async onGuardar(zarpar?: boolean) {
    if (zarpar) {
      const confirm = await this.confirmationDialogService.confirmar('Advertencia', 'Confirma la finalización de las cargas? El embarque pasará al estado "Zarpó".');
      if (!confirm) return;
    }

    this.mensajeSpinner = 'Guardando datos de la carga...';
    this.mostrarSpinner = true;
    try {
      const observaciones = this.detalleCargaComponent.observaciones;
      const datosFumigacion = this.fumigacionComponent.obtenerDatos() as OtroMuelleCarga;
      datosFumigacion.observacion = observaciones;

      await this.cargaOtrosMuellesService.guardarCarga(datosFumigacion, this.embarque.id, zarpar).toPromise();
      this.mostrarSpinner = false;
      await this.confirmationDialogService.exito('Datos guardados con éxito.');
    } catch (error) {
      this.mostrarSpinner = false;
      console.error('Error al guardar la carga', error);
      this.confirmationDialogService.error('No se pudieron guardar los cambios. Por favor, intente nuevamente.');
    }

    if (zarpar) {
      this.enviarMailFinalizacion();
    }
  }

  private async enviarMailFinalizacion() {
    this.mensajeSpinner = 'Generando mail de finalización...';
    this.mostrarSpinner = true;
    let mail: Mail;
    try {
      mail = await this.cargaOtrosMuellesService.obtenerMailFinalizacion(this.embarque.id).pipe(take(1)).toPromise()
      this.mostrarSpinner = false;
    } catch (error) {
      this.mostrarSpinner = false;
      console.error('Error al generar el mail de finalización', error);
      this.confirmationDialogService.error('No se pudo generar el mail de finalización. Por favor, intente nuevamente.');
      return;
    }

    const confirm = await this.envioDialogService.confirm("Enviar Mail de finalización", 'Cuerpo del Mail:', mail.titulo, 'Enviar', 'Cancelar', 'xl', mail, null, "Para:", "CC:", true);
    if (!confirm) { return; }

    // Si el email fue modificado por el usuario, el plugin CKEditor rompe las tablas, por lo que hay que repararlas
    if (mail.body.includes('<figure class="table">')) {
      const htmlOriginal = mail.body;

      let htmlLimpio = htmlOriginal
        .replace(/<figure class="table">/g, '')
        .replace(/<\/figure>/g, '')
        .replace(/<th(?!ead)([^>]*)>/g, '<th$1 style="border: 1px solid black; padding: 8px; text-align: left;">')
        .replace(/<td([^>]*)>/g, '<td$1 style="border: 1px solid black; padding: 8px; text-align: left;">');

      mail.body = `<div style="font-family: Arial, sans-serif; font-size: 14px;">${htmlLimpio}</div>`;
    }

    this.mensajeSpinner = 'Enviando mail de finalización...';
    this.mostrarSpinner = true;
    try {
      await  this.cargaOtrosMuellesService.enviarMailFinalizacion(mail).pipe(take(1)).toPromise();
      await this.confirmationDialogService.exito('Se ha enviado correctamente el mail de finalización.', 'Email enviado');
      window.history.back();
    } catch (error) {
      this.mostrarSpinner = false;
      console.error('Error al enviar el mail de finalización', error);
      this.confirmationDialogService.error('No se pudo enviar el mail de finalización. Por favor, intente nuevamente.');
      return;
    }
  }

}
