import { Component, Input, OnInit } from '@angular/core';
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
  public fumigacionBodegas: FumigacionBodega;
  public formFumigacion: FormGroup;
  constructor(
    private moduloDeCargaService: ModuloDeCargaService,
    private formBuilder: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,
  ) { }

  ngOnInit(): void {
    this.listarBodegas();
  }

  private patchFormBodegas() {
    this.formFumigacion = this.formBuilder.group({
      bodegas: this.formBuilder.array([]),
    });
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
        control.get('fumPreventiva')?.disable({emitEvent: false});
      });
    }

    if (this.fumigacionBodegas.tieneFumigacionCurativa == false) {
      bodegasFormArray.controls.forEach((control) => {
        control.get('fumCurativa')?.disable({emitEvent: false});
      });
    }
  }

  public getBodegas() {
    const bodegasFormArray = this.formFumigacion.get('bodegas') as FormArray;
    return bodegasFormArray;
  }

  private listarBodegas() {
    this.moduloDeCargaService.obtenerFumigacionBodega(this.ModuloDeCargaId).subscribe({
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
        control.get('fumPreventiva')?.setValue(false, {emitEvent: false}); // Limpiar selección
        control.get('fumPreventiva')?.disable({emitEvent: false}); // Deshabilitar checkbox
      });
    } else if (value === 'si') {
      // Habilitar la selección de bodegas
      this.fumigacionBodegas.tieneFumigacionPreventiva = true;
      bodegasFormArray.controls.forEach((control) => {
        control.get('fumPreventiva')?.enable({emitEvent: false}); // Habilitar checkbox
      });
    }
  }

  public onFumigacionCurativaChange(value: string): void {
    const bodegasFormArray = this.formFumigacion.get('bodegas') as FormArray;

    if (value === 'no') {
      // Deshabilitar la selección de bodegas y limpiar las seleccionadas
      this.fumigacionBodegas.tieneFumigacionCurativa = false;
      bodegasFormArray.controls.forEach((control) => {
        control.get('fumCurativa')?.setValue(false, {emitEvent: false}); // Limpiar selección
        control.get('fumCurativa')?.disable({emitEvent: false}); // Deshabilitar checkbox
      });
    } else if (value === 'si') {
      // Habilitar la selección de bodegas
      this.fumigacionBodegas.tieneFumigacionCurativa = true;
      bodegasFormArray.controls.forEach((control) => {
        control.get('fumCurativa')?.enable({emitEvent: false}); // Habilitar checkbox
      });
    }
  }
}
