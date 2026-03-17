import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { FumigacionBodega } from '@ScatoModels/fumigacion-bodega';
import { PlanoDeCargaBodega } from '@ScatoModels/plano-de-carga-bodega';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';

@Component({
  selector: 'app-fumigacion-bodega',
  templateUrl: './fumigacion-bodega.component.html',
  styleUrls: ['./fumigacion-bodega.component.css']
})
export class FumigacionBodegaComponent implements OnInit {
  @Input() ModuloDeCargaId: number = 0;
  @Input() esSoloLectura: boolean = false;
  @Input() embarqueSeleccionado: any;
  public fumigacionBodegas: FumigacionBodega;
  public formFumigacion: FormGroup;
  public seguardo: boolean = false;
  constructor(
    private moduloDeCargaService: ModuloDeCargaService,
    private formBuilder: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService
  ) {
    this.inicializarForm();
  }

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

    this.escucharCambiosCheckboxes();

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

  public validarSelectBodega() {
    const bodegasFormArray = this.formFumigacion.get('bodegas') as FormArray;

    // Validar fumigación preventiva
    if (this.fumigacionBodegas.tieneFumigacionPreventiva) {
      const algunaPreventivaSeleccionada = bodegasFormArray.controls.some(
        control => control.get('fumPreventiva')?.value
      );
      if (!algunaPreventivaSeleccionada) {
        this.confirmationDialogService.confirmar(
          'Advertencia',
          'Debe seleccionar al menos una bodega para guardar la marca de fumigación en SI'
        );
        return false;
      }
    }

    // Validar fumigación curativa
    if (this.fumigacionBodegas.tieneFumigacionCurativa) {
      const algunaCurativaSeleccionada = bodegasFormArray.controls.some(
        control => control.get('fumCurativa')?.value
      );
      if (!algunaCurativaSeleccionada) {
        this.confirmationDialogService.confirmar(
          'Advertencia',
          'Debe seleccionar al menos una bodega para guardar la marca de fumigación en SI'
        );
        return false;
      }
    }
    return true;
  }


  public onGuardar() {

    if (!this.validarSelectBodega()) {
      return;
    }

    this.moduloDeCargaService.guardarFumigacion(this.formFumigacion.getRawValue()).subscribe(
      () => {
        this.seguardo = true;
        this.confirmationDialogService.confirmar('Fumigación guardada', 'La fumigación se ha guardado correctamente.');
      }, error => {
        console.error('Error al guardar la fumigación:', error);
      });
  }

  public onGuardarDesdeFinalizar() {
    console.log("SI SE GUARDO DESDE FUMIGACION:::::::::===", this.seguardo);
    if (!this.seguardo) {
      this.moduloDeCargaService.guardarFumigacion(this.formFumigacion.getRawValue()).subscribe(
        () => {

        }, error => {
          console.error('Error al guardar la fumigación:', error);
        });
    }
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

  private escucharCambiosCheckboxes() {
    const bodegasFormArray = this.formFumigacion.get('bodegas') as FormArray;

    bodegasFormArray.controls.forEach(control => {

      control.get('fumPreventiva')?.valueChanges.subscribe(() => {
        this.seguardo = false;
      });

      control.get('fumCurativa')?.valueChanges.subscribe(() => {
        this.seguardo = false;
      });

    });
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
