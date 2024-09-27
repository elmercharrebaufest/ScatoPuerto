import { Destino } from '@ScatoModels/destino';
import { ConfirmationDialogService } from '@ScatoServicios/confirmation-dialog.service';
import { DestinosService } from '@ScatoServicios/destinos.service';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

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

  public destinos: Destino[] = [];
  public itemsTotales: number = 0; // Total de elementos

  @ViewChild('modalDestino') modalDestino: TemplateRef<any>;

  constructor(
    fb: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,
    private destinosService: DestinosService,
    private modalService: NgbModal
  ) {
    this.filtros = fb.group({ nombre: '' });
    this.destinoForm = fb.group({
      id: 0,
      nombre: ['', [Validators.required, Validators.pattern(/[\S]/g)]]
    });
  }

  ngOnInit(): void { this.onBuscar(); }

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
    this.modalService.open(this.modalDestino, { size: 'm', centered: true, backdrop: 'static', keyboard: false });
  }

  public onCrear() {
    this.titulo = 'Crear Destino';
    this.abrirModal();
  }

  public onModificar(destino: Destino) {
    this.titulo = 'Editar Destino';
    this.destinoForm.get('id').setValue(destino.id);
    this.destinoForm.get('nombre').setValue(destino.nombre);
    this.abrirModal();
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
  }

  public async onGuardar() {
    this.destinoForm.markAllAsTouched();
    if (this.destinoForm.invalid) {
      this.confirmationDialogService.alertar('Por favor complete todos los datos');
      return;
    }

    const id = +this.destinoForm.get('id').value || 0;
    const nombre = this.destinoForm.get('nombre').value as string;
    const observable = id ? this.destinosService.editarDestino({ id, nombre }) : this.destinosService.crearDestino(nombre);

    this.mensaje = 'Guardando destino';
    observable.subscribe(() => {
      this.loading = false;
      this.confirmationDialogService.exito('Destino guardado correctamente');
      this.closeModal();
      this.onBuscar();
    }, (err) => {
      this.loading = false;
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

}
