import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { ProductosService } from '@ScatoServicios/productos.service';

@Component({
  selector: 'app-modal-producto',
  templateUrl: './modal-producto.component.html',
  styleUrls: ['./modal-producto.component.css']
})
export class ModalProductoComponent implements OnInit {

  @ViewChild('colorPicker') colorPicker!: ElementRef;

  @Input() id: number = 0;
  formProducto: FormGroup;
  formCalidad: FormGroup;
  tabSeleccionado: string = "info-gral";
  indiceTc: number = 0;
  errorExisteProducto: string = "La descripción ingresada ya existe en otro producto.";
  errorProductoEnUso: string = "No puede modificar el estado liquido/solido del producto, porque él mismo esta utilizándose en una nominación/embarque.";
  constructor(
    private readonly fb: FormBuilder,
    private readonly modalService: NgbModal,
    private readonly confirmationDialogService: ConfirmationDialogService,
    private readonly productosService: ProductosService,
  ) {
    this.inicializarForm();
  }

  ngOnInit(): void {
    if (this.id > 0) {
      this.inicializarFormEdicion();
    }
  }

  //region FORMULARIO

  private inicializarForm() {
    this.formProducto = this.fb.group({
      materialPuerto: this.fb.group({
        id: [''],
        codigoSAP: ['', [Validators.pattern('^[0-9]{1,8}$'), Validators.maxLength(8)]],
        descripcion: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]*$'), Validators.maxLength(100)]],
        descripcionCorta: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]*$'), Validators.maxLength(50)]],
        descripcionCortaIngles: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]*$'), Validators.maxLength(100)]],
        almacenId: [''],
        almacenDesc: [''],
        esLiquido: [false, [Validators.required]],
        color: ['', [Validators.required, Validators.pattern('^#([A-Fa-f0-9]{6})$'), Validators.maxLength(7)]],
        activo: [true]
      }),
      tiposDeCalidad: this.fb.array([
      ]),
      documentos: this.fb.array([])
    });
  }

  private inicializarTipoCalidad(): FormGroup {
    return this.fb.group({
      tipoDeCalidad: this.fb.group({
        id: [''],
        descripcion: ['', [Validators.required, Validators.maxLength(250)]],
        activo: [true],
        seleccionado: [false]
      }),
      calidadValores: this.fb.array([/*this.inicializarCalidadValor()*/])
    });
  }

  private inicializarCalidadValor(): FormGroup {
    return this.fb.group({
      id: [''],
      valor: ['', [Validators.required, Validators.maxLength(250)]],
      parametro: ['', [Validators.required, Validators.maxLength(250)]],
      activo: [true]
    });
  }

  private inicializarDocumento(): FormGroup {
    return this.fb.group({
      id: [''],
      id_documento: ['', [Validators.required]],
      descripcion_documento: ['', [Validators.required]],
      activo: [false, [Validators.required]],
      doc_activo: [false, [Validators.required]]
    });
  }

  //endregion FORMULARIO

  //region AUXILIARES

  get tiposDeCalidadArray(): FormArray {
    return this.formProducto.get('tiposDeCalidad') as FormArray;
  }

  get calidadValoresSeleccionados(): FormArray {
    let selectedType = this.tiposDeCalidadArray.controls.find(control => control.get('tipoDeCalidad.seleccionado')?.value === true);
    return selectedType?.get('calidadValores') as FormArray || this.fb.array([]);
  }

  get documentosArray(): FormArray {
    return this.formProducto.get('documentos') as FormArray;
  }

  private mostrarError(msj: string) {
    this.confirmationDialogService.error(msj);
  }

  public onSeleccionarColor(event: Event) {
    const input = event.target as HTMLInputElement;
    const color = input.value.toUpperCase();
    this.formProducto.patchValue({
      materialPuerto: {
        color: color
      }
    });
  }

  public onEscribirColor(event: any) {
    const input = event.target as HTMLInputElement;
    const color = input.value.toLowerCase();
    this.colorPicker.nativeElement.value = color;
  }

  //endregion AUXILIARES

  //region FUNCIONES PRINCIPALES

  public onSelectTab(idTab: string) {
    this.tabSeleccionado = idTab;
  }

  public seleccionarTipoCalidad(index: number) {
    this.tiposDeCalidadArray.controls.forEach((control, i) => {
      control.get('tipoDeCalidad.seleccionado')?.setValue(i === index);
    });
    this.indiceTc = index;
  }

  public agregarTipoCalidad() {
    this.tiposDeCalidadArray.push(this.inicializarTipoCalidad());
    this.seleccionarTipoCalidad(this.tiposDeCalidadArray.length - 1);
  }

  public eliminarTipoCalidad(index: number) {
    this.tiposDeCalidadArray.removeAt(index);
  }

  public agregarCalidadValor(index: number) {
    const tipoDeCalidad = this.tiposDeCalidadArray.at(index) as FormGroup;
    const calidadValores = tipoDeCalidad.get('calidadValores') as FormArray;
    calidadValores.push(this.inicializarCalidadValor());
  }

  public eliminarCalidadValor(index: number) {
    const selectedType = this.tiposDeCalidadArray.controls.find(control => control.get('tipoDeCalidad.seleccionado')?.value === true);
    (selectedType?.get('calidadValores') as FormArray)?.removeAt(index);
  }

  //endregion FUNCIONES PRINCIPALES

  //region FUNCIONES EDICION

  private inicializarFormEdicion(): void {
    try {
      this.productosService.ObtenerProducto(this.id).subscribe(prod => {
        this.rellenarForm(prod);
      }, (error: any) => {
        console.error(error);
        this.mostrarError("Hubo un error al intentar obtener la informacion del producto.");
      });
    } catch (error) {
      console.error(error);
      this.mostrarError("Hubo un error al intentar obtener la informacion del producto.");
    }
  }

  private rellenarForm(producto: any) {
    this.formProducto.patchValue({
      materialPuerto: {
        id: producto.materialPuerto.id,
        codigoSAP: producto.materialPuerto.codigoSAP,
        descripcion: producto.materialPuerto.descripcion,
        descripcionCorta: producto.materialPuerto.descripcionCorta,
        descripcionCortaIngles: producto.materialPuerto.descripcionCortaIngles,
        almacenId: producto.materialPuerto.almacen_Id,
        almacenDesc: producto.materialPuerto.almacenDesc,
        esLiquido: producto.materialPuerto.esLiquido,
        color: producto.materialPuerto.color,
        activo: producto.materialPuerto.activo
      }
    });

    const tiposDeCalidadArray = this.formProducto.get('tiposDeCalidad') as FormArray;
    producto.tiposDeCalidad.forEach(tc => {
      const tipoCalidadFormGroup = this.inicializarTipoCalidad();

      tipoCalidadFormGroup.patchValue({
        tipoDeCalidad: {
          id: tc.tipoDeCalidad.id,
          descripcion: tc.tipoDeCalidad.descripcion,
          activo: tc.tipoDeCalidad.activo,
          seleccionado: false
        }
      });

      const calidadValoresArray = tipoCalidadFormGroup.get('calidadValores') as FormArray;
      tc.calidadValores.forEach(cv => {
        const calidadValorFormGroup = this.inicializarCalidadValor();

        calidadValorFormGroup.patchValue({
          id: cv.id,
          valor: cv.valor,
          parametro: cv.parametro,
          activo: cv.activo
        });
        calidadValoresArray.push(calidadValorFormGroup);
      });
      tiposDeCalidadArray.push(tipoCalidadFormGroup);
    });

    const documentosArray = this.formProducto.get('documentos') as FormArray;
    producto.documentos.forEach(doc => {
      const documentoFormGroup = this.inicializarDocumento();
      documentoFormGroup.patchValue({
        id: doc.id,
        id_documento: doc.documento.id,
        descripcion_documento: doc.documento.nombre,
        doc_activo: doc.documento.activo,
        activo: doc.activo
      });
      documentosArray.push(documentoFormGroup);
    });

    //Se selecciona primero por default
    this.tiposDeCalidadArray?.at(0)?.get('tipoDeCalidad.seleccionado')?.setValue(true);

    //Se selecciona color en el picker.
    if (this.colorPicker?.nativeElement && producto?.materialPuerto?.color) {
      this.colorPicker.nativeElement.value = producto.materialPuerto.color;
    }

  }

  //endregion FUNCIONES EDICION

  //region FUNCIONES ABM
  public cancelar() {
    this.modalService.dismissAll();
    this.formProducto.reset();
  }

  public guardar() {
    if (this.hayTipoDeCalidadRepetida()) {
      this.mostrarError("¡Atención! No se puede usar la misma descripción para distintos tipos de calidad.");
      return;
    }

    const tcConParametroRepetido = this.tcConParametroRepetido();
    if (tcConParametroRepetido !== '') {
      this.mostrarError(`¡Atención! El tipo de calidad ${tcConParametroRepetido} tiene parametros repetidos.`);
      return;
    }

    if (this.formProducto.invalid) {
      this.mostrarError("¡Atención! Por favor verifique los campos marcados en rojo.");
      return;
    }

    if (this.id > 0) {
      this.editarProducto();
    } else {
      this.crearProducto();
    }
  }

  private crearProducto() {
    try {
      this.productosService.CrearProducto(this.formProducto.value).subscribe(res => {
        this.modalService.dismissAll();
        this.confirmationDialogService.exito('Guardado con éxito.');
      }, (error: any) => {
        const msj = error.error == this.errorExisteProducto ? this.errorExisteProducto : "Hubo un error al intentar guardar el producto.";
        console.error('Error al enviar el formulario', msj);
        this.modalService.dismissAll();
        this.mostrarError(msj);
      });
    } catch (error) {
      console.error(error);
      this.modalService.dismissAll();
      this.mostrarError("Hubo un error al intentar registrar el producto.");
    }
  }

  private editarProducto() {
    try {
      this.productosService.EditarProducto(this.formProducto.value).subscribe(res => {
        this.modalService.dismissAll();
        this.confirmationDialogService.exito('Guardado con éxito.');
      }, (error: any) => {
        const msj = (error.error == this.errorExisteProducto || error.error == this.errorProductoEnUso) ? error.error : "Hubo un error al intentar editar el producto.";
        console.error('Error al enviar el formulario', msj);
        this.modalService.dismissAll();
        this.mostrarError(msj);
      });
    } catch (error) {
      console.error(error);
      this.modalService.dismissAll();
      this.mostrarError("Hubo un error al intentar editar el producto.");
    }
  }

  //endregion FUNCIONES ABM

  //region VALIDACIONES

  private hayTipoDeCalidadRepetida(): boolean {
    const arrayTc = this.formProducto.get('tiposDeCalidad') as FormArray;
    const values = arrayTc.controls.map(group => group.get('tipoDeCalidad.descripcion')?.value?.toLowerCase().trim());

    const hasDuplicates = values.some((value, index) => values.indexOf(value) !== index);
    return hasDuplicates == true;
  }

  private tcConParametroRepetido(): string {
    let tcConRepetidos = '';
    const arrayTc = this.formProducto.get('tiposDeCalidad') as FormArray;
    for (let i = 0; i < arrayTc.length; i++) {
      if (this.hayParametrosRepetidoDeTc(i)) {
        tcConRepetidos = arrayTc.at(i).get('tipoDeCalidad.descripcion').value;
        return tcConRepetidos;
      }
    }
    return tcConRepetidos;
  }

  private hayParametrosRepetidoDeTc(tipoCalidadIndex: number): boolean {
    const tipoCalidadArray = this.formProducto.get('tiposDeCalidad') as FormArray;
    const calidadValoresArray = tipoCalidadArray.at(tipoCalidadIndex).get('calidadValores') as FormArray;
    const parametros = calidadValoresArray.controls.map(group => group.get('parametro')?.value?.toLowerCase().trim());
    const tieneDuplicados = parametros.some((parametro, indice) => parametros.indexOf(parametro) !== indice);
    return tieneDuplicados == true;
  }

  //endregion VALIDACIONES
}
