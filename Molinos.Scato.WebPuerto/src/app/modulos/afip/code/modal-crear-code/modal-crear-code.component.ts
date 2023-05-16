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
    // this.initFormCrearEditarCaratula();
  }

  private initFormCrearEditarCode() {
    this.crearEditarCodeForm = null;
    this.crearEditarCodeForm = this.formBuilder.group({
      idCaratula: ['', Validators.required],
      idViaje: ['', Validators.required],
      coemCode: []
    })
  }

  

  closeModalEditarCrearCode(){
    this.modalService.dismissAll()
  }

  public onCrearCode() {
    this.submitted = true
    let buque = this.crearEditarCodeForm.getRawValue();
    if (this.crearEditarCodeForm.controls['nombreImo'].invalid ||
    this.crearEditarCodeForm.controls['nombreBuque'].invalid ||
    this.crearEditarCodeForm.controls['codigoAduana'].invalid ||
    this.crearEditarCodeForm.controls['codigoLugarOperativo'].invalid ||
    this.crearEditarCodeForm.controls['nombreMedioTransporte'].invalid) {
    this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
    return
    }
  }

  get f() { return this.crearEditarCodeForm.controls; }


}
