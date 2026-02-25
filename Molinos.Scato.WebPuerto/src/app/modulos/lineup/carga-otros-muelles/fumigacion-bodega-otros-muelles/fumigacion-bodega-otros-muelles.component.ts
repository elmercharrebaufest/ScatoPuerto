import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { FumigacionBodega } from '@ScatoModels/fumigacion-bodega';
import { PlanoDeCargaBodega } from '@ScatoModels/plano-de-carga-bodega';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';

@Component({
  selector: 'app-fumigacion-bodega-otros-muelles',
  templateUrl: './fumigacion-bodega-otros-muelles.component.html',
  styleUrls: ['./fumigacion-bodega-otros-muelles.component.css']
})
export class FumigacionBodegaOtrosMuellesComponent implements OnInit {
  @Input() ModuloDeCargaId: number = 0;
  @Input() esSoloLectura: boolean = false;
  @Input() forzarNueveBodegas: boolean = false;
  @Input() embarqueSeleccionado: any;
  public fumigacionBodegas: FumigacionBodega;
  public formFumigacion: FormGroup;

  constructor(
    private moduloDeCargaService: ModuloDeCargaService,
    private formBuilder: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,) { }

  ngOnInit(): void {
    //this.listarBodegas();
    this.moduloDeCargaService.refrescarFumigacion$
      .subscribe(() => {
        this.listarBodegas();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['ModuloDeCargaId'] && changes['ModuloDeCargaId'].currentValue > 0) {
      this.listarBodegas();
    }
  }

  private inicializarForm() {
    this.formFumigacion = this.formBuilder.group({
      bodegas: this.formBuilder.array([]),
    });
  }

  private patchFormBodegas() {

    const bodegasFormArray = this.formFumigacion.get('bodegas') as FormArray; // Asegurarte de que es un FormArray

    this.fumigacionBodegas.bodegas.forEach((bodega: PlanoDeCargaBodega) => {
      bodegasFormArray.push(this.formBuilder.group({
        id: bodega.id,
        fumPreventiva: bodega.fumPreventiva === null ? false : bodega.fumPreventiva,
        fumCurativa: bodega.fumCurativa === null ? false : bodega.fumCurativa,
        bodegaParcel: bodega.bodegaParcel
      }));
    });

    if (this.fumigacionBodegas.tieneFumigacionPreventiva == false) {
      bodegasFormArray.controls.forEach((control) => {
        control.get('fumPreventiva')?.disable({ emitEvent: false });
      });
    }

    if (this.fumigacionBodegas.tieneFumigacionCurativa == false) {
      bodegasFormArray.controls.forEach((control) => {
        control.get('fumCurativa')?.disable({ emitEvent: false });
      });
    }

    if (this.esSoloLectura) {
      const radios = document.querySelectorAll('[name="fumigacionPreventiva"], [name="fumigacionCurativa"]') as NodeListOf<HTMLInputElement>;
      radios.forEach(radio => radio.disabled = true);
      this.formFumigacion.disable();
    }
  }

  public getBodegas() {
    const bodegasFormArray = this.formFumigacion.get('bodegas') as FormArray;
    return bodegasFormArray;
  }

  private inicializarEstructuraFumigacion() {
    this.fumigacionBodegas = {
      tieneFumigacionPreventiva: false,
      tieneFumigacionCurativa: false,
      bodegas: []
    } as FumigacionBodega;
  }

  private limpiarBodegasFormArray() {
    const bodegasFormArray = this.formFumigacion.get('bodegas') as FormArray;
    while (bodegasFormArray.length !== 0) {
      bodegasFormArray.removeAt(0);
    }
  }

  private generarNueveBodegas() {
    const bodegas = [];
    for (let i = 1; i <= 9; i++) {
      bodegas.push({
        id: i,
        bodegaParcel: i,
        fumPreventiva: false,
        fumCurativa: false
      });
    }
    return bodegas;
  }

  private listarBodegas() {

    this.inicializarEstructuraFumigacion();
    this.limpiarBodegasFormArray();

    this.moduloDeCargaService
      .obtenerFumigacionBodega(this.ModuloDeCargaId)
      .subscribe({

        next: (data: FumigacionBodega) => {
          this.fumigacionBodegas = data;
          this.patchFormBodegas();
        },

        error: (error) => {
          console.error(error);
        }
      });
  }


  public onGuardar() {
    this.moduloDeCargaService.guardarFumigacion(this.formFumigacion.getRawValue()).subscribe(
      () => {
        this.confirmationDialogService.confirmar('Fumigación guardada', 'La fumigación se ha guardado correctamente.');
      }, error => {
        console.error('Error al guardar la fumigación:', error);
      });
  }

  public onFumigacionPreventivaChange(value: string): void {
    const bodegasFormArray = this.formFumigacion.get('bodegas') as FormArray;

    if (value === 'no') {
      // Deshabilitar la selección de bodegas y limpiar las seleccionadas
      this.fumigacionBodegas.tieneFumigacionPreventiva = false;
      bodegasFormArray.controls.forEach((control) => {
        control.get('fumPreventiva')?.setValue(false, { emitEvent: false }); // Limpiar selección
        control.get('fumPreventiva')?.disable({ emitEvent: false }); // Deshabilitar checkbox
      });
    } else if (value === 'si') {
      // Habilitar la selección de bodegas
      this.fumigacionBodegas.tieneFumigacionPreventiva = true;
      bodegasFormArray.controls.forEach((control) => {
        control.get('fumPreventiva')?.enable({ emitEvent: false }); // Habilitar checkbox
      });
    }
  }

  public onFumigacionCurativaChange(value: string): void {
    const bodegasFormArray = this.formFumigacion.get('bodegas') as FormArray;

    if (value === 'no') {
      // Deshabilitar la selección de bodegas y limpiar las seleccionadas
      this.fumigacionBodegas.tieneFumigacionCurativa = false;
      bodegasFormArray.controls.forEach((control) => {
        control.get('fumCurativa')?.setValue(false, { emitEvent: false }); // Limpiar selección
        control.get('fumCurativa')?.disable({ emitEvent: false }); // Deshabilitar checkbox
      });
    } else if (value === 'si') {
      // Habilitar la selección de bodegas
      this.fumigacionBodegas.tieneFumigacionCurativa = true;
      bodegasFormArray.controls.forEach((control) => {
        control.get('fumCurativa')?.enable({ emitEvent: false }); // Habilitar checkbox
      });
    }
  }

}
