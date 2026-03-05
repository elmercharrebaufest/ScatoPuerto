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
    private confirmationDialogService: ConfirmationDialogService
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
    this.mensajeSpinner = 'Guardando datos de la carga...';
    this.mostrarSpinner = true;
    try {
      const observaciones = this.detalleCargaComponent.observaciones;
      const datosFumigacion = this.fumigacionComponent.obtenerDatos() as OtroMuelleCarga;
      datosFumigacion.observacion = observaciones;

      await this.cargaOtrosMuellesService.guardarCarga(datosFumigacion, this.embarque.id).toPromise();

      this.mostrarSpinner = false;
      await this.confirmationDialogService.exito('Datos guardados con éxito.');
      if (zarpar) {
        window.history.back();
      }

    } catch (error) {
      this.mostrarSpinner = false;
      console.error('Error al guardar la carga', error);
      this.confirmationDialogService.error('No se pudieron guardar los cambios. Por favor, intente nuevamente.');
    }
  }

}
