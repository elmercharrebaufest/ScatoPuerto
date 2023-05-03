import { Component, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';

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
    private formBuilder: FormBuilder
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
      nombreImo: ['', Validators.required],
      nombreBuque: ['', Validators.required],
      nombrePuerto: [],
      codigoAduana: ['', Validators.required],
      codigoLugarOperativo: ['', Validators.required],
      nombreMedioTransporte: ['', Validators.required],
      codigoVia: ['', Validators.required],
      fechaArribo: ['', Validators.required],
      fechaZarpado: ['', Validators.required]
    })
  }

  

  closeModalEditarCrearCaratula(){
    this.modalService.dismissAll()
  }

  public onCrearCaratula() {
    this.submitted = true
    let buque = this.crearEditarCaratulaForm.getRawValue();
    if (this.crearEditarCaratulaForm.controls['nombreImo'].invalid ||
    this.crearEditarCaratulaForm.controls['nombreBuque'].invalid ||
    this.crearEditarCaratulaForm.controls['codigoAduana'].invalid ||
    this.crearEditarCaratulaForm.controls['codigoLugarOperativo'].invalid ||
    this.crearEditarCaratulaForm.controls['nombreMedioTransporte'].invalid ||
    this.crearEditarCaratulaForm.controls['codigoVia'].invalid ||
    this.crearEditarCaratulaForm.controls['fechaArribo'].invalid ||
    this.crearEditarCaratulaForm.controls['fechaZarpado'].invalid ) {
    this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
    return
    }
  }

  get f() { return this.crearEditarCaratulaForm.controls; }

}
