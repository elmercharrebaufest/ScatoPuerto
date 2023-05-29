import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Caratula } from '@ScatoModels/afip/caratula';
import { NuevasMercaderiasSueltasCoem } from '@ScatoModels/afip/nuevasMercaderiasSueltasCoem';
import { NuevoCoem } from '@ScatoModels/afip/nuevoCoem';
import { CoemAfipService } from '@ScatoServicios/afip/coem-afip.service';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-crear-coem',
  templateUrl: './modal-crear-coem.component.html',
  styleUrls: ['./modal-crear-coem.component.css']
})
export class ModalCrearCoemComponent implements OnInit {

  @Input() id: number = 0;
  @Input() title: string = "Nueva Comunicación de Embarque Previa";

  errorMessage: boolean = false;
  submitted = false;
  titleCoem:string
  listaNuevoCoem:NuevoCoem[]=[]
  nuevoCoem:NuevoCoem=new NuevoCoem;
  crearEditarCoemForm: FormGroup;
  idsCaratula:number[]=[]

  constructor(
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private formBuilder: FormBuilder,
    private coemAfipService:CoemAfipService
    ) {
      this.initFormCrearEditarCode();
     }

  ngOnInit(): void {
    this.titleCoem=this.title
    this.mercaderiasSueltasFormArray.push(this.inicializarFormMercaderias());
    this.loadIdsCaratula();
  }

  get mercaderiasSueltasFormArray(): FormArray {
    return this.crearEditarCoemForm.get("mercaderiasSueltas") as FormArray;
  }

  private initFormCrearEditarCode() {
    this.crearEditarCoemForm = null;
    this.crearEditarCoemForm = this.formBuilder.group({
      identificadorCaratula:['',Validators.required],
      mercaderiasSueltas:this.formBuilder.array([])
    })
  }
  public inicializarFormMercaderias(mercaderias: NuevasMercaderiasSueltasCoem = null): FormGroup {
    if (mercaderias != null) {
        return this.formBuilder.group({
            cuitATA: mercaderias.cuitATA,
            codigoEmbalaje: mercaderias.codigoEmbalaje,
            cantidadBultos: mercaderias.cantidadBultos,
            peso: mercaderias.peso,
            identificadorDeclaracion: mercaderias.identificadorDeclaracion
        })
    } else {
        return this.formBuilder.group({
          cuitATA: ['', Validators.required],
          codigoEmbalaje: ['', Validators.required],
          cantidadBultos: ['', Validators.required],
          peso: ['', Validators.required],
          identificadorDeclaracion: ['']
        })
    }
}

  closeModalEditarCrearCoem(){
    this.modalService.dismissAll()
  }

  public onCrearCoem() {
    this.submitted = true
    if (this.crearEditarCoemForm.controls['identificadorCaratula'].invalid ||
        this.mercaderiasSueltasFormArray.invalid
       ) {
      this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
      }else{
        let operacion : boolean = true
        // let condition : boolean = true
        this.title.includes('Nueva') ? operacion : operacion= false;
        // (!operacion && this.crearEditarCoemForm.get('id').value) || (operacion && !this.crearEditarCoemForm.get('id').value) ? condition = true : condition = false;

        // if(condition){
          this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de ${operacion? 'crear un nuevo':'editar el'} Coem`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning)
          .then((confirmed) => {
            // if (confirmed) {
            //   this.crearEditarCoemForm.get('puertoDestino').enable();
            //   //Si llegamos hasta aca es porque tenemos que crear un nuevo Coem.
              this.coemAfipService.registrarCoem(this.crearEditarCoemForm.value).subscribe((data) => {
                if(data){
                  // this.editFinish.emit();
                  this.confirmationDialogService.confirm('¡Felicitaciones!', `Ha ${operacion? 'creado una nueva':'editado la'} Caratula con éxito`, 'Cerrar', '', null, null, Tipoalerta.Success)
                }else{
                  this.confirmationDialogService.confirm('¡Error!', `No se ha podido ${operacion? 'crear una nueva':'editar la'} Caratula`, 'Cerrar', '', null, null, Tipoalerta.Error)
                }
              },(error) => {
                this.confirmationDialogService.confirm('¡Error!', `No se ha podido ${operacion? 'crear una nueva':'editar la'} Caratula, comunicarse con soporte técnico`, 'Cerrar', '', null, null, Tipoalerta.Error)
              })
            //   this.modalService.dismissAll();
            // }
          }).catch(() => {
            this.confirmationDialogService.confirm('¡Error!', `No se ha podido ${operacion? 'crear un nuevo':'editar el'} Coem`, 'Cerrar', '', null, null, Tipoalerta.Error)
            this.modalService.dismissAll()
          });
        // }else{
        //   this.confirmationDialogService.confirm('¡Error!', `No se ha podido ${operacion? 'crear una nueva':'editar la'} Caratula, comunicarse con soporte técnico`, 'Cerrar', '', null, null, Tipoalerta.Error)
        // }
        
      }

  }

  agregarNuevoCoem(){
    this.mercaderiasSueltasFormArray.push(this.inicializarFormMercaderias());
  }

  eliminarNuevoCoem(i){
    this.mercaderiasSueltasFormArray.removeAt(i);
  }

  public getListaHistorialCoem() {
    return this.listaNuevoCoem;
  }

  loadIdsCaratula(){
    if(this.title.includes("Nueva")){
      this.idsCaratula[0]=1;
      this.idsCaratula[1]=2
    }else{
      this.idsCaratula[0]=this.id;
      this.crearEditarCoemForm.controls['identificadorCaratula'].setValue(this.id)
      this.crearEditarCoemForm.controls['identificadorCaratula'].disable()
    }

  }

}
