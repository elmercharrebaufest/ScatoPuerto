import { Component, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Usuario } from '@ScatoInterfaces/usuario';
import { PermisosScato } from '@ScatoEnums/permisos-scato';
import { CaratulaAfipService } from '@ScatoServicios/afip/caratula-afip.service';

@Component({
  selector: 'app-modal-crear-caratula',
  templateUrl: './modal-crear-caratula.component.html',
  styleUrls: ['./modal-crear-caratula.component.css']
})
export class ModalCrearCaratulaComponent implements OnInit {

  @Input() id: number = 0;
  @Input() title: string = "Nueva Caratula";

  errorMessage: boolean = false;
  submitted = false;
  titleCaratula:string
  crearEditarCaratulaForm: FormGroup;

 


  constructor(
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private formBuilder: FormBuilder,
    private caratulaAfipService: CaratulaAfipService
    ) {
      this.initFormCrearEditarCaratula();
     }

  ngOnInit(): void {
    this.titleCaratula=this.title
    if(!this.title.includes('Nueva')){
      this.caratulaAfipService.obtenerCaratulaId(this.id).subscribe((datos)=>{
        this.crearEditarCaratulaForm.controls['fechaArribo'].setValue(datos.fechaArribo);
        this.crearEditarCaratulaForm.controls['fechaZarpada'].setValue(datos.fechaZarpada);
        this.crearEditarCaratulaForm.controls['identificadorBuque'].setValue(datos.identificadorBuque);
        this.crearEditarCaratulaForm.controls['nombreMedioTransporte'].setValue(datos.nombreMedioTransporte);
        this.crearEditarCaratulaForm.controls['puertoDestino'].setValue(datos.puertoDestino);
        this.crearEditarCaratulaForm.controls['codigoAduana'].setValue(datos.codigoAduana);
        this.crearEditarCaratulaForm.controls['codigoLugarOperativo'].setValue(datos.codigoLugarOperativo);
        this.crearEditarCaratulaForm.controls['via'].setValue(datos.via);
      })
    }
  }

  private initFormCrearEditarCaratula() {
    this.crearEditarCaratulaForm = null;
    this.crearEditarCaratulaForm = this.formBuilder.group({
      identificadorBuque: ['', Validators.required],
      nombreMedioTransporte: ['', Validators.required],
      puertoDestino: [''],
      codigoAduana: ['', Validators.required],
      codigoLugarOperativo: ['', Validators.required],
      via: ['', Validators.required,new FormControl('', Validators.minLength(1))],
      fechaArribo: ['', Validators.required],
      fechaZarpada: ['', Validators.required]
    })
  }

  

  closeModalEditarCrearCaratula(){
    this.modalService.dismissAll()
  }

  public onCrearCaratula() {
    console.log(this.crearEditarCaratulaForm.value)
    this.submitted = true
    // let buque = this.crearEditarCaratulaForm.getRawValue();
    if (this.crearEditarCaratulaForm.controls['identificadorBuque'].invalid ||
    this.crearEditarCaratulaForm.controls['nombreMedioTransporte'].invalid ||
    this.crearEditarCaratulaForm.controls['codigoAduana'].invalid ||
    this.crearEditarCaratulaForm.controls['codigoLugarOperativo'].invalid ||
    this.crearEditarCaratulaForm.controls['via'].invalid ||
    this.crearEditarCaratulaForm.controls['fechaArribo'].invalid ||
    this.crearEditarCaratulaForm.controls['fechaZarpada'].invalid ) {
    this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
    }else{
      this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de crear una nueva Caratula?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning)
      .then((confirmed) => {
        if (confirmed) {
          //Si llegamos hasta aca es porque tenemos que crear una nueva Caratula.
          this.caratulaAfipService.registrarNuevaCaratula(this.crearEditarCaratulaForm.value).subscribe(() => {
            this.confirmationDialogService.confirm('¡Felicitaciones!', 'Ha creado una nueva Caratula con éxito', 'Cerrar', '', null, null, Tipoalerta.Success)
          });
          this.modalService.dismissAll();
        }
      }).catch(() => {
        this.modalService.dismissAll()
      });
    }
  }

  get f() { return this.crearEditarCaratulaForm.controls; }

  

}
