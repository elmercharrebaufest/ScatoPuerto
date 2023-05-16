import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Caratula } from '@ScatoModels/afip/caratula';
import { NuevasMercaderiasSueltasCoem } from '@ScatoModels/afip/nuevasMercaderiasSueltasCoem';
import { NuevoCoem } from '@ScatoModels/afip/nuevoCoem';
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
  crearEditarCodeForm: FormGroup;
  idsCaratula:number[]=[]

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder
    ) {
      this.initFormCrearEditarCode();
     }

  ngOnInit(): void {
    this.titleCoem=this.title
    this.mercaderiasSueltasFormArray.push(this.inicializarFormMercaderias());
    this.loadIdsCaratula();
  }

  get mercaderiasSueltasFormArray(): FormArray {
    return this.crearEditarCodeForm.get("mercaderiasSueltas") as FormArray
  }

  private initFormCrearEditarCode() {
    this.crearEditarCodeForm = null;
    this.crearEditarCodeForm = this.formBuilder.group({
      
      idCaratula:['',Validators.required],
      mercaderiasSueltas:this.formBuilder.array([])
    })
  }
  public inicializarFormMercaderias(mercaderias: NuevasMercaderiasSueltasCoem = null): FormGroup {
    if (mercaderias != null) {
        return this.formBuilder.group({
            idCoem: mercaderias.idCoem,
            codEmbalaje: mercaderias.codEmbalaje,
            cantBultos: mercaderias.cantBultos,
            pesoKilosMercaderia: mercaderias.pesoKilosMercaderia,
            idDeclaracion: mercaderias.idDeclaracion
        })
    } else {
        return this.formBuilder.group({
          idCoem: ['', Validators.required],
          codEmbalaje: ['', Validators.required],
          cantBultos: ['', Validators.required],
          pesoKilosMercaderia: ['', Validators.required],
          idDeclaracion: []
        })
    }
}

  closeModalEditarCrearCoem(){
    this.modalService.dismissAll()
  }

  public onCrearCoem() {

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
      this.crearEditarCodeForm.controls['idCaratula'].setValue(this.id)
      this.crearEditarCodeForm.controls['idCaratula'].disable()
    }

  }

}
