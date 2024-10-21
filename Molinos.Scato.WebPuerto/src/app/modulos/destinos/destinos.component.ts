import { Destino } from '@ScatoModels/destino';
import { Documento, DocumentoDestino } from '@ScatoModels/digitalizacion-documentos/documento';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DestinosService } from '@ScatoServicios/destinos.service';
import { DocumentoService } from '@ScatoServicios/documento.service';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

export interface DocumentosDestino {
  documento: Documento;
  seleccionado: boolean;
}

export interface AltaEdicionDestino {
  documentos: DocumentoDestino[];
  destino: Destino
}

@Component({
  selector: 'app-destinos',
  templateUrl: './destinos.component.html',
  styleUrls: ['./destinos.component.css']
})
export class DestinosComponent implements OnInit {
  public mensaje: string;
  public titulo: string;
  public loading: boolean;
  public filtros: FormGroup;
  public destinoForm: FormGroup;
  public documentos: DocumentosDestino[] = [];
  public destinos: Destino[] = [];
  public itemsTotales: number = 0; // Total de elementos

  @ViewChild('modalDestino') modalDestino: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,
    private destinosService: DestinosService,
    private modalService: NgbModal,
    private documentosService: DocumentoService
  ) {
    this.filtros = this.fb.group({ nombre: '' });
    this.destinoForm = this.fb.group({
      id: 0,
      nombre: ['', [Validators.required, Validators.pattern(/[\S]/g)]],
      documentos: this.fb.array([])
    });
    this.obtenerDocumentos();
  }

  ngOnInit(): void { this.onBuscar(); }

  private inicializarDocumento(): FormGroup {
    return this.fb.group({
      id: [0],
      documento: [null, Validators.required],
    });
  }

  public onBuscar(page?: PageEvent) {
    let pagina = 1, itemsPorPagina = 10;
    if (page) {
      pagina = page.pageIndex + 1;
      itemsPorPagina = page.pageSize;
    }
    const nombre: string = this.filtros.get('nombre').value?.trim() || '';
    this.mensaje = 'Cargando datos';
    this.loading = true;
    this.destinosService.listarDestinos(pagina, itemsPorPagina, nombre).subscribe(res => {
      this.destinos = res.items;
      this.itemsTotales = res.itemsTotales;
      this.loading = false;
    }, err => {
      this.confirmationDialogService.error('Ocurrió un error al cargar los datos');
      console.error(err);
      this.loading = false;
    });
  }

  public async limpiarFiltros() {
    this.filtros.reset();
    this.onBuscar();
  }

  private abrirModal() {
    this.modalService.open(this.modalDestino, { size: 'lg', centered: true, backdrop: 'static', keyboard: false });
  }

  public onCrear() {
    this.titulo = 'Crear Destino';
    this.abrirModal();
  }

  public onModificar(destino: Destino) {
    this.titulo = 'Editar Destino';
    this.destinoForm.get('id').setValue(destino.id);
    this.destinoForm.get('nombre').setValue(destino.nombre);
    this.obtenerDocumentosAsociados(destino.id);
  }

  public async onEliminar(destino: Destino) {
    const confirmacion = await this.confirmationDialogService.confirmar('Atención', `Esta seguro de anular el destino ${destino.nombre}?`);
    if (!confirmacion) {
      return;
    }
    this.mensaje = 'Eliminando Destino';
    this.loading = true;

    this.destinosService.eliminarDestino(destino.id).subscribe(() => {
      this.loading = false;
      this.confirmationDialogService.exito('Se ha eliminado el destino');
    }, (err) => {
      this.loading = false;
      console.error(err);
      let msj: string;
      if (typeof err.error == 'string') {
        msj = err.error;
      } else {
        msj = err.error?.message || err.error?.error || 'Ha ocurrido un error al anular el destino';
      }
      this.confirmationDialogService.error(msj);
    });
  }

  public closeModal() {
    this.modalService.dismissAll();
    this.destinoForm.reset();
    this.limpiarFormArrayDocumentos();
  }

  private limpiarFormArrayDocumentos() {
    const documentosArray = this.destinoForm.get('documentos') as FormArray;
    while (documentosArray.length !== 0) {
      documentosArray.removeAt(0);
    }
    this.documentos.forEach(d=> {
      d.seleccionado = false;
    });
  }

  public async onGuardar() {
    this.destinoForm.markAllAsTouched();
    if (this.destinoForm.invalid) {
      this.confirmationDialogService.alertar('Por favor complete todos los datos');
      return;
    }

    const id = +this.destinoForm.get('id').value || 0;
    const nombre = this.destinoForm.get('nombre').value as string;
    const documentos = this.destinoForm.get('documentos').value as DocumentoDestino[];

    const altaEdicionDestino: AltaEdicionDestino = {
      destino: { id, nombre },
      documentos
    };

    id ? this.editarDestino(altaEdicionDestino) : this.crearDestino(altaEdicionDestino);
  }

  private editarDestino(objDestino: AltaEdicionDestino){
    this.loading = true;
    this.mensaje = 'Guardando destino';
    this.destinosService.editarDestino(objDestino).subscribe(async () =>{
      this.loading = false;
      await this.confirmationDialogService.exito('Destino guardado correctamente');
      this.closeModal(); 
      this.onBuscar();
    }, (err) => {
      console.error(err);
      let msj: string;
      if (typeof err.error == 'string') {
        msj = err.error;
      } else {
        msj = err.error?.message || err.error?.error || 'Ha ocurrido un error al guardar el destino';
      }
      this.confirmationDialogService.error(msj);
    });
  }

  private crearDestino(objDestino: AltaEdicionDestino){
    this.loading = true;
    this.mensaje = 'Guardando destino';
    this.destinosService.crearDestino(objDestino).subscribe(async ()=>{
      this.loading = false;
      this.confirmationDialogService.exito('Destino guardado correctamente');
      this.closeModal(); 
      this.onBuscar();
    }, (err) => {
      console.error(err);
      let msj: string;
      if (typeof err.error == 'string') {
        msj = err.error;
      } else {
        msj = err.error?.message || err.error?.error || 'Ha ocurrido un error al guardar el destino';
      }
      this.confirmationDialogService.error(msj);
    });
  }

  public async exportar() {
    this.mensaje = 'Exportando planilla de Excel';
    this.loading = true;
    const nombre: string = this.filtros.get('nombre').value?.trim() || '';
    this.destinosService.listarDestinosExportar(nombre).subscribe(async destinos => {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Listado de destinos');
      worksheet.columns = [{ header: 'Nombre', key: 'nombre', width: 40 }];
      worksheet.addRows(destinos);

      const data = await workbook.xlsx.writeBuffer();
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'Listado de destinos.xlsx');

      this.loading = false;
    }, err => {
      this.confirmationDialogService.error('Ocurrió un error al exportar los destinos');
    });
  }

  private obtenerDocumentos() {
    try {
      this.documentosService.listarDocumentosNominacion().subscribe(docs => {
        this.documentos = docs.map(doc => {
          return {
            documento: doc,
            seleccionado: false
          };
        });
      }, (error: any) => {
        console.error(error);
        this.mostrarError("Hubo un error al intentar obtener los documentos.");
      });
    } catch (error) {
      console.error(error);
      this.mostrarError("Hubo un error al intentar obtener los documentos.");
    }
  }

  private mostrarError(msj: string) {
    this.confirmationDialogService.error(msj);
  }

  public onCheckDocumento(doc: DocumentosDestino, event: any) {
    const input = event.target as HTMLInputElement;
    const documentosArray = this.destinoForm.get('documentos') as FormArray;
    const existeDocumento = documentosArray.controls.some(control => control.value.documento?.id === doc.documento.id);
    
    if (input.checked && !existeDocumento) {
      const documentoFormGroup = this.inicializarDocumento();
      documentoFormGroup.patchValue({
        id: 0,
        documento: doc.documento,
      });
      documentosArray.push(documentoFormGroup);
    } else if (!input.checked && existeDocumento) {
      const indice = documentosArray.controls.findIndex(control => control.value.documento?.id === doc.documento.id);
      if (indice !== -1) {
        documentosArray.removeAt(indice);
      }
    }
  }  

  private seleccionarDocumento(id: number) {
    let doc = this.documentos.find(d => d.documento.id == id);
    if (doc)
      doc.seleccionado = true;
  }

  private obtenerDocumentosAsociados(idDestino: number): void {
    this.documentosService.listarDocumentosDestino(idDestino).subscribe(docs => {
      const documentosArray = this.destinoForm.get('documentos') as FormArray;
      docs.forEach(doc => {
        const documentoFormGroup = this.inicializarDocumento();
        documentoFormGroup.patchValue({
          documento: doc.documento,
        });
        documentosArray.push(documentoFormGroup);
        this.seleccionarDocumento(doc.documento.id);
      });
      this.abrirModal();
    }, (error: any) => {
      console.error(error);
      this.mostrarError("Hubo un error al intentar obtener los documentos asociados al destino.");
    });
 } 
  
}
