import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { AmarreComponent } from 'app/shared/componentes/modulos/carga/amarre/amarre.component';

@Component({
  selector: 'app-umap',
  templateUrl: './umap.component.html',
  styleUrls: ['./umap.component.css']
})
export class UmapComponent implements OnInit {
  public forms: FormGroup;
  @ViewChild(AmarreComponent, { static: false }) amarreComponent: AmarreComponent;
  constructor(private builder: FormBuilder) { }

  ngOnInit(): void {
    this.forms = this.builder.group({
      umap: this.builder.array([this.initUmap()])
    });
  }

  initUmap(){
    return this.builder.group({
      fechaEncendido: '',
      horaEncendido: '',
      fechaApagado:'',
      horaApagado: '',
      velocidadDelViento: '',
      direccionDelViento: ''
    });
  }

  obtenerUmap(){
    return this.umapFormArray.getRawValue();
  }

  obtenerAmarre(){
    return this.amarreComponent.obtenerAmarre();
  }

  updateUMAP(umap){
    while(this.umapFormArray.length < umap.length) this.umapFormArray.push(this.initUmap());
    umap.forEach(element => {
      element.fechaEncendido = element.fechaEncendido ?  formatDate(element.fechaEncendido, 'yyyy-MM-dd', 'es-ar') : " ";
      element.fechaApagado = element.fechaApagado ?  formatDate(element.fechaApagado, 'yyyy-MM-dd', 'es-ar') : " ";
    });
    this.umapFormArray.patchValue(umap);
  }

  updateAmarre(amarre){
    this.amarreComponent.updateAmarre(amarre);
  }

  get umapFormArray(): FormArray {
    return this.forms.get("umap") as FormArray;
  }

  addUmap(){
    this.umapFormArray.push(this.initUmap());
  }

  isFirstOnList(form){
    return this.umapFormArray.value.indexOf(form.value) != 0;
  }

  deleteHorario(index: number){
    this.umapFormArray.removeAt(index);
  }
}
