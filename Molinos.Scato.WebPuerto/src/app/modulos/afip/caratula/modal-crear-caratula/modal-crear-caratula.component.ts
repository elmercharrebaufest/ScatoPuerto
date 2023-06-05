import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
  @Output() editOCrearFinish = new EventEmitter<void>();

  errorMessage: boolean = false;
  submitted = false;
  titleCaratula:string
  crearEditarCaratulaForm: FormGroup;
  load : boolean = true;

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
        this.crearEditarCaratulaForm.controls['id'].setValue(datos.id);
        this.crearEditarCaratulaForm.controls['fechaArribo'].setValue(datos.fechaArribo);
        this.crearEditarCaratulaForm.controls['fechaZarpada'].setValue(datos.fechaZarpada);
        
        this.crearEditarCaratulaForm.controls['puertoDestino'].setValue(datos.puertoDestino);
        this.crearEditarCaratulaForm.controls['codigoAduana'].setValue(datos.codigoAduana);
        this.crearEditarCaratulaForm.controls['codigoLugarOperativo'].setValue(datos.codigoLugarOperativo);
        this.crearEditarCaratulaForm.controls['via'].setValue(datos.via);
        this.crearEditarCaratulaForm.controls['identificadorBuque'].setValue(datos.identificadorBuque);
        this.crearEditarCaratulaForm.controls['nombreMedioTransporte'].setValue(datos.nombreMedioTransporte);
      })
    }
    
  }

  private initFormCrearEditarCaratula() {
    this.crearEditarCaratulaForm = null;
    this.crearEditarCaratulaForm = this.formBuilder.group({
      id:[''],
      itinerario:[[]],
      identificadorBuque: ['', Validators.required],
      nombreMedioTransporte: ['', Validators.required],
      puertoDestino: ['SanB'],
      codigoAduana: ['', Validators.required],
      codigoLugarOperativo: ['', Validators.required],
      via: ['8'],
      fechaArribo: ['', Validators.required],
      fechaZarpada: ['', Validators.required]
    })

    this.crearEditarCaratulaForm.get('puertoDestino').disable();
  }

  

  closeModalEditarCrearCaratula(){
    this.modalService.dismissAll()
  }

  public onCrearEditarCaratula() {
    this.submitted = true
    // let buque = this.crearEditarCaratulaForm.getRawValue();
    
      if (this.crearEditarCaratulaForm.controls['identificadorBuque'].invalid ||
      this.crearEditarCaratulaForm.controls['nombreMedioTransporte'].invalid ||
      this.crearEditarCaratulaForm.controls['codigoAduana'].invalid ||
      this.crearEditarCaratulaForm.controls['codigoLugarOperativo'].invalid ||
      this.crearEditarCaratulaForm.controls['fechaArribo'].invalid ||
      this.crearEditarCaratulaForm.controls['fechaZarpada'].invalid ) {
      this.confirmationDialogService.confirm('Advertencia', 'Los campos que estan en rojo son requeridos', 'Cerrar', '', null, null, Tipoalerta.Warning)
      }else{
        let operacion : boolean = true
        let condition : boolean = true
        this.title.includes('Nueva') ? operacion : operacion= false;
        (!operacion && this.crearEditarCaratulaForm.get('id').value) || (operacion && !this.crearEditarCaratulaForm.get('id').value) ? condition = true : condition = false;

        if(condition){
          this.confirmationDialogService.confirm('Advertencia', `¿Está seguro de ${operacion? 'crear una nueva':'editar la'} Caratula?`, 'Sí', 'Cancelar', null, null, Tipoalerta.Warning)
          .then((confirmed) => {
            if (confirmed) {
              this.crearEditarCaratulaForm.get('puertoDestino').enable();
              //Si llegamos hasta aca es porque tenemos que crear una nueva Caratula.
              this.caratulaAfipService.registrarOEditarCaratula(this.crearEditarCaratulaForm.value).subscribe((data) => {
                if(data){
                  this.editOCrearFinish.emit();
                  this.confirmationDialogService.confirm('¡Felicitaciones!', `Ha ${operacion? 'creado una nueva':'editado la'} Caratula con éxito`, 'Cerrar', '', null, null, Tipoalerta.Success)
                }else{
                  this.confirmationDialogService.confirm('¡Error!', `No se ha podido ${operacion? 'crear una nueva':'editar la'} Caratula`, 'Cerrar', '', null, null, Tipoalerta.Error)
                }
              },(error) => {
                this.confirmationDialogService.confirm('¡Error!', `No se ha podido ${operacion? 'crear una nueva':'editar la'} Caratula, comunicarse con soporte técnico`, 'Cerrar', '', null, null, Tipoalerta.Error)
              })
              this.modalService.dismissAll();
            }
          }).catch(() => {
            this.confirmationDialogService.confirm('¡Error!', `No se ha podido ${operacion? 'crear una nueva':'editar la'} Caratula`, 'Cerrar', '', null, null, Tipoalerta.Error)
            this.modalService.dismissAll()
          });
        }else{
          this.confirmationDialogService.confirm('¡Error!', `No se ha podido ${operacion? 'crear una nueva':'editar la'} Caratula, comunicarse con soporte técnico`, 'Cerrar', '', null, null, Tipoalerta.Error)
        }
        
      }
    
  }

  get f() { return this.crearEditarCaratulaForm.controls; }

  

}
