import { formatDate } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { AmarreComponent } from 'app/shared/componentes/modulos/carga/amarre/amarre.component';

@Component({
  selector: 'app-umap',
  templateUrl: './umap.component.html',
  styleUrls: ['./umap.component.css']
})
export class UmapComponent implements OnInit {
  @ViewChild(AmarreComponent, { static: false }) amarreComponent: AmarreComponent;
  @Input() ModuloDeCargaId: number;

  guardando: boolean = false;
  public forms: FormGroup;

  constructor(private builder: FormBuilder,
              private _confirmationDialogService: ConfirmationDialogService,
              private _moduloDeCargaService: ModuloDeCargaService) { }
              
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

  guardarUMAP(){
    this._confirmationDialogService.confirm("Atención!", "¿Seguro que desea guardar el UMAP?", 'Aceptar', 'Cancelar', null, null, Tipoalerta.Warning)
    .then( (confirmed) => {
      if(confirmed){
        this.guardando = true;
        if (this.ModuloDeCargaId > 0)
          this._moduloDeCargaService.guardarModuloDeCargaUmap(this.obtenerUmap(), this.ModuloDeCargaId).subscribe((res: any) => {
            this.guardando = false;
        });
      }
    });
  }

  deleteHorario(index: number){
    this.umapFormArray.removeAt(index);
    if(index == 0 && this.umapFormArray.length == 0){
      this.umapFormArray.push(this.initUmap());
    }
  }
}
