import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { ModuloDeCargaService } from '@ScatoServicios/modulo-de-carga.service';
import { AmarreComponent } from 'app/shared/componentes/modulos/carga/amarre/amarre.component';
import { Usuario } from '@ScatoInterfaces/usuario';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { SessionService } from '@ScatoServicios/session.service';

@Component({
  selector: 'app-umap',
  templateUrl: './umap.component.html',
  styleUrls: ['./umap.component.css']
})
export class UmapComponent implements OnInit {
  // @ViewChild(AmarreComponent, { static: false }) amarreComponent: AmarreComponent;
  @Input() ModuloDeCargaId: number;
	private user: Usuario;
	permisosScato: typeof PermisosScato = PermisosScato;
  @Input() esSoloLectura: boolean = false;
  @Output() cargarPeriodoDeCarga = new EventEmitter<boolean>();

  guardando: boolean = false;
  public forms: FormGroup;

  constructor(private builder: FormBuilder,
              private _confirmationDialogService: ConfirmationDialogService,
              private _moduloDeCargaService: ModuloDeCargaService,
              private session: SessionService,) {
  this.user = this.session.getUser();
  }

  ngOnInit(): void {
    this.forms = this.builder.group({
      umap: this.builder.array([this.initUmap()])
    });

    if(!this.hasPermisoTableroSolido_Umap_Modificar()) this.forms.get('umap').disable();
  }


  initUmap(){
    return this.builder.group({
      fechaEncendido: [{ value: '', disabled: this.esSoloLectura }],
      horaEncendido : [{ value: '', disabled: this.esSoloLectura }],
      fechaApagado      : [{ value: '', disabled: this.esSoloLectura }],
      horaApagado       : [{ value: '', disabled: this.esSoloLectura }],
      velocidadDelViento: [{ value: '', disabled: this.esSoloLectura }],
      direccionDelViento: [{ value: '', disabled: this.esSoloLectura }]
    });
  }

  obtenerUmap(){
    return this.umapFormArray.getRawValue();
  }

  obtenerAmarre(){
    // return this.amarreComponent.obtenerAmarre();
  }
  recargarPeriodoDeCarga(event){
    this.cargarPeriodoDeCarga.emit(event);
  }
  public updateUMAP(umap){
    while(this.umapFormArray.length < umap.length) this.umapFormArray.push(this.initUmap());
    umap.forEach(element => {
      element.fechaEncendido = element.fechaEncendido ?  formatDate(element.fechaEncendido, 'yyyy-MM-dd', 'es-ar') : " ";
      element.fechaApagado = element.fechaApagado ?  formatDate(element.fechaApagado, 'yyyy-MM-dd', 'es-ar') : " ";
    });
    this.umapFormArray.patchValue(umap);
  }

  public updateAmarre(amarre){
    // this.amarreComponent.updateAmarre(amarre);
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

  hasPermisoUmap_AgregarEncendido() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroSolido_Umap_AgregarEncendido);
  }
  hasPermisoUmap_EliminarRegistro() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroSolido_Umap_EliminarRegistro);
  }
  hasPermisoTableroSolido_Umap_Modificar() {
    return this.user.permisos.find(p => p === this.permisosScato.TableroSolido_Umap_Modificar);
  }
}
