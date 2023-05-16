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
    // this.initFormCrearEditarCaratula();
  }

  private initFormCrearEditarCaratula() {
    this.crearEditarCaratulaForm = null;
    this.crearEditarCaratulaForm = this.formBuilder.group({
      imoCaratula: ['', Validators.required],
      buqueCaratula: ['', Validators.required],
      puertoDestinoCaratula: [],
      codigoAduana: ['', Validators.required],
      codigoLugarOperativo: ['', Validators.required],
      nombreMedioTransporte: ['', Validators.required],
      codigoVia: ['', Validators.required,new FormControl('', Validators.minLength(5))],
      fechaArriboCaratula: ['', Validators.required],
      fechaZarpadaCaratula: ['', Validators.required]
    })
  }

  

  closeModalEditarCrearCaratula(){
    this.modalService.dismissAll()
  }

  public onCrearCaratula() {
    this.submitted = true
    let buque = this.crearEditarCaratulaForm.getRawValue();
    if (this.crearEditarCaratulaForm.controls['imoCaratula'].invalid ||
    this.crearEditarCaratulaForm.controls['buqueCaratula'].invalid ||
    this.crearEditarCaratulaForm.controls['codigoAduana'].invalid ||
    this.crearEditarCaratulaForm.controls['codigoLugarOperativo'].invalid ||
    this.crearEditarCaratulaForm.controls['nombreMedioTransporte'].invalid ||
    this.crearEditarCaratulaForm.controls['codigoVia'].invalid ||
    this.crearEditarCaratulaForm.controls['fechaArriboCaratula'].invalid ||
    this.crearEditarCaratulaForm.controls['fechaZarpadaCaratula'].invalid ) {
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
