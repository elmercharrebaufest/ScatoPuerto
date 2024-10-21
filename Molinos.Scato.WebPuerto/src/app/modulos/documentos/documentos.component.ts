import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Documento, DocumentoTipo } from '@ScatoModels/digitalizacion-documentos/documento';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DocumentoService } from '@ScatoServicios/documento.service';

@Component({
  selector: 'app-documentos',
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.css']
})
export class DocumentosComponent implements OnInit {

  public mensaje: string;
  public titulo: string;
  public loading: boolean;
  public filtros: FormGroup;
  public documentoForm: FormGroup;

  public documentos: Documento[] = [];
  public documentosTipos: DocumentoTipo[] = [];
  public itemsTotales: number = 0; // Total de elementos

  @ViewChild('modalDocumento') modalDocumento: TemplateRef<any>;

  constructor(
    fb: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,
    private documentosService: DocumentoService,
    private modalService: NgbModal
  ) {
    this.filtros = fb.group({ nombre: '' });
    this.documentoForm = fb.group({
      id: 0,
      documentoTipo: [{}, Validators.required],
      nombre: ['', [Validators.required, Validators.pattern(/[\S]/g)]],
      liquido: false,
      solido: false
    });
  }

  ngOnInit(): void {
    this.listarTipos();
    this.onBuscar();
  }

  public async listarTipos() {
    try {
      this.documentosTipos = await this.documentosService.listarDocumentoTipos().toPromise();
    } catch (error) {
      console.error(error);
      this.confirmationDialogService.error('Ocurrió un error al cargar los tipos de documentos');
    }
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
    this.documentosService.listarDocumentos(pagina, itemsPorPagina, nombre).subscribe(res => {
      this.documentos = res.items;
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
    this.modalService.open(this.modalDocumento, { size: 'm', centered: true, backdrop: 'static', keyboard: false });
  }

  public onCrear() {
    this.titulo = 'Crear Documento';
    this.documentoForm.get('documentoTipo').setValue(this.documentosTipos[0]);
    this.abrirModal();
  }

  public onModificar(documento: Documento) {
    this.titulo = 'Editar Documento';
    this.documentoForm.get('id').setValue(documento.id);
    this.documentoForm.get('nombre').setValue(documento.nombre);
    const documentoTipo = this.documentosTipos.find(d => d.id == documento.documentoTipo.id);
    this.documentoForm.get('documentoTipo').setValue(documentoTipo);
    this.documentoForm.get('liquido').setValue(documento.liquido);
    this.documentoForm.get('solido').setValue(documento.solido);
    this.abrirModal();
  }

  public async onEliminar(documento: Documento) {
    const confirmacion = await this.confirmationDialogService.confirmar('Atención', `Esta seguro de anular el documento ${documento.nombre}?`);
    if (!confirmacion) {
      return;
    }
    this.mensaje = 'Eliminando Documento';
    this.loading = true;

    this.documentosService.eliminarDocumento(documento.id).subscribe(async () => {
      this.loading = false;
      await this.confirmationDialogService.exito('Se ha eliminado el documento');
      this.onBuscar();
    }, (err) => this.mostrarError(err, 'Ha ocurrido un error al anular el documento'));
  }

  public closeModal() {
    this.modalService.dismissAll();
    this.documentoForm.reset();
  }

  public async onGuardar() {
    this.documentoForm.markAllAsTouched();
    if (this.documentoForm.invalid || !this.validadarLiquidoSolido()) {
      this.confirmationDialogService.alertar('Por favor complete todos los datos');
      return;
    }

    const id = +this.documentoForm.get('id').value || 0;
    const nombre = this.documentoForm.get('nombre').value as string;
    const documentoTipo = this.documentoForm.get('documentoTipo').value as DocumentoTipo;
    const liquido = this.documentoForm.get('liquido').value as boolean;
    const solido = this.documentoForm.get('solido').value as boolean;
    const documento: Documento = { id, nombre, documentoTipo, liquido, solido };
    const observable = id ? this.documentosService.editarDocumento(documento) : this.documentosService.crearDocumento(documento);

    this.mensaje = 'Guardando documento';
    this.loading = true;
    observable.subscribe(async () => {
      this.loading = false;
      await this.confirmationDialogService.exito('Documento guardado correctamente');
      this.closeModal();
      this.onBuscar();
    }, (err) => this.mostrarError(err, 'Ha ocurrido un error al guardar el documento'));
  }

  private mostrarError(err: any, msj: string) {
    this.loading = false;
    console.error(err);
    if (typeof err.error == 'string') {
      msj = err.error;
    } else {
      msj = err.error?.message || err.error?.error || msj;
    }
    this.confirmationDialogService.error(msj);
  }

  private validadarLiquidoSolido() {
    const solido = this.documentoForm.get('solido').value as boolean;
    const liquido = this.documentoForm.get('liquido').value as boolean;
    return (solido || liquido);
  }

  public liquidoSolidoInvalido(): boolean {
    const liquido = this.documentoForm.get('liquido');
    const solido = this.documentoForm.get('solido');
    if (liquido.touched || solido.touched) {
      return !this.validadarLiquidoSolido();
    }
    return false;
  }

}
