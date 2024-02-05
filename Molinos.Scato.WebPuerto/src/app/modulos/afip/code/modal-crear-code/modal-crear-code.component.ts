import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-crear-code',
  templateUrl: './modal-crear-code.component.html',
  styleUrls: ['./modal-crear-code.component.css']
})
export class ModalCrearCodeComponent implements OnInit {

  @Input() id: number = 0;
  @Input() title: string = "Nueva Comunicación de Embarque Definitiva";

  errorMessage: boolean = false;
  submitted = false;
  titleCode:string
  crearEditarCodeForm: FormGroup;


  constructor(
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private formBuilder: FormBuilder
    ) {
      this.initFormCrearEditarCode();
     }

  ngOnInit(): void {
    this.titleCode=this.title
  }

  private initFormCrearEditarCode() {
    this.crearEditarCodeForm = null;
    this.crearEditarCodeForm = this.formBuilder.group({
      identificadorCaratula: ['', Validators.required],
      numeroViaje: ['', Validators.required],
      identificadorCOEM: ['', Validators.required]
    })
  }

  

  closeModalEditarCrearCode(){
    this.modalService.dismissAll()
  }

  public onCrearCode() {
    this.submitted = true
    if (this.crearEditarCodeForm.controls['identificadorCaratula'].invalid ||
    this.crearEditarCodeForm.controls['numeroViaje'].invalid ||
    this.crearEditarCodeForm.controls['identificadorCOEM'].invalid ) {
    this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
    }else{
      let operacion : boolean = true
      // let condition : boolean = true
      this.title.includes('Nueva') ? operacion : operacion= false;

      // if(condition){
        this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de ${operacion? 'crear un nuevo':'editar el'} Code?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning)
        .then((confirmed) => {
          if (confirmed) {
            //Si llegamos hasta aca es porque tenemos que crear un nuevo Code.
            // this.caratulaAfipService.registrarOEditarCaratula(this.crearEditarCaratulaForm.value).subscribe((data) => {
            //   if(data){
            //     this.editFinish.emit();
            //     this.confirmationDialogService.confirm('¡Felicitaciones!', `Ha ${operacion? 'creado una nueva':'editado la'} Caratula con éxito`, 'Cerrar', '', null, null, Tipoalerta.Success)
            //   }else{
            //     this.confirmationDialogService.confirm('¡Error!', `No se ha podido ${operacion? 'crear una nueva':'editar la'} Caratula`, 'Cerrar', '', null, null, Tipoalerta.Error)
            //   }
            // },(error) => {
            //   this.confirmationDialogService.confirm('¡Error!', `No se ha podido ${operacion? 'crear una nueva':'editar la'} Caratula, comunicarse con soporte técnico`, 'Cerrar', '', null, null, Tipoalerta.Error)
            // })
            // this.modalService.dismissAll();
          }
        }).catch(() => {
          this.confirmationDialogService.confirm('¡Error!', `No se ha podido ${operacion? 'crear un nuevo':'editar el'} Code`, 'Cerrar', '', null, null, Tipoalerta.Error)
          this.modalService.dismissAll()
        });
      // }else{
      //   this.confirmationDialogService.confirm('¡Error!', `No se ha podido ${operacion? 'crear un nuevo':'editar el'} Code, comunicarse con soporte técnico`, 'Cerrar', '', null, null, Tipoalerta.Error)
      // }
      
    }
  }

  get f() { return this.crearEditarCodeForm.controls; }


}
