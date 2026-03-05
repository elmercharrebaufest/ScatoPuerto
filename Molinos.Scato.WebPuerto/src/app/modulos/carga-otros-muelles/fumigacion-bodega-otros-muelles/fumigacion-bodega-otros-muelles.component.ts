import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Embarque } from '@ScatoModels/embarque';
@Component({
  selector: 'app-fumigacion-bodega-otros-muelles',
  templateUrl: './fumigacion-bodega-otros-muelles.component.html',
  styleUrls: ['./fumigacion-bodega-otros-muelles.component.css']
})
export class FumigacionBodegaOtrosMuellesComponent implements OnInit {
  @Input() embarque: Embarque;
  public formFumigacion: FormGroup;

  constructor(fb: FormBuilder) {
    this.formFumigacion = fb.group({
      fumigacionPreventiva: [''],
      fumigacionCurativa: [''],
      senasa: ['']
    });
  }

  ngOnInit(): void {
    const otroMuelleCarga = this.embarque.otroMuelleCarga;
    this.formFumigacion.patchValue({
      fumigacionPreventiva: otroMuelleCarga.fumigacionPreventiva,
      fumigacionCurativa: otroMuelleCarga.fumigacionCurativa,
      senasa: otroMuelleCarga.senasa
    });
  }

  public obtenerDatos() {
    return this.formFumigacion.value;
  }
}
